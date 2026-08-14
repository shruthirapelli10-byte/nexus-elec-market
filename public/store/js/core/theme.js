import { getState, setState } from "./store.js";

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function initTheme() {
  const stored = getState().theme;
  const theme = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(theme);
  if (!stored) setState({ theme });
  return theme;
}

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setState({ theme: next });
  applyTheme(next);
  return next;
}
