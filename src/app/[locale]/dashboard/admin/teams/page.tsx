import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminTeamFilters } from "@/components/admin/admin-team-filters";
import { AdminTeamsTable } from "@/components/admin/admin-teams-table";
import { Link } from "@/i18n/navigation";
import {
  getAdminTeamsList,
  getAdminTeamMembersByTeamIds,
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
  const teams = await getAdminTeamsList(filters);
  const membersByTeam = await getAdminTeamMembersByTeamIds(teams.map((team) => team.id));
  const teamsWithMembers = teams.map((team) => ({
    ...team,
    members: membersByTeam[team.id] ?? [],
  }));

  const [groups, mentors, clients] = await Promise.all([
    getAllGroups(),
    getAllMentorsWithNames(),
    getAllClientsWithNames(),
  ]);

  const t = await getTranslations("AdminTeams");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <AdminTeamFilters
        groups={groups}
        mentors={mentors}
        clients={clients}
        current={filters}
      />

      <AdminTeamsTable teams={teamsWithMembers} />
    </section>
  );
}
