import { getTranslations } from "next-intl/server";

import { AdminTeamLinksIndicators } from "@/components/admin/admin-team-links-indicators";
import { Link } from "@/i18n/navigation";
import type { School } from "@/db/schema/enums";
import type { TeamSocialUrls } from "@/db/schema/teams";

type AdminTeamListItem = {
  id: string;
  name: string;
  classroom: string;
  schoolClass: string;
  school: string;
  groupName: string;
  githubRepoUrl: string | null;
  projectUrl: string | null;
  socialUrls: TeamSocialUrls | null;
  memberCount: number;
};

type AdminTeamsTableProps = {
  teams: AdminTeamListItem[];
};

export async function AdminTeamsTable({ teams }: AdminTeamsTableProps) {
  const t = await getTranslations("AdminTeams");

  if (teams.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground ">
        {t("emptyTeams")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-brand-dark/30 /50">
          <tr>
            <th className="px-4 py-3 font-medium">{t("columns.name")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.group")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.classroom")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.schoolClass")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.school")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.members")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.links")}</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id} className="border-b border-white/10 last:border-0">
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
              <td className="px-4 py-3">
                <AdminTeamLinksIndicators
                  githubRepoUrl={team.githubRepoUrl}
                  projectUrl={team.projectUrl}
                  socialUrls={team.socialUrls}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
