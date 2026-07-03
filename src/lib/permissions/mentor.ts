import type { UserRole } from "@/db/schema/enums";

export type MentorContext = {
  mentorId: string;
  mainGroupId: string | null;
  userId: string;
};

export type MentorGroupAccess = Pick<MentorContext, "mainGroupId">;

export function canViewAllGroups(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

export function canViewAllTeams(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

export function canViewAllTasks(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

export function canViewAllSubmissions(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

export function canEditTeam(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

/** Mentors may create tasks only for their main responsible group. */
export function canCreateTaskForGroup(mentor: MentorGroupAccess, groupId: string): boolean {
  return mentor.mainGroupId === groupId;
}

/** Mentors may apply/reuse tasks only to their main responsible group. */
export function canApplyTaskToGroup(mentor: MentorGroupAccess, groupId: string): boolean {
  return mentor.mainGroupId === groupId;
}

/** Mentors may comment on submissions from all groups. */
export function canCommentSubmission(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN" || role === "CLIENT";
}

/** Mentors may grade submissions from all groups (latest grade only is enforced elsewhere). */
export function canGradeSubmission(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

export function hasMainGroupAssigned(mentor: MentorGroupAccess): boolean {
  return mentor.mainGroupId !== null;
}
