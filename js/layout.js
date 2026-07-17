/* ============================================================
   Shared nav + footer injection
   Runs synchronously at <script defer> time so layout settles
   before paint and reveal observers attach to real DOM.
   ============================================================ */
(function () {
  const NAV_LINKS = [
    { href: '/',              label: 'About',   match: ['/', '/index.html'] },
    { href: '/resume.html',   label: 'Resume',  match: ['/resume.html'] },
  ];

  function currentPath() {
    let p = location.pathname;
    if (p.endsWith('/')) p = p + 'index.html';
    return p;
  }

  function isActive(link) {
    const path = currentPath();
    if (link.match.includes(path)) return true;
    if (path.endsWith('/index.html') && link.match.includes('/')) return true;
    return false;
  }

  function renderNav() {
    const slot = document.querySelector('[data-nav]');
    if (!slot) return;

    const linksHtml = NAV_LINKS.map(l =>
      `<li><a href="${l.href}"${isActive(l) ? ' class="is-active" aria-current="page"' : ''}>${l.label}</a></li>`
    ).join('');

    slot.outerHTML = `
      <nav class="nav" id="nav">
        <div class="nav-inner">
          <a class="nav-logo" href="/">KB</a>
          <ul class="nav-links" id="primary-navigation">${linksHtml}</ul>
          <button class="hamburger" id="hamburger" aria-label="Open menu" aria-controls="primary-navigation" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>`;
  }

  function renderFooter() {
    const slot = document.querySelector('[data-footer]');
    if (!slot) return;
    const hasGame = document.body.hasAttribute('data-bio');
    const hintLabel = hasGame ? 'Play Glitch Hunter' : 'Back to homepage';
    const hintTitle = hasGame ? "Something's hiding…" : 'Back to the story';

    // Footer eye is always a link to home (data-glitch-trigger).
    // On the bio page, main.js intercepts the click and opens the game modal.
    // On other pages, the click navigates to "/" — the eye becomes a "go discover" hint.
    slot.outerHTML = `
      <footer class="footer">
        <div class="footer-inner">
          <span>Kinjal Bhavsar &copy; 2026 &middot; made in the Bay Area</span>
          <a class="footer-hint" id="footer-hint" href="/" data-glitch-trigger aria-label="${hintLabel}" title="${hintTitle}">&#128065;&#65039;</a>
          <span>Handwritten in plain HTML, with &hearts;</span>
        </div>
      </footer>`;
  }

  function wireNav() {
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (!nav || !hamburger || !navLinks) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    function setMenu(open) {
      navLinks.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    hamburger.addEventListener('click', () => {
      setMenu(!navLinks.classList.contains('open'));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        setMenu(false);
        hamburger.focus();
      }
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        setMenu(false);
      });
    });
  }

  function wirePageActions() {
    document.querySelectorAll('[data-print-resume]').forEach(button => {
      button.addEventListener('click', () => window.print());
    });
  }

  // Render immediately — script is at end of <body>, DOM is ready.
  renderNav();
  renderFooter();
  wireNav();
  wirePageActions();
})();
