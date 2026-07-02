import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { getStudentByUserId, getTeamMembershipForStudent } from "@/lib/teams/queries";
import { requireRole } from "@/lib/auth/session";

type StudentDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function StudentDashboardPage({ params }: StudentDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, "STUDENT");
  const student = await getStudentByUserId(session.user.id);
  const membership = student ? await getTeamMembershipForStudent(student.id) : null;

  if (!membership) {
    redirect(`/${locale}/dashboard/student/team/setup`);
  }

  redirect(`/${locale}/dashboard/student/team`);
}
