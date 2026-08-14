import { BRANDS, CATEGORIES } from "../core/config.js";
import { el, getParam, icon, money, qs } from "../core/utils.js";
import { mountLayout } from "../ui/layout.js";
import { emptyState, sectionHead, skeletonGrid } from "../ui/components.js";
import { renderProducts } from "../ui/product-card.js";
import { listProducts, priceBounds } from "../services/product-service.js";

const bounds = priceBounds();

const filters = {
  query: getParam("q") ?? "",
  categories: getParam("category") ? [getParam("category")] : [],
  brands: getParam("brand") ? [getParam("brand")] : [],
  minPrice: bounds.min,
  maxPrice: bounds.max,
  rating: 0,
  discount: 0,
  inStock: false,
  flashDeal: getParam("deal") === "1",
  newArrival: getParam("new") === "1",
  bestSeller: getParam("best") === "1",
};

let sort = "relevance";

function checkboxList(items, selected, onChange) {
  return el("div", { class: "filter-list" },
    items.map(({ value, label }) =>
      el("label", { class: "check" }, [
        el("input", {
          type: "checkbox",
          checked: selected.includes(value),
          onchange: (e) => onChange(value, e.target.checked),
        }),
        el("span", { class: "small", text: label }),
      ]),
    ),
  );
}

function mountFilters() {
  const host = qs("#filters");
  host.innerHTML = "";

  const priceLabel = el("div", { class: "row row--between small muted" }, [
    el("span", { text: money(filters.minPrice) }),
    el("span", { text: money(filters.maxPrice) }),
  ]);
  const priceRange = el("input", {
    type: "range", min: bounds.min, max: bounds.max, step: 1000, value: filters.maxPrice,
    style: "width:100%;accent-color:var(--accent)",
    oninput: (e) => {
      filters.maxPrice = Number(e.target.value);
      priceLabel.lastChild.textContent = money(filters.maxPrice);
    },
    onchange: run,
  });

  const group = (title, node) => el("div", { class: "filter-group" }, [el("h4", { text: title }), node]);

  host.append(
    el("div", { class: "row row--between" }, [
      el("strong", { html: `${icon("filter", 16)} Filters` }),
      el("button", { class: "btn btn--quiet btn--sm", text: "Reset", onclick: reset }),
    ]),
    group("Category", checkboxList(
      CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
      filters.categories,
      (value, on) => { filters.categories = on ? [...filters.categories, value] : filters.categories.filter((v) => v !== value); run(); },
    )),
    group("Brand", checkboxList(
      BRANDS.map((b) => ({ value: b, label: b })),
      filters.brands,
      (value, on) => { filters.brands = on ? [...filters.brands, value] : filters.brands.filter((v) => v !== value); run(); },
    )),
    group("Max price", el("div", { class: "stack", style: "gap:8px" }, [priceRange, priceLabel])),
    group("Customer rating", el("div", { class: "row row--wrap" },
      [4.5, 4, 3.5, 0].map((value) =>
        el("button", {
          class: `chip ${filters.rating === value ? "is-active" : ""}`,
          text: value ? `${value}★ & up` : "Any",
          onclick: (e) => {
            filters.rating = value;
            e.currentTarget.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
            e.currentTarget.classList.add("is-active");
            run();
          },
        }),
      ),
    )),
    group("Discount", el("div", { class: "row row--wrap" },
      [10, 20, 30, 0].map((value) =>
        el("button", {
          class: `chip ${filters.discount === value ? "is-active" : ""}`,
          text: value ? `${value}%+ off` : "Any",
          onclick: (e) => {
            filters.discount = value;
            e.currentTarget.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
            e.currentTarget.classList.add("is-active");
            run();
          },
        }),
      ),
    )),
    group("Availability", el("div", { class: "stack", style: "gap:6px" }, [
      el("label", { class: "check" }, [
        el("input", { type: "checkbox", checked: filters.inStock, onchange: (e) => { filters.inStock = e.target.checked; run(); } }),
        el("span", { class: "small", text: "In stock only" }),
      ]),
      el("label", { class: "check" }, [
        el("input", { type: "checkbox", checked: filters.flashDeal, onchange: (e) => { filters.flashDeal = e.target.checked; run(); } }),
        el("span", { class: "small", text: "Flash deals" }),
      ]),
      el("label", { class: "check" }, [
        el("input", { type: "checkbox", checked: filters.newArrival, onchange: (e) => { filters.newArrival = e.target.checked; run(); } }),
        el("span", { class: "small", text: "New arrivals" }),
      ]),
    ])),
  );
}

function mountChips() {
  const host = qs("#active-chips");
  host.innerHTML = "";
  const active = [
    filters.query && { label: `"${filters.query}"`, clear: () => { filters.query = ""; } },
    ...filters.categories.map((c) => ({ label: CATEGORIES.find((x) => x.id === c)?.name ?? c, clear: () => { filters.categories = filters.categories.filter((x) => x !== c); } })),
    ...filters.brands.map((b) => ({ label: b, clear: () => { filters.brands = filters.brands.filter((x) => x !== b); } })),
    filters.rating && { label: `${filters.rating}★ & up`, clear: () => { filters.rating = 0; } },
    filters.discount && { label: `${filters.discount}%+ off`, clear: () => { filters.discount = 0; } },
    filters.inStock && { label: "In stock", clear: () => { filters.inStock = false; } },
    filters.flashDeal && { label: "Flash deals", clear: () => { filters.flashDeal = false; } },
  ].filter(Boolean);

  active.forEach((chip) =>
    host.append(el("button", {
      class: "chip is-active",
      html: `${chip.label} ${icon("close", 13)}`,
      onclick: () => { chip.clear(); mountFilters(); run(); },
    })),
  );
}

function reset() {
  Object.assign(filters, {
    query: "", categories: [], brands: [], minPrice: bounds.min, maxPrice: bounds.max,
    rating: 0, discount: 0, inStock: false, flashDeal: false, newArrival: false, bestSeller: false,
  });
  mountFilters();
  run();
}

async function run() {
  const grid = qs("#results");
  skeletonGrid(6, grid);
  mountChips();
  const products = await listProducts(filters, { sort });
  qs("#result-count").textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;
  if (!products.length) {
    grid.innerHTML = "";
    grid.append(emptyState({
      iconName: "search",
      title: "No products match those filters",
      message: "Try widening the price range or clearing a couple of filters.",
      actionLabel: "Reset filters",
      onAction: (e) => { e.preventDefault(); reset(); },
    }));
    return;
  }
  renderProducts(grid, products);
}

mountLayout();
qs("#listing-head").append(sectionHead({
  eyebrow: "Catalogue",
  title: filters.query ? `Results for "${filters.query}"` : filters.categories.length ? CATEGORIES.find((c) => c.id === filters.categories[0])?.name ?? "All products" : "All products",
  subtitle: "Live filters, honest stock counts, no hidden charges at checkout.",
}));
qs("#sort").addEventListener("change", (e) => { sort = e.target.value; run(); });
mountFilters();
run();
