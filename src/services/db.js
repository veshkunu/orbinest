/*
  Mock data store. Lives in memory and is mirrored to localStorage so edits
  survive a page refresh. Services are the only code that touch this file;
  swapping to Supabase later means rewriting the services, not the UI.
*/
import { company } from "../mock/company";
import { departments } from "../mock/departments";
import { createEmployees } from "../mock/employees";
import { createTasks } from "../mock/tasks";
import { createNotifications } from "../mock/notifications";

const STORAGE_KEY = "orbinest.db.v6";
const listeners = new Set();

function seed() {
  const employees = createEmployees();
  const tasks = createTasks(employees);
  return {
    company,
    departments,
    employees,
    tasks,
    notifications: createNotifications(employees, tasks),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — keep working in memory
  }
}

let state = load() ?? seed();
save();

function notify() {
  listeners.forEach((listener) => listener());
}

export function read() {
  return state;
}

/** Apply an immutable update and tell subscribers. */
export function write(updater) {
  state = updater(state);
  save();
  notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetDemoData() {
  state = seed();
  save();
  notify();
}

/** Simulated network latency so loading states are visible. */
export function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
