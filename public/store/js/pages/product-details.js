import { clamp, el, getParam, icon, money, percentOff, qs, starsMarkup, formatDate } from "../core/utils.js";
import { mountLayout } from "../ui/layout.js";
import { emptyState, sectionHead, skeletonGrid, skeletonLines } from "../ui/components.js";
import { renderProducts } from "../ui/product-card.js";
import { getProduct, getRelated, getReviews, getSimilar } from "../services/product-service.js";
import { addToCart, estimatedDelivery } from "../services/cart-service.js";
import { inWishlist, toggleWishlist } from "../services/wishlist-service.js";
import { toast } from "../ui/toast.js";

const id = getParam("id");
let qty = 1;

function gallery(product) {
  const img = el("img", { src: product.images[0], alt: product.name });
  const main = el("div", { class: "gallery__main" }, [img]);

  // Zoom follows the pointer.
  main.addEventListener("mousemove", (e) => {
    const rect = main.getBoundingClientRect();
    img.style.transformOrigin = `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`;
  });
  main.addEventListener("mouseenter", () => main.classList.add("is-zoom"));
  main.addEventListener("mouseleave", () => main.classList.remove("is-zoom"));

  const thumbs = el("div", { class: "gallery__thumbs" },
    product.images.map((src, i) =>
      el("button", { class: `gallery__thumb ${i === 0 ? "is-active" : ""}`, onclick: (e) => {
        img.src = src;
        thumbs.querySelectorAll(".gallery__thumb").forEach((t) => t.classList.remove("is-active"));
        e.currentTarget.classList.add("is-active");
      } }, [el("img", { src, alt: `${product.name} image ${i + 1}` })]),
    ),
  );

  return el("div", { class: "gallery" }, [main, thumbs, el("p", { class: "muted small center", text: "Hover the image to zoom" })]);
}

function buyBox(product) {
  const off = percentOff(product.mrp, product.price);
  const delivery = estimatedDelivery();
  const qtyLabel = el("span", { text: String(qty) });

  const wishBtn = el("button", {
    class: `btn ${inWishlist(product.id) ? "btn--primary" : "btn--ghost"}`,
    html: `${icon("heart", 16)} ${inWishlist(product.id) ? "In wishlist" : "Wishlist"}`,
    onclick: () => {
      const added = toggleWishlist(product.id);
      wishBtn.className = `btn ${added ? "btn--primary" : "btn--ghost"}`;
      wishBtn.innerHTML = `${icon("heart", 16)} ${added ? "In wishlist" : "Wishlist"}`;
      toast(added ? "Added to wishlist" : "Removed from wishlist", { type: added ? "success" : "info" });
    },
  });

  return el("div", { class: "stack", style: "gap:14px" }, [
    el("span", { class: "product__brand", text: product.brand }),
    el("h1", { style: "font-size:clamp(1.6rem,3.4vw,2.3rem)", text: product.name }),
    el("div", { class: "row row--wrap" }, [
      el("div", { class: "rating", html: `${starsMarkup(product.rating)} <strong>${product.rating}</strong> <span>· ${product.reviewsCount} reviews</span>` }),
      product.stock > 0
        ? el("span", { class: `badge ${product.stock <= 10 ? "badge--warning" : "badge--success"}`, text: product.stock <= 10 ? `Only ${product.stock} left` : "In stock" })
        : el("span", { class: "badge badge--danger", text: "Out of stock" }),
    ]),
    el("div", { class: "product__price" }, [
      el("span", { class: "price", style: "font-size:1.9rem", text: money(product.price) }),
      off ? el("span", { class: "price--old", text: money(product.mrp) }) : null,
      off ? el("span", { class: "price--off", text: `${off}% off` }) : null,
    ]),
    el("p", { class: "muted", text: product.description }),
    el("ul", { class: "stack", style: "gap:7px" },
      product.features.map((f) => el("li", { class: "row small", html: `<span style="color:var(--accent)">${icon("check", 15)}</span> ${f}` })),
    ),
    el("div", { class: "divider" }),
    el("div", { class: "row row--wrap" }, [
      el("div", { class: "qty" }, [
        el("button", { "aria-label": "Decrease", html: icon("minus", 15), onclick: () => { qty = clamp(qty - 1, 1, 10); qtyLabel.textContent = qty; } }),
        qtyLabel,
        el("button", { "aria-label": "Increase", html: icon("plus", 15), onclick: () => { qty = clamp(qty + 1, 1, 10); qtyLabel.textContent = qty; } }),
      ]),
      el("button", {
        class: "btn btn--primary btn--lg",
        html: `${icon("cart", 17)} Add to cart`,
        disabled: product.stock <= 0,
        onclick: () => { addToCart(product, qty); toast(`${qty} × ${product.name} added to cart`, { title: "Added to cart", type: "success" }); },
      }),
      wishBtn,
    ]),
    el("a", { class: "btn btn--ghost btn--block", href: "cart.html", text: "Go to cart" }),
    el("div", { class: "card card--pad stack", style: "gap:8px" }, [
      el("div", { class: "row small", html: `<span style="color:var(--accent)">${icon("truck", 16)}</span> Delivery between <strong>${formatDate(delivery.from)}</strong> and <strong>${formatDate(delivery.to)}</strong>` }),
      el("div", { class: "row small", html: `<span style="color:var(--accent)">${icon("shield", 16)}</span> ${product.warranty}` }),
      el("div", { class: "row small", html: `<span style="color:var(--accent)">${icon("refresh", 16)}</span> 7-day replacement, no questions asked` }),
    ]),
  ]);
}

