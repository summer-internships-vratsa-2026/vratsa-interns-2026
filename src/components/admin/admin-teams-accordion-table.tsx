"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useState } from "react";

import { AdminTeamLinksIndicators } from "@/components/admin/admin-team-links-indicators";
import { Link } from "@/i18n/navigation";
import type { School } from "@/db/schema/enums";
import type { AdminTeamMemberSummary } from "@/lib/teams/admin-queries";
import type { TeamSocialUrls } from "@/db/schema/teams";
import { cn } from "@/lib/utils";

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

type AdminTeamsAccordionTableProps = {
  teams: AdminTeamListItem[];
};

export function AdminTeamsAccordionTable({ teams }: AdminTeamsAccordionTableProps) {
  const t = useTranslations("AdminTeams");
  const tTeam = useTranslations("Team");
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<string>>(new Set());

  const columnCount = 7;

  function toggleTeam(teamId: string) {
    setExpandedTeamIds((current) => {
      const next = new Set(current);

      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }

      return next;
    });
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
          {teams.map((team) => {
            const isExpanded = expandedTeamIds.has(team.id);

            return (
              <Fragment key={team.id}>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTeam(team.id)}
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded ? t("members.collapse") : t("members.expand")
                        }
                        className="rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50"
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                          aria-hidden
                        />
                      </button>
                      <Link
                        href={`/dashboard/admin/teams/${team.id}`}
                        className="font-medium underline"
                      >
                        {team.name}
                      </Link>
                    </div>
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
                {isExpanded ? (
                  <tr className="border-b border-white/10 bg-brand-dark/20">
                    <td colSpan={columnCount} className="px-4 py-3 pl-12">
                      {team.members.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("members.empty")}</p>
                      ) : (
                        <ul className="space-y-1">
                          {team.members.map((member) => (
                            <li key={`${team.id}-${member.name}-${member.projectRole}`}>
                              {member.name} · {tTeam(`roles.${member.projectRole}`)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
