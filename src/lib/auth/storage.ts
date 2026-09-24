import type { User } from "@/types/auth";
import {
  AUTH_TOKEN_COOKIE,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie(name: string): void {
  document.cookie = `${name}=; path=/; SameSite=Lax; Max-Age=0`;
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ?? getCookie(AUTH_TOKEN_COOKIE)
  );
}

export function getStoredUser(): User | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function persistAuth(accessToken: string, user: User): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  setCookie(AUTH_TOKEN_COOKIE, accessToken, TOKEN_MAX_AGE_SECONDS);
}

export function clearAuth(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  clearCookie(AUTH_TOKEN_COOKIE);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
