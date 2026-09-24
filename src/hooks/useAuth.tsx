"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { login as loginRequest } from "@/lib/api/auth";
import type { ApiError } from "@/types/api";
import type { LoginCredentials, User } from "@/types/auth";
import { ROUTES } from "@/lib/auth/constants";
import {
  clearAuth,
  getAccessToken,
  getStoredUser,
  persistAuth,
} from "@/lib/auth/storage";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearLoginError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    } else if (!token) {
      clearAuth();
      setUser(null);
    }
    setIsBootstrapping(false);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      if (isLoggingIn) return false;

      setIsLoggingIn(true);
      setLoginError(null);

      try {
        const response = await loginRequest(credentials);
        const { accessToken, ...rest } = response;
        const userFields: User = {
          id: rest.id,
          username: rest.username,
          email: rest.email,
          firstName: rest.firstName,
          lastName: rest.lastName,
          gender: rest.gender,
          image: rest.image,
        };

        if (!accessToken) {
          setLoginError("Login succeeded but no access token was returned.");
          return false;
        }

        persistAuth(accessToken, userFields);
        setUser(userFields);
        router.replace(ROUTES.products);
        return true;
      } catch (error) {
        const apiError = error as ApiError;
        setLoginError(
          apiError.message || "Invalid username or password. Please try again."
        );
        return false;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [isLoggingIn, router]
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.replace(ROUTES.login);
  }, [router]);

  const clearLoginError = useCallback(() => {
    setLoginError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && getAccessToken()),
      isBootstrapping,
      isLoggingIn,
      loginError,
      login,
      logout,
      clearLoginError,
    }),
    [
      user,
      isBootstrapping,
      isLoggingIn,
      loginError,
      login,
      logout,
      clearLoginError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
