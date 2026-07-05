import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { StudentSubmittedTasksTable } from "@/components/task/student-tasks-table";
import { requireRole } from "@/lib/auth/session";
import { getStudentTaskOverview } from "@/lib/students/tasks";
import { getStudentByUserId, getTeamMembershipForStudent } from "@/lib/teams/queries";

type StudentSubmittedTasksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function StudentSubmittedTasksPage({ params }: StudentSubmittedTasksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, "STUDENT");
  const student = await getStudentByUserId(session.user.id);

  if (!student) {
    redirect(`/${locale}/dashboard/student/team/setup`);
  }

  const membership = await getTeamMembershipForStudent(student.id);

  if (!membership) {
    redirect(`/${locale}/dashboard/student/team/setup`);
  }

  const overview = await getStudentTaskOverview(session.user.id);
  const t = await getTranslations("StudentTasks");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("submittedTitle")}</h1>
        <p className="text-muted-foreground">{t("submittedDescription")}</p>
      </div>

      <StudentSubmittedTasksTable locale={locale} tasks={overview?.submittedTasks ?? []} />
    </section>
  );
}
