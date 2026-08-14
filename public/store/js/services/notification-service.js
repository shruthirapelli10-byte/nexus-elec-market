import { getState, setState } from "../core/store.js";
import { uid } from "../core/utils.js";

const SEED = [
  { type: "offer", title: "Flash sale live", body: "Up to 30% off on audio until midnight." },
  { type: "price", title: "Price drop alert", body: "Sony WH-1000XM6 dropped by ₹3,000 since you viewed it." },
  { type: "offer", title: "Coupon VOLTRA10", body: "Get 10% off on orders above ₹2,000." },
];

export function notify({ type = "order", title, body }) {
  const item = { id: uid("ntf"), type, title, body, at: Date.now(), read: false };
  setState({ notifications: [item, ...getState().notifications] });
  return item;
}

export const listNotifications = () => getState().notifications;
export const unreadCount = () => getState().notifications.filter((n) => !n.read).length;

export function markAllRead() {
  setState({ notifications: getState().notifications.map((n) => ({ ...n, read: true })) });
}

export function seedNotifications() {
  if (getState().notifications.length) return;
  setState({
    notifications: SEED.map((n, i) => ({ ...n, id: uid("ntf"), at: Date.now() - i * 36e5, read: false })),
  });
}
