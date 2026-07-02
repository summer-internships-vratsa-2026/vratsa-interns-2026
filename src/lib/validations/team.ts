import { z } from "zod";

import type { ProjectRole } from "@/db/schema/enums";

export const MIN_TEAM_SIZE = 2;
export const MAX_TEAM_SIZE = 4;

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
