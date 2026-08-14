import { getState, setState } from "../core/store.js";
import { addToCart } from "./cart-service.js";
import { PRODUCTS } from "../data/products.js";

export const getWishlist = () => getState().wishlist;
export const wishlistCount = () => getState().wishlist.length;
export const inWishlist = (id) => getState().wishlist.includes(id);

export function toggleWishlist(id) {
  const list = getState().wishlist;
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  setState({ wishlist: next });
  return next.includes(id);
}

export function removeFromWishlist(id) {
  setState({ wishlist: getState().wishlist.filter((x) => x !== id) });
}

export function moveWishlistToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return false;
  addToCart(product, 1);
  removeFromWishlist(id);
  return true;
}
