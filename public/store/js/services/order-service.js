/** Orders + notifications. Firestore: collection('orders') scoped by userId. */
import { ORDER_STATUS } from "../core/config.js";
import { getState, setState } from "../core/store.js";
import { addDays, sleep, uid } from "../core/utils.js";
import { clearCart, totals } from "./cart-service.js";
import { currentUser } from "./auth-service.js";
import { notify } from "./notification-service.js";

export async function placeOrder({ address, paymentMethod, items = getState().cart, coupon = getState().coupon }) {
  await sleep(650);
  if (!items.length) throw new Error("Your cart is empty.");
  const amounts = totals(items, coupon, { paymentMethod });
  const order = {
    id: `VLT${Date.now().toString().slice(-8)}`,
    userId: currentUser()?.id ?? "guest",
    items: items.map(({ id, name, brand, price, qty, image }) => ({ id, name, brand, price, qty, image })),
    amounts,
    coupon: coupon?.code ?? null,
    address,
    paymentMethod,
    status: "Placed",
    history: [{ status: "Placed", at: Date.now() }],
    placedAt: Date.now(),
    expectedAt: addDays(4).getTime(),
  };
  setState({ orders: [order, ...getState().orders] });
  notify({
    type: "order",
    title: `Order ${order.id} placed`,
    body: `We've received your order of ${amounts.count} item(s).`,
  });
  clearCart();
  return order;
}

export const listOrders = async () => {
  await sleep(220);
  const user = currentUser();
  return getState().orders.filter((o) => !user || o.userId === user.id || o.userId === "guest");
};

export const getOrder = async (id) => {
  await sleep(180);
  return getState().orders.find((o) => o.id === id) ?? null;
};

export async function cancelOrder(id) {
  await sleep(320);
  const orders = getState().orders.map((o) =>
    o.id === id
      ? { ...o, status: "Cancelled", history: [...o.history, { status: "Cancelled", at: Date.now() }] }
      : o,
  );
  setState({ orders });
  notify({ type: "order", title: `Order ${id} cancelled`, body: "Any amount paid will be refunded in 3-5 days." });
}

export const canCancel = (order) => !["Delivered", "Cancelled", "Shipped"].includes(order.status);

export const trackingSteps = (order) =>
  ORDER_STATUS.map((status) => {
    const entry = order.history.find((h) => h.status === status);
    return { status, at: entry?.at ?? null, done: Boolean(entry) };
  });

/** Simple printable invoice — opens the browser print dialog to save as PDF. */
export function downloadInvoice(order) {
  const rows = order.items
    .map((i) => `<tr><td>${i.name}</td><td>${i.qty}</td><td style="text-align:right">₹${i.price * i.qty}</td></tr>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.id}</title>
    <style>body{font-family:system-ui,sans-serif;padding:36px;color:#0b1220}
    h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:18px}
    th,td{padding:9px 6px;border-bottom:1px solid #e2e6f0;font-size:13px;text-align:left}
    .tot{margin-top:18px;font-size:16px;font-weight:700;text-align:right}
    .muted{color:#5b6478;font-size:12px}</style></head><body>
    <h1>Voltra — Tax Invoice</h1>
    <p class="muted">Order ${order.id} · Placed ${new Date(order.placedAt).toLocaleString()}<br>
    ${order.address?.name ?? ""}, ${order.address?.line1 ?? ""}, ${order.address?.city ?? ""} ${order.address?.pincode ?? ""}</p>
    <table><thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="tot">Total paid: ₹${order.amounts.total}</p>
    <p class="muted">Payment method: ${order.paymentMethod} · This is a computer generated invoice.</p>
    </body></html>`;
  const win = window.open("", "_blank", "width=760,height=900");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  return true;
}
