import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { read, subscribe } from "../services/db";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getSessionUser());

  // Keep the signed-in user in sync when their record changes (profile edit, demo reset)
  useEffect(
    () =>
      subscribe(() => {
        setUser((current) => (current ? (read().employees.find((e) => e.id === current.id) ?? null) : null));
      }),
    [],
  );

  const signIn = useCallback(async (email, password) => {
    const signedIn = await authService.signIn(email, password);
    setUser(signedIn);
    return signedIn;
  }, []);

  const signInAsDemo = useCallback(async (role) => {
    const signedIn = await authService.signInAsDemo(role);
    setUser(signedIn);
    return signedIn;
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === "admin", signIn, signInAsDemo, signOut }),
    [user, signIn, signInAsDemo, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
