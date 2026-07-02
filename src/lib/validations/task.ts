import { z } from "zod";

import type { ProjectRole } from "@/db/schema/enums";

export const projectRoleSchema = z.enum([
  "SOFTWARE_DEVELOPER",
  "MARKETING_EXPERT",
  "PRODUCT_OWNER",
]);

export const submissionUrlsSchema = z.array(z.string().url()).default([]);

export const taskTargetRolesSchema = z.object({
  targetAllRoles: z.boolean(),
  targetRoles: z.array(projectRoleSchema).optional(),
});

export function isRoleEligibleForTask(
  role: ProjectRole,
  task: { targetAllRoles: boolean; targetRoles: ProjectRole[] | null },
): boolean {
  if (task.targetAllRoles) {
    return true;
  }

  return task.targetRoles?.includes(role) ?? false;
}
