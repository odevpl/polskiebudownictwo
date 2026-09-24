(() => {
  function sync(editor, value) { value.value = editor.root.innerHTML.trim(); }
  document.querySelectorAll('[data-rich-textarea]').forEach(wrapper => {
    const element = wrapper.querySelector('[data-rich-text-input]');
    const value = wrapper.querySelector('textarea');
    const editor = new window.Quill(element, {
      theme: 'snow',
      modules: { toolbar: [['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }]] },
      formats: ['bold', 'italic', 'list'],
    });
    const initial = value.value.trim();
    if (initial) {
      if (/<[a-z][\s\S]*>/i.test(initial)) editor.clipboard.dangerouslyPasteHTML(initial);
      else editor.setText(initial);
    }
    sync(editor, value);
    editor.on('text-change', () => sync(editor, value));
    wrapper.closest('form')?.addEventListener('submit', () => sync(editor, value));
  });
})();
