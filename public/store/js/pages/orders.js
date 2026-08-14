import { el, formatDate, getParam, icon, money, qs } from "../core/utils.js";
import { subscribe } from "../core/store.js";
import { mountLayout } from "../ui/layout.js";
import { emptyState, sectionHead, skeletonLines } from "../ui/components.js";
import { confirmModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { canCancel, cancelOrder, downloadInvoice, listOrders, trackingSteps } from "../services/order-service.js";

const STATUS_BADGE = { Placed: "badge--accent", Confirmed: "badge--accent", Packed: "badge--warning", Shipped: "badge--warning", Delivered: "badge--success", Cancelled: "badge--danger" };

function tracking(order) {
  return el("div", { class: "timeline" },
    trackingSteps(order).map((step) =>
      el("div", { class: `timeline__item ${step.done ? "is-done" : ""}` }, [
        el("span", { class: "timeline__dot", html: icon(step.done ? "check" : "chevron", 13) }),
        el("div", {}, [
          el("strong", { class: "small", text: step.status }),
          el("div", { class: "muted small", text: step.at ? formatDate(step.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Pending" }),
        ]),
      ]),
    ),
  );
}

function orderCard(order, expanded) {
  const details = el("div", { class: `stack ${expanded ? "" : "hidden"}`, style: "margin-top:14px" }, [
    el("div", { class: "divider" }),
    ...order.items.map((item) =>
      el("div", { class: "row", style: "gap:12px" }, [
        el("img", { src: item.image, alt: item.name, style: "width:52px;height:52px;border-radius:10px;object-fit:cover", loading: "lazy" }),
        el("div", { style: "flex:1" }, [
          el("a", { class: "product__name", href: `product-details.html?id=${item.id}`, text: item.name }),
          el("div", { class: "muted small", text: `${item.brand} · Qty ${item.qty}` }),
        ]),
        el("strong", { class: "small", text: money(item.price * item.qty) }),
      ]),
    ),
    el("div", { class: "divider" }),
    el("div", { class: "grid grid--2", style: "gap:16px" }, [
      el("div", { class: "stack", style: "gap:4px" }, [
        el("strong", { class: "small", text: "Delivery address" }),
        el("p", { class: "muted small", text: `${order.address?.name}, ${order.address?.line1}, ${order.address?.city}, ${order.address?.state} — ${order.address?.pincode}` }),
        el("strong", { class: "small", text: "Payment" }),
        el("p", { class: "muted small", text: `${order.paymentMethod.toUpperCase()} · ${money(order.amounts.total)} ${order.coupon ? `· Coupon ${order.coupon}` : ""}` }),
      ]),
      el("div", {}, [el("strong", { class: "small", text: "Tracking" }), tracking(order)]),
    ]),
    el("div", { class: "row row--wrap" }, [
      el("button", { class: "btn btn--ghost btn--sm", html: `${icon("download", 15)} Download invoice`, onclick: () => {
        if (!downloadInvoice(order)) toast("Allow pop-ups to download the invoice.", { type: "warning" });
      } }),
      canCancel(order)
        ? el("button", { class: "btn btn--danger btn--sm", html: `${icon("close", 15)} Cancel order`, onclick: async () => {
            const ok = await confirmModal({ title: `Cancel order ${order.id}?`, message: "Refunds land back in the original payment method within 3-5 working days.", confirmLabel: "Cancel order" });
            if (!ok) return;
            await cancelOrder(order.id);
            toast(`Order ${order.id} cancelled`, { type: "info" });
          } })
        : null,
    ]),
  ]);

  const toggle = el("button", { class: "btn btn--quiet btn--sm", text: expanded ? "Hide details" : "View details", onclick: () => {
    const open = details.classList.toggle("hidden");
    toggle.textContent = open ? "View details" : "Hide details";
  } });

  return el("div", { class: "card card--pad fade-up" }, [
    el("div", { class: "row row--between row--wrap" }, [
      el("div", {}, [
        el("div", { class: "row" }, [
          el("strong", { text: `Order ${order.id}` }),
          el("span", { class: `badge ${STATUS_BADGE[order.status] ?? "badge--muted"}`, text: order.status }),
        ]),
        el("div", { class: "muted small", text: `Placed ${formatDate(order.placedAt)} · ${order.items.length} item(s) · ${money(order.amounts.total)}` }),
      ]),
      el("div", { class: "row" }, [
        el("span", { class: "muted small", html: `${icon("truck", 15)} Arrives ${formatDate(order.expectedAt)}` }),
        toggle,
      ]),
    ]),
    details,
  ]);
}

async function render() {
  const host = qs("#orders");
  skeletonLines(4, host);
  const orders = await listOrders();
  host.innerHTML = "";
  if (!orders.length) {
    host.append(emptyState({
      iconName: "box", title: "No orders yet",
      message: "Once you place an order it shows up here with live tracking and invoices.",
      actionLabel: "Start shopping", actionHref: "products.html",
    }));
    return;
  }
  const highlight = getParam("id");
  orders.forEach((order) => host.append(orderCard(order, order.id === highlight)));
}

mountLayout();
qs("#orders-head").append(sectionHead({ eyebrow: "History", title: "My orders", subtitle: "Track, cancel or download an invoice for any order." }));
render();
subscribe((_, changed) => { if (changed.includes("orders")) render(); });
