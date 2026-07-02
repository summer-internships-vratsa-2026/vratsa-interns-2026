import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";
import {
  canAccessDashboard,
  getDashboardPath,
  getDashboardSegment,
  isAuthPath,
  isDashboardPath,
  stripLocaleFromPathname,
} from "@/lib/auth/routes";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const locale = routing.locales.includes(segments[0] as (typeof routing.locales)[number])
    ? segments[0]
    : routing.defaultLocale;
  const pathWithoutLocale = stripLocaleFromPathname(pathname, routing.locales);

  if (isDashboardPath(pathWithoutLocale)) {
    if (!request.auth?.user) {
      const loginUrl = new URL(`/${locale}/login`, request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathWithoutLocale === "/dashboard") {
      return NextResponse.redirect(
        new URL(getDashboardPath(request.auth.user.role, locale), request.nextUrl.origin),
      );
    }

    const segment = getDashboardSegment(pathWithoutLocale);

    if (segment && !canAccessDashboard(request.auth.user.role, segment)) {
      return NextResponse.redirect(
        new URL(getDashboardPath(request.auth.user.role, locale), request.nextUrl.origin),
      );
    }
  }

  if (request.auth?.user && isAuthPath(pathWithoutLocale)) {
    return NextResponse.redirect(
      new URL(getDashboardPath(request.auth.user.role, locale), request.nextUrl.origin),
    );
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: ["/", "/(bg|en)/:path*"],
};
