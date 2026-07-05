import type { UserRole } from "@/db/schema/enums";
import { isClientAssignedToTeam } from "@/lib/clients/queries";

export function canViewAllSubmissions(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

export async function canAccessSubmission(
  userId: string,
  role: UserRole,
  teamId: string,
): Promise<boolean> {
  if (canViewAllSubmissions(role)) {
    return true;
  }

  if (role === "CLIENT") {
    return isClientAssignedToTeam(userId, teamId);
  }

  return false;
}

/** Mentors, admins, and clients may comment when they can access the submission. */
export function canCommentSubmission(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN" || role === "CLIENT";
}

export async function canCommentOnSubmission(
  userId: string,
  role: UserRole,
  teamId: string,
): Promise<boolean> {
  if (!canCommentSubmission(role)) {
    return false;
  }

  return canAccessSubmission(userId, role, teamId);
}

/** Mentors and admins may grade submissions. */
export function canGradeSubmission(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

/** Admins may edit any grade; mentors may edit only their own. */
export function canEditSubmissionGrade(
  role: UserRole,
  gradedByUserId: string | null,
  currentUserId: string,
): boolean {
  if (role === "ADMIN") {
    return true;
  }

  if (!canGradeSubmission(role)) {
    return false;
  }

  return !gradedByUserId || gradedByUserId === currentUserId;
}
