// Quando il documento è completamente caricato, carica gli utenti
document.addEventListener("DOMContentLoaded", async () => {
    checkUserRole(); // Controlla il ruolo dell'utente
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

            // Creazione della cella per username
            const usernameCell = document.createElement("td");
            usernameCell.textContent = user.username;
            row.appendChild(usernameCell);

            // Creazione della cella per email
            const emailCell = document.createElement("td");
            emailCell.textContent = user.email;
            console.log("Email per l'utente", user.username, ":", user.email); // Log per verificare
            row.appendChild(emailCell);

            // Creazione della cella per il giocatore associato
            const playerCell = document.createElement("td");
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

            playerCell.appendChild(playerSelect);
            row.appendChild(playerCell);

            // Creazione della cella per lo stato
            const statusCell = document.createElement("td");
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

            statusCell.appendChild(statusSelect);
            row.appendChild(statusCell);

            // Creazione della cella per il ruolo
            const roleCell = document.createElement("td");
            const roleSelect = document.createElement("select");
            roleSelect.classList.add("roleSelect");
            roleSelect.dataset.userId = user._id;

            ["user", "admin"].forEach(role => {
                const option = document.createElement("option");
                option.value = role;
                option.textContent = role; // Mostra "User" e "Admin" con maiuscola iniziale
                if (user.role === role) option.selected = true;
                roleSelect.appendChild(option);
            });

            roleCell.appendChild(roleSelect);
            row.appendChild(roleCell);

            // Aggiungi la riga alla tabella
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


// Funzione per controllare se l'utente ha il ruolo di 'admin'
function checkUserRole() {
    const role = localStorage.getItem('role');
    console.log("Ruolo dell'utente:", role); // Log per il controllo del ruolo

    if (role !== 'admin') {
        window.location.href = 'accesso-negato.html'; // Reindirizza se non è admin
    }
}