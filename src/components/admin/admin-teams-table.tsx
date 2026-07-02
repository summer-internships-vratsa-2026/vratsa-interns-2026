import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { School } from "@/db/schema/enums";

type AdminTeamListItem = {
  id: string;
  name: string;
  classroom: string;
  schoolClass: string;
  school: string;
  groupName: string;
  clientOrganization: string | null;
  memberCount: number;
};

type AdminTeamsTableProps = {
  teams: AdminTeamListItem[];
};

export async function AdminTeamsTable({ teams }: AdminTeamsTableProps) {
  const t = await getTranslations("AdminTeams");

  if (teams.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        {t("emptyTeams")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <tr>
            <th className="px-4 py-3 font-medium">{t("columns.name")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.group")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.classroom")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.schoolClass")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.school")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.members")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.client")}</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
              <td className="px-4 py-3">
                <Link href={`/dashboard/admin/teams/${team.id}`} className="font-medium underline">
                  {team.name}
                </Link>
              </td>
              <td className="px-4 py-3">{team.groupName}</td>
              <td className="px-4 py-3">{team.classroom}</td>
              <td className="px-4 py-3">{team.schoolClass}</td>
              <td className="px-4 py-3">{t(`schoolOptions.${team.school as School}`)}</td>
              <td className="px-4 py-3">{team.memberCount}</td>
              <td className="px-4 py-3">{team.clientOrganization ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
