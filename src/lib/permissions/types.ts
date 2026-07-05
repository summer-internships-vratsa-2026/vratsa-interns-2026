import type { UserRole } from "@/db/schema/enums";

export type PermissionUser = {
  id: string;
  role: UserRole;
};

export type MentorGroupAccess = {
  mainGroupId: string | null;
};
