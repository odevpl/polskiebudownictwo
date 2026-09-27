import { createRichTextBlock } from './modules/richText.js';
import { createYoutubeBlock } from './modules/youtube.js';
import { createFilesBlock } from './modules/files.js';
import { createLessonTitleBlock } from './modules/lessonTitle.js';

const blockModules = new Map([
  ['richText', createRichTextBlock],
  ['youtube', createYoutubeBlock],
  ['files', createFilesBlock],
  ['lessonTitle', createLessonTitleBlock],
]);

function initCourseContentEditor(root) {
  const hidden = root.querySelector('[data-content-blocks-value]');
  const blocksRoot = root.querySelector('[data-content-blocks]');
  const fileConfig = JSON.parse(root.dataset.fileConfig || '{}');
  const status = root.querySelector('[data-editor-status]');
  const titleButton = root.querySelector('[data-add-content-block="lessonTitle"]');
  const updateTitleButton = () => {
    if (titleButton) titleButton.hidden = Boolean(blocksRoot.querySelector('[data-block-type="lessonTitle"]'));
  };
  const editor = {
    root, fileConfig,
    fileCount() { return [...blocksRoot.children].reduce((count, block) => count + (block.fileManager?.count() || 0), 0); },
    sync() {
      hidden.value = JSON.stringify([...blocksRoot.children].map(serializeBlock).filter(Boolean));
      updateTitleButton();
    },
    add(type, block = {}) {
      const factory = blockModules.get(type);
      if (!factory) return;
      if (type === 'lessonTitle' && blocksRoot.querySelector('[data-block-type="lessonTitle"]')) { status.textContent = 'Tytuł lekcji można dodać tylko raz.'; return; }
      if (blocksRoot.children.length >= fileConfig.maxBlocks) { status.textContent = 'Osiągnięto limit sekcji lekcji.'; return; }
      const element = factory(block, editor);
      const order = document.createElement('div'); order.className = 'course-content-block__order';
      for (const [label, direction] of [['Sekcja wyżej', -1], ['Sekcja niżej', 1]]) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'button button--ghost button--compact'; button.textContent = label;
        button.addEventListener('click', () => {
          if (direction < 0 && element.previousElementSibling) blocksRoot.insertBefore(element, element.previousElementSibling);
          if (direction > 0 && element.nextElementSibling) blocksRoot.insertBefore(element.nextElementSibling, element);
          button.focus(); editor.sync();
        }); order.append(button);
      }
      element.prepend(order);
      element.querySelector('[data-remove-block]')?.addEventListener('click', () => { editor.sync(); root.querySelector('[data-add-content-block]')?.focus(); });
      blocksRoot.append(element);
      editor.sync();
    },
  };

  let initial = [];
  try { initial = JSON.parse(hidden.value || '[]'); } catch { initial = []; }
  initial.forEach(block => editor.add(block.type, block));
  root.querySelectorAll('[data-add-content-block]').forEach(button => button.addEventListener('click', () => editor.add(button.dataset.addContentBlock)));
  root.closest('form')?.addEventListener('submit', event => {
    if ([...blocksRoot.children].some(block => block.fileManager && !block.fileManager.valid())) {
      event.preventDefault(); status.textContent = 'Poczekaj na zakończenie uploadów. Popraw nazwy i ponów lub usuń pliki z błędem.'; status.focus(); return;
    }
    editor.sync();
  });
  editor.sync();
}

function serializeBlock(block) {
  const type = block.dataset.blockType;
  if (type === 'files') return { type, id: block.dataset.blockId, data: { files: block.fileManager.serialize() } };
  if (type === 'richText') {
    const html = block.querySelector('.course-content-editor__input')?.innerHTML.trim() || '';
    return html ? { type, data: { html } } : null;
  }
  if (type === 'youtube') {
    const url = block.querySelector('[data-youtube-url]')?.value.trim() || '';
    const title = block.querySelector('[data-youtube-title]')?.value.trim() || '';
    return url ? { type, data: { url, title } } : null;
  }
  if (type === 'lessonTitle') return { type, data: {} };
  return null;
}

document.querySelectorAll('[data-course-content-editor]').forEach(initCourseContentEditor);
