import { el, icon, qs } from "../core/utils.js";

const ICONS = { success: "check", error: "close", warning: "info", info: "info" };

function container() {
  let node = qs(".toasts");
  if (!node) {
    node = el("div", { class: "toasts", role: "status", "aria-live": "polite" });
    document.body.append(node);
  }
  return node;
}

export function toast(message, { title = "", type = "success", duration = 3200 } = {}) {
  const node = el("div", { class: `toast toast--${type}` }, [
    el("span", { html: icon(ICONS[type] ?? "info", 18), style: "color:var(--accent);margin-top:2px" }),
    el("div", {}, [
      title ? el("strong", { text: title }) : null,
      el("p", { text: message }),
    ]),
  ]);
  container().append(node);
  const remove = () => {
    node.style.transition = "opacity .25s, transform .25s";
    node.style.opacity = "0";
    node.style.transform = "translateX(16px)";
    setTimeout(() => node.remove(), 250);
  };
  node.addEventListener("click", remove);
  setTimeout(remove, duration);
}
