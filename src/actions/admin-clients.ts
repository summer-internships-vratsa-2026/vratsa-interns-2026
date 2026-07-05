"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { clients, teams } from "@/db/schema";
import { createClientUser, getUserByEmail } from "@/lib/auth/users";
import { hashPassword } from "@/lib/password";
import {
  assignClientTeamSchema,
  createClientSchema,
  removeClientTeamSchema,
  updateClientOrganizationSchema,
  type AdminClientActionState,
} from "@/lib/validations/admin-client";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

async function revalidateClientPaths(locale: string, clientId: string, teamId?: string) {
  const [client] = await db
    .select({ userId: clients.userId })
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  revalidatePath(`/${locale}/dashboard/admin/clients`);
  revalidatePath(`/${locale}/dashboard/admin/users`);
  revalidatePath(`/${locale}/dashboard/admin/teams`);

  if (client) {
    revalidatePath(`/${locale}/dashboard/admin/users/${client.userId}`);
    revalidatePath(`/${locale}/dashboard/client/teams`);
  }

  if (teamId) {
    revalidatePath(`/${locale}/dashboard/admin/teams/${teamId}`);
    revalidatePath(`/${locale}/dashboard/client/teams/${teamId}`);
  }
}

export async function createClientAction(
  locale: string,
  _prevState: AdminClientActionState,
  formData: FormData,
): Promise<AdminClientActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = createClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const existingUser = await getUserByEmail(parsed.data.email);

  if (existingUser) {
    return { error: "email_exists" };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await createClientUser({
    email: parsed.data.email,
    passwordHash,
    name: parsed.data.name,
    organizationName: parsed.data.organizationName,
  });

  revalidatePath(`/${locale}/dashboard/admin/clients`);
  revalidatePath(`/${locale}/dashboard/admin/teams`);

  return { success: "client_created" };
}

export async function updateClientOrganizationAction(
  locale: string,
  _prevState: AdminClientActionState,
  formData: FormData,
): Promise<AdminClientActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = updateClientOrganizationSchema.safeParse({
    clientId: formData.get("clientId"),
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.id, parsed.data.clientId))
    .limit(1);

  if (!client) {
    return { error: "client_not_found" };
  }

  await db
    .update(clients)
    .set({
      organizationName: parsed.data.organizationName,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, parsed.data.clientId));

  revalidatePath(`/${locale}/dashboard/admin/clients`);
  revalidatePath(`/${locale}/dashboard/admin/teams`);

  return { success: "client_updated" };
}

export async function assignClientTeamAction(
  locale: string,
  _prevState: AdminClientActionState,
  formData: FormData,
): Promise<AdminClientActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = assignClientTeamSchema.safeParse({
    clientId: formData.get("clientId"),
    teamId: formData.get("teamId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.id, parsed.data.clientId))
    .limit(1);

  if (!client) {
    return { error: "client_not_found" };
  }

  const [team] = await db
    .select({ id: teams.id, clientId: teams.clientId })
    .from(teams)
    .where(eq(teams.id, parsed.data.teamId))
    .limit(1);

  if (!team) {
    return { error: "team_not_found" };
  }

  if (team.clientId) {
    return { error: "team_already_assigned" };
  }

  await db
    .update(teams)
    .set({
      clientId: parsed.data.clientId,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, parsed.data.teamId));

  await revalidateClientPaths(locale, parsed.data.clientId, parsed.data.teamId);
  return { success: "team_assigned" };
}

export async function removeClientTeamAction(
  locale: string,
  _prevState: AdminClientActionState,
  formData: FormData,
): Promise<AdminClientActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = removeClientTeamSchema.safeParse({
    clientId: formData.get("clientId"),
    teamId: formData.get("teamId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const [team] = await db
    .select({ id: teams.id })
    .from(teams)
    .where(and(eq(teams.id, parsed.data.teamId), eq(teams.clientId, parsed.data.clientId)))
    .limit(1);

  if (!team) {
    return { error: "team_not_assigned" };
  }

  await db
    .update(teams)
    .set({
      clientId: null,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, parsed.data.teamId));

  await revalidateClientPaths(locale, parsed.data.clientId, parsed.data.teamId);
  return { success: "team_removed" };
}
