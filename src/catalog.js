import { calculateEngraving, engravingRates, formatPrice } from './products.js';

const chevron = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.25"/></svg>`;
const cross = `<svg viewBox="0 0 20 20" aria-hidden="true" fill="none"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.25"/></svg>`;
const magnifier = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="5.75"/><path d="m15 15 4.5 4.5"/></svg>`;

const itemCount = new Intl.PluralRules('ru');
const itemForms = { one: 'украшение', few: 'украшения', many: 'украшений' };
const previewSize = 2;

function normalizeSearch(text) {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
}

function filterMenu(key, title, options) {
  return `
    <details class="catalog-filter-menu" data-filter-menu="${key}" name="catalog-facets">
      <summary class="catalog-filter-summary">
        <span>${title}<span class="catalog-filter-count" hidden></span></span>
        ${chevron}
      </summary>
      <fieldset class="catalog-filter-options" aria-label="${title}">
        ${options.map((option) => `
          <label class="catalog-filter-option">
            <input type="checkbox" data-filter="${key}" value="${option}">
            <span>${option}</span>
          </label>
        `).join('')}
      </fieldset>
    </details>`;
}

function productCard(product) {
  const specifications = [product.type, product.metal, product.stone]
    .filter((value) => value !== 'Без камня')
    .join(' · ');

  return `
    <article class="catalog-product" data-item="${product.id}">
      <div class="catalog-product-image">
        <img src="${product.image}" alt="${product.type} ${product.name}" width="508" height="508"
          loading="lazy" decoding="async">
      </div>
      <div class="catalog-product-info">
        <h3 class="catalog-product-heading">
          <button class="catalog-product-button" type="button" data-product="${product.id}" aria-haspopup="dialog"
            aria-label="${product.type} ${product.name}" aria-describedby="spec-${product.id} price-${product.id}">${product.name}</button>
        </h3>
        <span class="catalog-product-price" id="price-${product.id}">${formatPrice(product.price)}</span>
        <span class="catalog-product-spec" id="spec-${product.id}">${specifications}</span>
      </div>
    </article>`;
}

function engravingFields(rate) {
  return `
    <div class="product-engraving">
      <label class="product-engraving-option">
        <input type="checkbox" id="product-engraving-toggle" aria-controls="product-engraving-fields">
        <span>Добавить гравировку</span>
      </label>
      <div class="product-engraving-fields" id="product-engraving-fields" hidden>
        <label for="product-engraving-text">Текст гравировки</label>
        <input type="text" id="product-engraving-text" autocomplete="off" spellcheck="false"
          aria-describedby="product-engraving-help" disabled>
        <p class="product-engraving-help" id="product-engraving-help">Русские и английские буквы, пробелы</p>
        <dl class="product-engraving-tariff">
          <div><dt>Букв</dt><dd data-letter-count>0</dd></div>
          <div><dt>За букву</dt><dd>${formatPrice(rate)}</dd></div>
          <div><dt>Гравировка</dt><dd data-engraving-cost>${formatPrice(0)}</dd></div>
        </dl>
        <p class="catalog-sr-only" data-engraving-status role="status" aria-atomic="true"></p>
      </div>
    </div>`;
}

function productDetails(product, rate) {
  return `
    <button class="product-dialog-close" type="button" aria-label="Закрыть карточку" autofocus>${cross}</button>
    <div class="product-detail-layout">
      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.type} ${product.name}" width="508" height="508" decoding="async">
      </div>
      <div class="product-detail-body">
        <h2 id="product-detail-title">${product.name}</h2>
        <p class="product-detail-description">${product.description}</p>
        <dl class="product-detail-specs">
          <div><dt>Изделие</dt><dd>${product.type}</dd></div>
          <div><dt>Металл</dt><dd>${product.metal}</dd></div>
          <div><dt>Камень</dt><dd>${product.stone}${product.stoneWeight ? ` · ${product.stoneWeight}` : ''}</dd></div>
        </dl>
        <form class="product-detail-form" id="product-detail-form">${rate ? engravingFields(rate) : ''}</form>
      </div>
    </div>
    <div class="product-detail-actions">
      <button class="product-detail-buy" type="submit" form="product-detail-form"
        aria-labelledby="product-buy-label" aria-describedby="product-detail-total">
        <span id="product-buy-label">В корзину</span> <span id="product-detail-total">${formatPrice(product.price)}</span>
      </button>
    </div>`;
}

function revealEngravingFields(layout, fields) {
  const overflow = fields.getBoundingClientRect().bottom - layout.getBoundingClientRect().bottom;
  if (overflow > 0) layout.scrollTop += overflow + 8;
}

export function mountCatalog({ products, onAdd }) {
  const container = document.querySelector('#catalog-content');
  const categories = [...new Set(products.map(({ category }) => category))];
  const metals = [...new Set(products.map(({ metal }) => metal))];
  const stones = [...new Set(products.map(({ stone }) => stone))];
  const linkedCategories = new URLSearchParams(location.search).getAll('category');
  const selected = {
    category: new Set(linkedCategories.filter((category) => categories.includes(category))),
    metal: new Set(),
    stone: new Set(),
  };
  const searchIndex = new Map(products.map(({ id, name, type, category, metal, stone }) =>
    [id, normalizeSearch([name, type, category, metal, stone].join(' '))]));
  let expanded = false;

  container.innerHTML = `
    <div class="catalog-search" role="search" aria-label="Украшения">
      ${magnifier}
      <label class="catalog-sr-only" for="catalog-search">Поиск украшений</label>
      <input type="search" id="catalog-search" placeholder="Название, металл или камень"
        autocomplete="off" spellcheck="false">
    </div>
    <div class="catalog-toolbar">
      <div class="catalog-categories" role="group" aria-label="Тип изделия">
        <button class="catalog-category" type="button" data-category="" aria-pressed="true">Все изделия</button>
        ${categories.map((category) => `
          <button class="catalog-category" type="button" data-category="${category}" aria-pressed="false">${category}</button>
        `).join('')}
      </div>
      <div class="catalog-filters" role="group" aria-label="Характеристики">
        ${filterMenu('metal', 'Металл', metals)}
        ${filterMenu('stone', 'Камень', stones)}
      </div>
    </div>
    <div class="catalog-results-bar">
      <p class="catalog-results-count" role="status" aria-atomic="true"></p>
      <div class="catalog-active-filters" aria-label="Выбранные характеристики" role="group" hidden></div>
      <button type="button" class="catalog-reset" data-reset hidden>Сбросить фильтры</button>
    </div>
    <div class="catalog-grid" id="catalog-grid">
      ${products.map(productCard).join('')}
    </div>
    <button type="button" class="catalog-more" data-toggle-preview aria-controls="catalog-grid"
      aria-expanded="false" hidden>Показать ещё</button>
    <div class="catalog-empty" hidden>
      <p>Украшения не найдены</p>
      <button type="button" class="catalog-reset" data-reset>Сбросить фильтры</button>
    </div>`;

  const categoryButtons = [...container.querySelectorAll('[data-category]')];
  const facetInputs = [...container.querySelectorAll('input[data-filter]')];
  const menus = [...container.querySelectorAll('.catalog-filter-menu')];
  const cards = [...container.querySelectorAll('[data-item]')];
  const search = container.querySelector('#catalog-search');
  const grid = container.querySelector('#catalog-grid');
  const previewToggle = container.querySelector('[data-toggle-preview]');
  const count = container.querySelector('.catalog-results-count');
  const activeFilters = container.querySelector('.catalog-active-filters');
  const resetButtons = [...container.querySelectorAll('[data-reset]')];
  const empty = container.querySelector('.catalog-empty');

  function updateCategoryLink() {
    const url = new URL(location.href);
    url.searchParams.delete('category');
    for (const category of selected.category) url.searchParams.append('category', category);
    if (url.href !== location.href) history.replaceState(history.state, '', url);
  }

  function updateCatalog() {
    const query = normalizeSearch(search.value);
    const terms = query ? query.split(/\s+/) : [];
    const hasFilters = Object.values(selected).some((values) => values.size);
    const matches = products.filter((product) =>
      terms.every((term) => searchIndex.get(product.id).includes(term)) &&
      Object.entries(selected).every(([key, values]) => !values.size || values.has(product[key])));
    const canTogglePreview = !hasFilters && !terms.length && matches.length > previewSize;
    const preview = canTogglePreview && !expanded;
    const shown = preview ? matches.slice(0, previewSize) : matches;
    const visibleIds = new Set(shown.map(({ id }) => id));

    grid.toggleAttribute('data-preview', preview);
    previewToggle.hidden = !canTogglePreview;
    previewToggle.setAttribute('aria-expanded', String(expanded));
    previewToggle.textContent = expanded ? 'Свернуть' : 'Показать ещё';
    for (const card of cards) card.hidden = !visibleIds.has(card.dataset.item);
    for (const button of categoryButtons) {
      const category = button.dataset.category;
      button.setAttribute('aria-pressed', String(category ? selected.category.has(category) : !selected.category.size));
    }
    for (const input of facetInputs) input.checked = selected[input.dataset.filter].has(input.value);
    for (const menu of menus) {
      const badge = menu.querySelector('.catalog-filter-count');
      const number = selected[menu.dataset.filterMenu].size;
      badge.textContent = number ? ` (${number})` : '';
      badge.hidden = !number;
    }

    const active = ['metal', 'stone'].flatMap((key) => [...selected[key]].map((value) => ({ key, value })));
    activeFilters.innerHTML = active.map(({ key, value }) => `
      <button class="catalog-active-filter" type="button" data-remove-filter="${key}" data-value="${value}"
        aria-label="Убрать фильтр «${value}»">${value}${cross}</button>
    `).join('');
    activeFilters.hidden = !active.length;

    const label = preview ? `Показано ${shown.length} из ${matches.length}` :
      `${matches.length} ${itemForms[itemCount.select(matches.length)]}`;
    if (count.textContent !== label) count.textContent = label;
    resetButtons[0].hidden = !hasFilters && !query;
    const resetLabel = query ? (hasFilters ? 'Сбросить поиск и фильтры' : 'Сбросить поиск') : 'Сбросить фильтры';
    for (const button of resetButtons) button.textContent = resetLabel;
    empty.hidden = Boolean(matches.length);
  }

  function closeMenus(except) {
    for (const menu of menus) {
      if (menu !== except) menu.open = false;
    }
  }

  search.addEventListener('input', updateCatalog);

  container.addEventListener('change', (event) => {
    const input = event.target.closest('input[data-filter]');
    if (!input) return;
    const group = selected[input.dataset.filter];
    if (input.checked) group.add(input.value);
    else group.delete(input.value);
    updateCatalog();
  });

  container.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if ('category' in button.dataset) {
      const category = button.dataset.category;
      if (!category) selected.category.clear();
      else if (selected.category.has(category)) selected.category.delete(category);
      else selected.category.add(category);
      updateCategoryLink();
      updateCatalog();
    } else if ('removeFilter' in button.dataset) {
      const key = button.dataset.removeFilter;
      const index = [...activeFilters.children].indexOf(button);
      selected[key].delete(button.dataset.value);
      updateCatalog();
      const next = activeFilters.children[index] || activeFilters.lastElementChild;
      (next || container.querySelector(`[data-filter-menu="${key}"] summary`)).focus({ preventScroll: true });
    } else if ('reset' in button.dataset) {
      const hadSearch = Boolean(search.value.trim());
      search.value = '';
      Object.values(selected).forEach((values) => values.clear());
      updateCategoryLink();
      updateCatalog();
      (hadSearch ? search : categoryButtons[0]).focus();
    } else if (button === previewToggle) {
      expanded = !expanded;
      updateCatalog();
      if (expanded) cards[previewSize]?.querySelector('button')?.focus();
      else previewToggle.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    } else if ('product' in button.dataset) {
      closeMenus();
      openProduct(button.dataset.product, { animate: event.detail !== 0, trigger: button });
    }
  });

  document.addEventListener('click', (event) => {
    closeMenus(event.target.closest('.catalog-filter-menu'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || dialog.open) return;
    const menu = menus.find(({ open }) => open);
    if (!menu) return;
    const restoreFocus = menu.contains(document.activeElement);
    closeMenus();
    if (restoreFocus) menu.querySelector('summary').focus();
  });

  const dialog = document.createElement('dialog');
  dialog.className = 'product-dialog';
  dialog.setAttribute('aria-labelledby', 'product-detail-title');
  document.body.append(dialog);

  let opener;
  let backdropPressed = false;

  function outsideDialog(event) {
    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    return event.target === dialog &&
      (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom);
  }

  function closeProduct(animate = true) {
    dialog.classList.toggle('product-dialog-instant', !animate);
    dialog.close();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }

  dialog.addEventListener('pointerdown', (event) => {
    backdropPressed = outsideDialog(event);
  });

  dialog.addEventListener('click', (event) => {
    if (event.target.closest('.product-dialog-close') || (backdropPressed && outsideDialog(event))) {
      closeProduct(event.detail !== 0);
    }
    backdropPressed = false;
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeProduct(false);
  });

  function openProduct(id, { engraving = false, animate = true, trigger = document.activeElement } = {}) {
    const product = products.find((item) => item.id === id);
    if (!product || dialog.open) return;

    opener = trigger;
    const rate = engravingRates[product.category];
    dialog.classList.toggle('product-dialog-instant', !animate);
    dialog.innerHTML = productDetails(product, rate);

    const layout = dialog.querySelector('.product-detail-layout');
    const form = dialog.querySelector('form');
    const total = dialog.querySelector('#product-detail-total');
    const fields = dialog.querySelector('#product-engraving-fields');
    let engravingText = '';

    if (rate) {
      const toggle = dialog.querySelector('#product-engraving-toggle');
      const input = dialog.querySelector('#product-engraving-text');
      const help = dialog.querySelector('#product-engraving-help');
      const letters = dialog.querySelector('[data-letter-count]');
      const cost = dialog.querySelector('[data-engraving-cost]');
      const status = dialog.querySelector('[data-engraving-status]');
      const allowed = 'Русские и английские буквы, пробелы';

      function updateEngraving() {
        fields.hidden = !toggle.checked;
        input.disabled = !toggle.checked;
        const { text, letters: letterCount, cost: engravingCost, valid } = calculateEngraving(
          product.category, toggle.checked ? input.value : '',
        );
        engravingText = text;

        const message = valid ? allowed : 'Используйте только русские и английские буквы и пробелы.';
        input.setCustomValidity(valid ? '' : message);
        if (valid) input.removeAttribute('aria-invalid');
        else input.setAttribute('aria-invalid', 'true');
        if (help.textContent !== message) help.textContent = message;
        help.classList.toggle('product-engraving-error', !valid);
        letters.textContent = letterCount;
        cost.textContent = formatPrice(engravingCost);
        total.textContent = formatPrice(product.price + engravingCost);

        const announcement = valid ? `Букв ${letterCount}. Гравировка ${formatPrice(engravingCost)}.` : message;
        if (status.textContent !== announcement) status.textContent = announcement;
      }

      toggle.checked = engraving;
      toggle.addEventListener('change', () => {
        updateEngraving();
        if (toggle.checked) revealEngravingFields(layout, fields);
      });
      input.addEventListener('input', updateEngraving);
      updateEngraving();
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      closeProduct(false);
      onAdd(product, { engravingText });
    });

    dialog.showModal();
    layout.scrollTop = 0;
    if (engraving && fields) revealEngravingFields(layout, fields);
  }

  updateCatalog();
  return { openProduct };
}
