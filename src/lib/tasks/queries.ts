import { and, desc, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { groups, taskGroups, tasks, topics, users } from "@/db/schema";
import type { ProjectRole } from "@/db/schema/enums";
import { isRoleEligibleForTask } from "@/lib/validations/task";

export function getRootSourceTaskId(task: { id: string; sourceTaskId: string | null }): string {
  return task.sourceTaskId ?? task.id;
}

export async function getAllTasksWithGroups() {
  return db
    .select({
      taskId: tasks.id,
      sourceTaskId: tasks.sourceTaskId,
      title: tasks.title,
      description: tasks.description,
      groupId: taskGroups.groupId,
      groupName: groups.name,
      taskGroupId: taskGroups.id,
      deadline: taskGroups.deadline,
      targetAllRoles: tasks.targetAllRoles,
      onePerTeam: tasks.onePerTeam,
      targetRoles: tasks.targetRoles,
      responseTypes: tasks.responseTypes,
      topicId: tasks.topicId,
      topicTitle: topics.title,
      topicDescription: topics.description,
      createdAt: tasks.createdAt,
      createdByName: users.name,
    })
    .from(tasks)
    .innerJoin(taskGroups, eq(tasks.id, taskGroups.taskId))
    .innerJoin(groups, eq(taskGroups.groupId, groups.id))
    .innerJoin(users, eq(tasks.createdByUserId, users.id))
    .leftJoin(topics, eq(tasks.topicId, topics.id))
    .orderBy(desc(taskGroups.deadline));
}

export async function getTaskById(taskId: string) {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  return task ?? null;
}

export async function getTaskWithGroups(taskId: string) {
  const task = await getTaskById(taskId);

  if (!task) {
    return null;
  }

  const assignments = await db
    .select({
      taskGroupId: taskGroups.id,
      groupId: taskGroups.groupId,
      groupName: groups.name,
      deadline: taskGroups.deadline,
    })
    .from(taskGroups)
    .innerJoin(groups, eq(taskGroups.groupId, groups.id))
    .where(eq(taskGroups.taskId, taskId))
    .orderBy(groups.name);

  const [creator] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, task.createdByUserId))
    .limit(1);

  const [topic] = task.topicId
    ? await db
        .select({ id: topics.id, title: topics.title, description: topics.description })
        .from(topics)
        .where(eq(topics.id, task.topicId))
        .limit(1)
    : [null];

  return {
    task,
    assignments,
    createdByName: creator?.name ?? "—",
    topic: topic ?? null,
  };
}

export async function getTaskGroupById(taskGroupId: string) {
  const [row] = await db
    .select({
      taskGroupId: taskGroups.id,
      groupId: taskGroups.groupId,
      groupName: groups.name,
      deadline: taskGroups.deadline,
      task: tasks,
      topicTitle: topics.title,
    })
    .from(taskGroups)
    .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
    .innerJoin(groups, eq(taskGroups.groupId, groups.id))
    .leftJoin(topics, eq(tasks.topicId, topics.id))
    .where(eq(taskGroups.id, taskGroupId))
    .limit(1);

  return row ?? null;
}

export async function getTaskAssignment(taskId: string, groupId: string) {
  const [assignment] = await db
    .select({
      taskGroupId: taskGroups.id,
      groupId: taskGroups.groupId,
      groupName: groups.name,
      deadline: taskGroups.deadline,
      task: tasks,
      topicTitle: topics.title,
      topicDescription: topics.description,
    })
    .from(taskGroups)
    .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
    .innerJoin(groups, eq(taskGroups.groupId, groups.id))
    .leftJoin(topics, eq(tasks.topicId, topics.id))
    .where(and(eq(taskGroups.taskId, taskId), eq(taskGroups.groupId, groupId)))
    .limit(1);

  return assignment ?? null;
}

/** Whether a task from this source chain is already assigned to the group. */
export async function isTaskAssignedToGroup(rootSourceTaskId: string, groupId: string) {
  const [existing] = await db
    .select({ id: taskGroups.id })
    .from(taskGroups)
    .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
    .where(
      and(
        eq(taskGroups.groupId, groupId),
        or(eq(tasks.id, rootSourceTaskId), eq(tasks.sourceTaskId, rootSourceTaskId)),
      ),
    )
    .limit(1);

  return !!existing;
}

export async function getEligibleTasksForStudent(
  groupId: string,
  projectRole: ProjectRole,
) {
  const rows = await getTasksForGroup(groupId);

  return rows.filter((row) =>
    isRoleEligibleForTask(projectRole, {
      targetAllRoles: row.targetAllRoles,
      onePerTeam: row.onePerTeam,
      targetRoles: row.targetRoles,
    }),
  );
}

export async function getTasksForGroup(groupId: string) {
  return db
    .select({
      taskGroupId: taskGroups.id,
      taskId: tasks.id,
      title: tasks.title,
      description: tasks.description,
      deadline: taskGroups.deadline,
      targetAllRoles: tasks.targetAllRoles,
      onePerTeam: tasks.onePerTeam,
      targetRoles: tasks.targetRoles,
      responseTypes: tasks.responseTypes,
      topicId: tasks.topicId,
      topicTitle: topics.title,
      topicDescription: topics.description,
    })
    .from(taskGroups)
    .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
    .leftJoin(topics, eq(tasks.topicId, topics.id))
    .where(eq(taskGroups.groupId, groupId))
    .orderBy(desc(taskGroups.deadline));
}
