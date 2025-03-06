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

  return greetings[Math.floor(Math.random() * greetings.length)];
}

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Utente";
  const userId = localStorage.getItem("userId");  // Recupera l'ID utente dal localStorage
  const giocatoreNome = localStorage.getItem("giocatoreNome");  // Recupera il nome del giocatore dal localStorage

  // Mostra solo il saluto casuale nell'header
  const greetingElement = document.getElementById("greeting");
  if (greetingElement) {
    greetingElement.textContent = generateGreeting(username);
  }

  // Mostra il nome del giocatore nel main content con stile più grande
  const userInfoElement = document.getElementById("user-info");
  if (userInfoElement) {
    userInfoElement.textContent = giocatoreNome || "Nessun giocatore associato";
  }

  // Se non c'è un token o un ID, rimanda alla pagina di login
  if (!token || !userId) {
    console.error('User ID non trovato');
    window.location.href = "index.html";  // Redirigi al login se manca il token o l'ID
    return;
  }

  // Funzione per recuperare i dettagli del profilo (con foto)
  async function getUserProfile() {
    try {
      const response = await fetch('https://appgis.onrender.com/api/auth/profile-with-photo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`  // Includi il token di autenticazione
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Errore nel recuperare il profilo');
      }

      // Aggiorna il DOM con i dati del profilo
      const usernameElement = document.getElementById('user-info');
      if (usernameElement) {
        usernameElement.textContent = data.username || "Nome utente non disponibile";
      }

      const photoElement = document.getElementById('user-photo');
      if (photoElement) {
        if (data.photo && data.photo !== 'Nessuna foto disponibile') {
          // Se c'è una foto, aggiorna l'elemento img con l'URL della foto
          photoElement.src = data.photo;
        } else {
          // Se non c'è una foto, usa una foto di default
          photoElement.src = '/uploads/default.png';  // Assicurati che questo percorso sia corretto
        }
      }
    } catch (error) {
      console.error(error);
      alert('Errore nel recuperare il profilo utente con foto');
    }
  }

  // Carica i dati del profilo utente al caricamento della pagina
  getUserProfile();

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
