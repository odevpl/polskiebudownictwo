import { createFileManager } from '../../file-manager/index.js';

export function createFilesBlock(block, editor) {
  const wrapper = editor.root.querySelector('[data-file-manager-template]').content.firstElementChild.cloneNode(true);
  wrapper.dataset.blockId = block.id || crypto.randomUUID();
  wrapper.fileManager = createFileManager(wrapper, block.data?.files || [], { ...editor.fileConfig, onChange: () => editor.sync(), totalCount: () => editor.fileCount() });
  wrapper.querySelector('[data-remove-block]').addEventListener('click', () => { wrapper.fileManager.dispose(); wrapper.remove(); editor.sync(); });
  return wrapper;
}
