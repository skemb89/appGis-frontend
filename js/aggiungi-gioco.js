document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("resultsContainer");
  const gameDetailsModal = document.getElementById("gameDetailsModal");
  const closeModalButton = document.getElementById("closeModal");
  const gameDetailsContent = document.getElementById("gameDetailsContent");
  const loadingSpinner = document.getElementById("loadingSpinner");
  let timeout = null;
  let activeRequests = 0;
  const MAX_CONCURRENT_REQUESTS = 5;
  const MAX_RESULTS = 20;
  const MAX_IMAGE_REQUESTS = 20; // 🔹 Limite massimo di richieste immagini

  searchInput.addEventListener("input", () => {
      clearTimeout(timeout);
      const query = searchInput.value.trim();

      if (!query) {
          resultsContainer.innerHTML = "";
          return;
      }

      timeout = setTimeout(() => {
          fetchGames(query);
      }, 700);
  });

  async function fetchGames(query) {
      try {
          showLoading();

          if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
              console.warn("Troppe richieste in corso. Attendi...");
              return;
          }

          activeRequests++;
          const response = await fetch(`https://boardgamegeek.com/xmlapi2/search?query=${query}&type=boardgame`);
          activeRequests--;

          const text = await response.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, "text/xml");
          let items = Array.from(xml.getElementsByTagName("item"));

          if (items.length === 0) {
              resultsContainer.innerHTML = "<p>Nessun gioco trovato.</p>";
              hideLoading();
              return;
          }

          items = items.slice(0, MAX_RESULTS);

          const games = items.map(item => ({
              id: item.getAttribute("id"),
              name: item.querySelector("name")?.getAttribute("value") || "Sconosciuto",
              year: item.querySelector("yearpublished")?.getAttribute("value") || "N/A",
              imageUrl: "https://via.placeholder.com/100"
          }));

          renderGames(games);
          await fetchGameImages(games.slice(0, MAX_IMAGE_REQUESTS)); // 🔹 Limita a 20 richieste immagini

          hideLoading();
      } catch (error) {
          console.error("Errore durante la ricerca:", error);
          resultsContainer.innerHTML = "<p>Si è verificato un errore durante la ricerca.</p>";
          hideLoading();
      }
  }

  function renderGames(games) {
      resultsContainer.innerHTML = "";
      games.forEach(game => {
          const gameCard = document.createElement("div");
          gameCard.classList.add("game-card");
          gameCard.innerHTML = `
              <img src="${game.imageUrl}" alt="${game.name}" class="game-image">
              <div class="game-info">
                  <p class="game-title">${game.name}</p>
                  <p class="game-year">${game.year}</p>
              </div>
          `;

          gameCard.addEventListener("click", () => showGameDetails(game.id));
          resultsContainer.appendChild(gameCard);
      });
  }

  async function fetchGameImages(games) {
      for (const game of games) {
          try {
              if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
                  console.warn("Troppe richieste in corso. Attendi...");
                  return;
              }

              activeRequests++;
              const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${game.id}`);
              activeRequests--;

              const text = await response.text();
              const parser = new DOMParser();
              const xml = parser.parseFromString(text, "text/xml");
              const imageUrl = xml.querySelector("image")?.textContent || "https://via.placeholder.com/100";

              const gameCards = document.querySelectorAll(".game-card");
              gameCards.forEach(card => {
                  if (card.querySelector(".game-title").textContent === game.name) {
                      card.querySelector(".game-image").src = imageUrl;
                  }
              });
          } catch (error) {
              console.error(`Errore nel recupero immagine per ${game.name}:`, error);
          }
      }
  }

  async function showGameDetails(gameId) {
      try {
          if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
              console.warn("Troppe richieste in corso. Attendi...");
              return;
          }

          activeRequests++;
          const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`);
          activeRequests--;

          const text = await response.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, "text/xml");

          const game = xml.querySelector("item");
          const name = game.querySelector("name")?.getAttribute("value") || "Sconosciuto";
          const imageUrl = game.querySelector("image")?.textContent || "https://via.placeholder.com/200";
          
          const rating = (parseFloat(game.querySelector("statistics ratings average")?.getAttribute("value")) || 0).toFixed(2);
          const weight = (parseFloat(game.querySelector("statistics ratings averageweight")?.getAttribute("value")) || 0).toFixed(2);
          const minPlayers = game.querySelector("minplayers")?.getAttribute("value") || "N/A";
          const maxPlayers = game.querySelector("maxplayers")?.getAttribute("value") || "N/A";
          const playTime = game.querySelector("playingtime")?.getAttribute("value") || "N/A";

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

  closeModalButton.addEventListener("click", () => {
      gameDetailsModal.classList.remove("visible");
  });

  document.getElementById("clearSearch").addEventListener("click", function () {
      searchInput.value = "";
      searchInput.focus();
      resultsContainer.innerHTML = "";
  });

  function showLoading() {
      loadingSpinner.style.display = "block";
  }

  function hideLoading() {
      loadingSpinner.style.display = "none";
  }
});
