document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Utente";
  document.getElementById("user-info").textContent = username;
  const greetingElement = document.getElementById("greeting");

  // Se non c'è un token, rimanda alla pagina di login
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  // Mostra il saluto con il nome utente (se presente)
  if (greetingElement && username) {
    greetingElement.textContent = `Ciao ${username}`;
  }

  // Aggiungi la logica per mostrare i giochi dell'utente
  const userId = localStorage.getItem("userId");  // Assicurati che l'ID dell'utente sia memorizzato nel localStorage
  if (!userId) {
    console.error("User ID non trovato.");
    return;
  }

  // Funzione per ottenere i giochi dell'utente
  async function getUserGames() {
    try {
      const response = await fetch(`https://appGis.onrender.com/api/giochi/giocatore/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`  // Includi il token di autenticazione
        }
      });
      
      if (!response.ok) {
        throw new Error('Errore nel recuperare i giochi');
      }

      const giochi = await response.json();

      // Mostra i giochi in una tabella
      const tableBody = document.getElementById("userGamesTable").getElementsByTagName("tbody")[0];

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
