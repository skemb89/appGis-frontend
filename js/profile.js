document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Utente";
  document.getElementById("user-info").textContent = username;
  const greetingElement = document.getElementById("greeting");

  // Se non c'è un token, rimanda alla pagina di login
  if (!token) {
    window.location.href = "index.html";
    return;
  }

    // Mostra il saluto con il nome utente (se presente)
    if (greetingElement && username) {
      greetingElement.textContent = `Ciao ${username}`;
    }

    
  // Logout
  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "index.html";
    });
  }
});
