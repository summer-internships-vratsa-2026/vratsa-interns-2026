import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardRecentList } from "@/components/dashboard/dashboard-recent-list";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { requireClientProfile } from "@/lib/auth/session";
import { getClientDashboardOverview } from "@/lib/dashboard/queries";

type ClientDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ClientDashboardPage({ params }: ClientDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { session } = await requireClientProfile(locale);

  const [overview, t] = await Promise.all([
    getClientDashboardOverview(session.user.id),
    getTranslations("Dashboard.client"),
  ]);

  if (!overview) {
    return null;
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section className="space-y-8">
      <DashboardPageHeader title={t("title")} description={t("description")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardStatCard
          href="/dashboard/client/teams"
          value={overview.teamCount}
          title={t("teamsLinkTitle")}
          description={t("teamsLinkDescription")}
        />
        <DashboardStatCard
          href="/dashboard/client/submissions"
          value={overview.submissionCount}
          title={t("submissionsLinkTitle")}
          description={t("submissionsLinkDescription")}
        />
      </div>

      <DashboardSection
        title={t("recentSubmissionsTitle")}
        description={t("recentSubmissionsDescription")}
      >
        <DashboardRecentList
          emptyMessage={t("emptySubmissions")}
          items={overview.recentSubmissions.map((row) => ({
            id: row.submissionId,
            title: row.taskTitle,
            subtitle: row.teamName,
            meta: row.submittedAt ? dateFormatter.format(row.submittedAt) : undefined,
            href: `/dashboard/client/submissions/${row.submissionId}`,
          }))}
        />
      </DashboardSection>

      <DashboardSection
        title={t("recentCommentsTitle")}
        description={t("recentCommentsDescription")}
      >
        <DashboardRecentList
          emptyMessage={t("emptyComments")}
          items={overview.recentComments.map((comment) => ({
            id: comment.id,
            title: comment.taskTitle,
            subtitle: `${comment.teamName} · ${comment.authorName}`,
            meta: dateFormatter.format(comment.createdAt),
            href: `/dashboard/client/submissions/${comment.submissionId}`,
          }))}
        />
      </DashboardSection>
    </section>
  );
}
