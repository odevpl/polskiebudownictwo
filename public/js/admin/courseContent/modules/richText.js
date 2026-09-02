function createRichTextBlock(block, editor) {
  const wrapper = document.createElement('section');
  wrapper.className = 'course-content-block course-content-block--rich-text';
  wrapper.dataset.blockType = 'richText';
  wrapper.innerHTML = `
    <header class="course-content-block__header"><strong>Treść tekstowa</strong><button type="button" class="button button--ghost button--compact" data-remove-block>Usuń</button></header>
    <div class="course-content-editor__toolbar" role="toolbar" aria-label="Formatowanie tekstu">
      <button type="button" class="button button--ghost button--compact" data-command="bold"><strong>B</strong></button>
      <button type="button" class="button button--ghost button--compact" data-command="italic"><em>I</em></button>
      <button type="button" class="button button--ghost button--compact" data-block-format="p">Akapit</button>
      <button type="button" class="button button--ghost button--compact" data-block-format="h2">Nagłówek 2</button>
      <button type="button" class="button button--ghost button--compact" data-block-format="h3">Nagłówek 3</button>
      <button type="button" class="button button--ghost button--compact" data-command="insertUnorderedList">Lista</button>
      <button type="button" class="button button--ghost button--compact" data-command="insertOrderedList">Numeracja</button>
      <button type="button" class="button button--ghost button--compact" data-add-link>Link</button>
    </div>
    <div class="course-content-editor__input" contenteditable="true" role="textbox" aria-multiline="true"></div>`;
  const input = wrapper.querySelector('.course-content-editor__input');
  input.innerHTML = block?.data?.html || '';
  wrapper.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => {
    input.focus();
    document.execCommand(button.dataset.command, false);
    editor.sync();
  }));
  wrapper.querySelectorAll('[data-block-format]').forEach(button => button.addEventListener('click', () => {
    input.focus();
    document.execCommand('formatBlock', false, button.dataset.blockFormat);
    editor.sync();
  }));
  wrapper.querySelector('[data-add-link]').addEventListener('click', () => {
    const url = window.prompt('Adres linku (http://, https:// lub mailto:):');
    if (!url) return;
    input.focus();
    document.execCommand('createLink', false, url);
    editor.sync();
  });
  wrapper.querySelector('[data-remove-block]').addEventListener('click', () => wrapper.remove());
  input.addEventListener('input', () => editor.sync());
  return wrapper;
}

export { createRichTextBlock };
