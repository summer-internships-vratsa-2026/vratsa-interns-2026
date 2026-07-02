import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { UserRole } from "@/db/schema/enums";
import { getDashboardPath } from "@/lib/auth/routes";

export async function requireAuth(locale: string) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return session;
}

export async function requireRole(locale: string, role: UserRole) {
  const session = await requireAuth(locale);

  if (session.user.role !== role) {
    redirect(getDashboardPath(session.user.role, locale));
  }

  return session;
}
