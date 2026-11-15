/* Eight & Six: menu toggle, photo viewer, inquiry form (draft 1). No libraries. */
(() => {
  // Phone menu
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      nav.dataset.open = String(open);
    });
  }

  // Photo viewer: every photo link with class "lb" opens the large version in a <dialog>.
  const links = [...document.querySelectorAll('a.lb')];
  const viewer = document.querySelector('dialog.viewer');
  if (links.length && viewer) {
    const img = viewer.querySelector('.viewer-stage img');
    const count = viewer.querySelector('.viewer-count');
    const template = count.dataset.template || '{i} / {n}';
    let index = 0;

    const show = (i) => {
      index = (i + links.length) % links.length;
      const link = links[index];
      img.src = link.href;
      img.alt = link.querySelector('img')?.alt || '';
      count.textContent = template.replace('{i}', index + 1).replace('{n}', links.length);
      // Warm the cache for the next photo.
      const next = links[(index + 1) % links.length];
      if (next) new Image().src = next.href;
    };

    links.forEach((link, i) => {
      link.addEventListener('click', (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        show(i);
        viewer.showModal();
      });
    });
    viewer.querySelector('.viewer-prev').addEventListener('click', () => show(index - 1));
    viewer.querySelector('.viewer-next').addEventListener('click', () => show(index + 1));
    viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') show(index - 1);
      if (event.key === 'ArrowRight') show(index + 1);
    });
    // Click on the dark area (not the photo or buttons) closes the viewer.
    viewer.addEventListener('click', (event) => {
      if (event.target === viewer || event.target.classList.contains('viewer-stage')) viewer.close();
    });
    // Swipe on phones.
    let startX = null;
    viewer.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', (event) => {
      if (startX === null) return;
      const dx = event.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });
    viewer.addEventListener('close', () => {
      img.removeAttribute('src');
      links[index]?.focus();
    });
  }

  // Inquiry form: "Other" text box appears only when "Other" is chosen.
  const form = document.querySelector('form.inquiry');
  if (form) {
    const type = form.querySelector('#f-type');
    const otherField = form.querySelector('.field-other');
    const otherInput = otherField?.querySelector('input');
    const eventFields = [...form.querySelectorAll('.field-event')];
    const sync = () => {
      if (!type) return;
      if (otherField && otherInput) {
        const isOther = type.value === 'other';
        otherField.hidden = !isOther;
        otherInput.required = isOther;
      }
      // Guest count and end date only for event-type shoots (weddings, events, baby showers, graduations, other).
      // Disabled while hidden, so nothing is sent for them. Without JavaScript they simply always show.
      const isEvent = type.selectedOptions[0]?.hasAttribute('data-guests') ?? false;
      eventFields.forEach((field) => {
        field.hidden = !isEvent;
        field.querySelectorAll('input').forEach((input) => { input.disabled = !isEvent; });
      });
    };
    type?.addEventListener('change', sync);
    sync();

    // A date range: the end date can't be earlier than the start date.
    const start = form.querySelector('#f-date');
    const end = form.querySelector('#f-date-end');
    if (start && end) {
      start.addEventListener('change', () => { end.min = start.value; });
    }

    // Draft: the form is not connected to anything yet, so stop here and say so.
    form.addEventListener('submit', (event) => {
      if (form.dataset.mode !== 'preview') return;
      event.preventDefault();
      const status = form.querySelector('.form-status');
      if (status) status.hidden = false;
    });
  }
})();
