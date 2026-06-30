document.addEventListener('click', event => {
  const openButton = event.target.closest('[data-modal-open]');
  if (openButton) {
    const modal = document.getElementById(openButton.dataset.modalOpen);
    if (modal) {
      modal.hidden = false;
      modal.querySelector('button, input, select, textarea, a')?.focus();
    }
    return;
  }

  const closeButton = event.target.closest('[data-modal-close]');
  if (closeButton) {
    closeButton.closest('.adm-modal')?.setAttribute('hidden', '');
    return;
  }

  if (event.target.classList.contains('adm-modal')) {
    event.target.setAttribute('hidden', '');
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;

  document.querySelectorAll('.adm-modal:not([hidden])').forEach(modal => {
    modal.setAttribute('hidden', '');
  });
});
