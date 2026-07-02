"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/db";
import { teamInvites, teamMembers, teams } from "@/db/schema";
import { buildTeamJoinUrl, sendTeamInviteEmail } from "@/lib/teams/emails";
import { createInviteToken, getInviteExpiryDate, isInviteExpired } from "@/lib/teams/invites";
import {
  getInviteByToken,
  getMemberRoles,
  getStudentByUserId,
  getTeamById,
  getTeamMembershipForStudent,
} from "@/lib/teams/queries";
import { MAX_TEAM_SIZE, validateJoinMemberRole } from "@/lib/validations/team";
import {
  createTeamSchema,
  inviteEmailSchema,
  joinTeamSchema,
  updateTeamNameSchema,
  updateTeamSchema,
  type TeamActionState,
} from "@/lib/validations/team-form";

async function requireStudentUser() {
  const session = await auth();

  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await getStudentByUserId(session.user.id);

  if (!student) {
    throw new Error("Student profile not found");
  }

  return { session, student };
}

async function requireStudentTeamMember(teamId: string) {
  const { session, student } = await requireStudentUser();
  const membership = await getTeamMembershipForStudent(student.id);

  if (!membership || membership.team.id !== teamId) {
    throw new Error("Forbidden");
  }

  return { session, student, membership };
}

export async function createTeamAction(
  locale: string,
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const { session, student } = await requireStudentUser();
  const existingMembership = await getTeamMembershipForStudent(student.id);

  if (existingMembership) {
    return { error: "already_in_team" };
  }

  const parsed = createTeamSchema.safeParse({
    name: formData.get("name"),
    classroom: formData.get("classroom"),
    schoolClass: formData.get("schoolClass"),
    school: formData.get("school"),
    groupId: formData.get("groupId"),
    projectRole: formData.get("projectRole"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const token = createInviteToken();

  await db.transaction(async (tx) => {
    const [createdTeam] = await tx
      .insert(teams)
      .values({
        name: parsed.data.name,
        classroom: parsed.data.classroom,
        schoolClass: parsed.data.schoolClass,
        school: parsed.data.school,
        groupId: parsed.data.groupId,
      })
      .returning();

    await tx.insert(teamMembers).values({
      teamId: createdTeam.id,
      studentId: student.id,
      projectRole: parsed.data.projectRole,
    });

    await tx.insert(teamInvites).values({
      teamId: createdTeam.id,
      token,
      invitedByUserId: session.user.id,
      expiresAt: getInviteExpiryDate(),
    });
  });

  redirect(`/${locale}/dashboard/student/team`);
}

export async function updateTeamNameAction(
  locale: string,
  teamId: string,
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  await requireStudentTeamMember(teamId);

  const parsed = updateTeamNameSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  await db
    .update(teams)
    .set({
      name: parsed.data.name,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));

  redirect(`/${locale}/dashboard/student/team?updated=1`);
}

export async function updateTeamDetailsAction(
  locale: string,
  teamId: string,
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
    return { error: "forbidden" };
  }

  const team = await getTeamById(teamId);

  if (!team) {
    return { error: "team_not_found" };
  }

  const parsed = updateTeamSchema.safeParse({
    name: formData.get("name"),
    classroom: formData.get("classroom"),
    schoolClass: formData.get("schoolClass"),
    school: formData.get("school"),
    groupId: formData.get("groupId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  await db
    .update(teams)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));

  if (session.user.role === "ADMIN") {
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/${locale}/dashboard/admin/teams`);
    revalidatePath(`/${locale}/dashboard/admin/teams/${teamId}`);
  }

  return { success: "team_updated" };
}

export async function generateInviteLinkAction(
  locale: string,
  teamId: string,
  _prevState?: TeamActionState,
  _formData?: FormData,
): Promise<TeamActionState> {
  const { session } = await requireStudentTeamMember(teamId);
  const token = createInviteToken();

  await db.insert(teamInvites).values({
    teamId,
    token,
    invitedByUserId: session.user.id,
    expiresAt: getInviteExpiryDate(),
  });

  return {
    success: "invite_created",
    inviteUrl: buildTeamJoinUrl(locale, token),
  };
}

export async function inviteByEmailAction(
  locale: string,
  teamId: string,
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const { session } = await requireStudentTeamMember(teamId);
  const team = await getTeamById(teamId);

  if (!team) {
    return { error: "team_not_found" };
  }

  const parsed = inviteEmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const members = await getMemberRoles(teamId);

  if (members.length >= MAX_TEAM_SIZE) {
    return { error: "team_full" };
  }

  const token = createInviteToken();

  await db.insert(teamInvites).values({
    teamId,
    token,
    email: parsed.data.email.toLowerCase(),
    invitedByUserId: session.user.id,
    expiresAt: getInviteExpiryDate(),
  });

  await sendTeamInviteEmail({
    to: parsed.data.email,
    teamName: team.name,
    token,
    locale,
  });

  return { success: "invite_sent" };
}

export async function joinTeamAction(
  locale: string,
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const { session, student } = await requireStudentUser();
  const existingMembership = await getTeamMembershipForStudent(student.id);

  if (existingMembership) {
    return { error: "already_in_team" };
  }

  const parsed = joinTeamSchema.safeParse({
    token: formData.get("token"),
    projectRole: formData.get("projectRole"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const inviteRecord = await getInviteByToken(parsed.data.token);

  if (!inviteRecord) {
    return { error: "invalid_token" };
  }

  if (isInviteExpired(inviteRecord.invite.expiresAt)) {
    return { error: "token_expired" };
  }

  if (
    inviteRecord.invite.email &&
    inviteRecord.invite.email !== session.user.email?.toLowerCase()
  ) {
    return { error: "email_mismatch" };
  }

  const currentMembers = await getMemberRoles(inviteRecord.team.id);
  const roleValidation = validateJoinMemberRole(currentMembers, parsed.data.projectRole);

  if (!roleValidation.valid) {
    return { error: roleValidation.errorKey ?? "role_not_allowed" };
  }

  await db.insert(teamMembers).values({
    teamId: inviteRecord.team.id,
    studentId: student.id,
    projectRole: parsed.data.projectRole,
  });

  redirect(`/${locale}/dashboard/student/team?joined=1`);
}
