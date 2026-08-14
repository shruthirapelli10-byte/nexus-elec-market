/**
 * Header + footer are injected here so no markup is duplicated across pages.
 * Every page calls mountLayout() once.
 */
import { APP, CATEGORIES } from "../core/config.js";
import { debounce, el, icon, initials, money, qs, storage } from "../core/utils.js";
import { getState, setState, subscribe } from "../core/store.js";
import { initTheme, toggleTheme } from "../core/theme.js";
import { cartCount } from "../services/cart-service.js";
import { wishlistCount } from "../services/wishlist-service.js";
import { currentUser, logout } from "../services/auth-service.js";
import { POPULAR_SEARCHES, search } from "../services/product-service.js";
import { listNotifications, markAllRead, seedNotifications, unreadCount } from "../services/notification-service.js";
import { openModal } from "./modal.js";
import { toast } from "./toast.js";

const NAV = [
  { label: "Home", href: "index.html" },
  { label: "Shop", href: "products.html" },
  { label: "Deals", href: "products.html?deal=1" },
  { label: "Orders", href: "orders.html" },
  { label: "Wishlist", href: "wishlist.html" },
];

const page = () => location.pathname.split("/").pop() || "index.html";

function searchBox() {
  const input = el("input", { class: "input search__input", type: "search", placeholder: "Search phones, laptops, audio…", "aria-label": "Search products" });
  const panel = el("div", { class: "search__panel hidden" });
  const box = el("div", { class: "search" }, [el("span", { class: "search__icon", html: icon("search", 18) }), input, panel]);

  const go = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const recents = [trimmed, ...getState().recentSearches.filter((r) => r !== trimmed)].slice(0, 6);
    setState({ recentSearches: recents });
    location.href = `products.html?q=${encodeURIComponent(trimmed)}`;
  };

  const suggestionsPanel = () => {
    panel.innerHTML = "";
    const recents = getState().recentSearches;
    if (recents.length) {
      panel.append(el("div", { class: "search__group-title", text: "Recent searches" }));
      recents.forEach((r) => panel.append(el("button", { class: "search__item", html: `${icon("refresh", 15)} <strong>${r}</strong>`, onclick: () => go(r) })));
    }
    panel.append(el("div", { class: "search__group-title", text: "Popular searches" }));
    POPULAR_SEARCHES.forEach((p) => panel.append(el("button", { class: "search__item", html: `${icon("zap", 15)} <strong>${p}</strong>`, onclick: () => go(p) })));
    panel.classList.remove("hidden");
  };

  const runSearch = debounce(async (value) => {
    if (!value.trim()) return suggestionsPanel();
    const { products, categories, brands } = await search(value);
    panel.innerHTML = "";
    if (!products.length && !categories.length && !brands.length) {
      panel.append(el("div", { class: "search__item muted", text: `No matches for "${value}"` }));
    }
    if (products.length) {
      panel.append(el("div", { class: "search__group-title", text: "Products" }));
      products.forEach((p) =>
        panel.append(el("a", { class: "search__item", href: `product-details.html?id=${p.id}` }, [
          el("img", { src: p.images[0], alt: p.name }),
          el("div", {}, [el("strong", { text: p.name }), el("div", { class: "muted small", text: `${p.brand} · ${money(p.price)}` })]),
        ])),
      );
    }
    if (categories.length) {
      panel.append(el("div", { class: "search__group-title", text: "Categories" }));
      categories.forEach((c) => panel.append(el("a", { class: "search__item", href: `products.html?category=${c.id}`, html: `${icon(c.icon, 15)} <strong>${c.name}</strong>` })));
    }
    if (brands.length) {
      panel.append(el("div", { class: "search__group-title", text: "Brands" }));
      brands.forEach((b) => panel.append(el("a", { class: "search__item", href: `products.html?brand=${encodeURIComponent(b)}`, html: `${icon("tag", 15)} <strong>${b}</strong>` })));
    }
    panel.classList.remove("hidden");
  }, 180);

  input.addEventListener("focus", () => (input.value ? runSearch(input.value) : suggestionsPanel()));
  input.addEventListener("input", (e) => runSearch(e.target.value));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") go(input.value); });
  document.addEventListener("click", (e) => { if (!box.contains(e.target)) panel.classList.add("hidden"); });
  return box;
}

function accountMenu() {
  const user = currentUser();
  const body = el("div", { class: "stack" }, [
    user
      ? el("div", { class: "row" }, [
          el("div", { class: "avatar", text: initials(user.name) }),
          el("div", {}, [el("strong", { text: user.name }), el("div", { class: "muted small", text: user.email })]),
        ])
      : el("p", { class: "muted", text: "Sign in to track orders, sync your wishlist and check out faster." }),
    el("div", { class: "divider" }),
    ...(user
      ? [
          el("a", { class: "btn btn--ghost btn--block", href: "profile.html", html: `${icon("user", 16)} My profile` }),
          el("a", { class: "btn btn--ghost btn--block", href: "orders.html", html: `${icon("box", 16)} My orders` }),
          el("a", { class: "btn btn--ghost btn--block", href: "wishlist.html", html: `${icon("heart", 16)} My wishlist` }),
          el("button", {
            class: "btn btn--danger btn--block",
            html: `${icon("logout", 16)} Log out`,
            onclick: async () => { await logout(); toast("You're signed out.", { type: "info" }); location.href = "index.html"; },
          }),
        ]
      : [
          el("a", { class: "btn btn--primary btn--block", href: "login.html", text: "Log in" }),
          el("a", { class: "btn btn--ghost btn--block", href: "register.html", text: "Create account" }),
        ]),
  ]);
  openModal({ title: user ? "Account" : "Welcome to Voltra", body, width: 420 });
}

