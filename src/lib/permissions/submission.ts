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
