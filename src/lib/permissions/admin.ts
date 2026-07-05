import type { UserRole } from "@/db/schema/enums";

export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canManageClients(role: UserRole): boolean {
  return role === "ADMIN";
}
