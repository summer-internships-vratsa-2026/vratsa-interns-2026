import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { UserRole } from "@/db/schema/enums";
import { getDashboardPath } from "@/lib/auth/routes";
import { getMentorByUserId } from "@/lib/mentors/queries";
import { getClientByUserId } from "@/lib/clients/queries";

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

export async function requireMentorProfile(locale: string) {
  const session = await requireRole(locale, "MENTOR");
  const mentor = await getMentorByUserId(session.user.id);

  if (!mentor) {
    redirect(getDashboardPath("MENTOR", locale));
  }

  return { session, mentor };
}

export async function requireClientProfile(locale: string) {
  const session = await requireRole(locale, "CLIENT");
  const client = await getClientByUserId(session.user.id);

  if (!client) {
    redirect(getDashboardPath("CLIENT", locale));
  }

  return { session, client };
}
