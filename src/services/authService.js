import { delay, read } from "./db";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../mock/employees";

const SESSION_KEY = "orbinest.session";

export class AuthError extends Error {}

function findByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return read().employees.find((e) => e.email === normalized);
}

export async function signIn(email, password) {
  await delay(400);
  const user = findByEmail(email);
  if (!user || password !== DEMO_PASSWORD) {
    throw new AuthError("That email and password don't match. Check them and try again.");
  }
  if (user.status === "inactive") {
    throw new AuthError("This account has been deactivated. Ask your admin to turn it back on.");
  }
  try {
    localStorage.setItem(SESSION_KEY, user.id);
  } catch {
    // Session only lasts until refresh
  }
  return user;
}

export function signInAsDemo(role) {
  return signIn(DEMO_ACCOUNTS[role], DEMO_PASSWORD);
}

export async function signOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clear
  }
}

/**
 * Development only: open any page with ?demo=admin or ?demo=staff to start signed in as that
 * demo account (same as the login page's "Try as" buttons). Lets screenshot tools reach app
 * screens. Stripped from production builds by the import.meta.env.DEV check.
 */
function demoUserFromUrl() {
  if (!import.meta.env.DEV) return null;
  const role = new URLSearchParams(window.location.search).get("demo");
  const email = DEMO_ACCOUNTS[role];
  const user = email && findByEmail(email);
  if (!user) return null;
  try {
    localStorage.setItem(SESSION_KEY, user.id);
  } catch {
    // Session only lasts until refresh
  }
  return user;
}

/** Restore the signed-in user from a previous visit, if any. */
export function getSessionUser() {
  const demo = demoUserFromUrl();
  if (demo) return demo;
  try {
    const id = localStorage.getItem(SESSION_KEY);
    const user = id && read().employees.find((e) => e.id === id);
    return user && user.status !== "inactive" ? user : null;
  } catch {
    return null;
  }
}
