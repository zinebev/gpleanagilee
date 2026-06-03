import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // récupérer token depuis cookies
  const token = request.cookies.get("token")?.value;

  // routes protégées
  const protectedRoutes = ["/dashboard", "/projects"];

  // vérifier si route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // si pas connecté : redirection login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // empêcher accès login/register si déjà connecté
  if (
    token &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// définir routes concernées
export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/login", "/register"],
};