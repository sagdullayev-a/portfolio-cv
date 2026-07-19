/**
 * Centralized API configuration and URL resolution.
 * Automatically resolves endpoint URLs for development and production.
 */

// Strip trailing slash if present
const rawApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export const API_BASE_URL: string =
  rawApiUrl ||
  import.meta.env.VITE_CONTACT_API_URL?.replace(/\/notify\/contact\/?$/, "") ||
  import.meta.env.VITE_CHAT_API_URL?.replace(/\/chat\/?$/, "") ||
  "http://localhost:3001";

export const CONTACT_API_URL: string =
  import.meta.env.VITE_CONTACT_API_URL || `${API_BASE_URL}/notify/contact`;

export const CHAT_API_URL: string =
  import.meta.env.VITE_CHAT_API_URL || `${API_BASE_URL}/chat`;

/**
 * Reusable fetch wrapper for API calls
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || `HTTP Error ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}
