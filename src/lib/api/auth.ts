import { api } from "@/lib/api/axios";
import { normalizeApiError } from "@/lib/api/errors";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth";

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>(
      "/auth/login",
      {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: 60,
      },
      { skipAuthRedirect: true }
    );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const { data } = await api.get<User>("/auth/me");
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
