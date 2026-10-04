import { API_BASE_URL } from "../config/env";
import { getToken, logoutStorage, emitUnauthorized } from "./authStorage";

interface ApiOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = await getToken();

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, options.timeoutMs || 20000);

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        signal: options.signal || controller.signal,
        headers: {
          ...(!isFormData && {
            "Content-Type": "application/json",
          }),

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),

          ...(options.headers || {}),
        },
      }
    );
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error("Request timed out. Please check your internet connection.");
    }
    throw new Error("Unable to connect to server. Please check your internet connection.");
  } finally {
    clearTimeout(timeout);
  }

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // Token expired
  if (response.status === 401) {
    await logoutStorage();
    emitUnauthorized();
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    let errorMsg = data?.message || data?.error;
    if (!errorMsg && Array.isArray(data?.errors) && data.errors.length > 0) {
      errorMsg = data.errors[0]?.message || data.errors[0];
    }
    if (!errorMsg) {
      if (response.status >= 500) {
        errorMsg = "Server error. Please try again later.";
      } else if (response.status === 404) {
        errorMsg = "Requested resource not found.";
      } else if (response.status === 403) {
        errorMsg = "Access denied.";
      } else {
        errorMsg = "Something went wrong. Please try again.";
      }
    }
    throw new Error(errorMsg);
  }

  return data as T;
}