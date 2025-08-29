document.addEventListener('DOMContentLoaded', () => {

  // --- GESTION DU MENU DÉROULANT ---
  const menuButton = document.querySelector('#menu-toggle-button');
  const dropdownMenu = document.querySelector('#dropdown-menu');
  if (menuButton && dropdownMenu) {
    menuButton.addEventListener('click', () => { dropdownMenu.classList.toggle('show'); });
    window.addEventListener('click', (event) => { if (!dropdownMenu.contains(event.target) && !menuButton.contains(event.target)) { if (dropdownMenu.classList.contains('show')) { dropdownMenu.classList.remove('show'); } } });
  }

  // --- BLOC AJOUTÉ: GESTION DU DRAG-AND-DROP ---
  const mainContainer = document.querySelector('main');
  if (mainContainer) {
      new Sortable(mainContainer, {
          animation: 150,
          ghostClass: 'sortable-ghost'
      });
  }

  // --- INTERACTIVITÉ DU SÉLECTEUR DE PÉRIODE ---
  const timeScaleButtons = document.querySelectorAll('.time-scale-btn');
  timeScaleButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      timeScaleButtons.forEach(btn => btn.classList.remove('active'));
      event.currentTarget.classList.add('active');
    });
  });

  // --- DESSIN DU GRAPHIQUE FICTIF ---
  const vitalsChartCanvas = document.querySelector('#vitals-chart');
  if (vitalsChartCanvas) {
    const ctx = vitalsChartCanvas.getContext('2d');
    const vitalsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0h', '1h', '2h', '3h', '4h', '5h', '6h', '7h'],
        datasets: [{
          label: 'Fréquence Cardiaque (BPM)',
          data: [62, 60, 58, 55, 54, 56, 58, 61],
          borderColor: '#ff3b30',
          backgroundColor: 'rgba(255, 59, 48, 0.2)',
          yAxisID: 'yBPM',
          tension: 0.4,
          fill: true
        }, {
            label: 'Fréq. Respiratoire',
            data: [16, 15, 15, 14, 14, 14, 15, 16],
            borderColor: '#00c8ff',
            backgroundColor: 'rgba(0, 200, 255, 0.2)',
            yAxisID: 'yResp',
            tension: 0.4,
            fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yBPM: { position: 'left', ticks: { color: '#ff3b30' }, grid: { color: 'rgba(160, 160, 160, 0.1)' } },
          yResp: { position: 'right', ticks: { color: '#00c8ff' }, grid: { drawOnChartArea: false } },
          x: { ticks: { color: '#a0a0a0' }, grid: { display: false } }
        },
        plugins: { legend: { labels: { color: '#e2e2e2' } } }
      }
    });
  }

  // --- ANIMATION FICTIVE DES ANNEAUX ---
  const setRingProgress = (ringId, percentage) => {
      const ring = document.getElementById(ringId);
      if(ring) {
          const radius = ring.r.baseVal.value;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (percentage / 100) * circumference;
          ring.style.strokeDasharray = `${circumference} ${circumference}`;
          ring.style.strokeDashoffset = offset;
      }
  };
  
  setRingProgress('ring-move', 75);
  setRingProgress('ring-exercise', 90);
  setRingProgress('ring-stand', 50);

  // --- RÉCUPÉRATION DE L'ANALYSE IA ---
  const fetchAiAnalysis = () => {
    const analysisElement = document.getElementById('ai-analysis-text');
    analysisElement.innerHTML = '<em>🤖 Analyse en cours...</em>';
    fetch('http://127.0.0.1:5000/api/sante/analyse')
      .then(response => {
        if (!response.ok) { return response.json().then(err => Promise.reject(err)); }
        return response.json();
      })
      .then(data => {
        analysisElement.textContent = data.analysis;
      })
      .catch(error => {
        console.error("Erreur lors de la récupération de l'analyse IA:", error);
        const errorMessage = error.error || "Une erreur est survenue.";
        analysisElement.textContent = `⚠️ ${errorMessage}`;
        analysisElement.style.color = '#e57373';
      });
  };
  fetchAiAnalysis();
});