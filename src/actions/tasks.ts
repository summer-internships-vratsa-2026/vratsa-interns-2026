"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/db";
import { taskGroups, tasks } from "@/db/schema";
import { getMentorByUserId } from "@/lib/mentors/queries";
import {
  canApplyTaskToGroup,
  canCreateTask,
  canCreateTaskForGroup,
  canEditTask,
} from "@/lib/permissions";
import { getAllGroups } from "@/lib/teams/admin-queries";
import {
  getRootSourceTaskId,
  getTaskAssignment,
  isTaskAssignedToGroup,
} from "@/lib/tasks/queries";
import {
  applyTaskSchema,
  createMentorTaskSchema,
  createTaskSchema,
  mapCreateTaskFieldErrors,
  parseTaskTargetInput,
  resolveTaskStatusFromIntent,
  updateTaskSchema,
  validationFailure,
  type TaskActionState,
} from "@/lib/validations/task-form";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

async function requireMentorWithMainGroup() {
  const session = await auth();

  if (!session?.user || session.user.role !== "MENTOR") {
    return null;
  }

  const mentor = await getMentorByUserId(session.user.id);

  if (!mentor || !canCreateTask(session.user.role, mentor)) {
    return null;
  }

  return { session, mentor };
}

function revalidateTaskPaths(locale: string, taskId?: string) {
  revalidatePath(`/${locale}/dashboard/mentor/tasks`);
  revalidatePath(`/${locale}/dashboard/admin/tasks`);
  revalidatePath(`/${locale}/dashboard/student/team`);

  if (taskId) {
    revalidatePath(`/${locale}/dashboard/admin/tasks/${taskId}`);
    revalidatePath(`/${locale}/dashboard/mentor/tasks/${taskId}`);
  }
}

function parseCreateTaskFormFields(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    deadline: formData.get("deadline"),
    targetMode: formData.get("targetMode"),
    targetRoles: formData.getAll("targetRoles"),
    responseTypes: formData.getAll("responseTypes"),
    topicId: formData.get("topicId"),
    publishIntent: formData.get("publishIntent"),
  };
}

function parseCreateTaskInput(formData: FormData) {
  return createTaskSchema.safeParse({
    ...parseCreateTaskFormFields(formData),
    assignAllGroups: formData.get("assignAllGroups"),
    groupIds: formData.getAll("groupIds"),
  });
}

function parseMentorCreateTaskInput(formData: FormData) {
  return createMentorTaskSchema.safeParse(parseCreateTaskFormFields(formData));
}

function parseUpdateTaskInput(formData: FormData) {
  return updateTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    groupId: formData.get("groupId"),
    title: formData.get("title"),
    description: formData.get("description"),
    deadline: formData.get("deadline"),
    targetMode: formData.get("targetMode"),
    targetRoles: formData.getAll("targetRoles"),
    responseTypes: formData.getAll("responseTypes"),
    topicId: formData.get("topicId"),
    publishIntent: formData.get("publishIntent"),
  });
}

export async function createMentorTaskAction(
  locale: string,
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const context = await requireMentorWithMainGroup();

  if (!context) {
    return { error: "forbidden" };
  }

  const parsed = parseMentorCreateTaskInput(formData);

  if (!parsed.success) {
    return validationFailure(mapCreateTaskFieldErrors(parsed.error), formData);
  }

  if (!parsed.data.deadline) {
    return validationFailure({ deadline: "invalid_deadline" }, formData);
  }

  const deadline = parsed.data.deadline;
  const target = parseTaskTargetInput({
    targetMode: parsed.data.targetMode,
    targetRoles: parsed.data.targetRoles,
  });
  const groupId = context.mentor.mainGroupId!;
  const status = resolveTaskStatusFromIntent(parsed.data.publishIntent);

  if (!canCreateTaskForGroup(context.mentor, groupId)) {
    return { error: "forbidden" };
  }

  await db.transaction(async (tx) => {
    const [createdTask] = await tx
      .insert(tasks)
      .values({
        title: parsed.data.title,
        description: parsed.data.description,
        createdByUserId: context.session.user.id,
        targetAllRoles: target.targetAllRoles,
        onePerTeam: target.onePerTeam,
        targetRoles: target.targetRoles,
        responseTypes: parsed.data.responseTypes,
        topicId: parsed.data.topicId,
        status,
      })
      .returning();

    await tx.insert(taskGroups).values({
      taskId: createdTask.id,
      groupId,
      deadline,
    });
  });

  revalidateTaskPaths(locale);
  redirect(
    `/${locale}/dashboard/mentor/tasks?${status === "DRAFT" ? "draft=1" : "created=1"}`,
  );
}