function notificationsMenu() {
  seedNotifications();
  const items = listNotifications();
  const body = el("div", { class: "stack" },
    items.length
      ? items.map((n) =>
          el("div", { class: "card card--pad", style: `display:grid;gap:4px;${n.read ? "opacity:.65" : ""}` }, [
            el("div", { class: "row row--between" }, [
              el("strong", { class: "small", text: n.title }),
              el("span", { class: "badge badge--muted", text: n.type }),
            ]),
            el("p", { class: "muted small", text: n.body }),
          ]),
        )
      : [el("p", { class: "muted", text: "No notifications yet." })],
  );
  openModal({ title: "Notifications", body, width: 460 });
  markAllRead();
  refreshBadges();
}

function refreshBadges() {
  const map = { cart: cartCount(), wishlist: wishlistCount(), bell: unreadCount() };
  Object.entries(map).forEach(([key, count]) => {
    const badge = qs(`[data-count="${key}"]`);
    if (!badge) return;
    badge.textContent = count > 9 ? "9+" : count;
    badge.classList.toggle("hidden", !count);
  });
}

function iconButton(name, { href, onclick, label, counter }) {
  const attrs = { class: "icon-btn", "aria-label": label, html: icon(name, 20) };
  const node = href ? el("a", { href, ...attrs }) : el("button", { ...attrs, onclick });
  if (counter) node.append(el("span", { class: "icon-btn__count hidden", dataset: { count: counter }, text: "0" }));
  return node;
}

export function mountHeader() {
  const current = page();
  const mobileNav = el("nav", { class: "mobile-nav hidden" },
    [...NAV, { label: "Categories", href: "products.html" }].map((item) => el("a", { href: item.href, text: item.label })),
  );

  const header = el("header", { class: "header" }, [
    el("div", { class: "container" }, [
      el("div", { class: "header__bar" }, [
        el("button", {
          class: "icon-btn header__menu-btn",
          "aria-label": "Menu",
          html: icon("menu"),
          onclick: () => mobileNav.classList.toggle("hidden"),
        }),
        el("a", { class: "logo", href: "index.html" }, [
          el("span", { class: "logo__mark", html: icon("zap", 18) }),
          el("span", { text: APP.name }),
        ]),
        el("nav", { class: "nav" }, NAV.map((item) =>
          el("a", { href: item.href, text: item.label, class: item.href === current ? "is-active" : "" }),
        )),
        el("div", { class: "spacer" }),
        searchBox(),
        iconButton("moon", { label: "Toggle theme", onclick: (e) => {
          const next = toggleTheme();
          e.currentTarget.innerHTML = icon(next === "dark" ? "sun" : "moon", 20);
        } }),
        iconButton("bell", { label: "Notifications", onclick: notificationsMenu, counter: "bell" }),
        iconButton("heart", { href: "wishlist.html", label: "Wishlist", counter: "wishlist" }),
        iconButton("cart", { href: "cart.html", label: "Cart", counter: "cart" }),
        iconButton("user", { label: "Account", onclick: accountMenu }),
      ]),
      mobileNav,
    ]),
  ]);

  document.body.prepend(header);
  const themeBtn = header.querySelectorAll(".icon-btn")[1];
  if (themeBtn) themeBtn.innerHTML = icon(document.documentElement.dataset.theme === "dark" ? "sun" : "moon", 20);
  refreshBadges();
}

export function mountFooter() {
  const column = (title, links) =>
    el("div", {}, [el("h4", { text: title }), el("ul", {}, links.map(([label, href]) => el("li", {}, [el("a", { href, text: label })])))]);

  const footer = el("footer", { class: "footer" }, [
    el("div", { class: "container" }, [
      el("div", { class: "footer__grid" }, [
        el("div", { class: "stack" }, [
          el("a", { class: "logo", href: "index.html" }, [
            el("span", { class: "logo__mark", html: icon("zap", 18) }),
            el("span", { text: APP.name }),
          ]),
          el("p", { class: "muted small", style: "max-width:30ch", text: APP.tagline }),
          el("div", { class: "row small muted", html: `${icon("shield", 16)} 100% genuine · 7-day replacement` }),
        ]),
        column("Shop", CATEGORIES.slice(0, 6).map((c) => [c.name, `products.html?category=${c.id}`])),
        column("More categories", CATEGORIES.slice(6, 12).map((c) => [c.name, `products.html?category=${c.id}`])),
        column("Account", [["My profile", "profile.html"], ["My orders", "orders.html"], ["Wishlist", "wishlist.html"], ["Cart", "cart.html"], ["Log in", "login.html"]]),
        column("Help", [[`Email ${APP.supportEmail}`, `mailto:${APP.supportEmail}`], [`Call ${APP.phone}`, `tel:${APP.phone}`], ["Shipping policy", "#"], ["Returns", "#"], ["Warranty", "#"]]),
      ]),
      el("div", { class: "footer__bottom" }, [
        el("span", { text: `© ${new Date().getFullYear()} ${APP.name} Electronics. All rights reserved.` }),
        el("span", { text: "Secure payments · UPI · Cards · Net banking · COD" }),
      ]),
    ]),
  ]);
  document.body.append(footer);
}

export function mountLayout({ header = true, footer = true } = {}) {
  initTheme();
  if (header) mountHeader();
  if (footer) mountFooter();
  subscribe((_, changed) => {
    if (changed.some((k) => ["cart", "wishlist", "notifications"].includes(k))) refreshBadges();
  });
}

export { refreshBadges };
