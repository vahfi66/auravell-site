import './site.js';
import { createCommerce } from './commerce.js';
import { mountCatalog } from './catalog.js';
import { mountEngraving } from './engraving.js';
import { engravingServices, formatPrice, perfume, products } from './products.js';

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
