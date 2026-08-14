import { el, formatDate, icon, initials, money, qs } from "../core/utils.js";
import { subscribe } from "../core/store.js";
import { mountLayout } from "../ui/layout.js";
import { emptyState, sectionHead } from "../ui/components.js";
import { confirmModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { changePassword, currentUser, logout, requireAuth, updateProfile } from "../services/auth-service.js";
import { deleteAddress, listAddresses, saveAddress, setDefaultAddress } from "../services/address-service.js";
import { listOrders } from "../services/order-service.js";
import { getWishlist } from "../services/wishlist-service.js";

if (!requireAuth("profile.html")) throw new Error("redirecting");

const TABS = [
  { id: "info", label: "Personal information", icon: "user" },
  { id: "addresses", label: "Saved addresses", icon: "location" },
  { id: "orders", label: "My orders", icon: "box" },
  { id: "wishlist", label: "Wishlist", icon: "heart" },
  { id: "security", label: "Change password", icon: "lock" },
];

let active = "info";

function infoPanel() {
  const user = currentUser();
  const field = (id, label, value, type = "text") =>
    el("div", { class: "field" }, [el("label", { for: id, text: label }), el("input", { class: "input", id, name: id, type, value: value ?? "" })]);

  const form = el("form", { class: "stack", onsubmit: async (e) => {
    e.preventDefault();
    await updateProfile(Object.fromEntries(new FormData(e.currentTarget)));
    toast("Profile updated", { type: "success" });
  } }, [
    el("div", { class: "grid grid--2", style: "gap:14px" }, [field("name", "Full name", user.name), field("phone", "Phone", user.phone, "tel")]),
    field("email", "Email", user.email, "email"),
    el("button", { class: "btn btn--primary", type: "submit", text: "Save changes" }),
  ]);

  return el("div", { class: "card card--pad stack" }, [
    el("div", { class: "row" }, [
      el("div", { class: "avatar", style: "width:56px;height:56px;font-size:1.1rem", text: initials(user.name) }),
      el("div", {}, [el("h3", { text: user.name }), el("div", { class: "muted small", text: `Member since ${formatDate(user.createdAt)}` })]),
    ]),
    el("div", { class: "divider" }),
    form,
  ]);
}

function addressesPanel() {
  const list = listAddresses();
  const field = (name, label, required = true) =>
    el("div", { class: "field" }, [el("label", { for: name, text: label }), el("input", { class: "input", id: name, name, required })]);

  const form = el("form", { class: "stack", onsubmit: async (e) => {
    e.preventDefault();
    await saveAddress(Object.fromEntries(new FormData(e.currentTarget)));
    toast("Address added", { type: "success" });
    render();
  } }, [
    el("div", { class: "grid grid--2", style: "gap:14px" }, [field("name", "Full name"), field("phone", "Phone")]),
    field("line1", "Flat / building / street"),
    el("div", { class: "grid grid--2", style: "gap:14px" }, [field("city", "City"), field("state", "State")]),
    field("pincode", "PIN code"),
    el("button", { class: "btn btn--primary", type: "submit", text: "Add address" }),
  ]);

  return el("div", { class: "stack" }, [
    ...(list.length
      ? list.map((a) =>
          el("div", { class: "card card--pad row row--between row--wrap" }, [
            el("div", {}, [
              el("div", { class: "row" }, [
                el("strong", { text: a.name }),
                a.isDefault ? el("span", { class: "badge badge--accent", text: "Default" }) : null,
              ]),
              el("div", { class: "muted small", text: `${a.line1}, ${a.city}, ${a.state} — ${a.pincode} · ${a.phone}` }),
            ]),
            el("div", { class: "row" }, [
              a.isDefault ? null : el("button", { class: "btn btn--ghost btn--sm", text: "Set default", onclick: () => { setDefaultAddress(a.id); render(); } }),
              el("button", { class: "btn btn--quiet btn--sm", html: icon("trash", 15), "aria-label": "Delete address", onclick: async () => {
                if (!(await confirmModal({ title: "Delete this address?", message: "You can add it again any time." }))) return;
                await deleteAddress(a.id);
                render();
              } }),
            ]),
          ]),
        )
      : [emptyState({ iconName: "location", title: "No saved addresses", message: "Add one now to speed up checkout." })]),
    el("div", { class: "card card--pad stack" }, [el("h3", { text: "Add a new address" }), form]),
  ]);
}

async function ordersPanel(host) {
  const orders = await listOrders();
  host.innerHTML = "";
  if (!orders.length) {
    host.append(emptyState({ iconName: "box", title: "No orders yet", message: "Your order history will appear here.", actionLabel: "Shop now", actionHref: "products.html" }));
    return;
  }
  host.append(el("div", { class: "stack" }, [
    ...orders.slice(0, 5).map((o) =>
      el("a", { class: "card card--pad row row--between", href: `orders.html?id=${o.id}` }, [
        el("div", {}, [el("strong", { text: `Order ${o.id}` }), el("div", { class: "muted small", text: `${formatDate(o.placedAt)} · ${money(o.amounts.total)}` })]),
        el("span", { class: "badge badge--accent", text: o.status }),
      ]),
    ),
    el("a", { class: "btn btn--ghost", href: "orders.html", text: "View all orders" }),
  ]));
}

function wishlistPanel() {
  const count = getWishlist().length;
  return el("div", { class: "card card--pad stack" }, [
    el("h3", { text: `${count} item${count === 1 ? "" : "s"} in your wishlist` }),
    el("p", { class: "muted small", text: "We send you an alert whenever a saved item drops in price." }),
    el("a", { class: "btn btn--primary", href: "wishlist.html", text: "Open wishlist" }),
  ]);
}

function securityPanel() {
  const field = (name, label) =>
    el("div", { class: "field" }, [el("label", { for: name, text: label }), el("input", { class: "input", id: name, name, type: "password", required: true })]);

  const form = el("form", { class: "stack", onsubmit: async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (data.newPassword !== data.confirm) return toast("New passwords must match.", { type: "error" });
    if (data.newPassword.length < 6) return toast("Password must be at least 6 characters.", { type: "error" });
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      e.currentTarget.reset();
      toast("Password changed", { type: "success" });
    } catch (err) {
      toast(err.message, { type: "error" });
    }
  } }, [
    field("currentPassword", "Current password"),
    field("newPassword", "New password"),
    field("confirm", "Confirm new password"),
    el("button", { class: "btn btn--primary", type: "submit", text: "Update password" }),
  ]);

  return el("div", { class: "stack" }, [
    el("div", { class: "card card--pad stack" }, [el("h3", { text: "Change password" }), form]),
    el("div", { class: "card card--pad row row--between row--wrap" }, [
      el("div", {}, [el("strong", { text: "Log out of this device" }), el("p", { class: "muted small", text: "Your cart and wishlist stay saved on this browser." })]),
      el("button", { class: "btn btn--danger", html: `${icon("logout", 16)} Log out`, onclick: async () => {
        await logout();
        location.href = "index.html";
      } }),
    ]),
  ]);
}

function nav() {
  const host = qs("#profile-nav");
  host.innerHTML = "";
  host.append(el("div", { class: "stack", style: "gap:4px" },
    TABS.map((tab) =>
      el("button", {
        class: `btn ${active === tab.id ? "btn--primary" : "btn--quiet"}`,
        style: "justify-content:flex-start",
        html: `${icon(tab.icon, 16)} ${tab.label}`,
        onclick: () => { active = tab.id; render(); },
      }),
    ),
  ));
}

function render() {
  nav();
  const host = qs("#profile-body");
  host.innerHTML = "";
  if (active === "info") host.append(infoPanel());
  else if (active === "addresses") host.append(addressesPanel());
  else if (active === "orders") ordersPanel(host);
  else if (active === "wishlist") host.append(wishlistPanel());
  else host.append(securityPanel());
}

mountLayout();
qs("#profile-head").append(sectionHead({ eyebrow: "Account", title: "My profile" }));
render();
subscribe((_, changed) => { if (changed.includes("addresses") && active === "addresses") render(); });
