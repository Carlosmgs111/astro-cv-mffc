function initNavbar(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('.navbar-link');
  const indicator = document.getElementById('navbar-indicator');
  if (!links.length) return;

  const sections = Array.from(links).map((link) => {
    const id = link.dataset.section!;
    return document.getElementById(id);
  }).filter(Boolean) as HTMLElement[];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sections.indexOf(entry.target as HTMLElement);
          if (index !== -1) {
            updateActiveLink(index);
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));

  function updateActiveLink(index: number): void {
    links.forEach((link, i) => {
      link.classList.toggle('active', i === index);
    });

    if (indicator && links[index]) {
      const linkRect = links[index].getBoundingClientRect();
      const navRect = links[index].closest('.navbar-links')!.getBoundingClientRect();
      indicator.style.top = `${linkRect.top - navRect.top}px`;
    }
  }

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.section!;
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  updateActiveLink(0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbar);
} else {
  initNavbar();
}
