import type { UserRole } from "@/db/schema/enums";
import { isClientAssignedToTeam } from "@/lib/clients/queries";
import { isStudentInTeamByUserId } from "@/lib/team-feedback/queries";

export async function canViewTeam(
  userId: string,
  role: UserRole,
  teamId: string,
): Promise<boolean> {
  if (role === "ADMIN" || role === "MENTOR") {
    return true;
  }

  if (role === "STUDENT") {
    return isStudentInTeamByUserId(userId, teamId);
  }

  if (role === "CLIENT") {
    return isClientAssignedToTeam(userId, teamId);
  }

  return false;
}

/** Students may edit their own team; mentors and admins may edit any team. */
export async function canEditTeam(
  userId: string,
  role: UserRole,
  teamId: string,
): Promise<boolean> {
  if (role === "ADMIN" || role === "MENTOR") {
    return true;
  }

  if (role === "STUDENT") {
    return isStudentInTeamByUserId(userId, teamId);
  }

  return false;
}
