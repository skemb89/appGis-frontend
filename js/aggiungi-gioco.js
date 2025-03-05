document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("resultsContainer");
    const gameDetailsModal = document.getElementById("gameDetailsModal");
    const closeModalButton = document.getElementById("closeModal");
    const gameDetailsContent = document.getElementById("gameDetailsContent");
    let timeout = null;
    let activeRequests = 0; // Per limitare le richieste simultanee
    const MAX_CONCURRENT_REQUESTS = 5; // Numero massimo di richieste simultanee
  
    // 🔹 Debounce migliorato per evitare troppe chiamate API
    searchInput.addEventListener("input", () => {
      clearTimeout(timeout);
      const query = searchInput.value.trim();
  
      if (!query) {
        resultsContainer.innerHTML = "";
        return;
      }
  
      timeout = setTimeout(() => {
        fetchGames(query);
      }, 700); // Aspetta 700ms dopo l'ultima digitazione prima di cercare
    });
  
    // 📌 Recupera i giochi solo quando ci sono abbastanza "spazi" per le richieste simultanee
    async function fetchGames(query) {
      try {
        if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
          console.warn("Troppe richieste in corso. Attendi...");
          return;
        }
  
        activeRequests++; // Incrementa il contatore delle richieste attive
        const response = await fetch(`https://boardgamegeek.com/xmlapi2/search?query=${query}&type=boardgame`);
        activeRequests--; // Decrementa il contatore delle richieste attive
  
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
  
        const items = xml.getElementsByTagName("item");
        resultsContainer.innerHTML = "";
  
        if (items.length === 0) {
          resultsContainer.innerHTML = "<p>Nessun gioco trovato.</p>";
          return;
        }
  
        for (let item of items) {
          const id = item.getAttribute("id");
          const name = item.querySelector("name")?.getAttribute("value") || "Sconosciuto";
          const year = item.querySelector("yearpublished")?.getAttribute("value") || "N/A";
  
          // Carica l'immagine con una seconda chiamata API
          const gameResponse = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${id}`);
          const gameText = await gameResponse.text();
          const gameXml = parser.parseFromString(gameText, "text/xml");
          const imageUrl = gameXml.querySelector("image")?.textContent || "https://via.placeholder.com/100";
  
          const gameCard = document.createElement("div");
          gameCard.classList.add("game-card");
          gameCard.innerHTML = `
            <img src="${imageUrl}" alt="${name}" class="game-image">
            <div class="game-info">
              <p class="game-title">${name}</p>
              <p class="game-year">${year}</p>
            </div>
          `;
  
          // Mostra i dettagli quando l'utente clicca
          gameCard.addEventListener("click", () => showGameDetails(id));
  
          resultsContainer.appendChild(gameCard);
        }
      } catch (error) {
        console.error("Errore durante la ricerca:", error);
        resultsContainer.innerHTML = "<p>Si è verificato un errore durante la ricerca.</p>";
      }
    }
  
    // 📌 Funzione per mostrare i dettagli del gioco
    async function showGameDetails(gameId) {
      try {
        if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
          console.warn("Troppe richieste in corso. Attendi...");
          return;
        }
  
        activeRequests++; // Incrementa il contatore delle richieste attive
        const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`);
        activeRequests--; // Decrementa il contatore delle richieste attive
  
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
  
        const game = xml.querySelector("item");
        const name = game.querySelector("name")?.getAttribute("value") || "Sconosciuto";
        const imageUrl = game.querySelector("image")?.textContent || "https://via.placeholder.com/200";
        const rating = game.querySelector("statistics ratings average")?.getAttribute("value") || "N/A";
        const weight = game.querySelector("statistics ratings averageweight")?.getAttribute("value") || "N/A";
        const minPlayers = game.querySelector("minplayers")?.getAttribute("value") || "N/A";
        const maxPlayers = game.querySelector("maxplayers")?.getAttribute("value") || "N/A";
        const playTime = game.querySelector("playingtime")?.getAttribute("value") || "N/A";
  
        // Estrai il designer correttamente
        const designerNodes = game.querySelectorAll('link[type="boardgamedesigner"]');
        const designers = designerNodes.length > 0
          ? Array.from(designerNodes).map(node => node.getAttribute("value")).join(", ")
          : "N/A";
  
        gameDetailsContent.innerHTML = `
          <img src="${imageUrl}" class="game-detail-image">
          <h2 class="game-detail-title">${name}</h2>
          <p><strong>⭐ Rating Medio:</strong> ${rating}</p>
          <p><strong>🎭 Difficoltà (Weight):</strong> ${weight}</p>
          <p><strong>👥 Giocatori:</strong> ${minPlayers} - ${maxPlayers}</p>
          <p><strong>⏳ Durata Media:</strong> ${playTime} min</p>
          <p><strong>🎨 Designer:</strong> ${designers}</p>
        `;
  
        gameDetailsModal.classList.add("visible");
      } catch (error) {
        console.error("Errore nel recupero dettagli:", error);
      }
    }
  
    // 📌 Funzione per chiudere la modale
    closeModalButton.addEventListener("click", () => {
      gameDetailsModal.classList.remove("visible");
    });
  
    // 📌 Aggiungi l'evento per la X che cancella il contenuto della barra di ricerca
    document.getElementById("clearSearch").addEventListener("click", function () {
      searchInput.value = ""; 
      searchInput.focus();
      resultsContainer.innerHTML = "";  // Pulisce anche la lista dei giochi
    });
  });
  