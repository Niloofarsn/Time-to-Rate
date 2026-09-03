import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getToken } from "../lib/api";
import {
  login as apiLogin,
  logout as apiLogout,
  getCachedUser,
  type CmsUser,
} from "../lib/authApi";

type Role = "RESEARCHER" | "PI" | "ADMIN";

interface AuthContextValue {
  user: CmsUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restore the session synchronously from the token + cached user (set at login),
  // so the role is available immediately on load without a redirect flash.
  const [user, setUser] = useState<CmsUser | null>(() => (getToken() ? getCachedUser() : null));
  const [hasToken, setHasToken] = useState<boolean>(() => !!getToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: hasToken,
      login: async (email, password) => {
        const u = await apiLogin(email, password);
        setUser(u);
        setHasToken(true);
      },
      logout: () => {
        apiLogout();
        setUser(null);
        setHasToken(false);
      },
    }),
    [user, hasToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
