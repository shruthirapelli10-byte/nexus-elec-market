/** Reusable presentational builders used across every page. */
import { el, icon, money, percentOff, starsMarkup } from "../core/utils.js";

export function skeletonGrid(count = 8, container) {
  container.innerHTML = "";
  container.append(...Array.from({ length: count }, () => el("div", { class: "skeleton skeleton-card" })));
}

export function skeletonLines(count = 3, container) {
  container.innerHTML = "";
  container.append(
    ...Array.from({ length: count }, (_, i) =>
      el("div", { class: "skeleton skeleton-line", style: `width:${100 - i * 12}%;margin-bottom:10px` }),
    ),
  );
}

export function emptyState({ iconName = "box", title, message, actionLabel, actionHref, onAction }) {
  return el("div", { class: "empty fade-up" }, [
    el("div", { class: "empty__icon", html: icon(iconName, 32) }),
    el("h3", { text: title }),
    el("p", { class: "muted", style: "max-width:44ch", text: message }),
    actionLabel
      ? el("a", { class: "btn btn--primary", href: actionHref ?? "#", text: actionLabel, ...(onAction ? { onclick: onAction } : {}) })
      : null,
  ]);
}

export function priceBlock(product) {
  const off = percentOff(product.mrp, product.price);
  return el("div", { class: "product__price" }, [
    el("span", { class: "price", text: money(product.price) }),
    off ? el("span", { class: "price--old", text: money(product.mrp) }) : null,
    off ? el("span", { class: "price--off", text: `${off}% off` }) : null,
  ]);
}

export function ratingBlock(product) {
  return el("div", { class: "rating", html: `${starsMarkup(product.rating)} <span>${product.rating}</span> <span>(${product.reviewsCount})</span>` });
}

export function stockBadge(stock) {
  if (stock <= 0) return el("span", { class: "badge badge--danger", text: "Out of stock" });
  if (stock <= 10) return el("span", { class: "badge badge--warning", text: `Only ${stock} left` });
  return el("span", { class: "badge badge--success", text: "In stock" });
}

export function sectionHead({ eyebrow, title, subtitle, linkLabel, linkHref }) {
  return el("div", { class: "section-head" }, [
    el("div", {}, [
      eyebrow ? el("div", { class: "eyebrow", text: eyebrow }) : null,
      el("h2", { text: title }),
      subtitle ? el("p", { text: subtitle }) : null,
    ]),
    linkLabel ? el("a", { class: "btn btn--ghost btn--sm", href: linkHref, html: `${linkLabel} ${icon("arrow", 15)}` }) : null,
  ]);
}
