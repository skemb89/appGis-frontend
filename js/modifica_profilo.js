document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem('token');
  
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
  
    try {
      const response = await fetch('https://appgis.onrender.com/api/auth/profile2', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Errore nel recuperare il profilo');
      }
  
      const data = await response.json();
      document.getElementById('current-username').textContent = data.username;
      document.getElementById('current-giocatore').textContent = data.giocatore;
  
      if (data.giocatore) {
        document.getElementById('giocatore').value = data.giocatore._id;
      }
  
      const giocatoriResponse = await fetch('https://appgis.onrender.com/api/giocatori', {
        method: 'GET',
      });
  
      if (!giocatoriResponse.ok) {
        throw new Error('Errore nel recuperare i giocatori');
      }
  
      const giocatoriData = await giocatoriResponse.json();
      const selectElement = document.getElementById('giocatore');
      giocatoriData.forEach(giocatore => {
        const option = document.createElement('option');
        option.value = giocatore._id;
        option.textContent = giocatore.nome;
        selectElement.appendChild(option);
      });
  
    } catch (error) {
      console.error('Errore nel recuperare il profilo:', error);
      alert('Errore nel recuperare il profilo');
    }
  
    document.getElementById('profileForm').addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const password = document.getElementById('password').value;
      const giocatoreId = document.getElementById('giocatore').value;
  
      const updateData = {};
  
      if (password) updateData.password = password;
      if (giocatoreId) updateData.giocatoreId = giocatoreId;
  
      try {
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
        window.location.reload();
  
      } catch (error) {
        console.error('Errore nell\'aggiornare il profilo:', error);
        alert('Errore nell\'aggiornare il profilo');
      }
    });
  });
  