import type { UserRole } from "@/db/schema/enums";

export const ROLE_DASHBOARD_SEGMENTS: Record<UserRole, string> = {
  STUDENT: "student",
  MENTOR: "mentor",
  ADMIN: "admin",
  CLIENT: "client",
};

export const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
] as const;

export function getDashboardPath(role: UserRole, locale: string): string {
  return `/${locale}/dashboard/${ROLE_DASHBOARD_SEGMENTS[role]}`;
}

/**
 * Segments under /dashboard that are accessible to specific roles
 * in addition to their own role segment.
 */
const SHARED_DASHBOARD_SEGMENTS: Record<string, UserRole[]> = {
  evaluation: ["ADMIN", "MENTOR"],
};

export function canAccessDashboard(role: UserRole, segment: string): boolean {
  if (ROLE_DASHBOARD_SEGMENTS[role] === segment) return true;
  const allowed = SHARED_DASHBOARD_SEGMENTS[segment];
  return allowed ? allowed.includes(role) : false;
}

export function stripLocaleFromPathname(pathname: string, locales: readonly string[]): string {
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];

  if (locale && locales.includes(locale)) {
    return `/${segments.slice(1).join("/")}` || "/";
  }

  return pathname;
}

export function isAuthPath(pathWithoutLocale: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`),
  );
}

export function isDashboardPath(pathWithoutLocale: string): boolean {
  return pathWithoutLocale === "/dashboard" || pathWithoutLocale.startsWith("/dashboard/");
}

export function getDashboardSegment(pathWithoutLocale: string): string | null {
  const match = pathWithoutLocale.match(/^\/dashboard\/([^/]+)/);
  return match?.[1] ?? null;
}
