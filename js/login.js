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

    // Log della risposta del server per verificare i dati ricevuti
    console.log("Risposta del server:", data);

    // Controlla la risposta
    if (response.status !== 200) {
      if (response.status === 403) {
        console.log("Errore: L'utente non è stato ancora approvato.");
        showError('L\'utente non è stato ancora approvato.');
      } else {
        console.log('Errore generico:', data.message || 'Errore nel login');
        showError(data.message || 'Errore nel login');
      }
      return;
    }

    // Verifica se il ruolo è presente nella risposta
    console.log("Ruolo ricevuto:", data.role);

    if (data.role) {
      // Salva il token, il nome utente, l'ID utente e il ruolo in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', data.userId); // Memorizza l'ID del giocatore
      localStorage.setItem('role', data.role); // Memorizza il ruolo

      // Log per vedere i dati nel localStorage
      console.log("Dati salvati in localStorage:");
      console.log("Token:", localStorage.getItem('token'));
      console.log("Username:", localStorage.getItem('username'));
      console.log("User ID:", localStorage.getItem('userId'));
      console.log("Ruolo:", localStorage.getItem('role'));
    } else {
      console.error("Errore: il ruolo non è presente nella risposta del server.");
      showError('Errore nel recupero del ruolo.');
      return;
    }

    // Recupera il nome del giocatore associato all'utente
    const giocatoreResponse = await fetch('https://appgis.onrender.com/api/auth/giocatore', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.token}`  // Invia il token di autenticazione
      }
    });

    const giocatoreData = await giocatoreResponse.json();

    if (giocatoreResponse.status === 200) {
      localStorage.setItem('giocatoreNome', giocatoreData.nomeGiocatore);
    } else {
      console.log('Giocatore non trovato o errore nel recupero');
      localStorage.setItem('giocatoreNome', 'Nessun giocatore associato');
    }

    //Prima del reindirizzamento, aggiungiamo un piccolo timeout per vedere i log
    setTimeout(() => {
       //Reindirizza alla pagina del profilo
      window.location.href = 'profilo.html';
    }, 100); // 2 secondi di attesa per assicurarsi che i log siano visibili prima del reindirizzamento

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
  errorElement.style.opacity = '1'; // Assicurati che l'errore sia visibile
}
