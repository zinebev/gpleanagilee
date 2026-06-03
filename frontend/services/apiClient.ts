// frontend/services/apiClient.ts
// Zineb - Jour 1
// Compatible avec lib/api.ts de Hajar (js-cookie)

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return {} as T;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || `Erreur ${response.status}`
    );
  }

  return data as T;
}

export const apiClient = {
  get:    <T>(url: string)                  => apiRequest<T>(url, "GET"),
  post:   <T>(url: string, body: unknown)   => apiRequest<T>(url, "POST", body),
  put:    <T>(url: string, body: unknown)   => apiRequest<T>(url, "PUT", body),
  patch:  <T>(url: string, body: unknown)   => apiRequest<T>(url, "PATCH", body),
  delete: <T>(url: string)                  => apiRequest<T>(url, "DELETE"),
};