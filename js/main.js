/* ============================================================
   Nav scroll effect
   ============================================================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ============================================================
   Mobile hamburger
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ============================================================
   Reveal on scroll
   ============================================================ */
const revealTargets = document.querySelectorAll(
  '.timeline-content, .project-card, .contact-card, .about-card, .about-text, .writing-placeholder'
);

revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

revealTargets.forEach(el => observer.observe(el));

/* ============================================================
   Active nav link on scroll
   ============================================================ */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
  const scrollMid = window.scrollY + window.innerHeight * 0.35;
  let current = sections[0].id;
  sections.forEach(s => {
    if (s.offsetTop <= scrollMid) current = s.id;
  });
  navAnchors.forEach(a => {
    const active = a.getAttribute('href') === '#' + current;
    a.style.color = active ? 'var(--accent)' : '';
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ============================================================
   GLITCH_HUNTER mini-game
   ============================================================ */
const GLITCH_EMOJIS = ['⚡', '🔴', '💀', '👾', '🐛', '❌', '⚠️'];
const GAME_DURATION = 30;

let gameScore = 0;
let gameBest = parseInt(localStorage.getItem('glitchBest') || '0', 10);
let gameTimer = GAME_DURATION;
let gameInterval = null;
let spawnInterval = null;
let gameRunning = false;

const scoreEl  = document.getElementById('game-score');
const timerEl  = document.getElementById('game-timer');
const bestEl   = document.getElementById('game-best');
const gameArea = document.getElementById('game-area');
const overlay  = document.getElementById('game-overlay');
const startBtn = document.getElementById('game-start-btn');

bestEl.textContent = gameBest;

function spawnGlitch() {
  if (!gameRunning) return;

  const el = document.createElement('div');
  el.className = 'glitch-target';
  el.textContent = GLITCH_EMOJIS[Math.floor(Math.random() * GLITCH_EMOJIS.length)];

  const areaRect = gameArea.getBoundingClientRect();
  const maxX = areaRect.width - 50;
  const maxY = areaRect.height - 50;
  el.style.left = Math.max(5, Math.floor(Math.random() * maxX)) + 'px';
  el.style.top  = Math.max(5, Math.floor(Math.random() * maxY)) + 'px';

  const lifetime = 1200 + Math.random() * 1500;
  gameArea.appendChild(el);

  const timeout = setTimeout(() => {
    if (el.parentNode) el.remove();
  }, lifetime);

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    clearTimeout(timeout);
    gameScore++;
    scoreEl.textContent = gameScore;

    const pop = document.createElement('div');
    pop.textContent = '+1';
    pop.style.cssText = `
      position:absolute; left:${el.style.left}; top:${el.style.top};
      color:#38bdf8; font-family:var(--mono); font-size:.85rem; font-weight:700;
      pointer-events:none; animation:fadeUp .5s forwards;
      text-shadow: 0 0 8px rgba(56,189,248,.8);
    `;
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
  gameArea.querySelectorAll('.glitch-target').forEach(g => g.remove());

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

  const gameOver = document.createElement('div');
  gameOver.className = 'game-over-overlay';
  gameOver.innerHTML = `
    <h3>GAME OVER</h3>
    <p>Score: <strong style="color:#38bdf8">${gameScore}</strong> glitches eliminated</p>
    ${gameScore > 0 && gameScore === gameBest ? '<p style="color:#34d399">New best! 🏆</p>' : ''}
    <button class="btn btn-primary" onclick="this.closest('.game-over-overlay').remove(); startGame();">
      Play again
    </button>
  `;
  gameArea.appendChild(gameOver);
}

startBtn.addEventListener('click', startGame);

/* footer eye Easter egg hint */
const footerHint = document.getElementById('footer-hint');
if (footerHint) {
  footerHint.addEventListener('click', () => {
    document.getElementById('fun').scrollIntoView({ behavior: 'smooth' });
  });
}
