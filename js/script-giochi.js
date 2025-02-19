// Funzione per ottenere i giochi dal server
async function getGames() {
    try {
        const response = await fetch('https://appGis.onrender.com/api/giochi');  // Usa l'URL del tuo server live
        let giochi = await response.json();

        // Ordina i giochi per nome in ordine alfabetico
        giochi.sort((a, b) => a.nome.localeCompare(b.nome));

        const tableBody = document.getElementById('gamesTable').getElementsByTagName('tbody')[0];

        // Aggiungi ogni gioco alla tabella
        giochi.forEach(gioco => {
            const row = tableBody.insertRow();

            row.insertCell(0).textContent = gioco.nome;
            row.insertCell(1).textContent = gioco.tipologia;
            row.insertCell(2).textContent = gioco.durataMedia;
            row.insertCell(3).textContent = gioco.difficolta;
            row.insertCell(4).textContent = gioco.giocatoriMin;
            row.insertCell(5).textContent = gioco.giocatoriMax;
            row.insertCell(6).textContent = gioco.proprietario;
            row.insertCell(7).textContent = gioco.posizione || 'N/A';
        });
    } catch (error) {
        console.error('Errore nel recuperare i giochi:', error);
    }
}

// Carica i giochi quando la pagina è pronta
window.onload = getGames;
