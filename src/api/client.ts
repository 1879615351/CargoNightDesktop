const API_BASE = "http://localhost:8080/api";

let authToken: string | null = localStorage.getItem("cargonight_token");

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("cargonight_token", token);
  } else {
    localStorage.removeItem("cargonight_token");
  }
}

export function getToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem("cargonight_token");
  }
  return authToken;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    if (res.headers.get("content-type")?.includes("application/json")) {
      return res.json();
    }
    return undefined as T;
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("连接超时：请确认服务器已启动 (http://localhost:8080)");
    }
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      throw new Error("无法连接服务器：请先启动 CargoNightServer");
    }
    throw e;
  }
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
