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
  linkTeams?: boolean;
};

export function AdminTeamsAccordionTable({
  teams,
  linkTeams = true,
}: AdminTeamsAccordionTableProps) {
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
    <>
      {/* ── Mobile card list (hidden on sm+) ────────────────────────── */}
      <div className="flex flex-col divide-y divide-white/10 rounded-lg border border-border sm:hidden">
        {teams.map((team) => {
          const isExpanded = expandedTeamIds.has(team.id);

          return (
            <div key={team.id} className="text-sm">
              {/* card header row */}
              <div className="flex items-start gap-2 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleTeam(team.id)}
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? t("members.collapse") : t("members.expand")}
                  className="mt-0.5 shrink-0 rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50"
                >
                  <ChevronDown
                    className={cn("size-4 transition-transform", isExpanded && "rotate-180")}
                    aria-hidden
                  />
                </button>

                <div className="min-w-0 flex-1 space-y-2">
                  {/* name + group */}
                  <div>
                    {linkTeams ? (
                      <Link
                        href={`/dashboard/admin/teams/${team.id}`}
                        className="font-medium underline"
                      >
                        {team.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{team.name}</span>
                    )}
                    <p className="text-xs text-white/60">{team.groupName}</p>
                  </div>

                  {/* links always visible */}
                  <AdminTeamLinksIndicators
                    githubRepoUrl={team.githubRepoUrl}
                    projectUrl={team.projectUrl}
                    socialUrls={team.socialUrls}
                  />
                </div>
              </div>

              {/* accordion detail */}
              {isExpanded ? (
                <div className="border-t border-white/10 bg-brand-dark/20 px-4 py-3 pl-12">
                  <dl className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <dt className="text-white/60">{t("columns.classroom")}</dt>
                    <dd>{team.classroom}</dd>
                    <dt className="text-white/60">{t("columns.schoolClass")}</dt>
                    <dd>{team.schoolClass}</dd>
                    <dt className="text-white/60">{t("columns.school")}</dt>
                    <dd>{t(`schoolOptions.${team.school as School}`)}</dd>
                    <dt className="text-white/60">{t("columns.members")}</dt>
                    <dd>{team.memberCount}</dd>
                  </dl>
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
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* ── Desktop table (hidden below sm) ─────────────────────────── */}
      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-brand-dark/30">
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
                          aria-label={isExpanded ? t("members.collapse") : t("members.expand")}
                          className="shrink-0 rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50"
                        >
                          <ChevronDown
                            className={cn(
                              "size-4 transition-transform",
                              isExpanded && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </button>
                        {linkTeams ? (
                          <Link
                            href={`/dashboard/admin/teams/${team.id}`}
                            className="font-medium underline"
                          >
                            {team.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{team.name}</span>
                        )}
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
    </>
  );
}
