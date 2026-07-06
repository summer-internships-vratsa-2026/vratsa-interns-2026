import { z } from "zod";

import { isRichTextEmpty, sanitizeTaskDescription } from "@/lib/rich-text";
import { projectRoleSchema, taskResponseTypeSchema, type TaskResponseType } from "@/lib/validations/task";

const draftDescriptionSchema = z.preprocess(
  (value) => (value == null ? "" : value),
  z.string().transform(sanitizeTaskDescription),
);

export const taskPublishIntentSchema = z.enum(["draft", "publish"]);
const richTextDescriptionSchema = z.preprocess(
  (value) => (value == null ? "" : value),
  z
    .string()
    .transform(sanitizeTaskDescription)
    .refine((value) => !isRichTextEmpty(value), { message: "description_required" }),
);

const topicIdField = z.preprocess(
  (value) => (value == null || value === "" ? null : value),
  z.union([z.null(), z.uuid({ message: "topic_invalid" })]),
);

export const taskTargetModeSchema = z.enum(["all_roles", "selected_roles", "one_per_team"], {
  message: "invalid_target_mode",
});

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

export function resolveTaskStatusFromIntent(intent: "draft" | "publish"): "DRAFT" | "PUBLISHED" {
  return intent === "draft" ? "DRAFT" : "PUBLISHED";
}

export function resolveTaskTargetMode(task: {
  targetAllRoles: boolean;
  onePerTeam: boolean;
}): TaskTargetMode {
  if (task.onePerTeam) {
    return "one_per_team";
  }

  if (!task.targetAllRoles) {
    return "selected_roles";
  }

  return "all_roles";
}

const createTaskCoreFields = {
  title: z.preprocess(
    (value) => (value == null ? "" : value),
    z
      .string()
      .trim()
      .min(1, { message: "title_required" })
      .min(2, { message: "title_too_short" })
      .max(255, { message: "title_too_long" }),
  ),
  description: draftDescriptionSchema,
  deadline: z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().min(1, { message: "deadline_required" }).transform(parseDeadline),
  ),
  targetMode: taskTargetModeSchema,
  targetRoles: targetRolesField,
  responseTypes: responseTypesField,
  topicId: topicIdField,
  publishIntent: z.preprocess(
    (value) => (value === "draft" ? "draft" : "publish"),
    taskPublishIntentSchema,
  ),
} as const;

function refineCreateTaskCore(
  data: {
    deadline: Date | undefined;
    publishIntent: "draft" | "publish";
    description: string;
    targetMode: TaskTargetMode;
    targetRoles: Array<z.infer<typeof projectRoleSchema>>;
    responseTypes: TaskResponseType[];
  },
  ctx: z.RefinementCtx,
) {
  if (!data.deadline) {
    ctx.addIssue({ code: "custom", message: "invalid_deadline", path: ["deadline"] });
  }

  if (data.publishIntent === "publish" && isRichTextEmpty(data.description)) {
    ctx.addIssue({ code: "custom", message: "description_required", path: ["description"] });
  }

  if (data.targetMode === "selected_roles" && data.targetRoles.length === 0) {
    ctx.addIssue({ code: "custom", message: "roles_required", path: ["targetRoles"] });
  }

  if (data.responseTypes.length === 0) {
    ctx.addIssue({ code: "custom", message: "response_types_required", path: ["responseTypes"] });
  }
}

/** Mentors are always assigned to their main group server-side; no group picker on the form. */
export const createMentorTaskSchema = z
  .object(createTaskCoreFields)
  .superRefine((data, ctx) => refineCreateTaskCore(data, ctx));

export const createTaskSchema = z
  .object({
    ...createTaskCoreFields,
    assignAllGroups: z.preprocess(
      (value) => value === true || value === "true",
      z.boolean(),
    ),
    groupIds: z.preprocess(
      (value) => {
        if (value == null) {
          return [] as string[];
        }

        const values = Array.isArray(value) ? value : [value];

        return values.filter((item): item is string => typeof item === "string" && item.length > 0);
      },
      z.array(z.uuid({ message: "groups_invalid" })),
    ),
  })
  .superRefine((data, ctx) => {
    refineCreateTaskCore(data, ctx);

    if (!data.assignAllGroups && data.groupIds.length === 0) {
      ctx.addIssue({ code: "custom", message: "groups_required", path: ["groupIds"] });
    }
  });

export const updateTaskSchema = z
  .object({
    taskId: z.uuid(),
    groupId: z.uuid(),
    title: z.preprocess(
      (value) => (value == null ? "" : value),
      z
        .string()
        .trim()
        .min(1, { message: "title_required" })
        .min(2, { message: "title_too_short" })
        .max(255, { message: "title_too_long" }),
    ),
    description: draftDescriptionSchema,
    deadline: z.preprocess(
      (value) => (value == null ? "" : value),
      z.string().min(1, { message: "deadline_required" }).transform(parseDeadline),
    ),
    targetMode: taskTargetModeSchema,
    targetRoles: targetRolesField,
    responseTypes: responseTypesField,
    topicId: topicIdField,
    publishIntent: z.preprocess(
      (value) => (value === "draft" ? "draft" : "publish"),
      taskPublishIntentSchema,
    ),
  })
  .superRefine((data, ctx) => {
    if (!data.deadline) {
      ctx.addIssue({ code: "custom", message: "invalid_deadline", path: ["deadline"] });
    }

    if (data.publishIntent === "publish" && isRichTextEmpty(data.description)) {
      ctx.addIssue({ code: "custom", message: "description_required", path: ["description"] });
    }

    if (data.targetMode === "selected_roles" && data.targetRoles.length === 0) {
      ctx.addIssue({ code: "custom", message: "roles_required", path: ["targetRoles"] });
    }

    if (data.responseTypes.length === 0) {
      ctx.addIssue({ code: "custom", message: "response_types_required", path: ["responseTypes"] });
    }
  });

