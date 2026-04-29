import type { WeddingSettings, WeddingEvent, Rsvp } from "./wedding-types";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3001/api";
const TOKEN_KEY = "wedding_admin_token";

export const tokenStore = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = (j.message && (Array.isArray(j.message) ? j.message.join(", ") : j.message)) || msg;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // public
  getSettings: () => request<WeddingSettings>("/settings"),
  listEvents: () => request<WeddingEvent[]>("/events"),
  submitRsvp: (data: Omit<Rsvp, "id" | "created_at">) =>
    request<Rsvp>("/rsvps", { method: "POST", body: JSON.stringify(data) }),

  // auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; role: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; role: string } }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ id: string; email: string; role: string }>("/auth/me"),

  // admin
  updateSettings: (id: string, patch: Partial<WeddingSettings>) =>
    request<WeddingSettings>(`/settings/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  createEvent: (data: Omit<WeddingEvent, "id">) =>
    request<WeddingEvent>("/events", { method: "POST", body: JSON.stringify(data) }),
  updateEvent: (id: string, data: Partial<WeddingEvent>) =>
    request<WeddingEvent>(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEvent: (id: string) => request<{ ok: true }>(`/events/${id}`, { method: "DELETE" }),
  listRsvps: () => request<Rsvp[]>("/rsvps"),
};