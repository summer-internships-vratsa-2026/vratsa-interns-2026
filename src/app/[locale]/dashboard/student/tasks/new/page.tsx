import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { StudentNewTasksTable } from "@/components/task/student-tasks-table";
import { requireRole } from "@/lib/auth/session";
import { getStudentTaskOverview } from "@/lib/students/tasks";
import { getStudentByUserId, getTeamMembershipForStudent } from "@/lib/teams/queries";

type StudentNewTasksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function StudentNewTasksPage({ params }: StudentNewTasksPageProps) {
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
        <h1 className="text-2xl font-semibold">{t("newTitle")}</h1>
        <p className="text-muted-foreground">{t("newDescription")}</p>
      </div>

      <StudentNewTasksTable locale={locale} tasks={overview?.newTasks ?? []} />
    </section>
  );
}
