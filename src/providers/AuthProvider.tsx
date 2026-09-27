import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const TOKEN_KEY = "elbatel.session.token";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "customer";
  isAdmin: boolean;
};

type AuthContextValue = {
  token: string | null;
  user: SessionUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<SessionUser>;
  signUp: (email: string, password: string, name?: string) => Promise<SessionUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const me = useQuery(api.auth.me, token ? { token } : "skip");
  const signInAction = useAction(api.authActions.signIn);
  const signUpAction = useAction(api.authActions.signUp);
  const signOutMutation = useMutation(api.auth.signOut);

  const persist = useCallback((next: string | null) => {
    setToken(next);
    try {
      if (next) localStorage.setItem(TOKEN_KEY, next);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage may be unavailable in private mode */
    }
  }, []);

  // Drop stale tokens so the UI never sits in a half-signed-in state.
  useEffect(() => {
    if (token && me === null) persist(null);
  }, [token, me, persist]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await signInAction({ email, password });
      persist(result.token);
      return {
        id: "",
        email: result.email,
        name: result.name ?? null,
        role: result.role,
        isAdmin: result.role === "admin",
      } satisfies SessionUser;
    },
    [signInAction, persist],
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      const result = await signUpAction({ email, password, name });
      persist(result.token);
      return {
        id: "",
        email: result.email,
        name: result.name ?? null,
        role: result.role,
        isAdmin: false,
      } satisfies SessionUser;
    },
    [signUpAction, persist],
  );

  const signOut = useCallback(async () => {
    if (token) {
      try {
        await signOutMutation({ token });
      } catch {
        /* session may already be gone */
      }
    }
    persist(null);
  }, [signOutMutation, token, persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user: me ?? null,
      loading: Boolean(token) && me === undefined,
      isAuthenticated: Boolean(me),
      isAdmin: Boolean(me?.isAdmin),
      signIn,
      signUp,
      signOut,
    }),
    [token, me, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
