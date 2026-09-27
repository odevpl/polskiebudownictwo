function createLessonTitleBlock(block, editor) {
  const wrapper = document.createElement('section');
  wrapper.className = 'course-content-block course-content-block--lesson-title';
  wrapper.dataset.blockType = 'lessonTitle';
  wrapper.innerHTML = `
    <header class="course-content-block__header"><strong>Tytuł lekcji</strong><button type="button" class="button button--ghost button--compact" data-remove-block>Usuń</button></header>
    <p class="muted">W tym miejscu uczestnik zobaczy tytuł wpisany w polu „Tytuł lekcji”.</p>`;
  wrapper.querySelector('[data-remove-block]').addEventListener('click', () => wrapper.remove());
  return wrapper;
}

export { createLessonTitleBlock };
