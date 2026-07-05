import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { requireClientProfile } from "@/lib/auth/session";
import { getClientTeamsByUserId } from "@/lib/clients/queries";
import { getGroupName } from "@/lib/teams/queries";

type ClientTeamsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ClientTeamsPage({ params }: ClientTeamsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { session } = await requireClientProfile(locale);
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
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      {teamsWithGroups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground ">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {teamsWithGroups.map((team) => (
            <li key={team.id} className="rounded-lg border border-border p-4">
              <Link href={`/dashboard/client/teams/${team.id}`} className="font-medium underline">
                {team.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("groupLabel", { group: team.groupName ?? "—" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
