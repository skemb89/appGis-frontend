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
    localStorage.setItem('userId', data.userId); // Memorizza l'ID dell'utente

    // Reindirizza alla pagina del profilo
    window.location.href = 'profilo.html';
  } catch (error) {
    console.error('Errore durante il login:', error);
    showError('Errore durante il login');
  }
});

// Event listener per il pulsante di registrazione
document.getElementById('registerButton').addEventListener('click', async function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://appgis.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.status !== 201) {
      showError(data.message || 'Errore nella registrazione');
      return;
    }

    showError(data.message || 'Registrazione completata! Ora effettua il login.');
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    showError('Errore durante la registrazione');
  }
});
