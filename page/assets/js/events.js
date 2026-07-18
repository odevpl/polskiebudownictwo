document.querySelectorAll('[data-event-description]').forEach(description => {
  const toggle = description.parentElement.querySelector('[data-event-description-toggle]');
  if (!toggle || description.scrollHeight <= description.clientHeight + 1) return;

  description.classList.add('is-truncated');
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const expanded = description.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Pokaż mniej' : 'Pokaż więcej';
  });
});
