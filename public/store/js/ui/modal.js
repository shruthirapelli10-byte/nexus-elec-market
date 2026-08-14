import { el, icon } from "../core/utils.js";

/** Generic animated modal. Pass a DOM node or HTML string as body. */
export function openModal({ title = "", body, width = 880 }) {
  const content = el("div", { class: "modal__body" }, []);
  if (typeof body === "string") content.innerHTML = body;
  else content.append(body);

  const modal = el("div", { class: "modal", style: `max-width:${width}px`, role: "dialog", "aria-modal": "true" }, [
    el("div", { class: "modal__head" }, [
      el("h3", { text: title }),
      el("button", { class: "icon-btn", "aria-label": "Close", html: icon("close"), onclick: () => close() }),
    ]),
    content,
  ]);

  const backdrop = el("div", { class: "modal-backdrop" }, [modal]);
  backdrop.addEventListener("mousedown", (e) => { if (e.target === backdrop) close(); });

  function onKey(e) { if (e.key === "Escape") close(); }
  function close() {
    document.removeEventListener("keydown", onKey);
    backdrop.style.opacity = "0";
    backdrop.style.transition = "opacity .2s";
    setTimeout(() => backdrop.remove(), 200);
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", onKey);
  document.body.style.overflow = "hidden";
  document.body.append(backdrop);
  return { close, content };
}

export function confirmModal({ title = "Are you sure?", message = "", confirmLabel = "Confirm", danger = true }) {
  return new Promise((resolve) => {
    const actions = el("div", { class: "row", style: "justify-content:flex-end;margin-top:18px" }, [
      el("button", { class: "btn btn--ghost", text: "Cancel", onclick: () => { handle.close(); resolve(false); } }),
      el("button", {
        class: `btn ${danger ? "btn--danger" : "btn--primary"}`,
        text: confirmLabel,
        onclick: () => { handle.close(); resolve(true); },
      }),
    ]);
    const handle = openModal({
      title,
      width: 440,
      body: el("div", {}, [el("p", { class: "muted", text: message }), actions]),
    });
  });
}
