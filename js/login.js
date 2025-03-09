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
      if (response.status === 403) {
        // Caso in cui l'utente non è approvato
        showError('L\'utente non è stato ancora approvato.');
      } else {
        // Gestione errore per credenziali non valide
        showError(data.message || 'Errore nel login');
      }
      return;
    }

    // Salva il token, il nome utente, l'ID utente e il ruolo in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', username);
    localStorage.setItem('userId', data.userId); // Memorizza l'ID del giocatore
    localStorage.setItem('role', data.role); // Memorizza il ruolo

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


// Funzione per mostrare un errore all'utente
function showError(message) {
  const errorElement = document.getElementById('error-message'); // Assicurati di avere un elemento HTML con l'id 'error-message'
  errorElement.textContent = message;
  errorElement.style.display = 'block'; // Mostra il messaggio di errore
}