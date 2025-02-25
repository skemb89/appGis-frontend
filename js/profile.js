document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const greetingElement = document.getElementById("greeting");

  // Se non c'è un token, rimanda alla pagina di login
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  // Mostra direttamente il saluto con il nome utente salvato
  if (username) {
    greetingElement.textContent = `Ciao ${username}`;
  } else {
    greetingElement.textContent = "Ciao!";
  }

  // Logout
  document.getElementById("logout").addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "index.html";
  });

  //lancio pagina lista giochi
  document.getElementById("viewGames").addEventListener("click", function () {
    window.location.href = "lista-giochi.html";
  });


});
