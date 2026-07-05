import { z } from "zod";

import { projectRoleSchema } from "@/lib/validations/task";
import { schoolSchema } from "@/lib/validations/team-form";

export const adminTeamFiltersSchema = z.object({
  groupId: z.uuid().optional(),
  school: schoolSchema.optional(),
  schoolClass: z.string().trim().optional(),
  mentorId: z.uuid().optional(),
  clientId: z.uuid().optional(),
});

export const assignTeamClientSchema = z.object({
  clientId: z.union([z.uuid(), z.literal("")]).transform((value) => (value === "" ? null : value)),
});

export const assignTeamMentorSchema = z.object({
  mentorId: z.uuid(),
});

export const addTeamMemberSchema = z.object({
  studentId: z.uuid(),
  projectRole: projectRoleSchema,
});

export const updateTeamMemberRoleSchema = z.object({
  memberId: z.uuid(),
  projectRole: projectRoleSchema,
});

export const removeTeamMemberSchema = z.object({
  memberId: z.uuid(),
});

export const removeTeamMentorSchema = z.object({
  teamMentorId: z.uuid(),
});

export const deleteTeamSchema = z.object({
  teamId: z.uuid(),
});

export type AdminTeamActionState = {
  error?: string;
  success?: string;
};
