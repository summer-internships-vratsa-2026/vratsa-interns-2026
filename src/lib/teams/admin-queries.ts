import { and, eq, exists, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  groups,
  mentors,
  students,
  teamMembers,
  teamMentors,
  teams,
  users,
} from "@/db/schema";
import type { ProjectRole } from "@/db/schema/enums";
import type { TeamSocialUrls } from "@/db/schema/teams";
import type { School } from "@/db/schema/enums";

export type AdminTeamFilters = {
  groupId?: string;
  school?: School;
  schoolClass?: string;
  mentorId?: string;
  clientId?: string;
};

export async function getAdminTeamsList(filters: AdminTeamFilters = {}) {
  const conditions = [];

  if (filters.groupId) {
    conditions.push(eq(teams.groupId, filters.groupId));
  }

  if (filters.school) {
    conditions.push(eq(teams.school, filters.school));
  }

  if (filters.schoolClass) {
    conditions.push(eq(teams.schoolClass, filters.schoolClass));
  }

  if (filters.clientId) {
    conditions.push(eq(teams.clientId, filters.clientId));
  }

  if (filters.mentorId) {
    conditions.push(
      exists(
        db
          .select({ id: teamMentors.id })
          .from(teamMentors)
          .where(
            and(eq(teamMentors.teamId, teams.id), eq(teamMentors.mentorId, filters.mentorId)),
          ),
      ),
    );
  }

  const rows = await db
    .select({
      id: teams.id,
      name: teams.name,
      classroom: teams.classroom,
      schoolClass: teams.schoolClass,
      school: teams.school,
      groupName: groups.name,
      githubRepoUrl: teams.githubRepoUrl,
      projectUrl: teams.projectUrl,
      socialUrls: teams.socialUrls,
      memberCount: sql<number>`count(${teamMembers.id})`.mapWith(Number),
    })
    .from(teams)
    .innerJoin(groups, eq(teams.groupId, groups.id))
    .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(
      teams.id,
      teams.name,
      teams.classroom,
      teams.schoolClass,
      teams.school,
      teams.githubRepoUrl,
      teams.projectUrl,
      teams.socialUrls,
      groups.name,
    )
    .orderBy(teams.name);

  return rows.map((row) => ({
    ...row,
    socialUrls: row.socialUrls as TeamSocialUrls | null,
  }));
}

export type AdminTeamMemberSummary = {
  name: string;
  projectRole: ProjectRole;
};

export async function getAdminTeamMembersByTeamIds(teamIds: string[]) {
  if (teamIds.length === 0) {
    return {} as Record<string, AdminTeamMemberSummary[]>;
  }

  const rows = await db
    .select({
      teamId: teamMembers.teamId,
      name: users.name,
      projectRole: teamMembers.projectRole,
    })
    .from(teamMembers)
    .innerJoin(students, eq(teamMembers.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(inArray(teamMembers.teamId, teamIds))
    .orderBy(users.name);

  const grouped: Record<string, AdminTeamMemberSummary[]> = {};

  for (const row of rows) {
    if (!grouped[row.teamId]) {
      grouped[row.teamId] = [];
    }

    grouped[row.teamId].push({
      name: row.name,
      projectRole: row.projectRole,
    });
  }

  return grouped;
}

export async function getAdminTeamDetail(teamId: string) {
  const [teamRow] = await db
    .select({
      team: teams,
      groupName: groups.name,
      clientOrganization: clients.organizationName,
      clientUserName: users.name,
    })
    .from(teams)
    .innerJoin(groups, eq(teams.groupId, groups.id))
    .leftJoin(clients, eq(teams.clientId, clients.id))
    .leftJoin(users, eq(clients.userId, users.id))
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!teamRow) {
    return null;
  }

  const [members, assignedMentors] = await Promise.all([
    db
      .select({
        id: teamMembers.id,
        studentId: teamMembers.studentId,
        projectRole: teamMembers.projectRole,
        name: users.name,
        email: users.email,
      })
      .from(teamMembers)
      .innerJoin(students, eq(teamMembers.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(teamMembers.teamId, teamId)),
    db
      .select({
        id: teamMentors.id,
        mentorId: teamMentors.mentorId,
        name: users.name,
        email: users.email,
      })
      .from(teamMentors)
      .innerJoin(mentors, eq(teamMentors.mentorId, mentors.id))
      .innerJoin(users, eq(mentors.userId, users.id))
      .where(eq(teamMentors.teamId, teamId)),
  ]);

  return {
    ...teamRow,
    members,
    mentors: assignedMentors,
  };
}

export async function getAllMentorsWithNames() {
  return db
    .select({
      id: mentors.id,
      name: users.name,
      email: users.email,
      mainGroupId: mentors.mainGroupId,
    })
    .from(mentors)
    .innerJoin(users, eq(mentors.userId, users.id))
    .orderBy(users.name);
}

export async function getAllClientsWithNames() {
  return db
    .select({
      id: clients.id,
      name: users.name,
      email: users.email,
      organizationName: clients.organizationName,
    })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))
    .orderBy(users.name);
}

export async function getStudentsWithoutTeam() {
  return db
    .select({
      studentId: students.id,
      name: users.name,
      email: users.email,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .leftJoin(teamMembers, eq(teamMembers.studentId, students.id))
    .where(isNull(teamMembers.id))
    .orderBy(users.name);
}

export async function getAllGroups() {
  return db.select().from(groups).orderBy(groups.name);
}
