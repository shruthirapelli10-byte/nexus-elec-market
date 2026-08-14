/**
 * Single source of truth for client state.
 * Every mutation goes through setState() so UI stays in sync via subscribe().
 */
import { STORAGE_KEYS } from "./config.js";
import { storage } from "./utils.js";

const listeners = new Set();

const state = {
  user: storage.get(STORAGE_KEYS.user, null),
  cart: storage.get(STORAGE_KEYS.cart, []),
  saved: storage.get(STORAGE_KEYS.saved, []),
  wishlist: storage.get(STORAGE_KEYS.wishlist, []),
  orders: storage.get(STORAGE_KEYS.orders, []),
  addresses: storage.get(STORAGE_KEYS.addresses, []),
  notifications: storage.get(STORAGE_KEYS.notifications, []),
  recentSearches: storage.get(STORAGE_KEYS.recentSearches, []),
  coupon: null,
  theme: storage.get(STORAGE_KEYS.theme, null),
};

const PERSISTED = {
  user: STORAGE_KEYS.user,
  cart: STORAGE_KEYS.cart,
  saved: STORAGE_KEYS.saved,
  wishlist: STORAGE_KEYS.wishlist,
  orders: STORAGE_KEYS.orders,
  addresses: STORAGE_KEYS.addresses,
  notifications: STORAGE_KEYS.notifications,
  recentSearches: STORAGE_KEYS.recentSearches,
  theme: STORAGE_KEYS.theme,
};

export const getState = () => state;

export function setState(patch) {
  const changed = [];
  for (const [key, value] of Object.entries(patch)) {
    if (state[key] === value) continue;
    state[key] = value;
    changed.push(key);
    if (PERSISTED[key]) storage.set(PERSISTED[key], value);
  }
  if (changed.length) listeners.forEach((fn) => fn(state, changed));
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Sync state across browser tabs. */
window.addEventListener("storage", (event) => {
  const entry = Object.entries(PERSISTED).find(([, storageKey]) => storageKey === event.key);
  if (!entry) return;
  const [key] = entry;
  state[key] = storage.get(event.key, state[key]);
  listeners.forEach((fn) => fn(state, [key]));
});
