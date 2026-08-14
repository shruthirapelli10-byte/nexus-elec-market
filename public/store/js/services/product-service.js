/**
 * Product read layer. Every call is async so switching the body of these
 * functions to Firestore queries requires no changes in the UI layer.
 *
 * Firestore equivalents (later):
 *   list()      -> getDocs(query(collection(db,'products'), ...))
 *   getById(id) -> getDoc(doc(db,'products',id))
 */
import { PRODUCTS, REVIEWS, TESTIMONIALS } from "../data/products.js";
import { BRANDS, CATEGORIES } from "../core/config.js";
import { percentOff, sleep } from "../core/utils.js";

const LATENCY = 220; // simulated network delay so skeletons are real

const matches = (product, f) => {
  if (f.category && product.category !== f.category) return false;
  if (f.categories?.length && !f.categories.includes(product.category)) return false;
  if (f.brands?.length && !f.brands.includes(product.brand)) return false;
  if (f.minPrice != null && product.price < f.minPrice) return false;
  if (f.maxPrice != null && product.price > f.maxPrice) return false;
  if (f.rating && product.rating < f.rating) return false;
  if (f.discount && percentOff(product.mrp, product.price) < f.discount) return false;
  if (f.inStock && product.stock <= 0) return false;
  if (f.featured && !product.featured) return false;
  if (f.newArrival && !product.newArrival) return false;
  if (f.bestSeller && !product.bestSeller) return false;
  if (f.flashDeal && !product.flashDeal) return false;
  if (f.query) {
    const q = f.query.toLowerCase();
    const haystack = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
};

const SORTERS = {
  relevance: (a, b) => b.rating - a.rating,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  discount: (a, b) => percentOff(b.mrp, b.price) - percentOff(a.mrp, a.price),
  newest: (a, b) => b.createdAt - a.createdAt,
  popular: (a, b) => b.reviewsCount - a.reviewsCount,
};

export async function listProducts(filters = {}, { sort = "relevance", limit } = {}) {
  await sleep(LATENCY);
  const result = PRODUCTS.filter((p) => matches(p, filters)).sort(SORTERS[sort] ?? SORTERS.relevance);
  return limit ? result.slice(0, limit) : result;
}

export async function getProduct(id) {
  await sleep(LATENCY);
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export async function getProductsByIds(ids = []) {
  await sleep(LATENCY);
  return ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
}

export async function getSimilar(product, limit = 4) {
  await sleep(LATENCY);
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}

export async function getRelated(product, limit = 4) {
  await sleep(LATENCY);
  return PRODUCTS.filter((p) => p.brand === product.brand && p.category !== product.category)
    .concat(PRODUCTS.filter((p) => p.bestSeller && p.category !== product.category))
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i && p.id !== product.id)
    .slice(0, limit);
}

/** Live search: products + category + brand suggestions. */
export async function search(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return { products: [], categories: [], brands: [] };
  await sleep(120);
  return {
    products: PRODUCTS.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q)).slice(0, limit),
    categories: CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3),
    brands: BRANDS.filter((b) => b.toLowerCase().includes(q)).slice(0, 3),
  };
}

export const POPULAR_SEARCHES = ["AirPods Pro", "MacBook", "PS5", "Sony XM6", "4K monitor", "SSD"];

export async function getReviews(productId) {
  await sleep(LATENCY);
  return REVIEWS.map((r, i) => ({ ...r, id: `${productId}-r${i}` }));
}

export const getTestimonials = () => TESTIMONIALS;

export const priceBounds = () => ({
  min: Math.min(...PRODUCTS.map((p) => p.price)),
  max: Math.max(...PRODUCTS.map((p) => p.price)),
});
