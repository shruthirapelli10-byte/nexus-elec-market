import { BRANDS, CATEGORIES } from "../core/config.js";
import { el, icon, qs } from "../core/utils.js";
import { mountLayout } from "../ui/layout.js";
import { emptyState, sectionHead, skeletonGrid } from "../ui/components.js";
import { renderProducts } from "../ui/product-card.js";
import { getTestimonials, listProducts } from "../services/product-service.js";
import { toast } from "../ui/toast.js";

const SLIDES = [
  {
    image: "assets/images/hero-1.jpg",
    eyebrow: "New season",
    title: "Flagship power, without the flagship wait",
    text: "Launch-day stock on the latest phones and laptops, with free 2-day delivery above ₹4,999.",
    cta: { label: "Shop new arrivals", href: "products.html?new=1" },
  },
  {
    image: "assets/images/hero-2.jpg",
    eyebrow: "Audio week",
    title: "Silence the world. Keep the detail.",
    text: "Up to 30% off reference headphones, earbuds and speakers from Sony, Bose and JBL.",
    cta: { label: "Explore audio", href: "products.html?category=headphones" },
  },
  {
    image: "assets/images/hero-3.jpg",
    eyebrow: "Battle station",
    title: "Build the setup you keep talking about",
    text: "Consoles, 240Hz monitors and mechanical decks bundled with instant savings.",
    cta: { label: "Shop gaming", href: "products.html?category=consoles" },
  },
];

function mountHero() {
  const host = qs("#hero");
  const track = el("div", { class: "hero__track" },
    SLIDES.map((slide, i) =>
      el("div", { class: `hero__slide ${i === 0 ? "is-active" : ""}` }, [
        el("img", { src: slide.image, alt: slide.title, loading: i === 0 ? "eager" : "lazy" }),
        el("div", { class: "hero__overlay" }, [
          el("div", { class: "hero__content" }, [
            el("span", { class: "eyebrow", style: "color:#8ab4ff", text: slide.eyebrow }),
            el("h1", { text: slide.title }),
            el("p", { text: slide.text }),
            el("div", { class: "row row--wrap" }, [
              el("a", { class: "btn btn--primary btn--lg", href: slide.cta.href, html: `${slide.cta.label} ${icon("arrow", 16)}` }),
              el("a", { class: "btn btn--ghost btn--lg", href: "products.html", text: "Browse all" }),
            ]),
          ]),
        ]),
      ]),
    ),
  );

  const dots = el("div", { class: "hero__dots" },
    SLIDES.map((_, i) => el("button", { class: `hero__dot ${i === 0 ? "is-active" : ""}`, "aria-label": `Slide ${i + 1}`, onclick: () => show(i) })),
  );

  host.append(track, dots);
  let index = 0;
  let timer;

  function show(next) {
    index = (next + SLIDES.length) % SLIDES.length;
    track.querySelectorAll(".hero__slide").forEach((s, i) => s.classList.toggle("is-active", i === index));
    dots.querySelectorAll(".hero__dot").forEach((d, i) => d.classList.toggle("is-active", i === index));
    clearInterval(timer);
    timer = setInterval(() => show(index + 1), 5500);
  }
  timer = setInterval(() => show(index + 1), 5500);
}

function mountCategories() {
  qs("#categories-head").append(sectionHead({
    eyebrow: "Browse",
    title: "Shop by category",
    subtitle: "Fourteen categories, curated stock, honest specs.",
    linkLabel: "All products",
    linkHref: "products.html",
  }));
  qs("#categories").append(...CATEGORIES.map((c) =>
    el("a", { class: "tile", href: `products.html?category=${c.id}` }, [
      el("span", { class: "tile__icon", html: icon(c.icon, 22) }),
      el("span", { text: c.name }),
    ]),
  ));
}

function mountBrands() {
  qs("#brands-head").append(sectionHead({ eyebrow: "Trusted", title: "Popular brands", subtitle: "Authorised stock with full manufacturer warranty." }));
  qs("#brands").append(...BRANDS.map((b) =>
    el("a", { class: "tile", href: `products.html?brand=${encodeURIComponent(b)}` }, [
      el("span", { class: "tile__icon", html: icon("tag", 20) }),
      el("span", { text: b }),
    ]),
  ));
}

