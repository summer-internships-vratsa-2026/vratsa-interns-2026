import { z } from "zod";

import { projectRoleSchema } from "@/lib/validations/task";
import { SCHOOL_CLASS_VALUES } from "@/lib/teams/constants";

export const schoolSchema = z.enum(["PPMG", "PTG"]);

export const schoolClassSchema = z.enum(SCHOOL_CLASS_VALUES);

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(255),
  classroom: z.string().trim().min(1).max(100),
  schoolClass: schoolClassSchema,
  school: schoolSchema,
  groupId: z.uuid(),
  projectRole: projectRoleSchema,
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).max(255),
  classroom: z.string().trim().min(1).max(100),
  schoolClass: schoolClassSchema,
  school: schoolSchema,
  groupId: z.uuid(),
});

export const updateTeamNameSchema = z.object({
  name: z.string().trim().min(2).max(255),
});

export const joinTeamSchema = z.object({
  token: z.string().min(1),
  projectRole: projectRoleSchema,
});

export const inviteEmailSchema = z.object({
  email: z.email(),
});

export type TeamActionState = {
  error?: string;
  success?: string;
  inviteUrl?: string;
};
