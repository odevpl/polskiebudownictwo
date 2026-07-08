document.querySelectorAll('[data-copy-clause]').forEach(button => {
  button.addEventListener('click', async () => {
    const clause = button.closest('.clause-box')?.dataset.clause?.trim();
    if (!clause) return;

    try {
      await navigator.clipboard.writeText(clause);
      const previousText = button.textContent;
      button.textContent = 'Skopiowano';
      window.setTimeout(() => {
        button.textContent = previousText;
      }, 1800);
    } catch {
      button.textContent = 'Nie udało się skopiować';
    }
  });
});
