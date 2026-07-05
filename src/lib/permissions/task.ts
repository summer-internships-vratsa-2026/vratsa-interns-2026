import type { UserRole } from "@/db/schema/enums";
import { getTaskAssignment, getTaskGroupById } from "@/lib/tasks/queries";
import { getStudentByUserId, getTeamMembershipForStudent } from "@/lib/teams/queries";
import { isRoleEligibleForTask } from "@/lib/validations/task";
import type { MentorGroupAccess } from "./types";

export function hasMainGroupAssigned(mentor: MentorGroupAccess): boolean {
  return mentor.mainGroupId !== null;
}

/** Admins can create tasks for any group; mentors only when they have a main group. */
export function canCreateTask(role: UserRole, mentor?: MentorGroupAccess | null): boolean {
  if (role === "ADMIN") {
    return true;
  }

  if (role === "MENTOR" && mentor) {
    return hasMainGroupAssigned(mentor);
  }

  return false;
}

/** Mentors may create tasks only for their main responsible group. */
export function canCreateTaskForGroup(mentor: MentorGroupAccess, groupId: string): boolean {
  return mentor.mainGroupId === groupId;
}

/** Mentors may apply/reuse tasks only to their main responsible group. */
export function canApplyTaskToGroup(mentor: MentorGroupAccess, groupId: string): boolean {
  return mentor.mainGroupId === groupId;
}

/** Students may submit when they belong to the task's group and their role is eligible. */
export async function canSubmitTask(
  userId: string,
  role: UserRole,
  taskGroupId: string,
): Promise<boolean> {
  if (role !== "STUDENT") {
    return false;
  }

  const student = await getStudentByUserId(userId);

  if (!student) {
    return false;
  }

  const membership = await getTeamMembershipForStudent(student.id);

  if (!membership) {
    return false;
  }

  const taskGroup = await getTaskGroupById(taskGroupId);

  if (!taskGroup || taskGroup.groupId !== membership.team.groupId) {
    return false;
  }

  if (taskGroup.task.status !== "PUBLISHED") {
    return false;
  }

  return isRoleEligibleForTask(membership.member.projectRole, taskGroup.task);
}

/** Admins can edit any task; mentors only tasks in their main group. */
export async function canEditTask(
  userId: string,
  role: UserRole,
  taskId: string,
  groupId: string,
  mentor?: MentorGroupAccess | null,
): Promise<boolean> {
  if (role === "ADMIN") {
    const assignment = await getTaskAssignment(taskId, groupId);
    return assignment !== null;
  }

  if (role !== "MENTOR" || !mentor?.mainGroupId) {
    return false;
  }

  if (!canCreateTaskForGroup(mentor, groupId)) {
    return false;
  }

  const assignment = await getTaskAssignment(taskId, groupId);
  return assignment !== null;
}
