import { PAYMENT_METHODS } from "../core/config.js";
import { el, formatDate, icon, money, qs } from "../core/utils.js";
import { getState } from "../core/store.js";
import { mountLayout } from "../ui/layout.js";
import { emptyState, sectionHead } from "../ui/components.js";
import { toast } from "../ui/toast.js";
import { estimatedDelivery, getCart, totals } from "../services/cart-service.js";
import { defaultAddress, listAddresses, saveAddress, setDefaultAddress } from "../services/address-service.js";
import { placeOrder } from "../services/order-service.js";
import { currentUser } from "../services/auth-service.js";

let paymentMethod = "upi";
let selectedAddress = defaultAddress();

function stepBar(step) {
  const host = qs("#steps");
  host.innerHTML = "";
  ["Address", "Payment", "Review"].forEach((label, i) => {
    host.append(el("div", { class: `step ${i === step ? "is-active" : i < step ? "is-done" : ""}`, html: `${i < step ? icon("check", 14) : `${i + 1}.`} ${label}` }));
  });
}

function addressForm() {
  const user = currentUser();
  const field = (name, label, value = "", type = "text", required = true) =>
    el("div", { class: "field" }, [el("label", { for: name, text: label }), el("input", { class: "input", id: name, name, type, value, required })]);

  const form = el("form", { class: "stack", onsubmit: async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const created = await saveAddress(data);
    setDefaultAddress(created.id);
    selectedAddress = created;
    toast("Address saved", { type: "success" });
    render(1);
  } }, [
    el("div", { class: "grid grid--2", style: "gap:14px" }, [
      field("name", "Full name", user?.name ?? ""),
      field("phone", "Phone", user?.phone ?? "", "tel"),
    ]),
    field("line1", "Flat / building / street"),
    el("div", { class: "grid grid--2", style: "gap:14px" }, [
      field("city", "City"),
      field("state", "State"),
    ]),
    el("div", { class: "grid grid--2", style: "gap:14px" }, [
      field("pincode", "PIN code"),
      field("landmark", "Landmark (optional)", "", "text", false),
    ]),
    el("button", { class: "btn btn--primary", type: "submit", text: "Save & continue" }),
  ]);
  return form;
}

function addressStep() {
  const list = listAddresses();
  return el("div", { class: "stack" }, [
    el("div", { class: "card card--pad stack" }, [
      el("h3", { html: `${icon("location", 17)} Delivery address` }),
      ...(list.length
        ? list.map((a) =>
            el("label", { class: `card card--pad row ${selectedAddress?.id === a.id ? "" : ""}`, style: `gap:12px;cursor:pointer;border-color:${selectedAddress?.id === a.id ? "var(--accent)" : "var(--border)"}` }, [
              el("input", { type: "radio", name: "addr", checked: selectedAddress?.id === a.id, style: "accent-color:var(--accent)", onchange: () => { selectedAddress = a; render(1); } }),
              el("div", {}, [
                el("strong", { text: `${a.name} · ${a.phone}` }),
                el("div", { class: "muted small", text: `${a.line1}, ${a.city}, ${a.state} — ${a.pincode}` }),
              ]),
            ]),
          )
        : [el("p", { class: "muted small", text: "Add a delivery address to continue." })]),
    ]),
    el("div", { class: "card card--pad stack" }, [el("h3", { text: list.length ? "Add another address" : "New address" }), addressForm()]),
  ]);
}

function paymentStep() {
  return el("div", { class: "stack" }, [
    el("div", { class: "card card--pad stack" }, [
      el("h3", { html: `${icon("card", 17)} Payment method` }),
      ...PAYMENT_METHODS.map((m) =>
        el("label", { class: "card card--pad row", style: `gap:12px;cursor:pointer;border-color:${paymentMethod === m.id ? "var(--accent)" : "var(--border)"}` }, [
          el("input", { type: "radio", name: "pay", checked: paymentMethod === m.id, style: "accent-color:var(--accent)", onchange: () => { paymentMethod = m.id; render(1); } }),
          el("div", {}, [el("strong", { text: m.label }), el("div", { class: "muted small", text: m.hint })]),
        ]),
      ),
      el("p", { class: "muted small", html: `${icon("lock", 14)} Payment UI only — no card details are stored or transmitted in this build.` }),
    ]),
    el("div", { class: "row row--wrap" }, [
      el("button", { class: "btn btn--ghost", text: "Back to address", onclick: () => render(0) }),
      el("button", { class: "btn btn--primary", html: `Review order ${icon("arrow", 16)}`, onclick: () => render(2) }),
    ]),
  ]);
}