export async function createAdminTaskAction(
  locale: string,
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { error: "forbidden" };
  }

  const parsed = parseCreateTaskInput(formData);

  if (!parsed.success) {
    return validationFailure(mapCreateTaskFieldErrors(parsed.error), formData);
  }

  if (!parsed.data.deadline) {
    return validationFailure({ deadline: "invalid_deadline" }, formData);
  }

  const deadline = parsed.data.deadline;
  const target = parseTaskTargetInput({
    targetMode: parsed.data.targetMode,
    targetRoles: parsed.data.targetRoles,
  });
  const status = resolveTaskStatusFromIntent(parsed.data.publishIntent);
  let groupIds = parsed.data.groupIds;

  if (parsed.data.assignAllGroups) {
    const allGroups = await getAllGroups();
    groupIds = allGroups.map((group) => group.id);
  }

  if (groupIds.length === 0) {
    return validationFailure({ groupIds: "groups_required" }, formData);
  }

  await db.transaction(async (tx) => {
    const [createdTask] = await tx
      .insert(tasks)
      .values({
        title: parsed.data.title,
        description: parsed.data.description,
        createdByUserId: session.user.id,
        targetAllRoles: target.targetAllRoles,
        onePerTeam: target.onePerTeam,
        targetRoles: target.targetRoles,
        responseTypes: parsed.data.responseTypes,
        topicId: parsed.data.topicId,
        status,
      })
      .returning();

    await tx.insert(taskGroups).values(
      groupIds.map((groupId) => ({
        taskId: createdTask.id,
        groupId,
        deadline,
      })),
    );
  });

  revalidateTaskPaths(locale);
  redirect(`/${locale}/dashboard/admin/tasks?${status === "DRAFT" ? "draft=1" : "created=1"}`);
}

export async function updateMentorTaskAction(
  locale: string,
  taskId: string,
  groupId: string,
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const context = await requireMentorWithMainGroup();

  if (!context) {
    return { error: "forbidden" };
  }

  if (
    !(await canEditTask(context.session.user.id, context.session.user.role, taskId, groupId, context.mentor))
  ) {
    return { error: "forbidden" };
  }

  const parsed = parseUpdateTaskInput(formData);

  if (!parsed.success) {
    return validationFailure(mapCreateTaskFieldErrors(parsed.error), formData);
  }

  if (!parsed.data.deadline) {
    return validationFailure({ deadline: "invalid_deadline" }, formData);
  }

  const target = parseTaskTargetInput({
    targetMode: parsed.data.targetMode,
    targetRoles: parsed.data.targetRoles,
  });
  const status = resolveTaskStatusFromIntent(parsed.data.publishIntent);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(tasks)
      .set({
        title: parsed.data.title,
        description: parsed.data.description,
        targetAllRoles: target.targetAllRoles,
        onePerTeam: target.onePerTeam,
        targetRoles: target.targetRoles,
        responseTypes: parsed.data.responseTypes,
        topicId: parsed.data.topicId,
        status,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId));

    await tx
      .update(taskGroups)
      .set({
        deadline: parsed.data.deadline,
        updatedAt: now,
      })
      .where(and(eq(taskGroups.taskId, taskId), eq(taskGroups.groupId, groupId)));
  });

  revalidateTaskPaths(locale, taskId);
  redirect(`/${locale}/dashboard/mentor/tasks/${taskId}?groupId=${groupId}&saved=1`);
}

