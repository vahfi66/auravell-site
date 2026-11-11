import { calculateEngraving } from "./products.js";

const cartKey = "auravell-cart";
const demoFields = {
  phone: "+7 000 000-00-00",
  card: "4242 4242 4242 4242",
  expiry: "12/30",
  cvv: "123",
};

const fieldErrors = {
  phone: `Введите тестовый телефон ${demoFields.phone}.`,
  card: `Введите тестовый номер ${demoFields.card}.`,
  expiry: `Введите тестовый срок ${demoFields.expiry}.`,
  cvv: `Введите тестовый код ${demoFields.cvv}.`,
  privacy: "Подтвердите согласие на обработку данных.",
  offer: "Примите условия демонстрационной оферты.",
};

const headings = {
  cart: "Корзина",
  checkout: "Оплата",
  success: "Заказ оформлен",
};

const closeIcon = `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
  <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" stroke-width="1.4"/>
</svg>`;

const backIcon = `<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none">
  <path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" stroke-width="1.4"/>
</svg>`;

function paymentField(key, label, { type = "text", inputMode = "numeric", maxLength }) {
  return `<div class="commerce-field">
    <label for="demo-${key}">${label}</label>
    <input id="demo-${key}" type="${type}" inputmode="${inputMode}" maxlength="${maxLength}"
      placeholder="${demoFields[key]}" autocomplete="off" spellcheck="false" required
      aria-describedby="demo-${key}-error">
    <p class="commerce-error" id="demo-${key}-error" hidden></p>
  </div>`;
}

function consentField(key, label) {
  return `<div>
    <label class="commerce-consent" for="demo-${key}">
      <input type="checkbox" id="demo-${key}" required aria-describedby="demo-${key}-error">
      <span>${label}</span>
    </label>
    <p class="commerce-error commerce-consent-error" id="demo-${key}-error" hidden></p>
  </div>`;
}

function makeDialog() {
  const dialog = document.createElement("dialog");
  dialog.className = "commerce-dialog";
  dialog.setAttribute("aria-labelledby", "commerce-heading");
  dialog.innerHTML = `
    <header class="commerce-header">
      <button class="commerce-text-button commerce-back" type="button" data-commerce="back" hidden>
        ${backIcon} Корзина
      </button>
      <h2 class="commerce-heading" id="commerce-heading" tabindex="-1" autofocus>Корзина</h2>
      <p class="commerce-demo" id="commerce-demo" hidden>Это демонстрация. Используйте тестовые данные.</p>
      <button class="commerce-icon-button commerce-close" type="button" data-commerce="close" aria-label="Закрыть">
        ${closeIcon}
      </button>
    </header>
    <div class="commerce-scroll">
      <div class="commerce-panel commerce-cart" data-panel="cart">
        <ul class="commerce-items" aria-label="Позиции в корзине"></ul>
        <div class="commerce-empty" hidden>
          <p>Корзина пока пуста.</p>
          <a class="commerce-secondary" href="#catalog" data-commerce="catalog">Перейти в каталог</a>
        </div>
      </div>
      <div class="commerce-panel" data-panel="checkout" hidden>
        <form class="commerce-form" method="dialog" autocomplete="off" novalidate>
          <button class="commerce-secondary commerce-fill" type="button" data-commerce="fill">
            Подставить тестовые данные
          </button>
          ${paymentField("phone", "Номер телефона", { type: "tel", inputMode: "tel", maxLength: 20 })}
          ${paymentField("card", "Номер карты", { maxLength: 23 })}
          <div class="commerce-field-pair">
            ${paymentField("expiry", "Срок действия", { maxLength: 7 })}
            ${paymentField("cvv", "CVV", { type: "password", maxLength: 3 })}
          </div>
          <div class="commerce-consents">
            ${consentField("privacy", "Я принимаю политику конфиденциальности и даю согласие на обработку персональных данных.")}
            ${consentField("offer", "Я принимаю условия демонстрационной оферты.")}
          </div>
          <div class="commerce-terms">
            <details>
              <summary>Политика конфиденциальности</summary>
              <p>Форма проверяет тестовые данные в браузере и очищается при закрытии. В корзине браузер сохраняет выбранные изделия и текст гравировки.</p>
            </details>
            <details>
              <summary>Условия демонстрационной оферты</summary>
              <p>Оформление заказа имитирует покупку. Указанная сумма используется для демонстрации оплаты.</p>
            </details>
          </div>
          <div class="commerce-checkout-total">
            <span>К оплате</span>
            <strong data-checkout-total></strong>
          </div>
          <button class="commerce-primary" type="submit">Оплатить в деморежиме</button>
        </form>
      </div>
      <div class="commerce-panel commerce-success" data-panel="success" hidden>
        <p>Оплата прошла в деморежиме.</p>
        <a class="commerce-primary" href="#catalog" data-commerce="catalog">Вернуться в каталог</a>
      </div>
    </div>
    <footer class="commerce-footer" hidden>
      <div class="commerce-subtotal" aria-live="polite">
        <span>Итого</span>
        <strong data-cart-total></strong>
      </div>
      <button class="commerce-primary" type="button" data-commerce="checkout">Оформить заказ</button>
    </footer>
  `;
  document.body.append(dialog);
  return dialog;
}

