"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/db";
import { clients, teamMembers, teamMentors, teams } from "@/db/schema";
import { getMemberRoles, getTeamById, getTeamMembershipForStudent } from "@/lib/teams/queries";
import { ALL_PROJECT_ROLES, MAX_TEAM_SIZE } from "@/lib/validations/team";
import { canManageUsers } from "@/lib/permissions";
import {
  addTeamMemberSchema,
  assignTeamClientSchema,
  assignTeamMentorSchema,
  deleteTeamSchema,
  removeTeamMemberSchema,
  removeTeamMentorSchema,
  updateTeamMemberRoleSchema,
  type AdminTeamActionState,
} from "@/lib/validations/admin-team";

async function requireAdmin(): Promise<{ userId: string } | null> {
  const session = await auth();

  if (!session?.user || !canManageUsers(session.user.role)) {
    return null;
  }

  return { userId: session.user.id };
}

function revalidateAdminTeamPaths(locale: string, teamId: string) {
  revalidatePath(`/${locale}/dashboard/admin/teams`);
  revalidatePath(`/${locale}/dashboard/admin/teams/${teamId}`);
}

export async function assignTeamClientAction(
  locale: string,
  teamId: string,
  _prevState: AdminTeamActionState,
  formData: FormData,
): Promise<AdminTeamActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const team = await getTeamById(teamId);

  if (!team) {
    return { error: "team_not_found" };
  }

  const parsed = assignTeamClientSchema.safeParse({
    clientId: formData.get("clientId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  await db
    .update(teams)
    .set({
      clientId: parsed.data.clientId,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));

  revalidateAdminTeamPaths(locale, teamId);

  if (parsed.data.clientId) {
    const [client] = await db
      .select({ userId: clients.userId })
      .from(clients)
      .where(eq(clients.id, parsed.data.clientId))
      .limit(1);

    if (client) {
      revalidatePath(`/${locale}/dashboard/admin/users/${client.userId}`);
    }
  }

  return { success: "client_updated" };
}

export async function assignTeamMentorAction(
  locale: string,
  teamId: string,
  _prevState: AdminTeamActionState,
  formData: FormData,
): Promise<AdminTeamActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const team = await getTeamById(teamId);

  if (!team) {
    return { error: "team_not_found" };
  }

  const parsed = assignTeamMentorSchema.safeParse({
    mentorId: formData.get("mentorId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const [existing] = await db
    .select({ id: teamMentors.id })
    .from(teamMentors)
    .where(and(eq(teamMentors.teamId, teamId), eq(teamMentors.mentorId, parsed.data.mentorId)))
    .limit(1);

  if (existing) {
    return { error: "mentor_already_assigned" };
  }

  await db.insert(teamMentors).values({
    teamId,
    mentorId: parsed.data.mentorId,
  });

  revalidateAdminTeamPaths(locale, teamId);
  return { success: "mentor_assigned" };
}

export async function removeTeamMentorAction(
  locale: string,
  teamId: string,
  _prevState: AdminTeamActionState,
  formData: FormData,
): Promise<AdminTeamActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = removeTeamMentorSchema.safeParse({
    teamMentorId: formData.get("teamMentorId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  await db
    .delete(teamMentors)
    .where(and(eq(teamMentors.id, parsed.data.teamMentorId), eq(teamMentors.teamId, teamId)));

  revalidateAdminTeamPaths(locale, teamId);
  return { success: "mentor_removed" };
}

export async function addTeamMemberAction(
  locale: string,
  teamId: string,
  _prevState: AdminTeamActionState,
  formData: FormData,
): Promise<AdminTeamActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const team = await getTeamById(teamId);

  if (!team) {
    return { error: "team_not_found" };
  }

  const parsed = addTeamMemberSchema.safeParse({
    studentId: formData.get("studentId"),
    projectRole: formData.get("projectRole"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  if (!ALL_PROJECT_ROLES.includes(parsed.data.projectRole)) {
    return { error: "role_not_allowed" };
  }

  const currentMembers = await getMemberRoles(teamId);

  if (currentMembers.length >= MAX_TEAM_SIZE) {
    return { error: "team_full" };
  }

  const existingMembership = await getTeamMembershipForStudent(parsed.data.studentId);

  if (existingMembership) {
    return { error: "student_already_in_team" };
  }

  await db.insert(teamMembers).values({
    teamId,
    studentId: parsed.data.studentId,
    projectRole: parsed.data.projectRole,
  });

  revalidateAdminTeamPaths(locale, teamId);
  return { success: "member_added" };
}

export async function updateTeamMemberRoleAction(
  locale: string,
  teamId: string,
  _prevState: AdminTeamActionState,
  formData: FormData,
): Promise<AdminTeamActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = updateTeamMemberRoleSchema.safeParse({
    memberId: formData.get("memberId"),
    projectRole: formData.get("projectRole"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  if (!ALL_PROJECT_ROLES.includes(parsed.data.projectRole)) {
    return { error: "role_not_allowed" };
  }

  const [member] = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(and(eq(teamMembers.id, parsed.data.memberId), eq(teamMembers.teamId, teamId)))
    .limit(1);

  if (!member) {
    return { error: "member_not_found" };
  }

  await db
    .update(teamMembers)
    .set({
      projectRole: parsed.data.projectRole,
      updatedAt: new Date(),
    })
    .where(eq(teamMembers.id, parsed.data.memberId));

  revalidateAdminTeamPaths(locale, teamId);
  return { success: "member_role_updated" };
}

export async function removeTeamMemberAction(
  locale: string,
  teamId: string,
  _prevState: AdminTeamActionState,
  formData: FormData,
): Promise<AdminTeamActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = removeTeamMemberSchema.safeParse({
    memberId: formData.get("memberId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const [member] = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(and(eq(teamMembers.id, parsed.data.memberId), eq(teamMembers.teamId, teamId)))
    .limit(1);

  if (!member) {
    return { error: "member_not_found" };
  }

  await db.delete(teamMembers).where(eq(teamMembers.id, parsed.data.memberId));

  revalidateAdminTeamPaths(locale, teamId);
  return { success: "member_removed" };
}

export async function deleteAdminTeamAction(
  locale: string,
  _prevState: AdminTeamActionState,
  formData: FormData,
): Promise<AdminTeamActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = deleteTeamSchema.safeParse({
    teamId: formData.get("teamId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const team = await getTeamById(parsed.data.teamId);

  if (!team) {
    return { error: "team_not_found" };
  }

  await db.delete(teams).where(eq(teams.id, parsed.data.teamId));

  revalidatePath(`/${locale}/dashboard/admin/teams`);
  revalidatePath(`/${locale}/dashboard/mentor/teams`);
  revalidatePath(`/${locale}/dashboard/client/teams`);

  if (team.clientId) {
    const [client] = await db
      .select({ userId: clients.userId })
      .from(clients)
      .where(eq(clients.id, team.clientId))
      .limit(1);

    if (client) {
      revalidatePath(`/${locale}/dashboard/admin/users/${client.userId}`);
    }
  }

  redirect(`/${locale}/dashboard/admin/teams`);
}
