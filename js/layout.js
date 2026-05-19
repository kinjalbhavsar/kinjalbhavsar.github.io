/* ============================================================
   Shared nav + footer injection
   Runs synchronously at <script defer> time so layout settles
   before paint and reveal observers attach to real DOM.
   ============================================================ */
(function () {
  const NAV_LINKS = [
    { href: '/',              label: 'Bio',      match: ['/', '/index.html'] },
    { href: '/resume.html',   label: 'Resume',   match: ['/resume.html'] },
    { href: '/projects.html', label: 'Projects', match: ['/projects.html'] },
    { href: '/writing.html',  label: 'Writing',  match: ['/writing.html'] },
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
      `<li><a href="${l.href}"${isActive(l) ? ' class="is-active"' : ''}>${l.label}</a></li>`
    ).join('');

    slot.outerHTML = `
      <nav class="nav" id="nav">
        <div class="nav-inner">
          <a class="nav-logo" href="/">KB</a>
          <ul class="nav-links">${linksHtml}</ul>
          <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>`;
  }

  function renderFooter() {
    const slot = document.querySelector('[data-footer]');
    if (!slot) return;

    // Footer eye is always a link to home (data-glitch-trigger).
    // On the bio page, main.js intercepts the click and opens the game modal.
    // On other pages, the click navigates to "/" — the eye becomes a "go discover" hint.
    slot.outerHTML = `
      <footer class="footer">
        <div class="footer-inner">
          <span>Kinjal Bhavsar &copy; 2026</span>
          <a class="footer-hint" id="footer-hint" href="/" data-glitch-trigger title="something's hiding...">&#128065;&#65039;</a>
          <span>Built with &hearts; and plain HTML</span>
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

    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Render immediately — script is at end of <body>, DOM is ready.
  renderNav();
  renderFooter();
  wireNav();
})();
