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
  
      // Pre-seleziona il giocatore associato, se presente
      if (data.giocatore) {
        document.getElementById('giocatore').value = data.giocatore._id;
      }
  
      // Popola il menù a tendina dei giocatori
      const giocatoriResponse = await fetch('https://appgis.onrender.com/api/giocatori', {
        method: 'GET',
      });
  
      if (!giocatoriResponse.ok) {
        throw new Error('Errore nel recuperare i giocatori');
      }
  
      const giocatoriData = await giocatoriResponse.json();
  
      // Popola il menù a tendina con i giocatori
      const selectElement = document.getElementById('giocatore');
      giocatoriData.forEach(giocatore => {
        const option = document.createElement('option');
        option.value = giocatore._id; // L'ID del giocatore
        option.textContent = giocatore.nome; // Il nome del giocatore
        selectElement.appendChild(option);
      });
  
    } catch (error) {
      console.error('Errore nel recuperare il profilo:', error);
      alert('Errore nel recuperare il profilo');
    }
  
    // Gestione dell'invio del modulo per aggiornare il profilo
    document.getElementById('profileForm').addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const giocatoreId = document.getElementById('giocatore').value;
  
      // Prepara i dati da inviare al server per aggiornare l'utente
      const updateData = {
        username,
        giocatoreId, // Il giocatore selezionato
      };
  
      // Se la password è stata modificata, includila nei dati da inviare
      if (password) {
        updateData.password = password;
      }
  
      try {
        // Esegui la richiesta di aggiornamento del profilo
        const updateResponse = await fetch('https://appgis.onrender.com/api/auth/modifica-profilo', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
  
        if (!updateResponse.ok) {
          throw new Error('Errore nell\'aggiornare il profilo');
        }
  
        const updateDataResponse = await updateResponse.json();
        alert('Profilo aggiornato con successo!');
        console.log(updateDataResponse);
  
        // Ricarica la pagina per vedere le modifiche aggiornate
        window.location.reload();
  
      } catch (error) {
        console.error('Errore nell\'aggiornare il profilo:', error);
        alert('Errore nell\'aggiornare il profilo');
      }
    });
  });
  