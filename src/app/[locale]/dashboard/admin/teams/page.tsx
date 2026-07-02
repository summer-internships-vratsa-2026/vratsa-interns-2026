import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminTeamFilters } from "@/components/admin/admin-team-filters";
import { AdminTeamsTable } from "@/components/admin/admin-teams-table";
import { Link } from "@/i18n/navigation";
import {
  getAdminTeamsList,
  getAllClientsWithNames,
  getAllGroups,
  getAllMentorsWithNames,
} from "@/lib/teams/admin-queries";
import { parseAdminTeamFilters } from "@/lib/teams/admin-filters";
import { requireRole } from "@/lib/auth/session";

type AdminTeamsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTeamsPage({ params, searchParams }: AdminTeamsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const filters = parseAdminTeamFilters(resolvedSearchParams);
  const [teams, groups, mentors, clients] = await Promise.all([
    getAdminTeamsList(filters),
    getAllGroups(),
    getAllMentorsWithNames(),
    getAllClientsWithNames(),
  ]);

  const t = await getTranslations("AdminTeams");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/admin" className="text-sm text-zinc-500 underline">
          {t("backToDashboard")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("description")}</p>
      </div>

      <AdminTeamFilters
        groups={groups}
        mentors={mentors}
        clients={clients}
        current={filters}
      />

      <AdminTeamsTable teams={teams} />
    </section>
  );
}
