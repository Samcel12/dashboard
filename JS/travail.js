document.addEventListener('DOMContentLoaded', () => {

  // --- GESTION DU MENU DÉROULANT (INCHANGÉ) ---
  const menuButton = document.querySelector('#menu-toggle-button');
  const dropdownMenu = document.querySelector('#dropdown-menu');
  menuButton.addEventListener('click', () => { dropdownMenu.classList.toggle('show'); });
  window.addEventListener('click', (event) => { if (!dropdownMenu.contains(event.target) && !menuButton.contains(event.target)) { if (dropdownMenu.classList.contains('show')) { dropdownMenu.classList.remove('show'); } } });

  // --- GESTION DU DRAG-AND-DROP (INCHANGÉ) ---
  const container = document.querySelector('main');
  const sortable = new Sortable(container, { animation: 150, ghostClass: 'sortable-ghost' });

  // --- BLOC MODIFIÉ: RÉCUPÉRATION DES DONNÉES DEPUIS LE BACKEND ---
  fetch('http://127.0.0.1:5000/api/travail') // On appelle notre serveur Python
    .then(response => {
      if (!response.ok) {
        throw new Error('La connexion au serveur a échoué.');
      }
      return response.json(); // On convertit la réponse en JSON
    })
    .then(dashboardData => {
      // Tout le code qui met à jour la page est maintenant ici,
      // il ne s'exécute que lorsque les données sont arrivées.
      
      // --- MISE À JOUR DES CARTES ---
      document.querySelector('#moyenne-generale').textContent = `${dashboardData.notes.moyenneGenerale}/20`;
      const listeMatieresEl = document.querySelector('#liste-matieres');
      listeMatieresEl.innerHTML = ''; 
      dashboardData.notes.matieres.forEach(m => { listeMatieresEl.innerHTML += `<li>${m.nom}<span class="value">${m.moyenne}</span></li>`; });
      const progression = Math.round((dashboardData.devoirs.faits / dashboardData.devoirs.total) * 100);
      document.querySelector('#progression-devoirs').textContent = `${progression}%`;
      document.querySelector('#liste-devoirs').innerHTML = `<li>Devoirs complétés<span class="value">${dashboardData.devoirs.faits} / ${dashboardData.devoirs.total}</span></li>`;
      document.querySelector('#duolingo-streak').textContent = dashboardData.duolingo.streak;
      document.querySelector('#liste-duolingo').innerHTML = `<li>XP du jour<span class="value">${dashboardData.duolingo.xpDuJour} XP</span></li>`;

      // --- GESTION DU GRAPHIQUE ---
      const toggleChartButton = document.querySelector('#toggle-chart-button');
      const chartContainer = document.querySelector('#chart-container');
      let averageChart = null;

      toggleChartButton.addEventListener('click', () => {
        const parentCard = toggleChartButton.closest('.card');
        chartContainer.classList.toggle('show');
        parentCard.classList.toggle('card-expanded');
        toggleChartButton.textContent = chartContainer.classList.contains('show') ? '−' : '+';
        sortable.option("disabled", parentCard.classList.contains('card-expanded'));

        setTimeout(() => { if (averageChart) { averageChart.resize(); } }, 400);

        if (chartContainer.classList.contains('show') && !averageChart) {
          const ctx = document.querySelector('#average-chart').getContext('2d');
          averageChart = new Chart(ctx, { /* ... configuration du graphique ... */ });
        }
      });
    })
    .catch(error => {
      // Affiche une erreur si le backend n'est pas accessible
      console.error('Erreur de fetch:', error);
      document.querySelector('main').innerHTML = `<p style="text-align: center; color: #e57373;">Impossible de charger les données. Le serveur backend est-il démarré ?</p>`;
    });
});
