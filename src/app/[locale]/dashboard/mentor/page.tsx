import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardRecentList } from "@/components/dashboard/dashboard-recent-list";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { requireMentorProfile } from "@/lib/auth/session";
import { getMentorDashboardOverview } from "@/lib/dashboard/queries";
import { hasMainGroupAssigned } from "@/lib/permissions";

type MentorDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MentorDashboardPage({ params }: MentorDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { mentor } = await requireMentorProfile(locale);

  const [overview, t] = await Promise.all([
    getMentorDashboardOverview(mentor),
    getTranslations("MentorDashboard"),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section className="space-y-8">
      <DashboardPageHeader title={t("title")} />

      {!hasMainGroupAssigned(mentor) ? (
        <div className="rounded-lg border border-amber-300/50 bg-amber-950/30 p-4 text-sm text-amber-100">
          {t("noMainGroupWarning")}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-medium">{t("mainGroupTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("mainGroupDescription", {
              group: overview.mainGroupName ?? "—",
              teams: overview.mainGroupTeams,
            })}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          href="/dashboard/mentor/groups"
          value={overview.groupCount}
          title={t("cards.groupsTitle")}
          description={t("cards.groupsDescription", { count: overview.groupCount })}
        />
        <DashboardStatCard
          href="/dashboard/mentor/tasks"
          value={overview.mainGroupTaskCount}
          title={t("cards.tasksTitle")}
          description={t("dashboard.mainGroupTasksDescription")}
        />
        <DashboardStatCard
          href="/dashboard/mentor/submissions"
          value={overview.pendingReviews}
          title={t("dashboard.pendingReviewsTitle")}
          description={t("dashboard.pendingReviewsDescription")}
        />
        <DashboardStatCard
          href="/dashboard/mentor/teams"
          title={t("cards.teamsTitle")}
          description={t("cards.teamsDescription")}
        />
      </div>

      <DashboardSection
        title={t("dashboard.recentSubmissionsTitle")}
        description={t("dashboard.recentSubmissionsDescription")}
      >
        <DashboardRecentList
          emptyMessage={t("emptySubmissions")}
          items={overview.recentSubmissions.map((row) => ({
            id: row.submissionId,
            title: row.taskTitle,
            subtitle: `${row.teamName} · ${row.groupName}`,
            meta: row.submittedAt ? dateFormatter.format(row.submittedAt) : undefined,
            href: `/dashboard/mentor/submissions/${row.submissionId}`,
          }))}
        />
      </DashboardSection>
    </section>
  );
}
