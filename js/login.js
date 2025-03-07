// Funzione per mostrare il messaggio di errore
function showError(message) {
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';  // Mostra il messaggio
  errorMessage.style.opacity = '1';  // Rende visibile il messaggio

  // Nasconde il messaggio dopo 3 secondi
  setTimeout(() => {
    errorMessage.style.opacity = '0';  // Fa svanire il messaggio
    setTimeout(() => {
      errorMessage.style.display = 'none';  // Nasconde il messaggio dopo l'animazione
    }, 500);
  }, 3000);
}

// Event listener per il pulsante di login
document.getElementById('loginButton').addEventListener('click', async function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    // Effettua il login
    const response = await fetch('https://appgis.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.status !== 200) {
      showError(data.message || 'Errore nel login');
      return;
    }

    // Salva il token, il nome utente e l'ID utente in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', username);
    localStorage.setItem('userId', data.userId); // Memorizza l'ID del giocatore

    // Ora recuperiamo il nome del giocatore associato all'utente
    const giocatoreResponse = await fetch('https://appgis.onrender.com/api/auth/giocatore', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.token}`  // Invia il token di autenticazione
      }
    });

    const giocatoreData = await giocatoreResponse.json();

    if (giocatoreResponse.status === 200) {
      // Salva anche il nome del giocatore in localStorage
      localStorage.setItem('giocatoreNome', giocatoreData.nomeGiocatore);
    } else {
      console.log('Giocatore non trovato o errore nel recupero');
      localStorage.setItem('giocatoreNome', 'Nessun giocatore associato');
    }

    // Reindirizza alla pagina del profilo
    window.location.href = 'profilo.html';
  } catch (error) {
    console.error('Errore durante il login:', error);
    showError('Errore durante il login');
  }
});

