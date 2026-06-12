document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const songsContainer = document.getElementById('songsContainer');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const categoriesWrapper = document.getElementById('categoriesWrapper');
  const pills = document.querySelectorAll('.pill');
  const statsDisplay = document.getElementById('statsDisplay');
  const btnFontMinus = document.getElementById('btnFontMinus');
  const btnFontPlus = document.getElementById('btnFontPlus');
  
  // Grid elements
  const fabGrid = document.getElementById('fabGrid');
  const modalOverlay = document.getElementById('modalOverlay');
  const btnCloseGrid = document.getElementById('btnCloseGrid');
  const numbersGrid = document.getElementById('numbersGrid');

  // State
  let currentCategory = 'todos';
  let currentSearch = '';
  let fontSize = parseInt(localStorage.getItem('fimeeFontSize')) || 18;

  // Initialize
  init();

  function init() {
    applyFontSize();
    renderGrid();
    renderSongs();
    setupEventListeners();
  }

  // Render logic
  function renderSongs() {
    let filtered = window.canciones;

    // Apply category filter
    if (currentCategory !== 'todos') {
      filtered = filtered.filter(s => s.categoria === currentCategory);
    }

    // Apply search filter
    if (currentSearch) {
      const term = currentSearch.toLowerCase();
      filtered = filtered.filter(s => 
        s.nombre.toLowerCase().includes(term) || 
        s.letra.toLowerCase().includes(term) ||
        s.displayNum.includes(term)
      );
    }

    // Update stats
    statsDisplay.textContent = `Mostrando ${filtered.length} canci${filtered.length === 1 ? 'ón' : 'ones'}`;

    // Render HTML
    if (filtered.length === 0) {
      songsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No encontramos resultados 😕</h3>
          <p>Prueba buscando con otras palabras o selecciona otra categoría.</p>
        </div>
      `;
      return;
    }

    songsContainer.innerHTML = filtered.map(song => `
      <article class="song-card" id="song-${song.id}">
        <div class="song-header">
          <div class="song-title-group">
            <span class="song-number">#${song.displayNum}</span>
            <h2 class="song-title">${song.nombre}</h2>
          </div>
          <span class="badge ${song.categoria}">${getCategoryEmoji(song.categoria)} ${capitalize(song.categoria)}</span>
        </div>
        <div class="lyrics-text" style="font-size: ${fontSize}px;">
          ${formatLyrics(song.letra)}
        </div>
        ${song.ritmoUrl ? `
          <a href="${song.ritmoUrl}" target="_blank" rel="noopener noreferrer" class="btn-ritmo">
            ▶️ Escuchar ritmo
          </a>
        ` : ''}
      </article>
    `).join('');
  }

  function renderGrid() {
    numbersGrid.innerHTML = window.canciones.map(song => `
      <button class="num-btn" data-id="${song.id}">${song.displayNum}</button>
    `).join('');
  }

  // Helpers
  function formatLyrics(text) {
    // Process instructions in brackets [...]
    return text.replace(/\[(.*?)\]/g, (match, p1) => {
      return `<div class="instruction">${p1}</div>`;
    });
  }

  function getCategoryEmoji(cat) {
    const emojis = {
      clasico: '🎵',
      ataque: '⚔️',
      burla: '😂',
      calientes: '💃',
      respuesta: '💬',
      aguante: '💪',
      falla: '😤'
    };
    return emojis[cat] || '🔥';
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Event Listeners
  function setupEventListeners() {
    // Category pills
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        // Remove active class
        pills.forEach(p => p.classList.remove('active'));
        // Add to clicked
        const clickedPill = e.target.closest('.pill');
        clickedPill.classList.add('active');
        // Update state and render
        currentCategory = clickedPill.dataset.category;
        renderSongs();
      });
    });

    // Search
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      
      // Toggle clear button
      if (currentSearch.length > 0) {
        searchClear.classList.add('visible');
      } else {
        searchClear.classList.remove('visible');
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        renderSongs();
      }, 150);
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      searchClear.classList.remove('visible');
      renderSongs();
    });

    // Font size controls
    btnFontMinus.addEventListener('click', () => {
      if (fontSize > 14) {
        fontSize -= 2;
        applyFontSize();
        updateCardsFontSize();
      }
    });

    btnFontPlus.addEventListener('click', () => {
      if (fontSize < 32) {
        fontSize += 2;
        applyFontSize();
        updateCardsFontSize();
      }
    });

    // Grid Modal
    fabGrid.addEventListener('click', () => {
      modalOverlay.classList.add('active');
    });

    btnCloseGrid.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });

    // Grid buttons
    numbersGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('num-btn')) {
        const id = e.target.dataset.id;
        modalOverlay.classList.remove('active');
        
        // Ensure we are viewing "Todos" or the song won't be found
        if (currentCategory !== 'todos' || currentSearch !== '') {
          // Reset filters
          document.querySelector('.pill[data-category="todos"]').click();
          searchClear.click();
        }

        setTimeout(() => {
          scrollToSong(id);
        }, 100);
      }
    });
  }

  function applyFontSize() {
    localStorage.setItem('fimeeFontSize', fontSize);
  }

  function updateCardsFontSize() {
    document.querySelectorAll('.lyrics-text').forEach(el => {
      el.style.fontSize = fontSize + 'px';
    });
  }

  function scrollToSong(id) {
    const card = document.getElementById(`song-${id}`);
    if (card) {
      // Calculate position adjusting for sticky headers
      const yOffset = -120; // Search bar + header
      const y = card.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({top: y, behavior: 'smooth'});
      
      // Highlight effect
      card.classList.add('highlight');
      setTimeout(() => {
        card.classList.remove('highlight');
      }, 1500);
    }
  }
});
