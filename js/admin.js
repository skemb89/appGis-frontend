// Quando il documento è completamente caricato, chiama la funzione per caricare gli utenti
document.addEventListener("DOMContentLoaded", async () => {
    await loadUsers();
});

/**
 * Carica gli utenti e popola la tabella con i dati.
 * Ogni riga include: username, email, un menu a tendina per scegliere il giocatore associato e uno per lo stato utente.
 */
async function loadUsers() {
    try {
        // Richiesta API per ottenere gli utenti in attesa di approvazione
        const response = await fetch("https://appgis.onrender.com/api/admin/users");
        const users = await response.json();
        
        const tableBody = document.getElementById("userTableBody");
        tableBody.innerHTML = ""; // Pulisce la tabella prima di riempirla con i nuovi dati

        users.forEach(user => {
            const row = document.createElement("tr");

            // Creazione del menu a tendina per lo stato utente
            const statusSelect = document.createElement("select");
            statusSelect.classList.add("statusSelect");
            statusSelect.dataset.userId = user._id;

            ["In attesa", "Approvato"].forEach(status => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                if (user.status === status) option.selected = true;
                statusSelect.appendChild(option);
            });

            // Creazione della riga della tabella
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <select class="playerSelect">
                        <option value="">Nessun giocatore</option>
                    </select>
                </td>
                <td></td>
            `;

            row.querySelector("td:last-child").appendChild(statusSelect);
            tableBody.appendChild(row);

            // Carica la lista dei giocatori non associati e seleziona il giocatore associato all'utente (se esiste)
            loadUnassociatedPlayers(row.querySelector(".playerSelect"), user.associatedPlayer);
        });

        // Aggiunge l'event listener per il salvataggio delle modifiche
        document.getElementById("saveChangesButton").addEventListener("click", async () => {
            await saveChanges();
        });

    } catch (error) {
        console.error("Errore nel caricamento degli utenti:", error);
    }
}

/**
 * Carica l'elenco dei giocatori disponibili (non ancora associati) nel menu a tendina della riga utente.
 */
async function loadUnassociatedPlayers(selectElement, selectedPlayerId) {
    try {
        const response = await fetch("https://appgis.onrender.com/api/admin/players/unassociated");
        const players = await response.json();

        players.forEach(player => {
            const option = document.createElement("option");
            option.value = player._id;
            option.textContent = player.nome;
            if (player._id === selectedPlayerId) option.selected = true;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error("Errore nel caricamento dei giocatori:", error);
    }
}

/**
 * Salva le modifiche allo stato utente e all'associazione con il giocatore in un'unica richiesta.
 */
async function saveChanges() {
    const rows = document.querySelectorAll("#userTableBody tr");
    const updates = Array.from(rows).map(row => {
        const userId = row.querySelector(".statusSelect").dataset.userId;
        const playerId = row.querySelector(".playerSelect").value;
        const status = row.querySelector(".statusSelect").value;

        return { userId, playerId, status };
    });

    try {
        for (const update of updates) {
            const response = await fetch(`https://appgis.onrender.com/api/admin/users/${update.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ giocatoreId: update.playerId, status: update.status })
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