export const deleteTaskSchema = z.object({
  taskId: z.uuid(),
  groupId: z.uuid(),
});

export type DeleteTaskActionState = {
  error?: string;
  success?: string;
};

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
  fieldErrors?: Partial<Record<CreateTaskField, string>>;
  values?: CreateTaskFormValues;
  success?: string;
};

export type CreateTaskFormValues = {
  title: string;
  description: string;
  deadline: string;
  targetMode: TaskTargetMode;
  targetRoles: Array<z.infer<typeof projectRoleSchema>>;
  responseTypes: TaskResponseType[];
  topicId: string;
  publishIntent: "draft" | "publish";
  assignAllGroups: boolean;
  groupIds: string[];
};

export function getDefaultCreateTaskFormValues(): CreateTaskFormValues {
  return {
    title: "",
    description: "",
    deadline: defaultDeadlineLocal(),
    targetMode: "all_roles",
    targetRoles: [],
    responseTypes: ["URL"],
    topicId: "",
    publishIntent: "publish",
    assignAllGroups: false,
    groupIds: [],
  };
}

export function taskToFormValues(
  task: {
    title: string;
    description: string;
    targetAllRoles: boolean;
    onePerTeam: boolean;
    targetRoles: Array<z.infer<typeof projectRoleSchema>> | null;
    responseTypes: TaskResponseType[];
    topicId: string | null;
    status: "DRAFT" | "PUBLISHED";
  },
  deadline: Date,
): CreateTaskFormValues {
  return {
    title: task.title,
    description: task.description,
    deadline: toDatetimeLocalValue(deadline),
    targetMode: resolveTaskTargetMode(task),
    targetRoles: task.targetRoles ?? [],
    responseTypes: task.responseTypes,
    topicId: task.topicId ?? "",
    publishIntent: task.status === "DRAFT" ? "draft" : "publish",
    assignAllGroups: false,
    groupIds: [],
  };
}

export function extractCreateTaskFormValues(formData: FormData): CreateTaskFormValues {
  const targetMode = formData.get("targetMode");
  const publishIntent = formData.get("publishIntent");

  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    deadline: String(formData.get("deadline") ?? ""),
    targetMode:
      targetMode === "selected_roles" || targetMode === "one_per_team"
        ? targetMode
        : "all_roles",
    targetRoles: formData.getAll("targetRoles") as Array<z.infer<typeof projectRoleSchema>>,
    responseTypes: formData.getAll("responseTypes") as TaskResponseType[],
    topicId: String(formData.get("topicId") ?? ""),
    publishIntent: publishIntent === "draft" ? "draft" : "publish",
    assignAllGroups: formData.get("assignAllGroups") === "true",
    groupIds: formData.getAll("groupIds") as string[],
  };
}

export function extractUpdateTaskFormValues(formData: FormData): CreateTaskFormValues {
  return extractCreateTaskFormValues(formData);
}

function validationFailure(
  fieldErrors: Partial<Record<CreateTaskField, string>>,
  formData: FormData,
): TaskActionState {
  return {
    fieldErrors,
    values: extractCreateTaskFormValues(formData),
  };
}

export { validationFailure };

export type CreateTaskField =
  | "title"
  | "description"
  | "deadline"
  | "targetMode"
  | "targetRoles"
  | "responseTypes"
  | "topicId"
  | "groupIds";

export function mapCreateTaskFieldErrors(error: z.ZodError): Partial<Record<CreateTaskField, string>> {
  const fieldErrors: Partial<Record<CreateTaskField, string>> = {};
  const fallbackByField: Partial<Record<CreateTaskField, string>> = {
    title: "title_required",
    description: "description_required",
    deadline: "invalid_deadline",
    targetMode: "invalid_target_mode",
    targetRoles: "roles_required",
    responseTypes: "response_types_required",
    topicId: "topic_invalid",
    groupIds: "groups_required",
  };
  const fieldAliases: Record<string, CreateTaskField> = {
    assignAllGroups: "groupIds",
  };
  const messageAliases: Record<string, string> = {
    groups_invalid: "groups_invalid",
  };

  const validFields = new Set<CreateTaskField>([
    "title",
    "description",
    "deadline",
    "targetMode",
    "targetRoles",
    "responseTypes",
    "topicId",
    "groupIds",
  ]);

  for (const issue of error.issues) {
    const rawField = issue.path[0];

    if (typeof rawField !== "string") {
      continue;
    }

    const field = fieldAliases[rawField] ?? (validFields.has(rawField as CreateTaskField) ? rawField as CreateTaskField : null);

    if (!field || field in fieldErrors) {
      continue;
    }

    const message = issue.message;
    const isKnownKey = message && !message.includes(" ");

    fieldErrors[field] = isKnownKey
      ? (messageAliases[message] ?? message)
      : (fallbackByField[field] ?? "description_required");
  }

  return fieldErrors;
}

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