function tabs(product, reviews) {
  const panels = {
    Description: () => el("div", { class: "stack" }, [
      el("p", { class: "muted", text: product.description }),
      el("p", { class: "muted", text: `Every ${product.brand} unit sold on Voltra is sourced through authorised distribution, tested before dispatch and covered by an on-paper warranty you can claim at any service centre.` }),
    ]),
    Specifications: () => el("div", { class: "specs" },
      Object.entries(product.specs).map(([k, v]) => el("div", {}, [el("span", { text: k }), el("span", { text: v })])),
    ),
    Features: () => el("ul", { class: "stack", style: "gap:9px" },
      product.features.concat(["Voltra 7-day replacement", "Free delivery above ₹4,999"]).map((f) =>
        el("li", { class: "row", html: `<span style="color:var(--accent)">${icon("check", 16)}</span> ${f}` }),
      ),
    ),
    Warranty: () => el("div", { class: "stack" }, [
      el("p", { class: "muted", text: product.warranty }),
      el("p", { class: "muted small", text: "Physical damage and liquid ingress are not covered. Keep the invoice — you can re-download it any time from My Orders." }),
    ]),
    [`Reviews (${reviews.length})`]: () => el("div", { class: "stack" }, [
      el("div", { class: "card card--pad row row--wrap", style: "gap:22px" }, [
        el("div", {}, [
          el("div", { style: "font-family:var(--font-display);font-size:2.4rem;font-weight:700", text: product.rating }),
          el("div", { html: starsMarkup(product.rating) }),
          el("div", { class: "muted small", text: `${product.reviewsCount} verified ratings` }),
        ]),
        el("div", { class: "stack", style: "flex:1;min-width:220px;gap:6px" },
          [5, 4, 3, 2, 1].map((star) => {
            const pct = Math.max(2, Math.round((star === Math.round(product.rating) ? 62 : star > 3 ? 22 : 6)));
            return el("div", { class: "row small" }, [
              el("span", { style: "width:26px", text: `${star}★` }),
              el("div", { style: "flex:1;height:7px;border-radius:99px;background:var(--surface-2);overflow:hidden" }, [
                el("div", { style: `width:${pct}%;height:100%;background:var(--accent)` }),
              ]),
              el("span", { class: "muted", style: "width:34px;text-align:right", text: `${pct}%` }),
            ]);
          }),
        ),
      ]),
      ...reviews.map((r) =>
        el("div", { class: "review" }, [
          el("div", { class: "row row--between" }, [
            el("div", { class: "row" }, [
              el("div", { class: "avatar", text: r.author.slice(0, 1) }),
              el("div", {}, [el("strong", { text: r.author }), el("div", { class: "muted small", text: formatDate(r.date) })]),
            ]),
            el("span", { class: "badge badge--success", text: "Verified buyer" }),
          ]),
          el("div", { html: starsMarkup(r.rating) }),
          el("strong", { text: r.title }),
          el("p", { class: "muted small", text: r.body }),
        ]),
      ),
    ]),
  };

  const body = el("div", { style: "padding-top:18px" }, [panels.Description()]);
  const bar = el("div", { class: "tabs" },
    Object.keys(panels).map((name, i) =>
      el("button", { class: `tab ${i === 0 ? "is-active" : ""}`, text: name, onclick: (e) => {
        bar.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
        e.currentTarget.classList.add("is-active");
        body.innerHTML = "";
        body.append(panels[name]());
      } }),
    ),
  );
  return el("div", {}, [bar, body]);
}

async function init() {
  mountLayout();
  const host = qs("#detail");
  skeletonLines(4, host);

  const product = await getProduct(id);
  if (!product) {
    host.innerHTML = "";
    host.append(emptyState({
      iconName: "search", title: "Product not found",
      message: "That link may be old or the product is no longer listed.",
      actionLabel: "Back to shop", actionHref: "products.html",
    }));
    return;
  }

  document.title = `${product.name} — ${product.brand} | Voltra`;
  host.innerHTML = "";
  host.append(
    el("nav", { class: "row small muted", style: "margin-bottom:16px", html:
      `<a href="index.html">Home</a> ${icon("chevron", 13)} <a href="products.html?category=${product.category}">${product.category}</a> ${icon("chevron", 13)} <span>${product.name}</span>` }),
    el("div", { class: "layout-split" }, [gallery(product), buyBox(product)]),
  );

  const reviews = await getReviews(product.id);
  qs("#tabs-section").append(tabs(product, reviews));

  qs("#similar-head").append(sectionHead({ eyebrow: "Compare", title: "Similar products" }));
  qs("#related-head").append(sectionHead({ eyebrow: "Goes well with", title: "Related products" }));
  skeletonGrid(4, qs("#similar"));
  skeletonGrid(4, qs("#related"));
  renderProducts(qs("#similar"), await getSimilar(product));
  renderProducts(qs("#related"), await getRelated(product));
}

init();
