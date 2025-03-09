// Quando il documento è completamente caricato, carica gli utenti
document.addEventListener("DOMContentLoaded", async () => {
    await loadUsers();
});

// Aggiunge un event listener al pulsante "Salva Modifiche"
const saveButton = document.getElementById("saveChangesButton");
if (saveButton) {
    console.log("✅ Pulsante 'Salva Modifiche' trovato! Aggiungo l'event listener.");
    saveButton.addEventListener("click", async () => {
        await saveChanges();
    });
} else {
    console.error("❌ ERRORE: Il pulsante 'Salva Modifiche' non è stato trovato nel DOM!");
}

/**
 * Carica gli utenti e popola la tabella con i dati.
 * Ogni riga include:
 * - Username
 * - Email
 * - Menu a tendina per scegliere il giocatore associato
 * - Menu a tendina per lo stato utente (In attesa / Approvato)
 * - Menu a tendina per il ruolo (User / Admin)
 */
async function loadUsers() {
    try {
        // Richiesta API per ottenere tutti gli utenti
        const response = await fetch("https://appgis.onrender.com/api/admin/users");
        const users = await response.json();

        const tableBody = document.getElementById("userTableBody");
        tableBody.innerHTML = ""; // Pulisce la tabella prima di riempirla con i nuovi dati

        // Itera sugli utenti per creare una riga nella tabella per ciascuno di essi
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

            // Creazione del menu a tendina per il ruolo utente
            const roleSelect = document.createElement("select");
            roleSelect.classList.add("roleSelect");
            roleSelect.dataset.userId = user._id;

            ["user", "admin"].forEach(role => {
                const option = document.createElement("option");
                option.value = role;
                option.textContent = role.charAt(0).toUpperCase() + role.slice(1); // Mostra "User" e "Admin" con maiuscola iniziale
                if (user.role === role) option.selected = true;
                roleSelect.appendChild(option);
            });

            // Creazione del menu a tendina per i giocatori associati
            const playerSelect = document.createElement("select");
            playerSelect.classList.add("playerSelect");
            playerSelect.dataset.userId = user._id;

            // Opzione predefinita (nessun giocatore associato)
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Nessun giocatore";
            playerSelect.appendChild(defaultOption);

            // Carica la lista dei giocatori non associati e seleziona il giocatore corretto
            loadUnassociatedPlayers(playerSelect, user.giocatore ? user.giocatore._id : null);

            // Creazione della riga della tabella
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td></td> <!-- Spazio per il select dei giocatori -->
                <td></td> <!-- Spazio per il select dello stato -->
                <td></td> <!-- Spazio per il select del ruolo -->
            `;

            row.cells[2].appendChild(playerSelect);
            row.cells[3].appendChild(statusSelect);
            row.cells[4].appendChild(roleSelect);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Errore nel caricamento degli utenti:", error);
    }
}

/**
 * Carica l'elenco dei giocatori disponibili (non ancora associati) nel menu a tendina.
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
        console.error("❌ Errore nel caricamento dei giocatori:", error);
    }
}

/**
 * Salva le modifiche dello stato utente, del giocatore associato e del ruolo.
 */
async function saveChanges() {
    const rows = document.querySelectorAll("#userTableBody tr");
    const updates = Array.from(rows).map(row => {
        const userId = row.querySelector(".statusSelect").dataset.userId;
        const playerId = row.querySelector(".playerSelect").value;
        const status = row.querySelector(".statusSelect").value;
        const role = row.querySelector(".roleSelect").value;

        return { userId, playerId, status, role };
    });

    try {
        for (const update of updates) {
            const response = await fetch(`https://appgis.onrender.com/api/admin/users/${update.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ giocatoreId: update.playerId, status: update.status, role: update.role })
            });

            if (!response.ok) {
                alert("❌ Errore nel salvataggio delle modifiche.");
                return;
            }
        }

        alert("✅ Modifiche salvate con successo.");
        await loadUsers(); // Ricarica la tabella dopo il salvataggio
    } catch (error) {
        console.error("❌ Errore nel salvataggio:", error);
    }
}