function readCart(productsById) {
  try {
    const saved = JSON.parse(localStorage.getItem(cartKey) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.flatMap((line) => {
      const product = productsById.get(line?.productId);
      if (!product || typeof line.engravingText !== "string"
        || !Number.isSafeInteger(line.quantity) || line.quantity < 1) return [];
      const engraving = calculateEngraving(product.category, line.engravingText);
      if (!engraving.valid || (product.requiresEngraving && !engraving.letters)) return [];
      return [{
        productId: product.id,
        engravingText: engraving.text,
        engravingCost: engraving.cost,
        quantity: line.quantity,
      }];
    });
  } catch {
    return [];
  }
}

function renderLine(line, index, product, formatPrice) {
  const item = document.createElement("li");
  item.className = "commerce-item";
  item.dataset.line = index;
  item.innerHTML = `
    <img class="commerce-thumb" alt="" width="88" height="88">
    <div class="commerce-item-info">
      <h3 class="commerce-item-name"></h3>
      <p class="commerce-item-metal"></p>
      <p class="commerce-item-engraving" hidden></p>
      <strong class="commerce-line-price"></strong>
      <div class="commerce-item-actions">
        <div class="commerce-quantity" role="group">
          <button class="commerce-icon-button" type="button" data-commerce="decrease" aria-label="Уменьшить количество">−</button>
          <span class="commerce-quantity-value"></span>
          <button class="commerce-icon-button" type="button" data-commerce="increase" aria-label="Увеличить количество">+</button>
        </div>
        <button class="commerce-text-button commerce-remove" type="button" data-commerce="remove">Удалить</button>
      </div>
    </div>
  `;
  item.querySelector("img").src = product.image;
  item.querySelector(".commerce-item-name").textContent = product.name;
  item.querySelector(".commerce-item-metal").textContent = product.detail ?? product.metal;
  const engraving = item.querySelector(".commerce-item-engraving");
  engraving.hidden = !line.engravingText;
  if (line.engravingText) {
    engraving.textContent = `Гравировка «${line.engravingText}» · ${formatPrice(line.engravingCost)} за изделие`;
  }
  item.querySelector(".commerce-line-price").textContent = formatPrice((product.price + line.engravingCost) * line.quantity);
  const quantity = item.querySelector(".commerce-quantity");
  quantity.setAttribute("aria-label", `Количество — ${product.name}`);
  quantity.querySelector(".commerce-quantity-value").textContent = line.quantity;
  quantity.querySelector('[data-commerce="decrease"]').disabled = line.quantity === 1;
  item.querySelector('[data-commerce="remove"]').setAttribute("aria-label", `Удалить ${product.name}`);
  return item;
}

export function createCommerce({ products, formatPrice }) {
  const productsById = new Map(products.map((product) => [product.id, product]));
  let lines = readCart(productsById);
  let view = "cart";
  const dialog = makeDialog();
  const heading = dialog.querySelector("#commerce-heading");
  const cartButton = document.querySelector("#cart-button");
  const badge = cartButton.querySelector("[data-cart-count]");
  const scrollArea = dialog.querySelector(".commerce-scroll");
  const items = dialog.querySelector(".commerce-items");
  const empty = dialog.querySelector(".commerce-empty");
  const footer = dialog.querySelector(".commerce-footer");
  const form = dialog.querySelector(".commerce-form");
  const fields = Object.fromEntries(
    Object.keys(fieldErrors).map((key) => [key, form.querySelector(`#demo-${key}`)]),
  );
  const demoNotice = dialog.querySelector(".commerce-demo");

  function updateBadge() {
    const count = lines.reduce((total, line) => total + line.quantity, 0);
    badge.textContent = count;
    cartButton.setAttribute("aria-label", `Корзина, количество изделий — ${count}`);
  }

  function persist() {
    try {
      const saved = lines.map(({ productId, engravingText, quantity }) => ({ productId, engravingText, quantity }));
      localStorage.setItem(cartKey, JSON.stringify(saved));
    } catch {
      // The in-memory cart also works when storage is disabled.
    }
    updateBadge();
  }

  function renderCart() {
    const total = lines.reduce((sum, line) => {
      return sum + (productsById.get(line.productId).price + line.engravingCost) * line.quantity;
    }, 0);
    items.replaceChildren(...lines.map((line, index) => renderLine(line, index, productsById.get(line.productId), formatPrice)));
    items.hidden = lines.length === 0;
    empty.hidden = lines.length > 0;
    footer.hidden = view !== "cart" || lines.length === 0;
    dialog.querySelector("[data-cart-total]").textContent = formatPrice(total);
    dialog.querySelector("[data-checkout-total]").textContent = formatPrice(total);
  }

  function showPanel(next, focus = true) {
    view = next;
    heading.textContent = headings[next];
    demoNotice.hidden = next !== "checkout";
    dialog.querySelector(".commerce-back").hidden = next !== "checkout";
    if (next === "checkout") dialog.setAttribute("aria-describedby", demoNotice.id);
    else dialog.removeAttribute("aria-describedby");
    dialog.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== next;
    });
    footer.hidden = next !== "cart" || lines.length === 0;
    scrollArea.scrollTop = 0;
    if (focus) heading.focus();
  }

  function setFieldError(key, message = "") {
    const field = fields[key];
    const error = form.querySelector(`#demo-${key}-error`);
    error.textContent = message;
    error.hidden = !message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  function resetForm() {
    form.reset();
    Object.keys(fields).forEach((key) => setFieldError(key));
    form.querySelectorAll("details").forEach((details) => {
      details.open = false;
    });
  }

  function dismiss(instant = false) {
    dialog.toggleAttribute("data-instant", instant);
    dialog.close();
    resetForm();
  }

  function openCart({ instant = false } = {}) {
    if (dialog.open) return;
    dialog.toggleAttribute("data-instant", instant);
    renderCart();
    showPanel("cart", false);
    dialog.showModal();
  }

  function addItem(product, { engravingText = "" } = {}) {
    const engraving = calculateEngraving(product.category, engravingText);
    if (!engraving.valid || (product.requiresEngraving && !engraving.letters)) return;
    const existing = lines.find((line) => line.productId === product.id
      && line.engravingText === engraving.text);
    if (existing) existing.quantity += 1;
    else lines.push({
      productId: product.id,
      engravingText: engraving.text,
      engravingCost: engraving.cost,
      quantity: 1,
    });
    persist();
    if (dialog.open) renderCart();
  }

  function changeLine(action, index) {
    const line = lines[index];
    if (action === "increase") line.quantity += 1;
    if (action === "decrease" && line.quantity > 1) line.quantity -= 1;
    if (action === "remove") lines.splice(index, 1);
    persist();
    renderCart();
    const target = items.children[Math.min(index, items.children.length - 1)];
    const previous = target?.querySelector(`[data-commerce="${action}"]:not(:disabled)`);
    (previous || target?.querySelector('[data-commerce="increase"]') || empty.querySelector("a"))
      .focus({ preventScroll: true });
  }

  cartButton.addEventListener("click", (event) => openCart({ instant: event.detail === 0 }));
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dismiss(true);
  });

  let backdropPress = false;
  dialog.addEventListener("pointerdown", (event) => {
    backdropPress = event.target === dialog;
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && backdropPress) {
      dismiss();
      return;
    }
    const control = event.target.closest("[data-commerce]");
    if (!control) return;
    const action = control.dataset.commerce;
    const line = control.closest("[data-line]");
    if (line) {
      changeLine(action, Number(line.dataset.line));
      return;
    }
    if (action === "close" || action === "catalog") dismiss(event.detail === 0);
    if (action === "back") showPanel("cart");
    if (action === "checkout" && lines.length) showPanel("checkout");
    if (action === "fill") {
      Object.entries(demoFields).forEach(([key, value]) => {
        fields[key].value = value;
        setFieldError(key);
      });
      fields.privacy.focus();
    }
  });

  Object.entries(fields).forEach(([key, field]) => {
    field.addEventListener("input", () => setFieldError(key));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (view !== "checkout" || lines.length === 0) return;
    const valid = {
      phone: fields.phone.value.replace(/[+()\s-]/g, "") === demoFields.phone.replace(/[+\s-]/g, ""),
      card: fields.card.value.replace(/\s/g, "") === demoFields.card.replace(/\s/g, ""),
      expiry: fields.expiry.value.trim().replace(/\s*\/\s*/, "") === demoFields.expiry.replace("/", ""),
      cvv: fields.cvv.value === demoFields.cvv,
      privacy: fields.privacy.checked,
      offer: fields.offer.checked,
    };
    const invalid = Object.keys(valid).filter((key) => !valid[key]);
    Object.keys(valid).forEach((key) => setFieldError(key, valid[key] ? "" : fieldErrors[key]));
    if (invalid.length) {
      fields[invalid[0]].focus();
      return;
    }
    lines = [];
    persist();
    renderCart();
    resetForm();
    showPanel("success");
  });

  updateBadge();
  return { addItem, openCart };
}
