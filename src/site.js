const menuToggle = document.querySelector('.site-menu-toggle');
const navigation = document.querySelector('#site-nav');
function menuIsOpen() {
  return menuToggle.getAttribute('aria-expanded') === 'true';
}

function setMenuOpen(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  navigation.inert = !open;
}

function closeMenuOutside({ target }) {
  if (menuIsOpen() && !menuToggle.contains(target) && !navigation.contains(target)) setMenuOpen(false);
}

menuToggle.addEventListener('click', (event) => {
  menuToggle.toggleAttribute('data-menu-instant', event.detail === 0);
  setMenuOpen(!menuIsOpen());
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});
document.addEventListener('click', closeMenuOutside);
document.addEventListener('focusin', closeMenuOutside);
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !menuIsOpen()) return;
  setMenuOpen(false);
  menuToggle.focus({ preventScroll: true });
});

let touchPress;

document.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'touch' || !event.isPrimary) return;
  const control = event.target.closest('a[href], button:not(:disabled), summary, label:has(input:is([type="checkbox"], [type="radio"]))');
  if (!control) return;

  touchPress = { control, pointerId: event.pointerId };
  control.setAttribute('data-touch-pressed', '');
}, { passive: true });

function clearTouchPress(event) {
  if (!touchPress || touchPress.pointerId !== event.pointerId) return;
  touchPress.control.removeAttribute('data-touch-pressed');
  touchPress = undefined;
}

document.addEventListener('pointerup', clearTouchPress, { passive: true });
document.addEventListener('pointercancel', clearTouchPress, { passive: true });
document.addEventListener('lostpointercapture', clearTouchPress, { passive: true });
