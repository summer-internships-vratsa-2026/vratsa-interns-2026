import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { clients, groups, mentors, students, teamMembers, teams, users } from "@/db/schema";
import type { UserRole } from "@/db/schema/enums";

export type UserListFilters = {
  role?: UserRole;
};

export type UserListRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerifiedAt: Date | null;
  disabledAt: Date | null;
  createdAt: Date;
  affiliation: string | null;
};

async function getAffiliationsByUserIds(userIds: string[], roles: UserRole[]) {
  const affiliationByUserId = new Map<string, string | null>();

  if (userIds.length === 0) {
    return affiliationByUserId;
  }

  const hasStudents = roles.includes("STUDENT");
  const hasMentors = roles.includes("MENTOR");
  const hasClients = roles.includes("CLIENT");

  const [studentRows, mentorRows, clientRows] = await Promise.all([
    hasStudents
      ? db
          .select({
            userId: users.id,
            teamName: teams.name,
          })
          .from(users)
          .innerJoin(students, eq(students.userId, users.id))
          .leftJoin(teamMembers, eq(teamMembers.studentId, students.id))
          .leftJoin(teams, eq(teams.id, teamMembers.teamId))
          .where(and(eq(users.role, "STUDENT"), inArray(users.id, userIds)))
      : Promise.resolve([]),
    hasMentors
      ? db
          .select({
            userId: users.id,
            groupName: groups.name,
          })
          .from(users)
          .innerJoin(mentors, eq(mentors.userId, users.id))
          .leftJoin(groups, eq(groups.id, mentors.mainGroupId))
          .where(and(eq(users.role, "MENTOR"), inArray(users.id, userIds)))
      : Promise.resolve([]),
    hasClients
      ? db
          .select({
            userId: users.id,
            organizationName: clients.organizationName,
          })
          .from(users)
          .innerJoin(clients, eq(clients.userId, users.id))
          .where(and(eq(users.role, "CLIENT"), inArray(users.id, userIds)))
      : Promise.resolve([]),
  ]);

  for (const row of studentRows) {
    affiliationByUserId.set(row.userId, row.teamName ?? null);
  }

  for (const row of mentorRows) {
    affiliationByUserId.set(row.userId, row.groupName ?? null);
  }

  for (const row of clientRows) {
    affiliationByUserId.set(row.userId, row.organizationName ?? null);
  }

  return affiliationByUserId;
}

export async function getUsersList(filters: UserListFilters = {}): Promise<UserListRow[]> {
  const conditions = filters.role ? [eq(users.role, filters.role)] : [];

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      disabledAt: users.disabledAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(users.name);

  const userIds = rows.map((row) => row.id);
  const roles = [...new Set(rows.map((row) => row.role))];
  const affiliations = await getAffiliationsByUserIds(userIds, roles);

  return rows.map((row) => ({
    ...row,
    affiliation: affiliations.get(row.id) ?? null,
  }));
}

export async function getUserAdminDetail(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}

export async function countAdmins(excludeUserId?: string) {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "ADMIN"));

  if (!excludeUserId) {
    return rows.length;
  }

  return rows.filter((row) => row.id !== excludeUserId).length;
}
