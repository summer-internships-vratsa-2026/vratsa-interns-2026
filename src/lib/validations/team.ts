import { z } from "zod";

import type { ProjectRole } from "@/db/schema/enums";

export const MIN_TEAM_SIZE = 2;
export const MAX_TEAM_SIZE = 4;

export const ALL_PROJECT_ROLES: ProjectRole[] = [
  "SOFTWARE_DEVELOPER",
  "MARKETING_EXPERT",
  "PRODUCT_OWNER",
];

export const gradeSchema = z.number().int().min(1).max(10);

export function isValidTeamSize(size: number): boolean {
  return size >= MIN_TEAM_SIZE && size <= MAX_TEAM_SIZE;
}

export function getAllowedRolesForTeamSize(teamSize: number): ProjectRole[] {
  if (teamSize === 3) {
    return ["SOFTWARE_DEVELOPER", "MARKETING_EXPERT", "PRODUCT_OWNER"];
  }

  if (teamSize === 2 || teamSize === 4) {
    return ["SOFTWARE_DEVELOPER", "MARKETING_EXPERT"];
  }

  return ["SOFTWARE_DEVELOPER", "MARKETING_EXPERT", "PRODUCT_OWNER"];
}

export function isProjectRoleAllowedForTeamSize(role: ProjectRole, teamSize: number): boolean {
  return getAllowedRolesForTeamSize(teamSize).includes(role);
}

export function validateTeamRoles(members: Array<{ projectRole: ProjectRole }>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const size = members.length;

  if (!isValidTeamSize(size)) {
    errors.push(`Team must have between ${MIN_TEAM_SIZE} and ${MAX_TEAM_SIZE} members.`);
  }

  const allowedRoles = getAllowedRolesForTeamSize(size);

  for (const member of members) {
    if (!allowedRoles.includes(member.projectRole)) {
      errors.push(`Role ${member.projectRole} is not allowed for a team of ${size} members.`);
    }
  }

  if (size === 3) {
    const roles = members.map((member) => member.projectRole);
    const uniqueRoles = new Set(roles);
    if (uniqueRoles.size !== roles.length) {
      errors.push("A 3-member team must have one student per role.");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateNewMemberRole(
  currentMembers: Array<{ projectRole: ProjectRole }>,
  newRole: ProjectRole,
): { valid: boolean; errorKey?: string } {
  const projectedSize = currentMembers.length + 1;

  if (projectedSize > MAX_TEAM_SIZE) {
    return { valid: false, errorKey: "team_full" };
  }

  const allowedRoles = getAllowedRolesForTeamSize(projectedSize);

  if (!allowedRoles.includes(newRole)) {
    return { valid: false, errorKey: "role_not_allowed" };
  }

  if (projectedSize === 3) {
    const projectedRoles = [...currentMembers.map((member) => member.projectRole), newRole];

    if (new Set(projectedRoles).size !== projectedRoles.length) {
      return { valid: false, errorKey: "duplicate_role" };
    }
  }

  return { valid: true };
}

/** Join flow: team size is unknown, so any project role may be chosen until the team is full. */
export function validateJoinMemberRole(
  currentMembers: Array<{ projectRole: ProjectRole }>,
  newRole: ProjectRole,
): { valid: boolean; errorKey?: string } {
  if (currentMembers.length + 1 > MAX_TEAM_SIZE) {
    return { valid: false, errorKey: "team_full" };
  }

  if (!ALL_PROJECT_ROLES.includes(newRole)) {
    return { valid: false, errorKey: "role_not_allowed" };
  }

  return { valid: true };
}
