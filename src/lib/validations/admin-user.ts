import { z } from "zod";

const userRoleSchema = z.enum(["ADMIN", "MENTOR", "STUDENT", "CLIENT"]);

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: userRoleSchema,
  organizationName: z
    .union([z.string().trim().max(255), z.literal("")])
    .optional()
    .transform((value) => (value === "" ? null : value)),
});

export const updateAdminUserDetailsSchema = z.object({
  userId: z.uuid(),
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(255),
});

export const updateAdminUserRoleSchema = z.object({
  userId: z.uuid(),
  role: userRoleSchema,
  organizationName: z
    .union([z.string().trim().max(255), z.literal("")])
    .optional()
    .transform((value) => (value === "" ? null : value)),
});

export const adminUserIdSchema = z.object({
  userId: z.uuid(),
});

export const resetAdminUserPasswordSchema = z.object({
  userId: z.uuid(),
  password: z.string().min(8).max(128),
});

export type AdminUserActionState = {
  error?: string;
  success?: string;
};

export type UserListRoleFilter = z.infer<typeof userRoleSchema> | "all";

export function parseUserListRoleFilter(value: string | undefined): UserListRoleFilter {
  if (value === "ADMIN" || value === "MENTOR" || value === "STUDENT" || value === "CLIENT") {
    return value;
  }

  return "all";
}
