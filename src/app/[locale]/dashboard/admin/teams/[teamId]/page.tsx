import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminTeamClientForm } from "@/components/admin/admin-team-client-form";
import { AdminTeamMembersPanel } from "@/components/admin/admin-team-members-panel";
import { AdminTeamMentorsPanel } from "@/components/admin/admin-team-mentors-panel";
import { TeamFeedbackPanel } from "@/components/team/team-feedback-panel";
import { TeamLinksDisplay } from "@/components/team/team-links-display";
import { TeamLinksForm } from "@/components/team/team-links-form";
import { UpdateTeamForm } from "@/components/team/update-team-form";
import { Link } from "@/i18n/navigation";
import {
  getAdminTeamDetail,
  getAllClientsWithNames,
  getAllMentorsWithNames,
  getStudentsWithoutTeam,
} from "@/lib/teams/admin-queries";
import { getInternshipGroups } from "@/lib/teams/queries";
import { getTeamFeedbackForTeam } from "@/lib/team-feedback/queries";
import { MAX_TEAM_SIZE, MIN_TEAM_SIZE, validateTeamRoles } from "@/lib/validations/team";
import { requireRole } from "@/lib/auth/session";

type AdminTeamDetailPageProps = {
  params: Promise<{ locale: string; teamId: string }>;
};

export default async function AdminTeamDetailPage({ params }: AdminTeamDetailPageProps) {
  const { locale, teamId } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const [teamDetail, groups, mentors, clients, availableStudents, feedbackItems] = await Promise.all([
    getAdminTeamDetail(teamId),
    getInternshipGroups(),
    getAllMentorsWithNames(),
    getAllClientsWithNames(),
    getStudentsWithoutTeam(),
    getTeamFeedbackForTeam(teamId),
  ]);

  if (!teamDetail) {
    notFound();
  }

  const t = await getTranslations("AdminTeams");
  const roleValidation = validateTeamRoles(teamDetail.members);
  const canAddMember = teamDetail.members.length < MAX_TEAM_SIZE;

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Link href="/dashboard/admin/teams" className="text-sm text-zinc-500 underline">
          {t("backToTeams")}
        </Link>
        <h1 className="text-2xl font-semibold">{teamDetail.team.name}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {t("detailDescription", { group: teamDetail.groupName })}
        </p>
      </div>

      {!roleValidation.valid ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">{t("roleValidationWarning")}</p>
          <ul className="mt-2 list-disc pl-5">
            {roleValidation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {teamDetail.members.length < MIN_TEAM_SIZE ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {t("teamSizeWarning", { count: teamDetail.members.length, min: MIN_TEAM_SIZE })}
        </div>
      ) : null}

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-medium">{t("sections.details")}</h2>
        <UpdateTeamForm locale={locale} team={teamDetail.team} groups={groups} />
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-medium">{t("sections.links")}</h2>
        <div className="mb-4">
          <TeamLinksDisplay team={teamDetail.team} />
        </div>
        <TeamLinksForm locale={locale} team={teamDetail.team} />
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-medium">{t("sections.members")}</h2>
        <AdminTeamMembersPanel
          locale={locale}
          teamId={teamId}
          members={teamDetail.members}
          availableStudents={availableStudents}
          canAddMember={canAddMember}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-medium">{t("sections.mentors")}</h2>
        <AdminTeamMentorsPanel
          locale={locale}
          teamId={teamId}
          assignedMentors={teamDetail.mentors}
          availableMentors={mentors}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-medium">{t("sections.client")}</h2>
        {teamDetail.clientOrganization ? (
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            {t("client.current", {
              name: teamDetail.clientUserName ?? teamDetail.clientOrganization,
              organization: teamDetail.clientOrganization,
            })}
          </p>
        ) : (
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{t("client.noneAssigned")}</p>
        )}
        <AdminTeamClientForm
          locale={locale}
          teamId={teamId}
          currentClientId={teamDetail.team.clientId}
          clients={clients}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <TeamFeedbackPanel
          locale={locale}
          teamId={teamId}
          feedbackItems={feedbackItems}
          canCreate
          canComment
          canMarkDone={false}
        />
      </div>
    </section>
  );
}
