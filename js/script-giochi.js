// Funzione per ottenere i giochi di un singolo giocatore
async function getGamesForPlayer(playerId) {
    if (!playerId) {
        console.error("ID giocatore non valido");
        return;
    }

    try {
        // Chiamata API per ottenere i giochi del giocatore specificato
        const response = await fetch(`https://appGis.onrender.com/api/giochi/giocatore/${playerId}`);  // Passa l'ID del giocatore nella URL
        
        if (!response.ok) {
            throw new Error('Errore nel recuperare i giochi dal server');
        }

        const giochi = await response.json();

        // Verifica se ci sono giochi restituiti
        if (giochi.length === 0) {
            alert('Nessun gioco trovato per questo giocatore');
            return;
        }

        // Ordina i giochi per nome in ordine alfabetico
        giochi.sort((a, b) => a.nome.localeCompare(b.nome));

        const tableBody = document.getElementById('gamesTable').getElementsByTagName('tbody')[0];

        // Rimuovi eventuali righe precedenti dalla tabella
        tableBody.innerHTML = '';

        // Aggiungi ogni gioco alla tabella (solo nome e tipologia)
        giochi.forEach(gioco => {
            const row = tableBody.insertRow();

            // Inserisci solo il nome e la tipologia
            row.insertCell(0).textContent = gioco.nome;
            row.insertCell(1).textContent = gioco.tipologia || 'N/A'; // Mostra il nome della tipologia

        });
    } catch (error) {
        console.error('Errore nel recuperare i giochi:', error);
    }
}

// Funzione per ottenere l'ID del giocatore loggato dal localStorage
function getPlayerIdFromLocalStorage() {
    const userId = localStorage.getItem('userId');  // Recupera l'ID utente dal localStorage
    if (!userId) {
        console.error('ID utente non trovato nel localStorage');
        alert('Utente non loggato');
        return null;
    }
    return userId;
}

// Carica i giochi quando la pagina è pronta
document.addEventListener('DOMContentLoaded', () => {
    const playerId = getPlayerIdFromLocalStorage();  // Ottieni l'ID dal localStorage
    if (playerId) {
        getGamesForPlayer(playerId);  // Ottieni i giochi del giocatore
    }
});
