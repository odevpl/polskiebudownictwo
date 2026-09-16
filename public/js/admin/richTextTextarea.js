(() => {
  function sync(editor, value) { value.value = editor.innerHTML.trim(); }
  document.querySelectorAll('[data-rich-textarea]').forEach(wrapper => {
    const editor = wrapper.querySelector('[data-rich-text-input]');
    const value = wrapper.querySelector('textarea');
    editor.innerHTML = value.value;
    wrapper.querySelectorAll('[data-rich-text-command]').forEach(button => {
      button.addEventListener('mousedown', event => event.preventDefault());
      button.addEventListener('click', () => {
        editor.focus();
        document.execCommand(button.dataset.richTextCommand, false, button.dataset.richTextValue || null);
        sync(editor, value);
      });
    });
    editor.addEventListener('input', () => sync(editor, value));
    editor.addEventListener('paste', event => {
      event.preventDefault();
      document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
      sync(editor, value);
    });
    wrapper.closest('form')?.addEventListener('submit', () => sync(editor, value));
  });
})();
