document.querySelectorAll('[data-academy-workspace]').forEach(workspace => {
  workspace.querySelectorAll('.academy-workspace__item, .academy-workspace__accordion-trigger, .academy-workspace__lesson-tab').forEach(link => {
    link.addEventListener('click', () => workspace.setAttribute('aria-busy', 'true'));
  });

  workspace.querySelectorAll('[data-sortable]').forEach(list => {
    let dragged = null;

    list.addEventListener('dragstart', event => {
      dragged = event.target.closest('[data-sort-id]');
      if (!dragged) return;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', dragged.dataset.sortId);
      dragged.classList.add('is-dragging');
    });

    list.addEventListener('dragover', event => {
      if (!dragged) return;
      event.preventDefault();
      const target = event.target.closest('[data-sort-id]');
      if (!target || target === dragged || target.parentElement !== list) return;
      const before = event.clientY < target.getBoundingClientRect().top + target.offsetHeight / 2;
      list.insertBefore(dragged, before ? target : target.nextSibling);
    });

    list.addEventListener('dragend', async () => {
      if (!dragged) return;
      dragged.classList.remove('is-dragging');
      dragged = null;
      const ids = [...list.querySelectorAll(':scope > [data-sort-id]')].map(item => Number(item.dataset.sortId));
      try {
        const response = await fetch(list.dataset.sortUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ type: list.dataset.sortType, ids, courseId: Number(list.dataset.courseId) || null, moduleId: Number(list.dataset.moduleId) || null }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Nie udało się zapisać kolejności.');
      } catch (error) {
        window.alert(error.message);
        window.location.reload();
      }
    });
  });
});
