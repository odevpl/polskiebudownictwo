function createYoutubeBlock(block, editor) {
  const wrapper = document.createElement('section');
  wrapper.className = 'course-content-block course-content-block--youtube';
  wrapper.dataset.blockType = 'youtube';
  wrapper.innerHTML = `
    <header class="course-content-block__header"><strong>Prezentacja YouTube</strong><button type="button" class="button button--ghost button--compact" data-remove-block>Usuń</button></header>
    <div class="adm-form-grid">
      <label class="adm-field"><span class="adm-label">Link do filmu YouTube</span><input class="adm-control" type="url" data-youtube-url placeholder="https://www.youtube.com/watch?v=..."></label>
      <label class="adm-field"><span class="adm-label">Tytuł filmu (opcjonalnie)</span><input class="adm-control" type="text" data-youtube-title maxlength="255"></label>
    </div>`;
  wrapper.querySelector('[data-youtube-url]').value = block?.data?.url || (block?.data?.videoId ? `https://www.youtube.com/watch?v=${block.data.videoId}` : '');
  wrapper.querySelector('[data-youtube-title]').value = block?.data?.title || '';
  wrapper.querySelectorAll('input').forEach(input => input.addEventListener('input', () => editor.sync()));
  wrapper.querySelector('[data-remove-block]').addEventListener('click', () => wrapper.remove());
  return wrapper;
}

export { createYoutubeBlock };
