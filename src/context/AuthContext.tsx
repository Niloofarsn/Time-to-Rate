import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getToken } from "../lib/api";
import { login as apiLogin, logout as apiLogout, type CmsUser } from "../lib/authApi";

interface AuthContextValue {
  user: CmsUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // If a token is already stored, treat the session as authenticated on load.
  const [user, setUser] = useState<CmsUser | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(() => !!getToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
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
