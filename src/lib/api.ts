// API client for the Time2Rate CMS backend (Express + MongoDB).
//
// The CMS API lives under a secret prefix path, e.g.
//   http://localhost:3000/cms/<PREFIX_CMS>/...
// Override via a .env file with VITE_CMS_API_BASE if the backend runs elsewhere.

const DEFAULT_BASE =
  "http://localhost:3000/cms/d6020091-a3ca-43ea-a709-33121b82e25b";

export const CMS_API_BASE: string =
  import.meta.env.VITE_CMS_API_BASE || DEFAULT_BASE;

const TOKEN_KEY = "t2r_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // attach the bearer token (default true)
}

/** Core fetch wrapper: base URL, JSON, bearer token, unified error handling. */
export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${CMS_API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Impossibile contattare il server. È avviato il backend?");
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      (data && typeof data === "object" && "msg" in data
        ? String((data as { msg: unknown }).msg)
        : null) ||
      `Errore ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  return data as T;
}
