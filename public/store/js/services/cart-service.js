/** Cart, save-for-later, coupons and money math. UI never computes totals. */
import { COMMERCE, COUPONS } from "../core/config.js";
import { getState, setState } from "../core/store.js";
import { addDays, clamp } from "../core/utils.js";
import { PRODUCTS } from "../data/products.js";

const line = (product, qty) => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  price: product.price,
  mrp: product.mrp,
  image: product.images[0],
  category: product.category,
  stock: product.stock,
  qty,
});

export const getCart = () => getState().cart;
export const cartCount = () => getState().cart.reduce((sum, item) => sum + item.qty, 0);
export const inCart = (id) => getState().cart.some((item) => item.id === id);

export function addToCart(product, qty = 1) {
  const cart = [...getState().cart];
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.qty = clamp(existing.qty + qty, 1, 10);
  else cart.push(line(product, clamp(qty, 1, 10)));
  setState({ cart });
  return cart;
}

export function removeFromCart(id) {
  setState({ cart: getState().cart.filter((item) => item.id !== id) });
}

export function updateQty(id, qty) {
  const next = getState().cart
    .map((item) => (item.id === id ? { ...item, qty: clamp(qty, 0, 10) } : item))
    .filter((item) => item.qty > 0);
  setState({ cart: next });
}

export function clearCart() {
  setState({ cart: [], coupon: null });
}

/* ---------- Save for later ---------- */
export function saveForLater(id) {
  const item = getState().cart.find((i) => i.id === id);
  if (!item) return;
  const saved = getState().saved.filter((s) => s.id !== id);
  setState({ saved: [...saved, item], cart: getState().cart.filter((i) => i.id !== id) });
}

export function moveToCart(id) {
  const item = getState().saved.find((s) => s.id === id);
  if (!item) return;
  setState({ saved: getState().saved.filter((s) => s.id !== id) });
  const product = PRODUCTS.find((p) => p.id === id) ?? item;
  addToCart(product, item.qty ?? 1);
}

export function removeSaved(id) {
  setState({ saved: getState().saved.filter((s) => s.id !== id) });
}

/* ---------- Coupons ---------- */
export function applyCoupon(code) {
  const coupon = COUPONS.find((c) => c.code === String(code).trim().toUpperCase());
  if (!coupon) throw new Error("That coupon code isn't valid.");
  const { subtotal } = totals();
  if (subtotal < coupon.min) throw new Error(`Add ${coupon.min - subtotal} more to use ${coupon.code}.`);
  setState({ coupon });
  return coupon;
}

export function removeCoupon() {
  setState({ coupon: null });
}

/* ---------- Totals ---------- */
export function totals(items = getState().cart, coupon = getState().coupon, { paymentMethod = null } = {}) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const mrpTotal = items.reduce((sum, i) => sum + i.mrp * i.qty, 0);
  const productSavings = mrpTotal - subtotal;
  let discount = 0;
  if (coupon && subtotal >= coupon.min) {
    discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  }
  const taxable = Math.max(0, subtotal - discount);
  const shipping = subtotal === 0 || subtotal >= COMMERCE.freeShippingAbove ? 0 : COMMERCE.shippingFlat;
  const codFee = paymentMethod === "cod" ? COMMERCE.codFee : 0;
  const tax = Math.round(taxable * COMMERCE.taxRate) / 1; // GST already included in list price for display parity
  const total = taxable + shipping + codFee;
  return { subtotal, mrpTotal, productSavings, discount, shipping, codFee, tax, total, count: items.reduce((s, i) => s + i.qty, 0) };
}

export const estimatedDelivery = () => ({
  from: addDays(COMMERCE.deliveryDays.min),
  to: addDays(COMMERCE.deliveryDays.max),
});
