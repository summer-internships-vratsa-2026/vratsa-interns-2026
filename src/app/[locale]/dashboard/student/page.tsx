import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardRecentList } from "@/components/dashboard/dashboard-recent-list";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { getStudentDashboardOverview } from "@/lib/dashboard/queries";
import { getStudentByUserId, getTeamMembershipForStudent } from "@/lib/teams/queries";

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

  const [overview, t, tSub] = await Promise.all([
    getStudentDashboardOverview(session.user.id),
    getTranslations("Dashboard.student"),
    getTranslations("Submissions"),
  ]);

  if (!overview) {
    redirect(`/${locale}/dashboard/student/team/setup`);
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const statusLabels = {
    submitted: tSub("status.submitted"),
    late: tSub("status.late"),
  };

  return (
    <section className="space-y-8">
      <DashboardPageHeader title={t("title")} description={t("description")} />

      <Card>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t("teamLabel")}</p>
            <p className="text-lg font-medium">{overview.team.name}</p>
            <p className="text-sm text-muted-foreground">
              {t("teamMeta", {
                group: overview.team.groupName ?? "—",
                members: overview.team.memberCount,
              })}
            </p>
          </div>
          <Link
            href="/dashboard/student/team"
            className="text-sm font-medium text-brand-accent underline-offset-4 hover:underline"
          >
            {t("viewTeam")}
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardStatCard
          href="/dashboard/student/tasks/new"
          value={overview.activeTaskCount}
          title={t("activeTasksTitle")}
          description={t("activeTasksDescription")}
        />
        <DashboardStatCard
          href="/dashboard/student/tasks/submitted"
          value={overview.submittedCount}
          title={t("submissionsTitle")}
          description={t("submissionsDescription")}
        />
      </div>

      <DashboardSection title={t("upcomingDeadlinesTitle")} description={t("upcomingDeadlinesDescription")}>
        <DashboardRecentList
          emptyMessage={t("emptyDeadlines")}
          items={overview.upcomingDeadlines.map((task) => ({
            id: task.taskGroupId,
            title: task.title,
            meta: dateFormatter.format(task.deadline),
            href: `/dashboard/student/tasks/${task.taskGroupId}`,
          }))}
        />
      </DashboardSection>

      <DashboardSection title={t("recentSubmissionsTitle")} description={t("recentSubmissionsDescription")}>
        <DashboardRecentList
          emptyMessage={t("emptySubmissions")}
          items={overview.recentSubmissions.map((submission) => ({
            id: submission.taskGroupId,
            title: submission.title,
            meta: `${statusLabels[submission.status]} · ${dateFormatter.format(submission.submittedAt)}`,
            href: `/dashboard/student/tasks/${submission.taskGroupId}`,
          }))}
        />
      </DashboardSection>
    </section>
  );
}
