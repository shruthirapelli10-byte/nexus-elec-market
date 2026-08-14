import { el, formatDate, icon, money, qs } from "../core/utils.js";
import { getState, subscribe } from "../core/store.js";
import { mountLayout } from "../ui/layout.js";
import { emptyState, sectionHead } from "../ui/components.js";
import { toast } from "../ui/toast.js";
import {
  applyCoupon, estimatedDelivery, getCart, moveToCart, removeCoupon,
  removeFromCart, removeSaved, saveForLater, totals, updateQty,
} from "../services/cart-service.js";
import { COMMERCE, COUPONS } from "../core/config.js";

function lineItem(item) {
  const qtyLabel = el("span", { text: String(item.qty) });
  return el("div", { class: "line-item fade-up" }, [
    el("a", { href: `product-details.html?id=${item.id}` }, [el("img", { src: item.image, alt: item.name, loading: "lazy" })]),
    el("div", { class: "stack", style: "gap:8px" }, [
      el("div", { class: "row row--between", style: "align-items:flex-start;gap:10px" }, [
        el("div", {}, [
          el("span", { class: "product__brand", text: item.brand }),
          el("a", { class: "product__name", href: `product-details.html?id=${item.id}`, text: item.name }),
        ]),
        el("strong", { class: "price", text: money(item.price * item.qty) }),
      ]),
      el("div", { class: "row row--wrap" }, [
        el("div", { class: "qty" }, [
          el("button", { "aria-label": "Decrease quantity", html: icon("minus", 15), onclick: () => updateQty(item.id, item.qty - 1) }),
          qtyLabel,
          el("button", { "aria-label": "Increase quantity", html: icon("plus", 15), onclick: () => updateQty(item.id, item.qty + 1) }),
        ]),
        el("span", { class: "muted small", text: `${money(item.price)} each` }),
      ]),
      el("div", { class: "row row--wrap" }, [
        el("button", { class: "btn btn--quiet btn--sm", html: `${icon("heart", 15)} Save for later`, onclick: () => { saveForLater(item.id); toast("Moved to saved items", { type: "info" }); } }),
        el("button", { class: "btn btn--quiet btn--sm", html: `${icon("trash", 15)} Remove`, onclick: () => { removeFromCart(item.id); toast(`${item.name} removed`, { type: "info" }); } }),
      ]),
    ]),
  ]);
}

function summary() {
  const host = qs("#cart-summary");
  host.innerHTML = "";
  const cart = getCart();
  const t = totals();
  const delivery = estimatedDelivery();
  const coupon = getState().coupon;

  const codeInput = el("input", { class: "input", placeholder: "Coupon code", value: coupon?.code ?? "" });
  const couponRow = el("form", { class: "row", style: "gap:8px", onsubmit: (e) => {
    e.preventDefault();
    try {
      const applied = applyCoupon(codeInput.value);
      toast(`${applied.code} applied — ${applied.label}`, { title: "Coupon applied", type: "success" });
      summary();
    } catch (err) {
      toast(err.message, { type: "error" });
    }
  } }, [
    el("div", { style: "flex:1" }, [codeInput]),
    el("button", { class: "btn btn--ghost", type: "submit", text: coupon ? "Update" : "Apply" }),
  ]);

  const row = (label, value, accent) =>
    el("div", { class: "summary__row" }, [
      el("span", { class: "muted", text: label }),
      el("strong", { style: accent ? "color:var(--success)" : "", text: value }),
    ]);

  host.append(
    el("h3", { text: "Order summary" }),
    row(`Items (${t.count})`, money(t.subtotal)),
    t.productSavings ? row("Product discount", `− ${money(t.productSavings)}`, true) : null,
    coupon ? row(`Coupon ${coupon.code}`, `− ${money(t.discount)}`, true) : null,
    row("Shipping", t.shipping === 0 ? "Free" : money(t.shipping)),
    t.shipping > 0 ? el("p", { class: "muted small", text: `Add ${money(COMMERCE.freeShippingAbove - t.subtotal)} more for free delivery.` }) : null,
    el("div", { class: "summary__total" }, [el("span", { text: "Total" }), el("span", { text: money(t.total) })]),
    el("p", { class: "muted small", html: `${icon("truck", 15)} Estimated delivery ${formatDate(delivery.from)} – ${formatDate(delivery.to)}` }),
    couponRow,
    coupon ? el("button", { class: "btn btn--quiet btn--sm", text: "Remove coupon", onclick: () => { removeCoupon(); summary(); } }) : null,
    el("a", { class: "btn btn--primary btn--block btn--lg", href: "checkout.html", html: `Checkout ${icon("arrow", 16)}`, ...(cart.length ? {} : { disabled: true }) }),
    el("div", { class: "divider" }),
    el("div", { class: "stack", style: "gap:6px" }, [
      el("span", { class: "muted small", text: "Available coupons" }),
      ...COUPONS.map((c) =>
        el("button", { class: "row small", style: "justify-content:space-between;text-align:left", onclick: () => { codeInput.value = c.code; couponRow.requestSubmit(); } }, [
          el("span", { class: "badge badge--accent", text: c.code }),
          el("span", { class: "muted", text: c.label }),
        ]),
      ),
    ]),
  );
}

function savedSection() {
  const host = qs("#saved-section");
  host.innerHTML = "";
  const saved = getState().saved;
  if (!saved.length) return;
  host.append(sectionHead({ title: `Saved for later (${saved.length})` }));
  host.append(el("div", { class: "stack" },
    saved.map((item) =>
      el("div", { class: "line-item" }, [
        el("img", { src: item.image, alt: item.name, loading: "lazy" }),
        el("div", { class: "stack", style: "gap:8px" }, [
          el("div", {}, [el("span", { class: "product__brand", text: item.brand }), el("strong", { text: item.name })]),
          el("span", { class: "price", text: money(item.price) }),
          el("div", { class: "row" }, [
            el("button", { class: "btn btn--primary btn--sm", html: `${icon("cart", 15)} Move to cart`, onclick: () => { moveToCart(item.id); toast("Moved to cart", { type: "success" }); } }),
            el("button", { class: "btn btn--quiet btn--sm", html: `${icon("trash", 15)} Remove`, onclick: () => removeSaved(item.id) }),
          ]),
        ]),
      ]),
    ),
  ));
}

function render() {
  const host = qs("#cart-items");
  host.innerHTML = "";
  const cart = getCart();
  if (!cart.length) {
    host.append(emptyState({
      iconName: "cart", title: "Your cart is empty",
      message: "Add a few things you love — deals and coupons apply automatically at checkout.",
      actionLabel: "Start shopping", actionHref: "products.html",
    }));
  } else {
    cart.forEach((item) => host.append(lineItem(item)));
  }
  summary();
  savedSection();
}

mountLayout();
qs("#cart-head").append(sectionHead({ eyebrow: "Step 1 of 2", title: "Shopping cart", subtitle: "Quantities, coupons and delivery estimates update instantly." }));
render();
subscribe((_, changed) => { if (changed.some((k) => ["cart", "saved"].includes(k))) render(); });
