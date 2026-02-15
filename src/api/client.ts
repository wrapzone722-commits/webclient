/**
 * API-клиент для веб-приложения (тот же бэкенд, что и iOS).
 * Базовый URL: VITE_API_BASE_URL или относительный /api (proxy в dev).
 */

const BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL) ||
  "";
const API_PREFIX = "/api/v1";

function getHeaders(apiKey: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let message = res.statusText;
    try {
      const json = JSON.parse(text);
      message = (json as { message?: string }).message ?? (json as { error?: string }).error ?? message;
    } catch {
      // leave message as statusText
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export type ApiKeyGetter = () => string | null;

let apiKeyGetter: ApiKeyGetter = () => null;

export function setApiKeyGetter(getter: ApiKeyGetter) {
  apiKeyGetter = getter;
}

function url(path: string, params?: Record<string, string>): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const full = `${BASE.replace(/\/$/, "")}${API_PREFIX}${normalized}`;
  if (!params || Object.keys(params).length === 0) return full;
  const search = new URLSearchParams(params).toString();
  return `${full}?${search}`;
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const res = await fetch(url(path, params), {
    method: "GET",
    headers: getHeaders(apiKeyGetter()),
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: "POST",
    headers: getHeaders(apiKeyGetter()),
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: "PUT",
    headers: getHeaders(apiKeyGetter()),
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(url(path), {
    method: "DELETE",
    headers: getHeaders(apiKeyGetter()),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = res.statusText;
    try {
      const json = JSON.parse(text);
      message = (json as { message?: string }).message ?? message;
    } catch {
      //
    }
    throw new Error(message);
  }
}

/** Скачать PDF акта (возвращает blob для сохранения/открытия). */
export async function apiGetBlob(path: string): Promise<Blob> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const full = `${BASE.replace(/\/$/, "")}${API_PREFIX}${normalized}`;
  const res = await fetch(full, { method: "GET", headers: getHeaders(apiKeyGetter()) });
  if (!res.ok) {
    const text = await res.text();
    let message = res.statusText;
    try {
      const json = JSON.parse(text);
      message = (json as { message?: string }).message ?? message;
    } catch {
      //
    }
    throw new Error(message);
  }
  return res.blob();
}

// ——— Конкретные вызовы ———

import type {
  Service,
  Booking,
  CreateBookingRequest,
  TimeSlot,
  Post,
  User,
  RegisterClientResponse,
} from "./types";

export async function registerClient(deviceId: string): Promise<RegisterClientResponse> {
  return apiPost<RegisterClientResponse>("/clients/register", {
    device_id: deviceId,
    platform: "web",
    app_version: "1.0",
  });
}

export async function fetchServices(): Promise<Service[]> {
  return apiGet<Service[]>("/services");
}

export async function fetchService(id: string): Promise<Service> {
  return apiGet<Service>(`/services/${id}`);
}

export async function fetchBookings(): Promise<Booking[]> {
  return apiGet<Booking[]>("/bookings");
}

export async function createBooking(req: CreateBookingRequest): Promise<Booking> {
  return apiPost<Booking>("/bookings", req);
}

export async function cancelBooking(id: string): Promise<void> {
  return apiDelete(`/bookings/${id}`);
}

export async function fetchBookingAct(bookingId: string): Promise<Blob> {
  return apiGetBlob(`/bookings/${bookingId}/act`);
}

export async function fetchSlots(serviceId: string, date: string, postId: string): Promise<TimeSlot[]> {
  return apiGet<TimeSlot[]>("/slots", {
    service_id: serviceId,
    date,
    post_id: postId,
  });
}

export async function fetchPosts(): Promise<Post[]> {
  return apiGet<Post[]>("/posts");
}

export async function fetchProfile(): Promise<User> {
  return apiGet<User>("/profile");
}
