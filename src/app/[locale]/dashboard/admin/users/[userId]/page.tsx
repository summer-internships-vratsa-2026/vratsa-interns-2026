import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminUserDetailPanel } from "@/components/admin/admin-user-detail-panel";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { requireRole } from "@/lib/auth/session";
import { getClientByUserId, getClientTeamsWithGroups, getTeamsAvailableForClientAssignment } from "@/lib/clients/queries";
import { getMentorByUserId } from "@/lib/mentors/queries";
import { getAllGroups } from "@/lib/teams/admin-queries";
import { getGroupName, getStudentByUserId, getTeamMembershipForStudent } from "@/lib/teams/queries";
import type { ProjectRole } from "@/db/schema/enums";
import { getUserAdminDetail } from "@/lib/users/queries";

type AdminUserDetailPageProps = {
  params: Promise<{ locale: string; userId: string }>;
};

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { locale, userId } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const [user, session, t] = await Promise.all([
    getUserAdminDetail(userId),
    auth(),
    getTranslations("AdminUsers"),
  ]);

  if (!user) {
    notFound();
  }

  let mentorProfile: Awaited<ReturnType<typeof getMentorByUserId>> | null = null;
  let groups: Awaited<ReturnType<typeof getAllGroups>> = [];
  let clientProfile: Awaited<ReturnType<typeof getClientByUserId>> | null = null;
  let clientTeams: Awaited<ReturnType<typeof getClientTeamsWithGroups>> = [];
  let availableTeamsForClient: Awaited<ReturnType<typeof getTeamsAvailableForClientAssignment>> = [];
  let studentTeam: {
    id: string;
    name: string;
    groupName: string | null;
    projectRole: ProjectRole;
  } | null = null;

  if (user.role === "MENTOR") {
    [mentorProfile, groups] = await Promise.all([getMentorByUserId(user.id), getAllGroups()]);
  } else if (user.role === "CLIENT") {
    clientProfile = await getClientByUserId(user.id);

    if (clientProfile) {
      [clientTeams, availableTeamsForClient] = await Promise.all([
        getClientTeamsWithGroups(clientProfile.id),
        getTeamsAvailableForClientAssignment(),
      ]);
    }
  } else if (user.role === "STUDENT") {
    const student = await getStudentByUserId(user.id);

    if (student) {
      const membership = await getTeamMembershipForStudent(student.id);

      if (membership) {
        studentTeam = {
          id: membership.team.id,
          name: membership.team.name,
          groupName: await getGroupName(membership.team.groupId),
          projectRole: membership.member.projectRole,
        };
      }
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/admin/users" className="text-sm text-muted-foreground underline">
          {t("backToUsers")}
        </Link>
        <h1 className="text-2xl font-semibold">{user.name}</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <AdminUserDetailPanel
        locale={locale}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerifiedAt: user.emailVerifiedAt,
          disabledAt: user.disabledAt,
        }}
        isSelf={session?.user?.id === user.id}
        mentorProfile={
          mentorProfile
            ? { id: mentorProfile.id, mainGroupId: mentorProfile.mainGroupId }
            : null
        }
        groups={groups}
        clientProfile={
          clientProfile
            ? {
                id: clientProfile.id,
                organizationName: clientProfile.organizationName,
              }
            : null
        }
        clientTeams={clientTeams}
        availableTeamsForClient={availableTeamsForClient}
        studentTeam={studentTeam}
      />
    </section>
  );
}
