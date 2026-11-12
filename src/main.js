import { createCommerce } from './commerce.js';
import { mountCatalog } from './catalog.js';
import { mountEngraving } from './engraving.js';
import { engravingServices, formatPrice, perfume, products } from './products.js';

const menuToggle = document.querySelector('.site-menu-toggle');
const navigation = document.querySelector('#site-nav');
const mobileHeader = matchMedia('(max-width: 720px)');

function menuIsOpen() {
  return menuToggle.getAttribute('aria-expanded') === 'true';
}

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
}

function closeMenuOutside({ target }) {
  if (menuIsOpen() && !menuToggle.contains(target) && !navigation.contains(target)) closeMenu();
}

menuToggle.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', String(!menuIsOpen()));
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('click', closeMenuOutside);
document.addEventListener('focusin', closeMenuOutside);
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !menuIsOpen()) return;
  closeMenu();
  menuToggle.focus({ preventScroll: true });
});
mobileHeader.addEventListener('change', closeMenu);

function restoreHeaderFocus({ relatedTarget, currentTarget }) {
  const hiddenOnMobile = currentTarget === navigation;
  if (relatedTarget || mobileHeader.matches !== hiddenOnMobile || (hiddenOnMobile && menuIsOpen())) return;

  requestAnimationFrame(() => {
    if (document.activeElement !== document.body || mobileHeader.matches !== hiddenOnMobile) return;
    const nextControl = hiddenOnMobile ? menuToggle : navigation.querySelector('a');
    nextControl.focus({ preventScroll: true });
  });
}

menuToggle.addEventListener('focusout', restoreHeaderFocus);
navigation.addEventListener('focusout', restoreHeaderFocus);

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

const commerce = createCommerce({ products: [...products, perfume, ...engravingServices], formatPrice });

function addToCart(product, options, instant = false) {
  commerce.addItem(product, options);
  commerce.openCart({ instant });
}

mountCatalog({ products, onAdd: addToCart });
mountEngraving(addToCart);
document.querySelector('[data-perfume-price]').textContent = formatPrice(perfume.price);
document.querySelector('.perfume-buy').addEventListener('click', (event) => {
  addToCart(perfume, undefined, event.detail === 0);
});
