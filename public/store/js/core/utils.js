/** Small, dependency-free helpers shared by every page. */
import { CURRENCY } from "./config.js";

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Create an element declaratively: el("div", { class: "x" }, [child]) */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "text") node.textContent = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export const money = (value) =>
  new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(Number(value) || 0)));

export const percentOff = (mrp, price) => (!mrp || mrp <= price ? 0 : Math.round(((mrp - price) / mrp) * 100));

export const uid = (prefix = "id") => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const debounce = (fn, wait = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const slugify = (str) => String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const formatDate = (value, opts = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(value).toLocaleDateString(CURRENCY.locale, opts);

export const addDays = (days, from = Date.now()) => new Date(from + days * 86400000);

export const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "U";

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const getParam = (key, fallback = null) => new URLSearchParams(location.search).get(key) ?? fallback;

export const escapeHtml = (str = "") =>
  String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Namespaced localStorage access with JSON + failure safety. */
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode — ignore */
    }
    return value;
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

/** Deterministic gradient product artwork — no external image dependency. */
export function productImage(seedText, index = 0, label = "") {
  let hash = 0;
  const seed = `${seedText}-${index}`;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  const h1 = hash;
  const h2 = (hash + 48) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${h1},72%,58%)"/>
        <stop offset="100%" stop-color="hsl(${h2},78%,38%)"/>
      </linearGradient>
      <radialGradient id="r" cx="30%" cy="25%">
        <stop offset="0%" stop-color="rgba(255,255,255,.55)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <rect width="800" height="600" fill="url(#r)"/>
    <rect x="230" y="150" width="340" height="300" rx="34" fill="rgba(6,10,20,.35)"/>
    <rect x="262" y="182" width="276" height="236" rx="22" fill="rgba(255,255,255,.14)"/>
    <text x="400" y="530" font-family="Space Grotesk, sans-serif" font-size="34" font-weight="700"
      fill="rgba(255,255,255,.9)" text-anchor="middle">${escapeHtml(label).slice(0, 22)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Minimal inline icon set (stroke-based, currentColor). */
const ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  cart: '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  star: '<path d="m12 3.6 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8Z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5Z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
  bell: '<path d="M18 15V10a6 6 0 1 0-12 0v5l-1.5 2.5h15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  smartphone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  laptop: '<rect x="4" y="5" width="16" height="10" rx="2"/><path d="M2.5 19h19"/>',
  tablet: '<rect x="5" y="3" width="14" height="18" rx="2.4"/><path d="M11 18h2"/>',
  watch: '<rect x="7.5" y="7" width="9" height="10" rx="2.5"/><path d="M9.5 7 9 3h6l-.5 4M9.5 17l-.5 4h6l-.5-4"/>',
  headphones: '<path d="M4 15v-3a8 8 0 1 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.6"/><rect x="17" y="14" width="4" height="6" rx="1.6"/>',
  earbuds: '<circle cx="8" cy="8" r="3.4"/><path d="M8 11.4V19"/><circle cx="16" cy="8" r="3.4"/><path d="M16 11.4V19"/>',
  speaker: '<rect x="6" y="2.5" width="12" height="19" rx="2.6"/><circle cx="12" cy="15" r="3.2"/><circle cx="12" cy="7" r="1.2"/>',
  gamepad: '<rect x="2.5" y="7.5" width="19" height="9" rx="4.5"/><path d="M7 10.5v3M5.5 12h3M15.5 11h.01M18 13.5h.01"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
  keyboard: '<rect x="2.5" y="6.5" width="19" height="11" rx="2.2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M8 14h8"/>',
  mouse: '<rect x="7" y="2.5" width="10" height="19" rx="5"/><path d="M12 6.5v3"/>',
  storage: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.4"/>',
  plug: '<path d="M9 3v6M15 3v6M6 9h12v3a6 6 0 0 1-12 0z"/><path d="M12 18v3"/>',
  tag: '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z"/>',
  refresh: '<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4"/>',
  download: '<path d="M12 4v10m0 0 4-4m-4 4-4-4M4 19h16"/>',
  logout: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H10"/>',
  location: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.4"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2.4"/><path d="M8.5 10V7.5a3.5 3.5 0 1 1 7 0V10"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
};

export function icon(name, size = 20, stroke = 1.7) {
  const path = ICON_PATHS[name] ?? ICON_PATHS.info;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor"
    stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

export function starsMarkup(rating = 0) {
  const full = Math.round(rating);
  return `<span class="stars">${Array.from({ length: 5 }, (_, i) =>
    `<span style="opacity:${i < full ? 1 : 0.25}">${icon("star", 13, 0)}</span>`
  ).join("")}</span>`;
}
