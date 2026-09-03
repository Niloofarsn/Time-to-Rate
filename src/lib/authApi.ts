import { apiRequest, setToken, clearToken } from "./api";

// Shape returned by the CMS backend for a logged-in user.
export interface CmsUser {
  id: string;
  mail: string;
  name?: string;
  surname?: string;
  fullName?: string;
  role: "RESEARCHER" | "PI" | "ADMIN";
}

const USER_KEY = "t2r_user";

function cacheUser(user: CmsUser): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage may be unavailable */
  }
}

/** Read the cached logged-in user (set at login), or null. */
export function getCachedUser(): CmsUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as CmsUser) : null;
  } catch {
    return null;
  }
}

interface LoginResponse {
  success: boolean;
  msg: string;
  result: {
    token: string;
    user: CmsUser;
    surveys: unknown[];
  };
}

/** Log in against the CMS backend. Stores the token on success. */
export async function login(email: string, password: string): Promise<CmsUser> {
  const res = await apiRequest<LoginResponse>("/user/authenticate", {
    method: "POST",
    auth: false,
    body: {
      email,
      password,
      // The backend skips reCAPTCHA in development; this value is a placeholder.
      recaptchaResponse: "dev",
    },
  });
  if (!res?.result?.token) {
    throw new Error(res?.msg || "Login non riuscito");
  }
  setToken(res.result.token);
  cacheUser(res.result.user);
  return res.result.user;
}

export function logout(): void {
  clearToken();
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}
