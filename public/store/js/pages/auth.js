/** One controller for all four auth screens — chosen by data-auth on <body>. */
import { el, getParam, icon, qs } from "../core/utils.js";
import { initTheme } from "../core/theme.js";
import { toast } from "../ui/toast.js";
import { login, register, requestPasswordReset, resetPassword } from "../services/auth-service.js";
import { APP } from "../core/config.js";

const mode = document.body.dataset.auth;

const field = ({ id, label, type = "text", placeholder = "", required = true, autocomplete }) =>
  el("div", { class: "field" }, [
    el("label", { for: id, text: label }),
    el("input", { class: "input", id, name: id, type, placeholder, required, autocomplete }),
  ]);

function shell(title, subtitle, form, footer) {
  const card = el("div", { class: "auth__card" }, [
    el("a", { class: "logo", href: "index.html" }, [
      el("span", { class: "logo__mark", html: icon("zap", 18) }),
      el("span", { text: APP.name }),
    ]),
    el("div", {}, [el("h1", { style: "font-size:1.7rem", text: title }), el("p", { class: "muted small", text: subtitle })]),
    form,
    footer,
  ]);
  qs("#auth").append(card);
}

function submitButton(label) {
  return el("button", { class: "btn btn--primary btn--block btn--lg", type: "submit", text: label });
}

function withLoading(button, label, fn) {
  return async (event) => {
    event.preventDefault();
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> ${label}`;
    try {
      await fn(Object.fromEntries(new FormData(event.currentTarget)));
    } catch (err) {
      toast(err.message, { title: "Something went wrong", type: "error" });
    } finally {
      button.disabled = false;
      button.textContent = label.replace("…", "");
    }
  };
}

function loginScreen() {
  const button = submitButton("Log in");
  const form = el("form", { class: "stack" }, [
    field({ id: "email", label: "Email", type: "email", placeholder: "you@email.com", autocomplete: "email" }),
    field({ id: "password", label: "Password", type: "password", placeholder: "••••••••", autocomplete: "current-password" }),
    el("div", { class: "row row--between" }, [
      el("label", { class: "check" }, [el("input", { type: "checkbox", checked: true }), el("span", { class: "small", text: "Keep me signed in" })]),
      el("a", { class: "small", style: "color:var(--accent);font-weight:700", href: "forgot-password.html", text: "Forgot password?" }),
    ]),
    button,
  ]);
  form.addEventListener("submit", withLoading(button, "Logging in…", async (data) => {
    const user = await login(data);
    toast(`Welcome back, ${user.name.split(" ")[0]}.`, { type: "success" });
    location.href = getParam("next") ?? "index.html";
  }));
  shell("Welcome back", "Log in to track orders and sync your cart across devices.", form,
    el("p", { class: "center small muted", html: `New here? <a href="register.html" style="color:var(--accent);font-weight:700">Create an account</a>` }));
}

function registerScreen() {
  const button = submitButton("Create account");
  const form = el("form", { class: "stack" }, [
    field({ id: "name", label: "Full name", placeholder: "Aarav Sharma", autocomplete: "name" }),
    field({ id: "email", label: "Email", type: "email", placeholder: "you@email.com", autocomplete: "email" }),
    field({ id: "phone", label: "Phone", type: "tel", placeholder: "98765 43210", required: false, autocomplete: "tel" }),
    field({ id: "password", label: "Password", type: "password", placeholder: "At least 6 characters", autocomplete: "new-password" }),
    el("label", { class: "check" }, [el("input", { type: "checkbox", required: true }), el("span", { class: "small muted", text: "I agree to the terms of service and privacy policy" })]),
    button,
  ]);
  form.addEventListener("submit", withLoading(button, "Creating account…", async (data) => {
    if (String(data.password).length < 6) throw new Error("Password must be at least 6 characters.");
    const user = await register(data);
    toast(`Account created. Welcome, ${user.name.split(" ")[0]}.`, { type: "success" });
    location.href = "index.html";
  }));
  shell("Create your account", "One account for orders, wishlist, addresses and price alerts.", form,
    el("p", { class: "center small muted", html: `Already registered? <a href="login.html" style="color:var(--accent);font-weight:700">Log in</a>` }));
}

function forgotScreen() {
  const button = submitButton("Send reset link");
  const form = el("form", { class: "stack" }, [
    field({ id: "email", label: "Account email", type: "email", placeholder: "you@email.com", autocomplete: "email" }),
    button,
  ]);
  form.addEventListener("submit", withLoading(button, "Sending…", async (data) => {
    const token = await requestPasswordReset(data.email);
    toast("Reset link generated. Opening the reset screen.", { title: "Check your inbox", type: "success" });
    setTimeout(() => { location.href = `reset-password.html?token=${token}`; }, 900);
  }));
  shell("Forgot your password?", "We'll email you a secure link to set a new one.", form,
    el("p", { class: "center small muted", html: `<a href="login.html" style="color:var(--accent);font-weight:700">Back to login</a>` }));
}

function resetScreen() {
  const token = getParam("token") ?? "";
  const button = submitButton("Update password");
  const form = el("form", { class: "stack" }, [
    field({ id: "password", label: "New password", type: "password", placeholder: "At least 6 characters", autocomplete: "new-password" }),
    field({ id: "confirm", label: "Confirm password", type: "password", placeholder: "Repeat password", autocomplete: "new-password" }),
    button,
  ]);
  form.addEventListener("submit", withLoading(button, "Updating…", async (data) => {
    if (data.password !== data.confirm) throw new Error("Both passwords must match.");
    if (String(data.password).length < 6) throw new Error("Password must be at least 6 characters.");
    await resetPassword({ token, password: data.password });
    toast("Password updated. You can log in now.", { type: "success" });
    setTimeout(() => { location.href = "login.html"; }, 900);
  }));
  shell("Set a new password", token ? "Choose something you haven't used before." : "This link is missing its token — request a new one.", form,
    el("p", { class: "center small muted", html: `<a href="forgot-password.html" style="color:var(--accent);font-weight:700">Request a new link</a>` }));
}

initTheme();
({ login: loginScreen, register: registerScreen, forgot: forgotScreen, reset: resetScreen })[mode]?.();
