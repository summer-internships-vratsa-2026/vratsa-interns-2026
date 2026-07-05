import { z } from "zod";

export const addSubmissionCommentSchema = z.object({
  submissionId: z.uuid(),
  content: z.string().trim().min(1).max(5000),
});

export const upsertSubmissionGradeSchema = z.object({
  submissionId: z.uuid(),
  grade: z.coerce.number().int().min(1).max(10),
  content: z.preprocess(
    (value) => (value == null || value === "" ? undefined : value),
    z.string().trim().min(1).max(5000).optional(),
  ),
});

export const deleteSubmissionGradeSchema = z.object({
  submissionId: z.uuid(),
});

export type SubmissionReviewActionState = {
  error?: string;
  success?: string;
};
