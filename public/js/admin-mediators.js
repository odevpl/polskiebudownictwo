function syncRichEditor(editor) {
  const input = editor.querySelector('.adm-rich-editor__input');
  const source = editor.querySelector('.adm-rich-editor__source');
  if (input && source) source.value = input.innerHTML;
}

document.querySelectorAll('[data-rich-editor]').forEach(editor => {
  const input = editor.querySelector('.adm-rich-editor__input');
  input?.addEventListener('input', () => syncRichEditor(editor));
});

document.querySelectorAll('[data-editor-command]').forEach(button => {
  button.addEventListener('click', () => {
    const editor = document.getElementById(`${button.dataset.editorTarget}-editor`);
    editor?.focus();
    document.execCommand(button.dataset.editorCommand, false);
    const wrapper = editor?.closest('[data-rich-editor]');
    if (wrapper) syncRichEditor(wrapper);
  });
});

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', () => {
    form.querySelectorAll('[data-rich-editor]').forEach(syncRichEditor);
  });
});