function reviewStep() {
  const delivery = estimatedDelivery();
  const placeBtn = el("button", { class: "btn btn--primary btn--lg btn--block", html: `${icon("check", 17)} Place order`, onclick: async () => {
    placeBtn.disabled = true;
    placeBtn.innerHTML = `<span class="spinner"></span> Placing order…`;
    try {
      const order = await placeOrder({ address: selectedAddress, paymentMethod });
      toast("Order placed successfully", { title: `Order ${order.id}`, type: "success" });
      location.href = `orders.html?id=${order.id}`;
    } catch (err) {
      toast(err.message, { type: "error" });
      placeBtn.disabled = false;
      placeBtn.innerHTML = `${icon("check", 17)} Place order`;
    }
  } });

  return el("div", { class: "stack" }, [
    el("div", { class: "card card--pad stack" }, [
      el("h3", { text: "Review & confirm" }),
      el("div", { class: "muted small" }, [
        el("strong", { text: `${selectedAddress.name} · ${selectedAddress.phone}` }),
        el("div", { text: `${selectedAddress.line1}, ${selectedAddress.city}, ${selectedAddress.state} — ${selectedAddress.pincode}` }),
      ]),
      el("div", { class: "divider" }),
      ...getCart().map((item) =>
        el("div", { class: "row row--between small" }, [
          el("span", { text: `${item.name} × ${item.qty}` }),
          el("strong", { text: money(item.price * item.qty) }),
        ]),
      ),
      el("div", { class: "divider" }),
      el("div", { class: "row small", html: `${icon("card", 15)} ${PAYMENT_METHODS.find((m) => m.id === paymentMethod).label}` }),
      el("div", { class: "row small", html: `${icon("truck", 15)} Arrives ${formatDate(delivery.from)} – ${formatDate(delivery.to)}` }),
    ]),
    el("div", { class: "row row--wrap" }, [el("button", { class: "btn btn--ghost", text: "Change payment", onclick: () => render(1) })]),
    placeBtn,
  ]);
}

function summary() {
  const host = qs("#checkout-summary");
  host.innerHTML = "";
  const t = totals(getCart(), getState().coupon, { paymentMethod });
  const row = (label, value, accent) => el("div", { class: "summary__row" }, [
    el("span", { class: "muted", text: label }),
    el("strong", { style: accent ? "color:var(--success)" : "", text: value }),
  ]);
  host.append(
    el("h3", { text: "Summary" }),
    row(`Items (${t.count})`, money(t.subtotal)),
    t.discount ? row("Coupon discount", `− ${money(t.discount)}`, true) : null,
    row("Shipping", t.shipping === 0 ? "Free" : money(t.shipping)),
    t.codFee ? row("COD handling", money(t.codFee)) : null,
    el("div", { class: "summary__total" }, [el("span", { text: "Payable" }), el("span", { text: money(t.total) })]),
    el("p", { class: "muted small", text: "Inclusive of all taxes. GST invoice available after dispatch." }),
  );
}

function render(step = 0) {
  stepBar(step);
  const host = qs("#checkout-body");
  host.innerHTML = "";
  if (step === 0 || !selectedAddress) host.append(addressStep());
  else if (step === 1) host.append(paymentStep());
  else host.append(reviewStep());
  summary();
}

mountLayout();
qs("#checkout-head").append(sectionHead({ eyebrow: "Step 2 of 2", title: "Checkout" }));

if (!getCart().length) {
  qs("#checkout-body").append(emptyState({
    iconName: "cart", title: "Nothing to check out",
    message: "Your cart is empty — add a product first.",
    actionLabel: "Browse products", actionHref: "products.html",
  }));
  qs("#steps").remove();
} else {
  render(selectedAddress ? 1 : 0);
}
