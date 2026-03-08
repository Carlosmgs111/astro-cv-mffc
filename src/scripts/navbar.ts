function initNavbar(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('.navbar-link');
  const toggle = document.getElementById('navbar-toggle');
  const panel = document.getElementById('navbar-panel');
  const overlay = document.getElementById('navbar-overlay');
  if (!links.length) return;

  const sections = Array.from(links).map((link) => {
    const id = link.dataset.section!;
    return document.getElementById(id);
  }).filter(Boolean) as HTMLElement[];

  /* === Scroll spy === */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sections.indexOf(entry.target as HTMLElement);
          if (index !== -1) updateActiveLink(index);
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));

  function updateActiveLink(index: number): void {
    links.forEach((link, i) => link.classList.toggle('active', i === index));
  }

  /* === Smooth scroll on link click === */
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.section!;
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: 'smooth' });
      closePanel();
    });
  });

  /* === Hamburger toggle (mobile) === */
  function closePanel(): void {
    toggle?.classList.remove('open');
    panel?.classList.remove('open');
    overlay?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }

  toggle?.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    panel?.classList.toggle('open', isOpen);
    overlay?.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on overlay click
  overlay?.addEventListener('click', closePanel);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  updateActiveLink(0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbar);
} else {
  initNavbar();
}
