"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/db";
import { taskGroups, tasks } from "@/db/schema";
import { getMentorByUserId } from "@/lib/mentors/queries";
import { canApplyTaskToGroup, canCreateTaskForGroup } from "@/lib/permissions";
import { getAllGroups } from "@/lib/teams/admin-queries";
import {
  getRootSourceTaskId,
  getTaskAssignment,
  isTaskAssignedToGroup,
} from "@/lib/tasks/queries";
import { applyTaskSchema, createTaskSchema, parseTaskTargetInput, type TaskActionState } from "@/lib/validations/task-form";

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

  if (!mentor?.mainGroupId) {
    return null;
  }

  return { session, mentor };
}

function revalidateTaskPaths(locale: string) {
  revalidatePath(`/${locale}/dashboard/mentor/tasks`);
  revalidatePath(`/${locale}/dashboard/admin/tasks`);
  revalidatePath(`/${locale}/dashboard/student/team`);
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

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    deadline: formData.get("deadline"),
    targetMode: formData.get("targetMode"),
    targetRoles: formData.getAll("targetRoles"),
    responseTypes: formData.getAll("responseTypes"),
  });

  if (!parsed.success || !parsed.data.deadline) {
    return { error: "invalid_input" };
  }

  const deadline = parsed.data.deadline;
  const target = parseTaskTargetInput({
    targetMode: parsed.data.targetMode,
    targetRoles: parsed.data.targetRoles,
  });
  const groupId = context.mentor.mainGroupId!;

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
      })
      .returning();

    await tx.insert(taskGroups).values({
      taskId: createdTask.id,
      groupId,
      deadline,
    });
  });

  revalidateTaskPaths(locale);
  redirect(`/${locale}/dashboard/mentor/tasks?created=1`);
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

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    deadline: formData.get("deadline"),
    targetMode: formData.get("targetMode"),
    targetRoles: formData.getAll("targetRoles"),
    responseTypes: formData.getAll("responseTypes"),
    assignAllGroups: formData.get("assignAllGroups"),
    groupIds: formData.getAll("groupIds"),
  });

  if (!parsed.success || !parsed.data.deadline) {
    return { error: "invalid_input" };
  }

  const deadline = parsed.data.deadline;
  const target = parseTaskTargetInput({
    targetMode: parsed.data.targetMode,
    targetRoles: parsed.data.targetRoles,
  });
  let groupIds = parsed.data.groupIds;

  if (parsed.data.assignAllGroups) {
    const allGroups = await getAllGroups();
    groupIds = allGroups.map((group) => group.id);
  }

  if (groupIds.length === 0) {
    return { error: "groups_required" };
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
  redirect(`/${locale}/dashboard/admin/tasks?created=1`);
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
    return { error: "invalid_input" };
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
      })
      .returning();

    await tx.insert(taskGroups).values({
      taskId: appliedTask.id,
      groupId: mainGroupId,
      deadline: parsed.data.deadline,
    });
  });

  revalidateTaskPaths(locale);
  redirect(`/${locale}/dashboard/mentor/tasks?applied=1`);
}
