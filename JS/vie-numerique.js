document.addEventListener('DOMContentLoaded', () => {

  // --- GESTION DU MENU DÉROULANT ---
  const menuButton = document.querySelector('#menu-toggle-button');
  const dropdownMenu = document.querySelector('#dropdown-menu');
  if (menuButton && dropdownMenu) {
    menuButton.addEventListener('click', () => { dropdownMenu.classList.toggle('show'); });
    window.addEventListener('click', (event) => { if (!dropdownMenu.contains(event.target) && !menuButton.contains(event.target)) { if (dropdownMenu.classList.contains('show')) { dropdownMenu.classList.remove('show'); } } });
  }

  // --- GESTION DU DRAG-AND-DROP ---
  const mainContainer = document.querySelector('main');
  if (mainContainer) {
      new Sortable(mainContainer, { animation: 150, ghostClass: 'sortable-ghost' });
  }

  // --- DONNÉES FICTIVES ---
  const screenTimeData = {
    totalMinutes: 225, // 3h 45m
    weeklyMinutes: [180, 210, 240, 190, 260, 300, 225],
    categories: { labels: ["Réseaux Sociaux", "Productivité", "Divertissement", "Autre"], values: [120, 60, 30, 15] },
    topApps: [ {name: "Instagram", time: "1h 15m"}, {name: "VS Code", time: "50m"}, {name: "YouTube", time: "25m"} ],
    habits: { pickups: 89, notifications: 152 }
  };

  // --- MISE À JOUR DES ÉLÉMENTS DE LA PAGE ---

  // 1. Afficher le temps total
  const hours = Math.floor(screenTimeData.totalMinutes / 60);
  const minutes = screenTimeData.totalMinutes % 60;
  document.getElementById('total-screentime').textContent = `${hours}h ${minutes}m`;

  // 2. Dessiner le graphique de l'historique hebdomadaire (barres)
  const weeklyChartCanvas = document.getElementById('weekly-screentime-chart');
  if (weeklyChartCanvas) {
    new Chart(weeklyChartCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
          label: 'Temps d\'écran (minutes)',
          data: screenTimeData.weeklyMinutes,
          backgroundColor: 'rgba(79, 134, 247, 0.6)',
          borderColor: '#4f86f7',
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { display: false }, x: { ticks: { color: '#a0a0a0' }, grid: { display: false } } }, plugins: { legend: { display: false } } }
    });
  }

  // 3. Dessiner le graphique des catégories (anneau)
  const categoryChartCanvas = document.getElementById('category-doughnut-chart');
  if (categoryChartCanvas) {
    new Chart(categoryChartCanvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: screenTimeData.categories.labels,
        datasets: [{
          data: screenTimeData.categories.values,
          backgroundColor: ['#4f86f7', '#a4ff4f', '#ffcc00', '#404258'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e2e2e2', boxWidth: 12 } } } }
    });
  }

  // 4. Remplir la liste des applications
  const topAppsList = document.getElementById('top-apps-list');
  if (topAppsList) {
    topAppsList.innerHTML = '';
    screenTimeData.topApps.forEach(app => {
      const li = `<li><div class="app-icon"></div>${app.name}<span class="value">${app.time}</span></li>`;
      topAppsList.innerHTML += li;
    });
  }

  // 5. Mettre à jour les habitudes
  document.getElementById('phone-pickups').textContent = screenTimeData.habits.pickups;
  document.getElementById('notifications-count').textContent = screenTimeData.habits.notifications;
});