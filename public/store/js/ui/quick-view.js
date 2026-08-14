import { el, icon, money, percentOff, starsMarkup } from "../core/utils.js";
import { addToCart } from "../services/cart-service.js";
import { openModal } from "./modal.js";
import { toast } from "./toast.js";

export function openQuickView(product) {
  const main = el("img", { src: product.images[0], alt: product.name, style: "width:100%;border-radius:14px;aspect-ratio:4/3;object-fit:cover" });
  const thumbs = el("div", { class: "gallery__thumbs" },
    product.images.map((src, i) =>
      el("button", { class: `gallery__thumb ${i === 0 ? "is-active" : ""}`, onclick: (e) => {
        main.src = src;
        e.currentTarget.parentElement.querySelectorAll(".gallery__thumb").forEach((t) => t.classList.remove("is-active"));
        e.currentTarget.classList.add("is-active");
      } }, [el("img", { src, alt: `${product.name} view ${i + 1}` })]),
    ),
  );

  const off = percentOff(product.mrp, product.price);
  const body = el("div", { class: "grid grid--2", style: "align-items:start" }, [
    el("div", { class: "stack" }, [main, thumbs]),
    el("div", { class: "stack" }, [
      el("span", { class: "product__brand", text: product.brand }),
      el("h3", { style: "font-size:1.4rem", text: product.name }),
      el("div", { class: "rating", html: `${starsMarkup(product.rating)} <span>${product.rating} · ${product.reviewsCount} reviews</span>` }),
      el("div", { class: "product__price" }, [
        el("span", { class: "price", style: "font-size:1.5rem", text: money(product.price) }),
        off ? el("span", { class: "price--old", text: money(product.mrp) }) : null,
        off ? el("span", { class: "price--off", text: `${off}% off` }) : null,
      ]),
      el("p", { class: "muted small", text: product.description }),
      el("ul", { class: "stack", style: "gap:6px" },
        product.features.map((f) => el("li", { class: "row small", html: `<span style="color:var(--accent)">${icon("check", 15)}</span> ${f}` })),
      ),
      el("div", { class: "row row--wrap" }, [
        el("button", {
          class: "btn btn--primary",
          html: `${icon("cart", 16)} Add to cart`,
          onclick: () => { addToCart(product); toast(`${product.name} added to cart`, { type: "success" }); },
        }),
        el("a", { class: "btn btn--ghost", href: `product-details.html?id=${product.id}`, text: "Full details" }),
      ]),
    ]),
  ]);

  openModal({ title: "Quick view", body });
}
