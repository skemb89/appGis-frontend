// Funzione per generare un saluto casuale
function generateGreeting(username) {
  const greetings = [
    "Ciao",
    "Benvenuto",
    "Salve",
    "Ehi",
    "Ciao, come va?",
    "Sei un necro?"
  ];

  // Scegli un saluto casuale
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Mostra il saluto con il nome utente
  return `${randomGreeting} ${username}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Utente";
  const userId = localStorage.getItem("userId");  // Recupera l'ID utente dal localStorage
  const giocatoreNome = localStorage.getItem("giocatoreNome");  // Recupera il nome del giocatore dal localStorage

  // Mostra il nome utente nella sidebar
  const userInfoElement = document.getElementById("user-info");
  if (userInfoElement) {
    userInfoElement.textContent = giocatoreNome || "Nessun giocatore associato";  // Se il nome del giocatore non è disponibile, mostra "Nessun giocatore associato"
  }

  // Mostra il saluto con il nome utente
  const greetingElement = document.getElementById("greeting");
  if (greetingElement) {
    greetingElement.textContent = generateGreeting(giocatoreNome || username);  // Saluto casuale con il nome utente
  }

  // Se non c'è un token o un ID, rimanda alla pagina di login
  if (!token || !userId) {
    console.error('User ID non trovato');
    window.location.href = "index.html";  // Redirigi al login se manca il token o l'ID
    return;
  }

  // Funzione per recuperare i giochi dell'utente
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
          row.insertCell(2).textContent = gioco.dataPubblicazione || 'N/A'; // Data di pubblicazione
          row.insertCell(3).textContent = gioco.durataMedia;
          row.insertCell(4).textContent = gioco.difficolta;
          row.insertCell(5).textContent = gioco.posizione || 'N/A';
          
          // Aggiungi immagine
          const imgCell = row.insertCell(6);
          const img = document.createElement("img");
          img.src = gioco.immagine || 'path_to_default_image.jpg';  // Usa un'immagine predefinita se manca l'URL
          img.alt = gioco.nome;
          img.style.width = '50px';  // Imposta una dimensione moderata per l'immagine
          img.style.height = 'auto';
          imgCell.appendChild(img);
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
      localStorage.removeItem("giocatoreNome"); // Rimuovi anche il nome del giocatore dal localStorage
      window.location.href = "index.html";
    });
  }
});
