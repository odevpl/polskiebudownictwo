import { createRichTextBlock } from './modules/richText.js';
import { createYoutubeBlock } from './modules/youtube.js';

const blockModules = new Map([
  ['richText', createRichTextBlock],
  ['youtube', createYoutubeBlock],
]);

function initCourseContentEditor(root) {
  const hidden = root.querySelector('[data-content-blocks-value]');
  const blocksRoot = root.querySelector('[data-content-blocks]');
  const editor = {
    sync() {
      hidden.value = JSON.stringify([...blocksRoot.children].map(serializeBlock).filter(Boolean));
    },
    add(type, block = {}) {
      const factory = blockModules.get(type);
      if (!factory) return;
      blocksRoot.append(factory(block, editor));
      editor.sync();
    },
  };

  let initial = [];
  try { initial = JSON.parse(hidden.value || '[]'); } catch { initial = []; }
  initial.forEach(block => editor.add(block.type, block));
  root.querySelectorAll('[data-add-content-block]').forEach(button => button.addEventListener('click', () => editor.add(button.dataset.addContentBlock)));
  root.closest('form')?.addEventListener('submit', () => editor.sync());
  editor.sync();
}

function serializeBlock(block) {
  const type = block.dataset.blockType;
  if (type === 'richText') {
    const html = block.querySelector('.course-content-editor__input')?.innerHTML.trim() || '';
    return html ? { type, data: { html } } : null;
  }
  if (type === 'youtube') {
    const url = block.querySelector('[data-youtube-url]')?.value.trim() || '';
    const title = block.querySelector('[data-youtube-title]')?.value.trim() || '';
    return url ? { type, data: { url, title } } : null;
  }
  return null;
}

document.querySelectorAll('[data-course-content-editor]').forEach(initCourseContentEditor);
