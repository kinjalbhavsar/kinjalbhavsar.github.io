/* ============================================================
   Page-wide behaviors
   Feature-gated so each page runs only what it needs.
   ============================================================ */

/* ---------- Reveal on scroll (every page) ---------- */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.timeline-content, .project-card, .bento-card, .writing-placeholder'
  );
  if (targets.length === 0) return;
  targets.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => obs.observe(el));
})();

/* ---------- Time-aware greeting (bio page) ---------- */
(function initGreeting() {
  const slot = document.getElementById('greeting');
  if (!slot) return;
  const h = new Date().getHours();
  let g = 'hello';
  if (h < 5)        g = 'still up';
  else if (h < 12)  g = 'good morning';
  else if (h < 17)  g = 'good afternoon';
  else if (h < 21)  g = 'good evening';
  else              g = 'good night';
  slot.textContent = g;
})();

/* ============================================================
   GLITCH_HUNTER game (loaded only if the dialog exists)
   ============================================================ */
(function initGame() {
  const dialog = document.getElementById('game-dialog');
  if (!dialog) return;

  const GLITCH_EMOJIS = ['⚡', '🔴', '💀', '👾', '🐛', '❌', '⚠️'];
  const GAME_DURATION = 30;

  const scoreEl  = document.getElementById('game-score');
  const timerEl  = document.getElementById('game-timer');
  const bestEl   = document.getElementById('game-best');
  const gameArea = document.getElementById('game-area');
  const overlay  = document.getElementById('game-overlay');
  const startBtn = document.getElementById('game-start-btn');
  const closeBtn = document.getElementById('game-close');

  let gameScore = 0;
  let gameBest = parseInt(localStorage.getItem('glitchBest') || '0', 10);
  let gameTimer = GAME_DURATION;
  let gameInterval = null;
  let spawnInterval = null;
  let gameRunning = false;

  bestEl.textContent = gameBest;

  function spawnGlitch() {
    if (!gameRunning) return;
    const el = document.createElement('div');
    el.className = 'glitch-target';
    el.textContent = GLITCH_EMOJIS[Math.floor(Math.random() * GLITCH_EMOJIS.length)];

    const rect = gameArea.getBoundingClientRect();
    const maxX = rect.width - 50;
    const maxY = rect.height - 50;
    el.style.left = Math.max(5, Math.floor(Math.random() * maxX)) + 'px';
    el.style.top  = Math.max(5, Math.floor(Math.random() * maxY)) + 'px';

    const lifetime = 1200 + Math.random() * 1500;
    gameArea.appendChild(el);
    const timeout = setTimeout(() => { if (el.parentNode) el.remove(); }, lifetime);

    el.addEventListener('click', e => {
      e.stopPropagation();
      clearTimeout(timeout);
      gameScore++;
      scoreEl.textContent = gameScore;

      const pop = document.createElement('div');
      pop.textContent = '+1';
      pop.style.cssText = `
        position:absolute; left:${el.style.left}; top:${el.style.top};
        color:var(--accent); font-family:var(--mono); font-size:.85rem; font-weight:700;
        pointer-events:none; animation:fadeUp .5s forwards;
        text-shadow: 0 0 8px var(--accent);`;
      gameArea.appendChild(pop);
      setTimeout(() => pop.remove(), 500);
      el.remove();
    }, { once: true });
  }

  function startGame() {
    gameScore = 0;
    gameTimer = GAME_DURATION;
    gameRunning = true;
    scoreEl.textContent = 0;
    timerEl.textContent = GAME_DURATION;

    overlay.style.display = 'none';
    gameArea.querySelectorAll('.glitch-target, .game-over-overlay').forEach(g => g.remove());

    spawnInterval = setInterval(spawnGlitch, 700);
    spawnGlitch();

    gameInterval = setInterval(() => {
      gameTimer--;
      timerEl.textContent = gameTimer;
      if (gameTimer <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    gameArea.querySelectorAll('.glitch-target').forEach(g => g.remove());

    if (gameScore > gameBest) {
      gameBest = gameScore;
      localStorage.setItem('glitchBest', gameBest);
      bestEl.textContent = gameBest;
    }

    const over = document.createElement('div');
    over.className = 'game-over-overlay';
    over.innerHTML = `
      <h3>GAME OVER</h3>
      <p>Score: <strong style="color:var(--accent)">${gameScore}</strong> glitches eliminated</p>
      ${gameScore > 0 && gameScore === gameBest ? '<p style="color:#34d399">New best! 🏆</p>' : ''}
      <button class="btn btn-primary" data-game-restart>Play again</button>`;
    gameArea.appendChild(over);
    over.querySelector('[data-game-restart]').addEventListener('click', () => {
      over.remove();
      startGame();
    });
  }

  function resetUI() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    gameArea.querySelectorAll('.glitch-target, .game-over-overlay').forEach(g => g.remove());
    overlay.style.display = '';
    gameScore = 0;
    gameTimer = GAME_DURATION;
    scoreEl.textContent = 0;
    timerEl.textContent = GAME_DURATION;
  }

  function openModal() {
    resetUI();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeModal() {
    resetUI();
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  startBtn.addEventListener('click', startGame);
  closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click (clicking outside the .game-shell)
  dialog.addEventListener('click', e => {
    if (e.target === dialog) closeModal();
  });

  // Wire all trigger elements (caret in hero, eye in footer).
  // preventDefault keeps an anchor trigger (footer eye links to "/") from navigating
  // on the bio page where the game is available.
  document.querySelectorAll('[data-glitch-trigger]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
    if (el.tagName !== 'BUTTON' && el.tagName !== 'A') {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal();
        }
      });
    }
  });
})();
