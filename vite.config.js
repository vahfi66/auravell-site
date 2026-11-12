import { defineConfig } from 'vite';
import { featuredProduct, formatPrice } from './src/products.js';

export default defineConfig({
  base: './',
  plugins: [{
    name: 'auravell-featured-price',
    transformIndexHtml(html) {
      return html.replace('{{featured-price}}', formatPrice(featuredProduct.price));
    },
  }],
});
