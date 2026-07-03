import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminTeamFilters } from "@/components/admin/admin-team-filters";
import { MentorNav } from "@/components/mentor/mentor-nav";
import { Link } from "@/i18n/navigation";
import type { School } from "@/db/schema/enums";
import { requireMentorProfile } from "@/lib/auth/session";
import { getAllGroups, getAdminTeamsList } from "@/lib/teams/admin-queries";
import { resolveMentorTeamFilters } from "@/lib/teams/admin-filters";

type MentorTeamsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MentorTeamsPage({ params, searchParams }: MentorTeamsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  const { mentor } = await requireMentorProfile(locale);

  const filters = resolveMentorTeamFilters(resolvedSearchParams, mentor.mainGroupId);
  const [teams, groups] = await Promise.all([
    getAdminTeamsList(filters),
    getAllGroups(),
  ]);

  const t = await getTranslations("MentorDashboard");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("teamsPageTitle")}</h1>
      </div>

      <MentorNav current="teams" />

      <AdminTeamFilters
        groups={groups}
        current={filters}
        showMentorFilter={false}
        showClientFilter={false}
      />

      {teams.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("emptyTeams")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t("teamsColumns.name")}</th>
                <th className="px-4 py-3 font-medium">{t("teamsColumns.group")}</th>
                <th className="px-4 py-3 font-medium">{t("teamsColumns.classroom")}</th>
                <th className="px-4 py-3 font-medium">{t("teamsColumns.schoolClass")}</th>
                <th className="px-4 py-3 font-medium">{t("teamsColumns.school")}</th>
                <th className="px-4 py-3 font-medium">{t("teamsColumns.members")}</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr
                  key={team.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/mentor/teams/${team.id}`}
                      className="font-medium underline"
                    >
                      {team.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{team.groupName}</td>
                  <td className="px-4 py-3">{team.classroom}</td>
                  <td className="px-4 py-3">{team.schoolClass}</td>
                  <td className="px-4 py-3">{t(`schoolOptions.${team.school as School}`)}</td>
                  <td className="px-4 py-3">{team.memberCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
