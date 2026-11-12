const imageBase = `${import.meta.env?.BASE_URL ?? './'}images/`;

export const engravingRates = {
  Кольца: 5_000,
  Браслеты: 3_000,
};

const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export const formatPrice = (price) => rubles.format(price);

export function calculateEngraving(category, value) {
  const rate = Object.hasOwn(engravingRates, category) ? engravingRates[category] : 0;
  const normalized = value.normalize('NFC');
  const text = normalized.trim();
  const letters = text.match(/[A-Za-zА-Яа-яЁё]/g)?.length || 0;
  const valid = !/[^A-Za-zА-Яа-яЁё ]/.test(normalized) && (rate > 0 || !text);

  return { text, letters, cost: letters * rate, valid };
}

export const products = [
  {
    id: 'eclat',
    name: 'Éclat',
    category: 'Кольца',
    type: 'Кольцо',
    metal: 'Белое золото',
    stone: 'Бриллиант',
    price: 84_000,
    image: `${imageBase}eclat.webp`,
    description: 'Круглый бриллиант в открытой оправе на гладком кольце из белого золота.',
  },
  {
    id: 'ligne',
    name: 'Ligne',
    category: 'Браслеты',
    type: 'Браслет',
    metal: 'Серебро',
    stone: 'Без камня',
    price: 28_000,
    image: `${imageBase}ligne.webp`,
    description: 'Открытый браслет из серебра с матовой шлифовкой и скруглёнными краями.',
  },
  {
    id: 'lune',
    name: 'Lune',
    category: 'Подвески',
    type: 'Подвеска',
    metal: 'Серебро',
    stone: 'Лунный камень',
    price: 19_000,
    image: `${imageBase}lune.webp`,
    description: 'Лунный камень с холодным голубым отблеском в серебряной оправе.',
  },
  {
    id: 'onde',
    name: 'Onde',
    category: 'Кольца',
    type: 'Кольцо',
    metal: 'Серебро',
    stone: 'Без камня',
    price: 24_000,
    image: `${imageBase}onde.webp`,
    description: 'Серебряное кольцо с волнообразным профилем и зеркальной полировкой.',
  },
  {
    id: 'sillage',
    name: 'Sillage',
    category: 'Колье',
    type: 'Колье',
    metal: 'Белое золото',
    stone: 'Бриллиант',
    price: 76_000,
    image: `${imageBase}sillage.webp`,
    description: 'Бриллианты в отдельных оправах образуют непрерывную линию на колье из белого золота.',
  },
  {
    id: 'halo',
    name: 'Halo',
    category: 'Серьги',
    type: 'Серьги',
    metal: 'Белое золото',
    stone: 'Бриллиант',
    price: 62_000,
    image: `${imageBase}halo.webp`,
    description: 'Пара серёг из белого золота с круглыми бриллиантами.',
  },
];

export const featuredProduct = products[0];

export const perfume = {
  id: 'sillage-noir',
  name: 'Sillage Noir',
  price: 18_900,
  detail: 'Парфюмерная вода · 50 мл',
  image: `${imageBase}sillage-noir.webp`,
};

export const engravingServices = [
  { id: 'engrave-own-ring', category: 'Кольца', name: 'Гравировка своего кольца' },
  { id: 'engrave-own-bracelet', category: 'Браслеты', name: 'Гравировка своего браслета' },
].map((service) => ({
  ...service,
  price: 0,
  detail: 'Услуга гравировки',
  image: `${imageBase}engraving-720.webp`,
  requiresEngraving: true,
}));