export async function updateAdminTaskAction(
  locale: string,
  taskId: string,
  groupId: string,
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { error: "forbidden" };
  }

  if (!(await canEditTask(session.user.id, session.user.role, taskId, groupId))) {
    return { error: "forbidden" };
  }

  const parsed = parseUpdateTaskInput(formData);

  if (!parsed.success) {
    return validationFailure(mapCreateTaskFieldErrors(parsed.error), formData);
  }

  if (!parsed.data.deadline) {
    return validationFailure({ deadline: "invalid_deadline" }, formData);
  }

  const target = parseTaskTargetInput({
    targetMode: parsed.data.targetMode,
    targetRoles: parsed.data.targetRoles,
  });
  const status = resolveTaskStatusFromIntent(parsed.data.publishIntent);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(tasks)
      .set({
        title: parsed.data.title,
        description: parsed.data.description,
        targetAllRoles: target.targetAllRoles,
        onePerTeam: target.onePerTeam,
        targetRoles: target.targetRoles,
        responseTypes: parsed.data.responseTypes,
        topicId: parsed.data.topicId,
        status,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId));

    await tx
      .update(taskGroups)
      .set({
        deadline: parsed.data.deadline,
        updatedAt: now,
      })
      .where(and(eq(taskGroups.taskId, taskId), eq(taskGroups.groupId, groupId)));
  });

  revalidateTaskPaths(locale, taskId);
  redirect(`/${locale}/dashboard/admin/tasks/${taskId}?groupId=${groupId}&saved=1`);
}

export async function applyTaskToGroupAction(
  locale: string,
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const context = await requireMentorWithMainGroup();

  if (!context) {
    return { error: "forbidden" };
  }

  const parsed = applyTaskSchema.safeParse({
    sourceTaskId: formData.get("sourceTaskId"),
    sourceGroupId: formData.get("sourceGroupId"),
    deadline: formData.get("deadline"),
  });

  if (!parsed.success) {
    return { fieldErrors: { deadline: "invalid_deadline" } };
  }

  const mainGroupId = context.mentor.mainGroupId!;

  if (!canApplyTaskToGroup(context.mentor, mainGroupId)) {
    return { error: "forbidden" };
  }

  const sourceAssignment = await getTaskAssignment(
    parsed.data.sourceTaskId,
    parsed.data.sourceGroupId,
  );

  if (!sourceAssignment) {
    return { error: "task_not_found" };
  }

  const rootSourceId = getRootSourceTaskId(sourceAssignment.task);

  if (parsed.data.sourceGroupId === mainGroupId) {
    return { error: "already_in_main_group" };
  }

  const alreadyAssigned = await isTaskAssignedToGroup(rootSourceId, mainGroupId);

  if (alreadyAssigned) {
    return { error: "already_applied" };
  }

  await db.transaction(async (tx) => {
    const [appliedTask] = await tx
      .insert(tasks)
      .values({
        title: sourceAssignment.task.title,
        description: sourceAssignment.task.description,
        createdByUserId: context.session.user.id,
        sourceTaskId: rootSourceId,
        targetAllRoles: sourceAssignment.task.targetAllRoles,
        onePerTeam: sourceAssignment.task.onePerTeam,
        targetRoles: sourceAssignment.task.targetRoles,
        responseTypes: sourceAssignment.task.responseTypes,
        topicId: sourceAssignment.task.topicId,
        status: "DRAFT",
      })
      .returning();

    await tx.insert(taskGroups).values({
      taskId: appliedTask.id,
      groupId: mainGroupId,
      deadline: parsed.data.deadline,
    });
  });

  revalidateTaskPaths(locale);
  redirect(`/${locale}/dashboard/mentor/tasks?draft=1`);
}
