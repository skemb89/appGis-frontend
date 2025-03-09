// Ascolta l'evento DOMContentLoaded per eseguire il codice quando la pagina è completamente caricata
document.addEventListener("DOMContentLoaded", async function () {
  
  // Recupera il token di autenticazione salvato nel localStorage
  const token = localStorage.getItem('token');
  
  // Se il token non esiste, significa che l'utente non è loggato, quindi lo reindirizza alla pagina di login
  if (!token) {
    window.location.href = 'login.html'; // Reindirizza alla pagina di login
    return; // Ferma l'esecuzione del codice successivo
  }

  try {
    // Effettua una richiesta GET per ottenere il profilo dell'utente, passando il token nell'header per l'autenticazione
    const response = await fetch('https://appgis.onrender.com/api/auth/profile2', {
      method: 'GET', // Metodo di richiesta GET
      headers: {
        'Authorization': `Bearer ${token}`, // Invia il token nell'header di autorizzazione
      },
    });

    // Verifica se la risposta non è OK (ad esempio, errore 404 o 500), e lancia un errore in caso negativo
    if (!response.ok) {
      throw new Error('Errore nel recuperare il profilo');
    }

    // Parso la risposta JSON contenente i dati del profilo
    const data = await response.json();

    // Mostra il nome utente e il nome del giocatore nel documento HTML
    document.getElementById('current-username').textContent = data.username;
    document.getElementById('current-giocatore').textContent = data.giocatore;

    // Se l'utente ha un giocatore associato, imposta il campo del giocatore con il suo ID
    if (data.giocatore) {
      document.getElementById('giocatore').value = data.giocatore._id;
    }

    // Effettua una seconda richiesta per ottenere i giocatori non associati all'utente
    const giocatoriResponse = await fetch('https://appgis.onrender.com/api/players/unassociated', {
      method: 'GET', // Metodo di richiesta GET
    });

    // Verifica se la risposta dei giocatori non associati è OK
    if (!giocatoriResponse.ok) {
      throw new Error('Errore nel recuperare i giocatori');
    }

    // Parso la risposta JSON contenente i giocatori non associati
    const giocatoriData = await giocatoriResponse.json();
    
    // Recupera l'elemento select dal DOM per i giocatori
    const selectElement = document.getElementById('giocatore');

    // Cicla attraverso i giocatori non associati e crea le opzioni per il menu a discesa
    giocatoriData.forEach(giocatore => {
      const option = document.createElement('option'); // Crea un nuovo elemento option
      option.value = giocatore._id; // Imposta il valore dell'opzione come l'ID del giocatore
      option.textContent = giocatore.nome; // Imposta il nome del giocatore come testo dell'opzione
      selectElement.appendChild(option); // Aggiungi l'opzione all'elemento select
    });

  } catch (error) {
    // Se c'è un errore in qualsiasi parte del try, viene catturato qui
    console.error('Errore nel recuperare il profilo:', error);
    alert('Errore nel recuperare il profilo'); // Mostra un messaggio di errore all'utente
  }

  // Aggiungi un listener per il submit del form per modificare il profilo
  document.getElementById('profileForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita il comportamento predefinito del form (che sarebbe il reindirizzamento della pagina)

    // Recupera il valore della password e dell'ID del giocatore selezionato
    const password = document.getElementById('password').value;
    const giocatoreId = document.getElementById('giocatore').value;

    // Prepara un oggetto per i dati da inviare nella richiesta di aggiornamento
    const updateData = {};

    // Se c'è una nuova password, la aggiunge nell'oggetto updateData
    if (password) updateData.password = password;
    // Se è stato selezionato un giocatore, lo aggiunge nell'oggetto updateData
    if (giocatoreId) updateData.giocatoreId = giocatoreId;

    try {
      // Effettua una richiesta PUT per aggiornare i dati del profilo dell'utente
      const updateResponse = await fetch('https://appgis.onrender.com/api/auth/modifica-profilo', {
        method: 'PUT', // Metodo di richiesta PUT (per aggiornare i dati)
        headers: {
          'Authorization': `Bearer ${token}`, // Invia il token nell'header di autorizzazione
          'Content-Type': 'application/json', // Imposta il tipo di contenuto come JSON
        },
        body: JSON.stringify(updateData), // Converte i dati dell'utente in formato JSON per inviarli nel corpo della richiesta
      });

      // Se la risposta non è OK (errore nel server), lancia un errore
      if (!updateResponse.ok) {
        throw new Error('Errore nell\'aggiornare il profilo');
      }

      // Parso la risposta JSON che contiene i dati aggiornati
      const updateDataResponse = await updateResponse.json();
      
      // Mostra un messaggio di successo all'utente
      alert('Profilo aggiornato con successo!');
      
      // Log dei dati restituiti dalla risposta del server per il debug
      console.log(updateDataResponse);

      // Ricarica la pagina per riflettere i cambiamenti nel profilo
      window.location.reload();

    } catch (error) {
      // Se c'è un errore nell'aggiornamento del profilo, viene catturato qui
      console.error('Errore nell\'aggiornare il profilo:', error);
      alert('Errore nell\'aggiornare il profilo'); // Mostra un messaggio di errore all'utente
    }
  });
});
