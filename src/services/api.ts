import { API_BASE_URL } from "../config/env";
import { getToken, logoutStorage } from "./authStorage";

interface ApiOptions extends RequestInit {}

export async function apiClient<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = await getToken();

  const isFormData =
    options.body instanceof FormData;

  console.log("API Request:", {
    endpoint,
    method: options.method || "GET",
    isFormData,
    token,
  });

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

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

  let data: any = null;

  try {
    data = await response.json();
    console.log("API Response:", data);
  } catch {
    data = null;
  }

  // Token expired
  if (response.status === 401) {
    await logoutStorage();

    throw new Error(
      "Session expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Something went wrong."
    );
  }

  return data as T;
}