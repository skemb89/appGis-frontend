document.addEventListener("DOMContentLoaded", async function () {
    // Recuperiamo il token JWT dal localStorage
    const token = localStorage.getItem('token');
  
    if (!token) {
      // Se non c'è il token, redirigi alla pagina di login
      window.location.href = 'login.html';
      return;
    }
  
    try {
      // Eseguiamo la richiesta per ottenere il profilo dell'utente
      const response = await fetch('https://appgis.onrender.com/api/auth/profile2', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Aggiungi il token nella richiesta
        },
      });
  
      if (!response.ok) {
        throw new Error('Errore nel recuperare il profilo');
      }
  
      const data = await response.json();
  
      // Mostra le informazioni dell'utente nel form
      document.getElementById('current-username').textContent = data.username;
      document.getElementById('current-giocatore').textContent = data.giocatore;
  
    } catch (error) {
      console.error('Errore nel recuperare il profilo:', error);
      // Mostra un messaggio di errore se la richiesta non va a buon fine
      alert('Errore nel recuperare il profilo');
    }
  });
  