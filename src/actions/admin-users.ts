"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createUserByAdmin,
  getUserByEmail,
  getUserById,
  markEmailVerified,
  resetUserPassword,
} from "@/lib/auth/users";
import { hashPassword } from "@/lib/password";
import { canManageUsers } from "@/lib/permissions";
import { approveMentor } from "@/lib/mentors/approval";
import { getMentorByUserId } from "@/lib/mentors/queries";
import { ensureUserProfileForRole } from "@/lib/users/admin";
import { countAdmins } from "@/lib/users/queries";
import {
  adminUserIdSchema,
  createAdminUserSchema,
  resetAdminUserPasswordSchema,
  updateAdminUserDetailsSchema,
  updateAdminUserRoleSchema,
  type AdminUserActionState,
} from "@/lib/validations/admin-user";

async function requireAdmin() {
  const session = await auth();
  return session?.user && canManageUsers(session.user.role) ? session : null;
}

function revalidateUserPaths(locale: string, userId?: string) {
  revalidatePath(`/${locale}/dashboard/admin/users`);
  if (userId) {
    revalidatePath(`/${locale}/dashboard/admin/users/${userId}`);
  }
}

export async function createAdminUserAction(
  locale: string,
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = createAdminUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
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

  await createUserByAdmin({
    email: parsed.data.email,
    passwordHash,
    name: parsed.data.name,
    role: parsed.data.role,
    organizationName: parsed.data.organizationName,
  });

  revalidateUserPaths(locale);
  return { success: "user_created" };
}

export async function updateAdminUserDetailsAction(
  locale: string,
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { error: "forbidden" };
  }

  const parsed = updateAdminUserDetailsSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const user = await getUserById(parsed.data.userId);

  if (!user) {
    return { error: "user_not_found" };
  }

  const emailTaken = await getUserByEmail(parsed.data.email);

  if (emailTaken && emailTaken.id !== parsed.data.userId) {
    return { error: "email_exists" };
  }

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, parsed.data.userId));

  revalidateUserPaths(locale, parsed.data.userId);
  return { success: "user_updated" };
}

export async function updateAdminUserRoleAction(
  locale: string,
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { error: "forbidden" };
  }

  const parsed = updateAdminUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const user = await getUserById(parsed.data.userId);

  if (!user) {
    return { error: "user_not_found" };
  }

  if (user.id === session.user.id && parsed.data.role !== "ADMIN") {
    return { error: "cannot_change_own_role" };
  }

  if (user.role === "ADMIN" && parsed.data.role !== "ADMIN") {
    const remainingAdmins = await countAdmins(user.id);

    if (remainingAdmins === 0) {
      return { error: "last_admin" };
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        role: parsed.data.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parsed.data.userId));

    await ensureUserProfileForRole(
      parsed.data.userId,
      parsed.data.role,
      parsed.data.organizationName,
      tx,
    );
  });

  revalidateUserPaths(locale, parsed.data.userId);
  return { success: "role_updated" };
}

export async function verifyAdminUserEmailAction(
  locale: string,
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = adminUserIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const user = await getUserById(parsed.data.userId);

  if (!user) {
    return { error: "user_not_found" };
  }

  await markEmailVerified(parsed.data.userId);

  revalidateUserPaths(locale, parsed.data.userId);
  return { success: "email_verified" };
}

export async function approveAdminMentorAction(
  locale: string,
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = adminUserIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const user = await getUserById(parsed.data.userId);

  if (!user) {
    return { error: "user_not_found" };
  }

  if (user.role !== "MENTOR") {
    return { error: "not_a_mentor" };
  }

  const mentor = await getMentorByUserId(parsed.data.userId);

  if (!mentor) {
    return { error: "user_not_found" };
  }

  if (mentor.approvedAt) {
    return { success: "mentor_approved" };
  }

  await approveMentor(parsed.data.userId);

  revalidateUserPaths(locale, parsed.data.userId);
  revalidatePath(`/${locale}/dashboard/admin/mentors`);
  return { success: "mentor_approved" };
}

export async function resetAdminUserPasswordAction(
  locale: string,
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = resetAdminUserPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const user = await getUserById(parsed.data.userId);

  if (!user) {
    return { error: "user_not_found" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await resetUserPassword(parsed.data.userId, passwordHash);

  revalidateUserPaths(locale, parsed.data.userId);
  return { success: "password_reset" };
}

export async function disableAdminUserAction(
  locale: string,
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { error: "forbidden" };
  }

  const parsed = adminUserIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  if (parsed.data.userId === session.user.id) {
    return { error: "cannot_disable_self" };
  }

  const user = await getUserById(parsed.data.userId);

  if (!user) {
    return { error: "user_not_found" };
  }

  if (user.disabledAt) {
    return { success: "user_disabled" };
  }

  if (user.role === "ADMIN") {
    const adminRows = await db
      .select({ id: users.id, disabledAt: users.disabledAt })
      .from(users)
      .where(eq(users.role, "ADMIN"));

    const activeCount = adminRows.filter(
      (row) => row.id !== parsed.data.userId && !row.disabledAt,
    ).length;

    if (activeCount === 0) {
      return { error: "last_admin" };
    }
  }

  await db
    .update(users)
    .set({
      disabledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, parsed.data.userId));

  revalidateUserPaths(locale, parsed.data.userId);
  return { success: "user_disabled" };
}

export async function enableAdminUserAction(
  locale: string,
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = adminUserIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const user = await getUserById(parsed.data.userId);

  if (!user) {
    return { error: "user_not_found" };
  }

  await db
    .update(users)
    .set({
      disabledAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, parsed.data.userId));

  revalidateUserPaths(locale, parsed.data.userId);
  return { success: "user_enabled" };
}

export async function deleteAdminUserAction(
  locale: string,
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { error: "forbidden" };
  }

  const parsed = adminUserIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  if (parsed.data.userId === session.user.id) {
    return { error: "cannot_delete_self" };
  }

  const user = await getUserById(parsed.data.userId);

  if (!user) {
    return { error: "user_not_found" };
  }

  if (user.role === "ADMIN") {
    const remainingAdmins = await countAdmins(user.id);

    if (remainingAdmins === 0) {
      return { error: "last_admin" };
    }
  }

  await db.delete(users).where(eq(users.id, parsed.data.userId));

  revalidateUserPaths(locale);
  redirect(`/${locale}/dashboard/admin/users`);
}
