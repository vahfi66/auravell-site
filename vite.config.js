import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { featuredProduct, formatPrice } from './src/products.js';

export default defineConfig({
  base: './',
  build: {
    rolldownOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        catalog: fileURLToPath(new URL('./catalog.html', import.meta.url)),
      },
    },
  },
  plugins: [{
    name: 'auravell-featured-product',
    transformIndexHtml(html) {
      return html
        .replace('{{featured-price}}', formatPrice(featuredProduct.price))
        .replace('{{featured-stone-weight}}', featuredProduct.stoneWeight);
    },
  }],
});
