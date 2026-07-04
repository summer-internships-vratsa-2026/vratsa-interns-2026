import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { getGroupName } from "@/lib/teams/queries";
import { getClientTeamsByUserId } from "@/lib/team-feedback/queries";

type ClientTeamsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ClientTeamsPage({ params }: ClientTeamsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, "CLIENT");
  const t = await getTranslations("ClientTeams");

  const teams = await getClientTeamsByUserId(session.user.id);
  const teamsWithGroups = await Promise.all(
    teams.map(async (team) => ({
      ...team,
      groupName: await getGroupName(team.groupId),
    })),
  );

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/client" className="text-sm text-zinc-500 underline">
          {t("backToDashboard")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("description")}</p>
      </div>

      {teamsWithGroups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {teamsWithGroups.map((team) => (
            <li key={team.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <Link href={`/dashboard/client/teams/${team.id}`} className="font-medium underline">
                {team.name}
              </Link>
              <p className="mt-1 text-sm text-zinc-500">
                {t("groupLabel", { group: team.groupName ?? "—" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
