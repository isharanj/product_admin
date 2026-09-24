import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_TOKEN_COOKIE, ROUTES } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const isLogin = pathname === ROUTES.login;
  const isProtected =
    pathname.startsWith("/products") || pathname === "/";

  if (!token && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ROUTES.login;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLogin) {
    const productsUrl = request.nextUrl.clone();
    productsUrl.pathname = ROUTES.products;
    productsUrl.search = "";
    return NextResponse.redirect(productsUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/products/:path*"],
};
