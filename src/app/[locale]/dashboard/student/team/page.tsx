import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TeamDetailsDisplay } from "@/components/team/team-details-display";
import { TeamInviteSection } from "@/components/team/team-invite-section";
import { UpdateTeamNameForm } from "@/components/team/update-team-name-form";
import {
  getGroupName,
  getStudentByUserId,
  getTeamMembersWithNames,
  getTeamMembershipForStudent,
} from "@/lib/teams/queries";
import { MAX_TEAM_SIZE } from "@/lib/validations/team";
import { requireRole } from "@/lib/auth/session";

type StudentTeamPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function StudentTeamPage({ params }: StudentTeamPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, "STUDENT");
  const student = await getStudentByUserId(session.user.id);

  if (!student) {
    redirect(`/${locale}/dashboard/student/team/setup`);
  }

  const membership = await getTeamMembershipForStudent(student.id);

  if (!membership) {
    redirect(`/${locale}/dashboard/student/team/setup`);
  }

  const [members, groupName] = await Promise.all([
    getTeamMembersWithNames(membership.team.id),
    getGroupName(membership.team.groupId),
  ]);

  const t = await getTranslations("Team");

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("teamPageTitle")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("teamPageDescription")}</p>
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-3 text-lg font-medium">{t("members")}</h2>
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <span>
                {member.name} ({member.email})
              </span>
              <span className="text-zinc-500">{t(`roles.${member.projectRole}`)}</span>
            </li>
          ))}
        </ul>
        {groupName ? (
          <p className="mt-3 text-sm text-zinc-600">
            {t("currentGroup")}: {groupName}
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-medium">{t("teamDetails")}</h2>
        <TeamDetailsDisplay team={membership.team} groupName={groupName} />
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-medium">{t("editTeamName")}</h2>
        <UpdateTeamNameForm locale={locale} team={membership.team} />
      </div>

      <TeamInviteSection
        locale={locale}
        teamId={membership.team.id}
        memberCount={members.length}
        maxMembers={MAX_TEAM_SIZE}
      />

      <div className="rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
        <h2 className="text-lg font-medium">{t("tasksPlaceholderTitle")}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("tasksPlaceholderDescription")}
        </p>
      </div>
    </section>
  );
}
