/**
 * Global application configuration.
 * Everything environment-ish lives here so Firebase can be dropped in later
 * without touching feature code.
 */

export const APP = {
  name: "Voltra",
  tagline: "Premium electronics, delivered fast.",
  supportEmail: "care@voltra.store",
  phone: "1800-000-4455",
};

/** Firebase placeholder — fill in and initialise inside services/firebase.js later. */
export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

/** Data source switch. Swap to "firebase" once the SDK is wired up. */
export const DATA_SOURCE = "local";

export const CURRENCY = { code: "INR", symbol: "₹", locale: "en-IN" };

export const COMMERCE = {
  freeShippingAbove: 4999,
  shippingFlat: 149,
  taxRate: 0.18,
  codFee: 49,
  deliveryDays: { min: 2, max: 5 },
};

export const STORAGE_KEYS = {
  cart: "voltra.cart",
  wishlist: "voltra.wishlist",
  saved: "voltra.saved",
  orders: "voltra.orders",
  user: "voltra.user",
  users: "voltra.users",
  theme: "voltra.theme",
  recentSearches: "voltra.recentSearches",
  notifications: "voltra.notifications",
  addresses: "voltra.addresses",
  resetTokens: "voltra.resetTokens",
};

export const CATEGORIES = [
  { id: "smartphones", name: "Smartphones", icon: "smartphone" },
  { id: "laptops", name: "Laptops", icon: "laptop" },
  { id: "tablets", name: "Tablets", icon: "tablet" },
  { id: "smartwatches", name: "Smart Watches", icon: "watch" },
  { id: "headphones", name: "Headphones", icon: "headphones" },
  { id: "earbuds", name: "Earbuds", icon: "earbuds" },
  { id: "speakers", name: "Speakers", icon: "speaker" },
  { id: "consoles", name: "Gaming Consoles", icon: "gamepad" },
  { id: "monitors", name: "Monitors", icon: "monitor" },
  { id: "keyboards", name: "Keyboard", icon: "keyboard" },
  { id: "mice", name: "Mouse", icon: "mouse" },
  { id: "storage", name: "Storage Devices", icon: "storage" },
  { id: "cameras", name: "Cameras", icon: "camera" },
  { id: "accessories", name: "Accessories", icon: "plug" },
];

export const BRANDS = [
  "Apple", "Samsung", "Sony", "Dell", "Asus", "Lenovo", "HP",
  "Bose", "JBL", "Logitech", "Canon", "SanDisk", "Nintendo", "Xiaomi",
];

export const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", hint: "Pay when it arrives" },
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm" },
  { id: "debit", label: "Debit Card", hint: "Visa, Mastercard, RuPay" },
  { id: "credit", label: "Credit Card", hint: "EMI available" },
  { id: "netbanking", label: "Net Banking", hint: "All major banks" },
];

export const COUPONS = [
  { code: "VOLTRA10", type: "percent", value: 10, min: 2000, label: "10% off above ₹2,000" },
  { code: "NEW500", type: "flat", value: 500, min: 5000, label: "₹500 off above ₹5,000" },
  { code: "AUDIO15", type: "percent", value: 15, min: 3000, label: "15% off audio orders" },
];

export const ORDER_STATUS = ["Placed", "Confirmed", "Packed", "Shipped", "Delivered"];
