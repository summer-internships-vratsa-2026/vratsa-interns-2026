import { z } from "zod";

import { isRichTextEmpty, sanitizeTaskDescription } from "@/lib/rich-text";
import { projectRoleSchema, taskResponseTypeSchema, type TaskResponseType } from "@/lib/validations/task";

const richTextDescriptionSchema = z
  .string()
  .transform(sanitizeTaskDescription)
  .refine((value) => !isRichTextEmpty(value), { message: "description_required" });

export const taskTargetModeSchema = z.enum(["all_roles", "selected_roles", "one_per_team"]);

export type TaskTargetMode = z.infer<typeof taskTargetModeSchema>;

function parseDeadline(value: string): Date | undefined {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

const targetRolesField = z
  .union([z.array(projectRoleSchema), projectRoleSchema])
  .optional()
  .transform((value) => {
    if (!value) {
      return [] as Array<z.infer<typeof projectRoleSchema>>;
    }

    return Array.isArray(value) ? value : [value];
  });

const responseTypesField = z
  .union([z.array(taskResponseTypeSchema), taskResponseTypeSchema])
  .optional()
  .transform((value) => {
    if (!value) {
      return [] as TaskResponseType[];
    }

    return Array.isArray(value) ? value : [value];
  });

export function parseTaskTargetInput(input: {
  targetMode: TaskTargetMode;
  targetRoles: Array<z.infer<typeof projectRoleSchema>>;
}) {
  if (input.targetMode === "all_roles") {
    return {
      targetAllRoles: true,
      onePerTeam: false,
      targetRoles: null,
    };
  }

  if (input.targetMode === "one_per_team") {
    return {
      targetAllRoles: true,
      onePerTeam: true,
      targetRoles: null,
    };
  }

  return {
    targetAllRoles: false,
    onePerTeam: false,
    targetRoles: input.targetRoles,
  };
}

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(2).max(255),
    description: richTextDescriptionSchema,
    deadline: z.string().min(1).transform(parseDeadline),
    targetMode: taskTargetModeSchema,
    targetRoles: targetRolesField,
    responseTypes: responseTypesField,
    assignAllGroups: z
      .union([z.literal("true"), z.literal("false"), z.boolean()])
      .optional()
      .transform((value) => value === true || value === "true"),
    groupIds: z
      .union([z.uuid(), z.array(z.uuid())])
      .optional()
      .transform((value) => {
        if (!value) {
          return [] as string[];
        }

        return Array.isArray(value) ? value : [value];
      }),
  })
  .superRefine((data, ctx) => {
    if (!data.deadline) {
      ctx.addIssue({ code: "custom", message: "invalid_deadline", path: ["deadline"] });
    }

    if (data.targetMode === "selected_roles" && data.targetRoles.length === 0) {
      ctx.addIssue({ code: "custom", message: "roles_required", path: ["targetRoles"] });
    }

    if (data.responseTypes.length === 0) {
      ctx.addIssue({ code: "custom", message: "response_types_required", path: ["responseTypes"] });
    }
  });

export const applyTaskSchema = z.object({
  sourceTaskId: z.uuid(),
  sourceGroupId: z.uuid(),
  deadline: z
    .string()
    .min(1)
    .transform(parseDeadline)
    .refine((value): value is Date => value instanceof Date, { message: "invalid_deadline" }),
});

export type TaskActionState = {
  error?: string;
  success?: string;
};

export function toDatetimeLocalValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function defaultDeadlineLocal(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(23, 59, 0, 0);
  return toDatetimeLocalValue(date);
}
