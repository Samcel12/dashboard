document.addEventListener('DOMContentLoaded', () => {

  // --- GESTION DU MENU DÉROULANT ---
  const menuButton = document.querySelector('#menu-toggle-button');
  const dropdownMenu = document.querySelector('#dropdown-menu');
  menuButton.addEventListener('click', () => { dropdownMenu.classList.toggle('show'); });
  window.addEventListener('click', (event) => { if (!dropdownMenu.contains(event.target) && !menuButton.contains(event.target)) { if (dropdownMenu.classList.contains('show')) { dropdownMenu.classList.remove('show'); } } });

  // --- DONNÉES FICTIVES ---
  const dashboardData = {
    notes: {
      moyenneGenerale: 15.8,
      matieres: [
        { nom: "Mathématiques", moyenne: 17.5 },
        { nom: "Physique-Chimie", moyenne: 16 },
        { nom: "Spé. SIN", moyenne: 18 },
        { nom: "Anglais", moyenne: 14.5 }
      ],
      historiqueMoyenne: {
        labels: ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév"],
        points: [14.2, 14.8, 15.1, 15.0, 15.5, 15.8]
      }
    },
    devoirs: { total: 8, faits: 6 },
    duolingo: { streak: 412, xpDuJour: 80 }
  };

  // --- GESTION DU DRAG-AND-DROP ---
  const container = document.querySelector('main');
  const sortable = new Sortable(container, { animation: 150, ghostClass: 'sortable-ghost' });

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

    // --- LIGNE AJOUTÉE: Redimensionnement du graphique après la transition ---
    setTimeout(() => {
      if (averageChart) {
        averageChart.resize(); // Demande au graphique de se redessiner
      }
    }, 400); // 400ms = durée de la transition dans le CSS

    // Initialisation du graphique (une seule fois)
    if (chartContainer.classList.contains('show') && !averageChart) {
      const ctx = document.querySelector('#average-chart').getContext('2d');
      averageChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dashboardData.notes.historiqueMoyenne.labels,
          datasets: [{
            label: 'Moyenne Générale',
            data: dashboardData.notes.historiqueMoyenne.points,
            borderColor: '#4f86f7',
            backgroundColor: 'rgba(79, 134, 247, 0.2)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          // MODIFIÉ: maintainAspectRatio à false permet plus de flexibilité
          maintainAspectRatio: false, 
          scales: {
            y: { beginAtZero: false, suggestedMin: 10, suggestedMax: 20, ticks: { color: '#a0a0a0' }, grid: { color: 'rgba(160, 160, 160, 0.1)' } },
            x: { ticks: { color: '#a0a0a0' }, grid: { display: false } }
          },
          plugins: { legend: { display: false } }
        }
      });
    }
  });

});