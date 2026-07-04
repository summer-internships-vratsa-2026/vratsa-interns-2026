import { z } from "zod";

import { feedbackCategoryEnum } from "@/db/schema";
import { isRichTextEmpty, sanitizeTaskDescription } from "@/lib/rich-text";

const richTextFeedbackSchema = z
  .string()
  .transform(sanitizeTaskDescription)
  .refine((value) => !isRichTextEmpty(value), { message: "feedback_content_required" });

export const createTeamFeedbackSchema = z.object({
  teamId: z.uuid(),
  category: z.enum(feedbackCategoryEnum.enumValues),
  title: z.string().trim().min(2).max(255),
  content: richTextFeedbackSchema,
});

export const createTeamFeedbackCommentSchema = z.object({
  teamId: z.uuid(),
  feedbackId: z.uuid(),
  content: z.string().trim().min(1).max(1000),
});

export const markTeamFeedbackDoneSchema = z.object({
  teamId: z.uuid(),
  feedbackId: z.uuid(),
  done: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((value) => value === true || value === "true"),
});

export type TeamFeedbackActionState = {
  error?: string;
  success?: string;
};
