import { getTranslations } from "next-intl/server";

import { AdminTeamsAccordionTable } from "@/components/admin/admin-teams-accordion-table";
import type { AdminTeamMemberSummary } from "@/lib/teams/admin-queries";
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
  members: AdminTeamMemberSummary[];
};

type AdminTeamsTableProps = {
  teams: AdminTeamListItem[];
  linkTeams?: boolean;
};

export async function AdminTeamsTable({ teams, linkTeams = true }: AdminTeamsTableProps) {
  const t = await getTranslations("AdminTeams");

  if (teams.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground ">
        {t("emptyTeams")}
      </p>
    );
  }

  return <AdminTeamsAccordionTable teams={teams} linkTeams={linkTeams} />;
}
