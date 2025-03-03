// Funzione per ottenere i giochi dal server
async function getGames() {
    try {
        const response = await fetch('https://appGis.onrender.com/api/giochi');  // Usa l'URL del tuo server live
        let giochi = await response.json();

        // Ordina i giochi per nome in ordine alfabetico
        giochi.sort((a, b) => a.nome.localeCompare(b.nome));

        const tableBody = document.getElementById('gamesTable').getElementsByTagName('tbody')[0];

        // Svuota la tabella prima di riempirla
        tableBody.innerHTML = "";

        // Aggiungi ogni gioco alla tabella
        giochi.forEach(gioco => {
            const row = tableBody.insertRow();

            row.insertCell(0).textContent = gioco.nome;
            row.insertCell(1).textContent = gioco.tipologia ? gioco.tipologia.nome : 'N/A'; // Mostra il nome della tipologia
            row.insertCell(2).textContent = gioco.durataMedia || 'N/A';
            row.insertCell(3).textContent = gioco.difficolta || 'N/A';
            row.insertCell(4).textContent = gioco.giocatoriMin || 'N/A';
            row.insertCell(5).textContent = gioco.giocatoriMax || 'N/A';
            row.insertCell(6).textContent = gioco.proprietario ? gioco.proprietario.nome : 'N/A'; // Mostra il nome del proprietario
            row.insertCell(7).textContent = gioco.posizione || 'N/A';
        });
    } catch (error) {
        console.error('Errore nel recuperare i giochi:', error);
    }
}

// Carica i giochi quando la pagina è pronta
document.addEventListener('DOMContentLoaded', getGames);
