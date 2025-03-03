document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Utente";
  const userId = localStorage.getItem("userId");  // Recupera l'ID utente dal localStorage

  document.getElementById("user-info").textContent = username;
  const greetingElement = document.getElementById("greeting");

  // Se non c'è un token o un ID, rimanda alla pagina di login
  if (!token || !userId) {
    console.error('User ID non trovato');
    window.location.href = "index.html";  // Redirigi al login se manca il token o l'ID
    return;
  }

  // Mostra il saluto con il nome utente
  if (greetingElement && username) {
    greetingElement.textContent = `Ciao ${username}`;
  }

  async function getUserGames() {
    try {
      const response = await fetch(`https://appgis.onrender.com/api/giochi/giocatore/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`  // Includi il token di autenticazione
        }
      });
  
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response body:', data);
  
      if (!response.ok) {
        throw new Error('Errore nel recuperare i giochi');
      }
  
      const giochi = data;  // Assicurati che `giochi` contenga l'array dei giochi.
  
      const tableBody = document.getElementById("userGamesTable").getElementsByTagName("tbody")[0];
  
      // Se l'array dei giochi è vuoto, mostra un messaggio nella tabella
      if (giochi.length === 0) {
        const row = tableBody.insertRow();
        row.classList.add("no-data");
        row.insertCell(0).colSpan = 8;  // Per fare in modo che la riga copra tutte le colonne
        row.cells[0].textContent = "Nessun gioco disponibile";
      } else {
        // Aggiungi i giochi alla tabella
        giochi.forEach(gioco => {
          const row = tableBody.insertRow();
  
          row.insertCell(0).textContent = gioco.nome;
          row.insertCell(1).textContent = gioco.tipologia.nome;  // Tipologia (nome)
          row.insertCell(2).textContent = gioco.durataMedia;
          row.insertCell(3).textContent = gioco.difficolta;
          row.insertCell(4).textContent = gioco.giocatoriMin;
          row.insertCell(5).textContent = gioco.giocatoriMax;
          row.insertCell(6).textContent = gioco.proprietario.nome;  // Proprietario (nome)
          row.insertCell(7).textContent = gioco.posizione || 'N/A';
        });
      }
    } catch (error) {
      console.error('Errore nel recuperare i giochi dell\'utente:', error);
    }
  }

  // Carica i giochi al caricamento della pagina
  getUserGames();

  // Logout
  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      window.location.href = "index.html";
    });
  }
});
