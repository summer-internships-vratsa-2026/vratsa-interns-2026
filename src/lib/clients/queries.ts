import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, groups, teams, users } from "@/db/schema";

export async function getClientByUserId(userId: string) {
  const [client] = await db.select().from(clients).where(eq(clients.userId, userId)).limit(1);
  return client ?? null;
}

export async function isClientAssignedToTeam(userId: string, teamId: string) {
  const client = await getClientByUserId(userId);

  if (!client) {
    return false;
  }

  const [assigned] = await db
    .select({ id: teams.id })
    .from(teams)
    .where(and(eq(teams.id, teamId), eq(teams.clientId, client.id)))
    .limit(1);

  return !!assigned;
}

export async function getClientTeamsByUserId(userId: string) {
  const client = await getClientByUserId(userId);

  if (!client) {
    return [];
  }

  return db
    .select({
      id: teams.id,
      name: teams.name,
      groupId: teams.groupId,
      classroom: teams.classroom,
      schoolClass: teams.schoolClass,
      school: teams.school,
    })
    .from(teams)
    .where(eq(teams.clientId, client.id))
    .orderBy(teams.name);
}

export async function getClientTeamsWithGroups(clientId: string) {
  return db
    .select({
      id: teams.id,
      name: teams.name,
      groupName: groups.name,
      classroom: teams.classroom,
      schoolClass: teams.schoolClass,
      school: teams.school,
    })
    .from(teams)
    .innerJoin(groups, eq(teams.groupId, groups.id))
    .where(eq(teams.clientId, clientId))
    .orderBy(teams.name);
}

export async function getTeamsAvailableForClientAssignment() {
  return db
    .select({
      id: teams.id,
      name: teams.name,
      groupName: groups.name,
    })
    .from(teams)
    .innerJoin(groups, eq(teams.groupId, groups.id))
    .where(isNull(teams.clientId))
    .orderBy(teams.name);
}

export async function getClientsWithTeamCounts() {
  return db
    .select({
      id: clients.id,
      userId: clients.userId,
      name: users.name,
      email: users.email,
      organizationName: clients.organizationName,
      teamCount: sql<number>`count(${teams.id})`.mapWith(Number),
    })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))
    .leftJoin(teams, eq(teams.clientId, clients.id))
    .groupBy(clients.id, users.id, users.name, users.email, clients.organizationName)
    .orderBy(users.name);
}

export type ClientProfile = NonNullable<Awaited<ReturnType<typeof getClientByUserId>>>;
