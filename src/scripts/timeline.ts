function initTimelines(): void {
  document.querySelectorAll<HTMLElement>('[data-vtl-line]').forEach((lineFill) => {
    const section = lineFill.closest('.vtl-section');
    if (!section) return;

    const container = section.querySelector('.vtl-container') as HTMLElement | null;
    if (!container) return;

    function updateLineFill(): void {
      const rect = container!.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // How far through the container the viewport center has scrolled
      const scrolled = viewportHeight * 0.5 - rect.top;
      const total = rect.height;
      const pct = Math.min(Math.max(scrolled / total, 0), 1) * 100;

      lineFill.style.height = `${pct}%`;
    }

    window.addEventListener('scroll', updateLineFill, { passive: true });
    updateLineFill();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTimelines);
} else {
  initTimelines();
}
