document.addEventListener('DOMContentLoaded', () => {
  const playerSelect = document.getElementById('playerSelect');
  const newPlayerDiv = document.getElementById('newPlayerDiv');
  
  // Gestire il cambiamento nella selezione del giocatore
  playerSelect.addEventListener('change', () => {
    if (playerSelect.value === 'newPlayer') {
      // Mostra il campo per aggiungere un nuovo giocatore
      newPlayerDiv.style.display = 'block';
    } else {
      // Nascondi il campo per aggiungere un nuovo giocatore
      newPlayerDiv.style.display = 'none';
    }
  });

  // Gestione della registrazione (esempio)
  document.getElementById('registerButton').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    let selectedPlayer = document.getElementById('playerSelect').value;
    const newPlayerName = document.getElementById('newPlayerName').value;

    // Se l'utente ha scelto di creare un nuovo giocatore
    if (selectedPlayer === 'newPlayer' && newPlayerName) {
      // Effettua l'operazione per creare un nuovo giocatore (via API)
      selectedPlayer = newPlayerName;
    }

    // Validazione e invio dei dati al server
    if (username && email && password && selectedPlayer) {
      // Esegui il submit dei dati (inviare tramite fetch o altro metodo)
      handleRegister(username, email, password, selectedPlayer, newPlayerName); // Passa tutti i parametri
    } else {
      showErrorMessage('Tutti i campi sono obbligatori.');
    }
  });
});

// Funzione per ottenere i giocatori non associati
async function getUnassociatedPlayers() {
try {
  // Chiamata API per ottenere i giocatori non associati
  const response = await fetch('https://appgis.onrender.com/api/players/unassociated');
  const players = await response.json();

  // Se ci sono giocatori non associati, aggiungili alla combo
  const playerSelect = document.getElementById('playerSelect');
  players.forEach(player => {
    const option = document.createElement('option');
    option.value = player._id; // L'ID del giocatore sarà il valore
    option.textContent = player.nome; // Nome del giocatore
    playerSelect.insertBefore(option, playerSelect.lastElementChild); // Inserisce prima dell'elemento "Nuovo Giocatore"
  });
} catch (error) {
  console.error('Errore nel recupero dei giocatori:', error);
  // Gestisci l'errore come preferisci
}
}

// Funzione per gestire il comportamento della combo box
function handlePlayerSelection() {
const playerSelect = document.getElementById('playerSelect');
const newPlayerDiv = document.getElementById('newPlayerDiv');
const newPlayerName = document.getElementById('newPlayerName');

// Mostra il campo per inserire un nuovo giocatore se viene selezionato "Nuovo giocatore"
if (playerSelect.value === 'newPlayer') {
  newPlayerDiv.style.display = 'block';
  newPlayerName.required = true; // Rendi obbligatorio il nome del nuovo giocatore
} else {
  newPlayerDiv.style.display = 'none';
  newPlayerName.required = false; // Non è più obbligatorio se non si seleziona "Nuovo giocatore"
}
}

// Funzione per inviare il form di registrazione
async function handleRegister(username, email, password, selectedPlayer, newPlayerName) {
// Se l'utente ha scelto "Nuovo giocatore", creiamo un nuovo giocatore
let playerId = selectedPlayer;
if (selectedPlayer === 'newPlayer') {
  // Aggiungiamo un nuovo giocatore
  try {
    const response = await fetch('https://appgis.onrender.com/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome: newPlayerName })
    });

    const newPlayer = await response.json();
    playerId = newPlayer._id; // Usa l'ID del nuovo giocatore
  } catch (error) {
    showErrorMessage('Errore durante l\'aggiunta del nuovo giocatore.');
    return;
  }
}

// Invia i dati dell'utente e il giocatore associato
try {
  const response = await fetch('https://appgis.onrender.com/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password, giocatore: playerId })
  });

  if (response.ok) {
    showSuccessMessage(username); // Mostra il messaggio di successo con il nome utente
    setTimeout(() => {
      window.location.href = 'index.html'; // Redirigi alla pagina di login dopo un breve timeout
    }, 5000); // Timeout di 5 secondi
  } else {
    showErrorMessage('Errore durante la registrazione.');
  }
} catch (error) {
  console.error('Errore durante la registrazione:', error);
  showErrorMessage('Errore nel server durante la registrazione.');
}
}

// Funzione per mostrare il messaggio di errore
function showErrorMessage(message) {
const errorMessage = document.getElementById('error-message');
errorMessage.textContent = message;
errorMessage.style.display = 'block';
}

// Funzione per mostrare il messaggio di successo
function showSuccessMessage(username) {
const successMessage = document.getElementById('success-message');
successMessage.textContent = `${username}, la tua registrazione è avvenuta con successo! Rimani in attesa di una mail con la conferma di ammissione da parte dell'amministratore.`;
successMessage.style.display = 'block';

// Nascondi il messaggio di errore, se presente
const errorMessage = document.getElementById('error-message');
errorMessage.style.display = 'none';
}

// Aggiungi gli eventi ai selettori
document.getElementById('registerButton').addEventListener('click', handleRegister);
document.getElementById('playerSelect').addEventListener('change', handlePlayerSelection);

// Carica i giocatori non associati al caricamento della pagina
window.onload = getUnassociatedPlayers;
