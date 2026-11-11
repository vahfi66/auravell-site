import './site.css';
import './catalog.css';
import './commerce.css';
import './atelier.css';
import { createCommerce } from './commerce.js';
import { mountCatalog } from './catalog.js';
import { mountEngraving } from './engraving.js';
import { engravingServices, featuredProduct, formatPrice, perfume, products } from './products.js';

const heroPrice = document.querySelector('.hero-price');
heroPrice.textContent = formatPrice(featuredProduct.price);
heroPrice.hidden = false;

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

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const catalogPhotos = document.querySelectorAll('.catalog-product-image');
if ('IntersectionObserver' in window) {
  const entrance = new IntersectionObserver((entries) => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) continue;
      entrance.unobserve(target);
      if (motion.matches || target.closest('article').matches(':has(:focus-visible)')) continue;
      target.animate([
        { opacity: .55, translate: '0 24px', scale: '.97' },
        { opacity: 1, translate: '0 0', scale: '1' },
      ], { duration: 560, easing: getComputedStyle(target).getPropertyValue('--ease-out').trim(), id: 'catalog-entrance' });
    }
  }, { threshold: .16 });
  catalogPhotos.forEach((photo) => entrance.observe(photo));
  motion.addEventListener('change', ({ matches }) => {
    if (matches) document.getAnimations().filter(({ id }) => id === 'catalog-entrance').forEach((animation) => animation.cancel());
  });
}
