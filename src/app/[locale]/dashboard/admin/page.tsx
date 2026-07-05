import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { requireRole } from "@/lib/auth/session";
import { getAdminDashboardStats } from "@/lib/dashboard/queries";

type AdminDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const [stats, t] = await Promise.all([
    getAdminDashboardStats(),
    getTranslations("Dashboard.admin"),
  ]);

  return (
    <section className="space-y-8">
      <DashboardPageHeader title={t("title")} description={t("description")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          href="/dashboard/admin/users"
          value={stats.users}
          title={t("usersLinkTitle")}
          description={t("usersLinkDescription")}
        />
        <DashboardStatCard
          href="/dashboard/admin/teams"
          value={stats.teams}
          title={t("teamsLinkTitle")}
          description={t("teamsLinkDescription")}
        />
        <DashboardStatCard
          href="/dashboard/admin/tasks"
          value={stats.tasks}
          title={t("tasksLinkTitle")}
          description={t("tasksLinkDescription")}
        />
        <DashboardStatCard
          value={stats.groups}
          title={t("groupsStatTitle")}
          description={t("groupsStatDescription")}
        />
        <DashboardStatCard
          href="/dashboard/admin/submissions"
          value={stats.submissions}
          title={t("submissionsLinkTitle")}
          description={t("submissionsLinkDescription")}
        />
        <DashboardStatCard
          href="/dashboard/admin/topics"
          value={stats.topics}
          title={t("topicsLinkTitle")}
          description={t("topicsLinkDescription")}
        />
      </div>
    </section>
  );
}
