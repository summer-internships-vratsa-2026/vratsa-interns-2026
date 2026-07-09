import { z } from "zod";

import type { ProjectRole } from "@/db/schema/enums";

export const projectRoleSchema = z.enum([
  "SOFTWARE_DEVELOPER",
  "MARKETING_EXPERT",
  "PRODUCT_OWNER",
]);

export const TASK_RESPONSE_TYPES = ["URL", "TEXT"] as const;

export type TaskResponseType = (typeof TASK_RESPONSE_TYPES)[number];

export const taskResponseTypeSchema = z.enum(TASK_RESPONSE_TYPES);

export const submissionUrlsSchema = z.array(z.string().url()).default([]);

export const taskTargetRolesSchema = z.object({
  targetAllRoles: z.boolean(),
  targetRoles: z.array(projectRoleSchema).optional(),
});

export function isRoleEligibleForTask(
  role: ProjectRole,
  task: {
    targetAllRoles: boolean;
    onePerTeam?: boolean;
    targetRoles: ProjectRole[] | null;
  },
): boolean {
  if (task.onePerTeam || task.targetAllRoles) {
    return true;
  }

  return task.targetRoles?.includes(role) ?? false;
}
