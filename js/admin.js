// Quando il documento è completamente caricato, chiama la funzione per caricare gli utenti
document.addEventListener("DOMContentLoaded", async () => {
    await loadUsers();
});

/**
 * Carica gli utenti con stato "In attesa" e popola la tabella con i dati.
 * Ogni riga include: username, email, un menu a tendina per scegliere il giocatore associato e i pulsanti per approvare/rifiutare.
 */
async function loadUsers() {
    try {
        // Effettua una richiesta API per ottenere gli utenti in attesa di approvazione
        const response = await fetch("https://appgis.onrender.com/api/admin/users");
        const users = await response.json();
        
        const tableBody = document.getElementById("userTableBody");
        tableBody.innerHTML = ""; // Pulisce la tabella prima di riempirla con i nuovi dati

        users.forEach(user => {
            const row = document.createElement("tr");
            
            // Crea la riga della tabella con i dati dell'utente
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <select class="playerSelect">
                        <option value="">Nessun giocatore</option>
                    </select>
                </td>
                <td>
                    <button class="approveButton" data-user-id="${user._id}">Approva</button>
                    <button class="rejectButton" data-user-id="${user._id}">Rifiuta</button>
                </td>
            `;

            tableBody.appendChild(row);

            // Carica la lista dei giocatori non associati e pre-seleziona il giocatore già associato all'utente (se esiste)
            loadUnassociatedPlayers(row.querySelector(".playerSelect"), user.associatedPlayer);
        });

        // Aggiunge gli event listeners per i pulsanti di approvazione e rifiuto
        addEventListeners();
    } catch (error) {
        console.error("Errore nel caricamento degli utenti:", error);
    }
}

/**
 * Carica l'elenco dei giocatori disponibili (non ancora associati) nel menu a tendina della riga utente.
 * @param {HTMLElement} selectElement - Il menu a tendina in cui inserire le opzioni dei giocatori.
 * @param {string} selectedPlayerId - L'ID del giocatore già associato all'utente (se presente).
 */
async function loadUnassociatedPlayers(selectElement, selectedPlayerId) {
    try {
        // Richiesta API per ottenere i giocatori disponibili
        const response = await fetch("https://appgis.onrender.com/api/admin/players/unassociated");
        const players = await response.json();

        // Aggiunge le opzioni al menu a tendina
        players.forEach(player => {
            const option = document.createElement("option");
            option.value = player._id;
            option.textContent = player.nome;

            // Se il giocatore è già associato all'utente, lo seleziona di default
            if (player._id === selectedPlayerId) {
                option.selected = true;
            }

            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error("Errore nel caricamento dei giocatori:", error);
    }
}

/**
 * Aggiunge gli event listeners ai pulsanti di approvazione, rifiuto e salvataggio modifiche.
 */
function addEventListeners() {
    // Event listener per approvare un utente
    document.querySelectorAll(".approveButton").forEach(button => {
        button.addEventListener("click", async (event) => {
            const userId = event.target.dataset.userId;
            await updateUserStatus(userId, "approve");
        });
    });

    // Event listener per rifiutare un utente
    document.querySelectorAll(".rejectButton").forEach(button => {
        button.addEventListener("click", async (event) => {
            const userId = event.target.dataset.userId;
            await updateUserStatus(userId, "reject");
        });
    });

    // Event listener per salvare le modifiche alle associazioni giocatore-utente
    document.getElementById("saveChangesButton").addEventListener("click", async () => {
        await saveChanges();
    });
}

/**
 * Aggiorna lo stato di un utente (approvato/rifiutato) tramite una richiesta API.
 * @param {string} userId - ID dell'utente da aggiornare.
 * @param {string} status - Nuovo stato dell'utente ("approve" o "reject").
 */
async function updateUserStatus(userId, action) {
    try {
        const response = await fetch(`https://appgis.onrender.com/api/admin/users/${userId}/${action}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            alert(`Utente ${action} con successo.`);
            await loadUsers(); // Aggiorna la tabella degli utenti dopo il cambiamento di stato
        } else {
            alert("Errore nell'aggiornamento dello stato.");
        }
    } catch (error) {
        console.error("Errore:", error);
    }
}

/**
 * Salva le modifiche alle associazioni tra utenti e giocatori.
 * Prende i dati dalla tabella e invia una richiesta API per aggiornare l'associazione.
 */
async function saveChanges() {
    const rows = document.querySelectorAll("#userTableBody tr");

    // Creiamo un array con gli aggiornamenti delle associazioni
    const updates = Array.from(rows).map(row => {
        const userId = row.querySelector(".approveButton").dataset.userId;
        const playerId = row.querySelector(".playerSelect").value; // Giocatore selezionato
        return { userId, playerId };
    });

    try {
        // Per aggiornare l'associazione tra utente e giocatore
        for (const update of updates) {
            const response = await fetch(`https://appgis.onrender.com/api/admin/users/${update.userId}/player`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ giocatoreId: update.playerId })
            });

            if (!response.ok) {
                alert("Errore nel salvataggio delle modifiche.");
                return;
            }
        }

        alert("Modifiche salvate con successo.");
        await loadUsers(); // Ricarica la tabella dopo il salvataggio
    } catch (error) {
        console.error("Errore nel salvataggio:", error);
    }
}
