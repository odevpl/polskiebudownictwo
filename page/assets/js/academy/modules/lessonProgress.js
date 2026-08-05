const progressModule = document.querySelector('[data-lesson-progress]');
const completeButton = progressModule?.querySelector('[data-lesson-complete]');
const progressStatus = progressModule?.querySelector('[data-lesson-status]');

completeButton?.addEventListener('click', async () => {
  completeButton.disabled = true;
  if (progressStatus) progressStatus.textContent = 'Zapisywanie…';

  try {
    const response = await fetch(`/api/academy/lessons/${completeButton.dataset.lessonId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message);
    completeButton.textContent = 'Lekcja ukończona';
    if (progressStatus) progressStatus.textContent = 'Postęp został zapisany.';
  } catch (error) {
    completeButton.disabled = false;
    if (progressStatus) {
      progressStatus.textContent = error.message || 'Nie udało się zapisać postępu.';
      progressStatus.classList.add('form-status--error');
    }
  }
});
