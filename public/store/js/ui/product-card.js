/** The single product card implementation used by every listing on the site. */
import { el, icon, money, percentOff, starsMarkup } from "../core/utils.js";
import { addToCart } from "../services/cart-service.js";
import { inWishlist, toggleWishlist } from "../services/wishlist-service.js";
import { toast } from "./toast.js";
import { openQuickView } from "./quick-view.js";

export function productCard(product) {
  const media = el("div", { class: "product__media" }, [
    el("img", { src: product.images[0], alt: product.name, loading: "lazy" }),
  ]);

  // Hover swaps to the second shot — cheap "multiple images" affordance.
  media.addEventListener("mouseenter", () => { media.querySelector("img").src = product.images[1]; });
  media.addEventListener("mouseleave", () => { media.querySelector("img").src = product.images[0]; });

  const off = percentOff(product.mrp, product.price);
  const flags = el("div", { class: "product__flags" }, [
    off ? el("span", { class: "badge badge--danger", text: `-${off}%` }) : null,
    product.newArrival ? el("span", { class: "badge badge--accent", text: "New" }) : null,
    product.bestSeller ? el("span", { class: "badge badge--muted", text: "Best seller" }) : null,
  ]);

  const wishBtn = el("button", {
    class: `product__icon ${inWishlist(product.id) ? "is-on" : ""}`,
    "aria-label": "Toggle wishlist",
    html: icon("heart", 17),
    onclick: (e) => {
      e.preventDefault();
      const added = toggleWishlist(product.id);
      wishBtn.classList.toggle("is-on", added);
      toast(added ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`, { type: added ? "success" : "info" });
    },
  });

  const quickBtn = el("button", {
    class: "product__icon",
    "aria-label": "Quick view",
    html: icon("eye", 17),
    onclick: (e) => { e.preventDefault(); openQuickView(product); },
  });

  const cartBtn = el("button", {
    class: "btn btn--primary btn--sm btn--block",
    html: `${icon("cart", 16)} ${product.stock > 0 ? "Add to cart" : "Notify me"}`,
    onclick: (e) => {
      e.preventDefault();
      if (product.stock <= 0) return toast("We'll alert you when this is back in stock.", { type: "info" });
      addToCart(product);
      toast(`${product.name} added to cart`, { title: "Added", type: "success" });
    },
  });

  media.append(flags, el("div", { class: "product__actions" }, [wishBtn, quickBtn]));

  const stock =
    product.stock <= 0
      ? el("span", { class: "badge badge--danger", text: "Out of stock" })
      : product.stock <= 10
        ? el("span", { class: "badge badge--warning", text: `Only ${product.stock} left` })
        : el("span", { class: "badge badge--success", text: "In stock" });

  return el("article", { class: "product fade-up" }, [
    el("a", { href: `product-details.html?id=${product.id}`, "aria-label": product.name }, [media]),
    el("div", { class: "product__body" }, [
      el("span", { class: "product__brand", text: product.brand }),
      el("a", { class: "product__name", href: `product-details.html?id=${product.id}`, text: product.name }),
      el("div", { class: "rating", html: `${starsMarkup(product.rating)} <span>${product.rating}</span><span>(${product.reviewsCount})</span>` }),
      el("div", { class: "product__price" }, [
        el("span", { class: "price", text: money(product.price) }),
        off ? el("span", { class: "price--old", text: money(product.mrp) }) : null,
        off ? el("span", { class: "price--off", text: `${off}% off` }) : null,
      ]),
      el("div", { class: "row" }, [stock]),
      el("div", { style: "margin-top:auto;padding-top:10px" }, [cartBtn]),
    ]),
  ]);
}

export function renderProducts(container, products) {
  container.innerHTML = "";
  products.forEach((p, i) => {
    const card = productCard(p);
    card.style.animationDelay = `${Math.min(i, 8) * 40}ms`;
    container.append(card);
  });
}
