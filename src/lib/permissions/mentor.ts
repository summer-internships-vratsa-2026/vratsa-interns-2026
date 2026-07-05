import type { UserRole } from "@/db/schema/enums";

export function canViewAllGroups(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

export function canViewAllTeams(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}

export function canViewAllTasks(role: UserRole): boolean {
  return role === "MENTOR" || role === "ADMIN";
}
