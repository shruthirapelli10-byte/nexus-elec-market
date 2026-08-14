/**
 * Auth layer. Mirrors the Firebase Auth API surface so the internals can be
 * replaced with createUserWithEmailAndPassword / signInWithEmailAndPassword /
 * sendPasswordResetEmail / updatePassword without changing call sites.
 */
import { STORAGE_KEYS } from "../core/config.js";
import { setState, getState, subscribe } from "../core/store.js";
import { storage, sleep, uid } from "../core/utils.js";

const users = () => storage.get(STORAGE_KEYS.users, []);
const saveUsers = (list) => storage.set(STORAGE_KEYS.users, list);

const publicUser = ({ id, name, email, phone, createdAt }) => ({ id, name, email, phone, createdAt });

// Demo-only hashing stand-in; Firebase Auth handles credentials for real.
const hash = (value) => btoa(unescape(encodeURIComponent(`voltra:${value}`)));

export const currentUser = () => getState().user;
export const isAuthenticated = () => Boolean(getState().user);

export function onAuthChange(callback) {
  callback(getState().user);
  return subscribe((state, changed) => {
    if (changed.includes("user")) callback(state.user);
  });
}

export async function register({ name, email, password, phone = "" }) {
  await sleep(400);
  const normalized = email.trim().toLowerCase();
  if (users().some((u) => u.email === normalized)) throw new Error("An account with this email already exists.");
  const user = { id: uid("usr"), name: name.trim(), email: normalized, phone, password: hash(password), createdAt: Date.now() };
  saveUsers([...users(), user]);
  setState({ user: publicUser(user) });
  return publicUser(user);
}

export async function login({ email, password }) {
  await sleep(400);
  const normalized = email.trim().toLowerCase();
  const found = users().find((u) => u.email === normalized);
  if (!found || found.password !== hash(password)) throw new Error("Incorrect email or password.");
  setState({ user: publicUser(found) });
  return publicUser(found);
}

export async function logout() {
  await sleep(150);
  setState({ user: null, coupon: null });
}

/** Firebase: sendPasswordResetEmail(auth, email) */
export async function requestPasswordReset(email) {
  await sleep(400);
  const normalized = email.trim().toLowerCase();
  if (!users().some((u) => u.email === normalized)) throw new Error("No account found with that email.");
  const token = uid("rst");
  storage.set(STORAGE_KEYS.resetTokens, { ...storage.get(STORAGE_KEYS.resetTokens, {}), [token]: normalized });
  return token; // in production this arrives by email
}

export async function resetPassword({ token, password }) {
  await sleep(400);
  const tokens = storage.get(STORAGE_KEYS.resetTokens, {});
  const email = tokens[token];
  if (!email) throw new Error("This reset link is invalid or has expired.");
  saveUsers(users().map((u) => (u.email === email ? { ...u, password: hash(password) } : u)));
  delete tokens[token];
  storage.set(STORAGE_KEYS.resetTokens, tokens);
}

export async function changePassword({ currentPassword, newPassword }) {
  await sleep(400);
  const active = currentUser();
  if (!active) throw new Error("You need to sign in first.");
  const found = users().find((u) => u.id === active.id);
  if (!found || found.password !== hash(currentPassword)) throw new Error("Your current password is incorrect.");
  saveUsers(users().map((u) => (u.id === active.id ? { ...u, password: hash(newPassword) } : u)));
}

export async function updateProfile(patch) {
  await sleep(300);
  const active = currentUser();
  if (!active) throw new Error("You need to sign in first.");
  const updated = { ...active, ...patch };
  saveUsers(users().map((u) => (u.id === active.id ? { ...u, ...patch } : u)));
  setState({ user: updated });
  return updated;
}

/** Redirect guard for protected pages. */
export function requireAuth(redirect = location.pathname.split("/").pop()) {
  if (isAuthenticated()) return true;
  location.replace(`login.html?next=${encodeURIComponent(redirect)}`);
  return false;
}