function mountPromo() {
  const target = new Date(Date.now() + 7.5 * 3600 * 1000);
  const countdown = el("div", { class: "countdown", style: "margin-top:6px" });
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    countdown.innerHTML = [["Hrs", h], ["Min", m], ["Sec", s]]
      .map(([label, v]) => `<span>${String(v).padStart(2, "0")}<small>${label}</small></span>`).join("");
  };
  tick();
  setInterval(tick, 1000);

  qs("#promo-banner").append(
    el("span", { class: "badge badge--accent", text: "Limited time" }),
    el("h2", { text: "Voltra Days — extra 10% off with VOLTRA10" }),
    el("p", { text: "Stack the coupon on top of existing deals across audio, gaming and storage. Ends when the timer does." }),
    countdown,
    el("a", { class: "btn btn--primary btn--lg", style: "margin-top:8px", href: "products.html?deal=1", html: `Grab the deals ${icon("arrow", 16)}` }),
  );
}

function mountReviews() {
  qs("#reviews-head").append(sectionHead({ eyebrow: "Loved by 40,000+", title: "What customers say" }));
  qs("#reviews").append(...getTestimonials().map((t) =>
    el("div", { class: "review fade-up" }, [
      el("div", { class: "row" }, [
        el("div", { class: "avatar", text: t.author.slice(0, 1) }),
        el("div", {}, [el("strong", { text: t.author }), el("div", { class: "muted small", text: t.role })]),
      ]),
      el("p", { class: "muted", text: `"${t.body}"` }),
      el("div", { class: "stars", html: Array.from({ length: t.rating }, () => icon("star", 14, 0)).join("") }),
    ]),
  ));
}

function mountNewsletter() {
  const input = el("input", { class: "input", type: "email", placeholder: "you@email.com", required: true, "aria-label": "Email address" });
  const form = el("form", { class: "row row--wrap", style: "gap:10px", onsubmit: (e) => {
    e.preventDefault();
    if (!input.checkValidity()) return toast("Enter a valid email address.", { type: "error" });
    input.value = "";
    toast("You're on the list. Watch out for drop alerts.", { title: "Subscribed", type: "success" });
  } }, [
    el("div", { style: "flex:1;min-width:220px" }, [input]),
    el("button", { class: "btn btn--primary", type: "submit", text: "Subscribe" }),
  ]);

  qs("#newsletter").append(
    el("div", { class: "row row--between row--wrap", style: "gap:20px" }, [
      el("div", { style: "max-width:46ch" }, [
        el("div", { class: "eyebrow", text: "Newsletter" }),
        el("h2", { style: "font-size:1.5rem", text: "Price drops, first" }),
        el("p", { class: "muted small", text: "One email a week: restocks, launch dates and genuine discounts. No spam." }),
      ]),
      form,
    ]),
  );
}

async function mountRail({ headSelector, gridSelector, head, filters, sort, limit = 8 }) {
  qs(headSelector).append(sectionHead(head));
  const grid = qs(gridSelector);
  skeletonGrid(4, grid);
  const products = await listProducts(filters, { sort, limit });
  if (!products.length) {
    grid.innerHTML = "";
    grid.append(emptyState({ title: "Nothing here yet", message: "New stock lands every week — check back soon." }));
    return;
  }
  renderProducts(grid, products);
}

mountLayout();
mountHero();
mountCategories();
mountPromo();
mountReviews();
mountNewsletter();

mountRail({
  headSelector: "#flash-head", gridSelector: "#flash-deals",
  head: { eyebrow: "Ends tonight", title: "Flash deals", subtitle: "Biggest discounts on the floor right now.", linkLabel: "All deals", linkHref: "products.html?deal=1" },
  filters: { flashDeal: true }, sort: "discount", limit: 4,
});
mountRail({
  headSelector: "#featured-head", gridSelector: "#featured",
  head: { eyebrow: "Handpicked", title: "Featured products", subtitle: "The gear our team actually recommends.", linkLabel: "See all", linkHref: "products.html" },
  filters: { featured: true }, sort: "rating", limit: 8,
});
mountRail({
  headSelector: "#new-head", gridSelector: "#new-arrivals",
  head: { eyebrow: "Just landed", title: "New arrivals", linkLabel: "See all", linkHref: "products.html?new=1" },
  filters: { newArrival: true }, sort: "newest", limit: 4,
});
mountRail({
  headSelector: "#best-head", gridSelector: "#best-sellers",
  head: { eyebrow: "Most loved", title: "Best sellers", linkLabel: "See all", linkHref: "products.html?best=1" },
  filters: { bestSeller: true }, sort: "popular", limit: 4,
});
