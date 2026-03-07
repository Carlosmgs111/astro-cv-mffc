function initTimelines(): void {
  document.querySelectorAll<HTMLElement>('[data-timeline-scroll]').forEach((scrollContainer) => {
    const timelineId = scrollContainer.dataset.timelineScroll!;
    const pointsContainer = document.querySelector<HTMLElement>(`[data-timeline-points="${timelineId}"]`);
    const indicatorEl = document.querySelector<HTMLElement>(`[data-timeline-indicator="${timelineId}"]`);
    const section = scrollContainer.closest('.timeline-section');
    if (!pointsContainer || !section) return;

    const points = pointsContainer.querySelectorAll<HTMLElement>('.timeline-point');
    const infoboxes = scrollContainer.querySelectorAll<HTMLElement>('.timeline-infobox');
    const backgrounds = section.querySelectorAll<HTMLElement>('.timeline-background');
    const wrappers = scrollContainer.querySelectorAll<HTMLElement>('.timeline-infobox-wrapper');

    let currentIndex = 0;
    let lastDirection = 1;

    function selectItem(index: number): void {
      if (index === currentIndex && infoboxes[index]?.classList.contains('selected')) return;

      const direction = index > currentIndex ? 1 : -1;
      if (direction !== lastDirection && indicatorEl) {
        indicatorEl.classList.toggle('swapped', direction === -1);
        lastDirection = direction;
      }

      currentIndex = index;

      points.forEach((p, i) => p.classList.toggle('selected', i === index));
      infoboxes.forEach((box, i) => box.classList.toggle('selected', i === index));
      backgrounds.forEach((bg, i) => bg.classList.toggle('selected', i === index));

      if (indicatorEl && points[index]) {
        const pointRect = points[index].getBoundingClientRect();
        const containerRect = pointsContainer!.getBoundingClientRect();
        const leftPercent = ((pointRect.left + pointRect.width / 2 - containerRect.left) / containerRect.width) * 100;
        indicatorEl.style.left = `${leftPercent}%`;
      }

      if (wrappers[index]) {
        wrappers[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }

    points.forEach((point, i) => {
      point.addEventListener('click', () => selectItem(i));
    });

    let scrollTimeout: ReturnType<typeof setTimeout>;
    scrollContainer.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const containerRect = scrollContainer.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;

        let closestIndex = 0;
        let closestDist = Infinity;

        wrappers.forEach((wrapper, i) => {
          const rect = wrapper.getBoundingClientRect();
          const dist = Math.abs(rect.left + rect.width / 2 - centerX);
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        });

        selectItem(closestIndex);
      }, 100);
    });

    selectItem(0);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTimelines);
} else {
  initTimelines();
}
