export const AUTH_TOKEN_COOKIE = "pad_access_token";
export const AUTH_USER_KEY = "pad_user";
export const AUTH_TOKEN_KEY = "pad_access_token";

export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dummyjson.com";

export const DEMO_CREDENTIALS = {
  username: "emilys",
  password: "emilyspass",
} as const;

export const ROUTES = {
  login: "/login",
  products: "/products",
  productNew: "/products/new",
  product: (id: number | string) => `/products/${id}`,
  productEdit: (id: number | string) => `/products/${id}/edit`,
} as const;
