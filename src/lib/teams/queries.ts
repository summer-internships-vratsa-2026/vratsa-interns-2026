import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { groups, students, teamInvites, teamMembers, teams, users } from "@/db/schema";
import type { ProjectRole } from "@/db/schema/enums";
import { INTERNSHIP_GROUP_NAMES } from "@/lib/teams/constants";

export async function getStudentByUserId(userId: string) {
  const [student] = await db.select().from(students).where(eq(students.userId, userId)).limit(1);
  return student ?? null;
}

export async function getInternshipGroups() {
  const allGroups = await db
    .select()
    .from(groups)
    .where(inArray(groups.name, [...INTERNSHIP_GROUP_NAMES]));

  const order = new Map(INTERNSHIP_GROUP_NAMES.map((name, index) => [name, index]));

  return allGroups.sort(
    (a, b) => (order.get(a.name as (typeof INTERNSHIP_GROUP_NAMES)[number]) ?? 0) -
      (order.get(b.name as (typeof INTERNSHIP_GROUP_NAMES)[number]) ?? 0),
  );
}

export async function getTeamMembershipForStudent(studentId: string) {
  const [membership] = await db
    .select({
      member: teamMembers,
      team: teams,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.studentId, studentId))
    .limit(1);

  return membership ?? null;
}

export async function getTeamMembersWithNames(teamId: string) {
  return db
    .select({
      id: teamMembers.id,
      projectRole: teamMembers.projectRole,
      studentId: teamMembers.studentId,
      name: users.name,
      email: users.email,
    })
    .from(teamMembers)
    .innerJoin(students, eq(teamMembers.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));
}

export async function getTeamById(teamId: string) {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  return team ?? null;
}

export async function getInviteByToken(token: string) {
  const [invite] = await db
    .select({
      invite: teamInvites,
      team: teams,
    })
    .from(teamInvites)
    .innerJoin(teams, eq(teamInvites.teamId, teams.id))
    .where(eq(teamInvites.token, token))
    .limit(1);

  return invite ?? null;
}

export async function getActiveInvitesForTeam(teamId: string) {
  return db.select().from(teamInvites).where(eq(teamInvites.teamId, teamId));
}

export async function getMemberRoles(teamId: string): Promise<Array<{ projectRole: ProjectRole }>> {
  return db
    .select({ projectRole: teamMembers.projectRole })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));
}

export async function isStudentInTeam(studentId: string, teamId: string) {
  const [member] = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(and(eq(teamMembers.studentId, studentId), eq(teamMembers.teamId, teamId)))
    .limit(1);

  return !!member;
}

export async function getGroupName(groupId: string) {
  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  return group?.name ?? null;
}
