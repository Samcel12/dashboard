document.addEventListener('DOMContentLoaded', () => {

  // --- GESTION DU MENU DÉROULANT (S'exécute sur toutes les pages) ---
  const menuButton = document.querySelector('#menu-toggle-button');
  const dropdownMenu = document.querySelector('#dropdown-menu');

  if (menuButton && dropdownMenu) {
    // LIGNES RESTAURÉES: Ces deux écouteurs d'événements rendent le menu fonctionnel
    menuButton.addEventListener('click', () => { dropdownMenu.classList.toggle('show'); });
    window.addEventListener('click', (event) => {
      if (!dropdownMenu.contains(event.target) && !menuButton.contains(event.target)) {
        if (dropdownMenu.classList.contains('show')) {
          dropdownMenu.classList.remove('show');
        }
      }
    });
  }

  // --- CODE SPÉCIFIQUE À LA PAGE "TRAVAIL" ---
  const mainContainer = document.querySelector('main');
  const isTravailPage = mainContainer && mainContainer.querySelector('#card-notes');

  if (isTravailPage) {
    const sortable = new Sortable(mainContainer, { animation: 150, ghostClass: 'sortable-ghost' });

    const showErrorOverlay = (cardElement, message) => {
      const overlay = document.createElement('div');
      overlay.className = 'card-error-overlay';
      overlay.innerHTML = `
        <div class="icon">⚠️</div>
        <div class="message">${message}</div>
      `;
      cardElement.appendChild(overlay);
    };

    fetch('http://127.0.0.1:5000/api/travail')
      .then(response => response.json())
      .then(dashboardData => {

        // --- Module NOTES ---
        const notesCard = document.querySelector('#card-notes');
        if (dashboardData.notes.status === 'success') {
          const data = dashboardData.notes.data;
          document.querySelector('#moyenne-generale').textContent = `${data.moyenneGenerale}/20`;
          const listeMatieresEl = document.querySelector('#liste-matieres');
          listeMatieresEl.innerHTML = ''; 
          data.matieres.forEach(m => { listeMatieresEl.innerHTML += `<li>${m.nom}<span class="value">${m.moyenne}</span></li>`; });
          // Note: La logique du graphique doit aussi être ici si vous voulez la restaurer
          const toggleChartButton = document.querySelector('#toggle-chart-button');
          if (toggleChartButton) {
            // ... (coller ici la logique du graphique si besoin) ...
          }
        } else {
          showErrorOverlay(notesCard, dashboardData.notes.message);
        }

        // --- Module DEVOIRS ---
        const devoirsCard = document.querySelector('#card-devoirs');
        if (dashboardData.devoirs.status === 'success') {
          const data = dashboardData.devoirs.data;
          // S'assurer que total n'est pas zéro pour éviter la division par zéro
          const progression = data.total > 0 ? Math.round((data.faits / data.total) * 100) : 0;
          document.querySelector('#progression-devoirs').textContent = `${progression}%`;
          document.querySelector('#liste-devoirs').innerHTML = `<li>Devoirs complétés<span class="value">${data.faits} / ${data.total}</span></li>`;
        } else {
          showErrorOverlay(devoirsCard, dashboardData.devoirs.message);
        }

        // --- Module DUOLINGO ---
        const duolingoCard = document.querySelector('#card-duolingo');
        if (dashboardData.duolingo.status === 'success') {
            const data = dashboardData.duolingo.data;
            document.querySelector('#duolingo-streak').textContent = data.streak;
            document.querySelector('#liste-duolingo').innerHTML = `<li>XP du jour<span class="value">${data.xpDuJour} XP</span></li>`;
        } else {
            showErrorOverlay(duolingoCard, dashboardData.duolingo.message);
        }
      })
      .catch(error => {
        console.error('Erreur de fetch:', error);
        mainContainer.innerHTML = `<p style="text-align: center; color: #e57373;">Impossible de contacter le serveur. Est-il démarré ?</p>`;
      });
  }
});