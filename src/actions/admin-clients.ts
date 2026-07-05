"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { createClientUser, getUserByEmail } from "@/lib/auth/users";
import { hashPassword } from "@/lib/password";
import {
  createClientSchema,
  updateClientOrganizationSchema,
  type AdminClientActionState,
} from "@/lib/validations/admin-client";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
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
