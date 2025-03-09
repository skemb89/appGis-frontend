// Quando il documento è completamente caricato, carica gli utenti
document.addEventListener("DOMContentLoaded", async () => {
    await loadUsers();
});

// Funzione per caricare gli utenti
async function loadUsers() {
    try {
        // Richiesta API per ottenere gli utenti e i giocatori
        const response = await fetch("https://appgis.onrender.com/api/admin/users");
        const data = await response.json();
        const users = data.users;
        const players = data.players;

        const tableBody = document.getElementById("userTableBody");
        tableBody.innerHTML = ""; // Pulisce la tabella prima di riempirla con i nuovi dati

        // Itera sugli utenti per creare una riga nella tabella per ciascuno di essi
        users.forEach(user => {
            const row = document.createElement("tr");

            // Creazione del menu a tendina per i giocatori associati
            const playerSelect = document.createElement("select");
            playerSelect.classList.add("playerSelect");
            playerSelect.dataset.userId = user._id;

            // Aggiungi l'opzione predefinita (Nessun giocatore)
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Nessun giocatore";
            playerSelect.appendChild(defaultOption);

            // Aggiungi tutti i giocatori al menu a tendina
            players.forEach(player => {
                const option = document.createElement("option");
                option.value = player._id;
                option.textContent = player.nome;
                if (user.giocatore && user.giocatore._id === player._id) {
                    option.selected = true; // Se il giocatore è già associato, selezionalo
                }
                playerSelect.appendChild(option);
            });

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

// Aggiungi un listener per il pulsante "Salva Modifiche"
const saveButton = document.getElementById("saveChanges");
if (saveButton) {
    saveButton.addEventListener("click", async () => {
        console.log("✅ Pulsante 'Salva Modifiche' cliccato!");
        await saveChanges();
    });
} else {
    console.error("❌ ERRORE: Il pulsante 'Salva Modifiche' non è stato trovato nel DOM!");
}

// Funzione per salvare le modifiche
async function saveChanges() {
    const rows = document.querySelectorAll("#userTableBody tr");
    const updates = Array.from(rows).map(row => {
        const userId = row.querySelector(".statusSelect").dataset.userId;
        const playerId = row.querySelector(".playerSelect").value;
        const status = row.querySelector(".statusSelect").value;
        const role = row.querySelector(".roleSelect").value;

        // Log per il debug: visualizza i dati che vengono inviati
        console.log('User ID:', userId, 'Player ID:', playerId, 'Status:', status, 'Role:', role);

        return { userId, playerId, status, role };
    });

    try {
        // Itera sugli aggiornamenti e invia la richiesta PUT per ciascun utente
        for (const update of updates) {
            console.log("Aggiornando utente:", update); // Log per il debug
            const response = await fetch(`https://appgis.onrender.com/api/admin/users/${update.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ giocatoreId: update.playerId, status: update.status, role: update.role })
            });

            if (!response.ok) {
                console.error("❌ Errore nel salvataggio delle modifiche.");
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
