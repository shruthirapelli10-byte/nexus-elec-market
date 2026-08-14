import { el, icon, money, qs } from "../core/utils.js";
import { subscribe } from "../core/store.js";
import { mountLayout } from "../ui/layout.js";
import { emptyState, sectionHead, skeletonGrid } from "../ui/components.js";
import { toast } from "../ui/toast.js";
import { getProductsByIds } from "../services/product-service.js";
import { getWishlist, moveWishlistToCart, removeFromWishlist } from "../services/wishlist-service.js";

async function render() {
  const host = qs("#wishlist");
  host.innerHTML = "";
  const ids = getWishlist();
  if (!ids.length) {
    host.append(emptyState({
      iconName: "heart", title: "Your wishlist is empty",
      message: "Tap the heart on any product to keep an eye on it and get price drop alerts.",
      actionLabel: "Find something you like", actionHref: "products.html",
    }));
    return;
  }
  const grid = el("div", { class: "stack" });
  host.append(grid);
  skeletonGrid(ids.length, grid);
  const products = await getProductsByIds(ids);
  grid.className = "stack";
  grid.innerHTML = "";
  products.forEach((p) =>
    grid.append(el("div", { class: "line-item fade-up" }, [
      el("a", { href: `product-details.html?id=${p.id}` }, [el("img", { src: p.images[0], alt: p.name, loading: "lazy" })]),
      el("div", { class: "stack", style: "gap:8px" }, [
        el("div", { class: "row row--between", style: "align-items:flex-start;gap:10px" }, [
          el("div", {}, [
            el("span", { class: "product__brand", text: p.brand }),
            el("a", { class: "product__name", href: `product-details.html?id=${p.id}`, text: p.name }),
          ]),
          el("strong", { class: "price", text: money(p.price) }),
        ]),
        el("div", { class: "row row--wrap" }, [
          el("button", { class: "btn btn--primary btn--sm", html: `${icon("cart", 15)} Move to cart`, onclick: () => { moveWishlistToCart(p.id); toast(`${p.name} moved to cart`, { type: "success" }); } }),
          el("button", { class: "btn btn--quiet btn--sm", html: `${icon("trash", 15)} Remove`, onclick: () => { removeFromWishlist(p.id); toast("Removed from wishlist", { type: "info" }); } }),
        ]),
      ]),
    ])),
  );
}

mountLayout();
qs("#wishlist-head").append(sectionHead({ eyebrow: "Saved", title: "My wishlist", subtitle: "We'll alert you when any of these drop in price." }));
render();
subscribe((_, changed) => { if (changed.includes("wishlist")) render(); });
