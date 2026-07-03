import { z } from "zod";

export const updateMentorMainGroupSchema = z.object({
  mentorId: z.uuid(),
  mainGroupId: z.union([z.uuid(), z.literal("")]).transform((value) => (value === "" ? null : value)),
});

export type AdminMentorActionState = {
  error?: string;
  success?: string;
};
