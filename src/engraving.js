import { calculateEngraving, engravingRates, engravingServices, formatPrice, products } from './products.js';

export function mountEngraving(onAdd) {
  const form = document.querySelector('#engraving-form');
  const { ownership, category, model, inscription } = form.elements;
  const modelField = form.querySelector('[data-engraving-model]');
  const base = form.querySelector('[data-engraving-base]');
  const hint = form.querySelector('#engraving-hint');
  const announcement = form.querySelector('[data-engraving-announcement]');
  const submit = form.querySelector('button[type="submit"]');
  let models = [];
  let instant = true;

  function updateModels() {
    models = products.filter((product) => product.category === category.value);
    model.replaceChildren(...models.map((product) => new Option(`${product.name} · ${formatPrice(product.price)}`, product.id)));
  }

  function updateQuote(announce = true) {
    const own = ownership.value === 'own';
    const product = own
      ? engravingServices.find((service) => service.category === category.value)
      : models.find((item) => item.id === model.value);
    const engraving = calculateEngraving(category.value, inscription.value);
    const rate = formatPrice(engravingRates[category.value]);
    const message = !engraving.valid ? 'Используйте только русские и английские буквы и пробелы.'
      : !engraving.letters && inscription.value ? 'Введите хотя бы одну букву.' : '';
    inscription.setCustomValidity(message);
    if (message) inscription.setAttribute('aria-invalid', 'true');
    else inscription.removeAttribute('aria-invalid');
    if (hint.textContent !== (message || 'Русские и английские буквы, пробелы бесплатны.')) {
      hint.textContent = message || 'Русские и английские буквы, пробелы бесплатны.';
    }
    modelField.hidden = model.disabled = own;
    base.hidden = own;
    base.querySelector('dd').textContent = formatPrice(product.price);
    form.querySelector('[data-engraving-count]').textContent = `Гравировка · ${engraving.letters} × ${rate}`;
    form.querySelector('[data-engraving-fee]').textContent = formatPrice(engraving.cost);
    form.querySelector('[data-engraving-action]').textContent = own ? 'Добавить услугу' : 'В корзину';
    const total = formatPrice(product.price + engraving.cost);
    form.querySelector('[data-engraving-total]').textContent = total;
    if (announce) announcement.textContent = message || `Итого ${total}`;
    return { product, engraving };
  }

  form.addEventListener('change', (event) => {
    if (event.target === inscription) return;
    if (event.target.name === 'category') updateModels();
    updateQuote();
  });
  inscription.addEventListener('input', () => updateQuote());
  submit.addEventListener('click', (event) => { instant = event.detail === 0; });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const { product, engraving } = updateQuote(false);
    if (engraving.valid && engraving.letters) onAdd(product, { engravingText: engraving.text }, instant);
  });

  updateModels();
  updateQuote(false);
}
