import { z } from "zod";

import { isRichTextEmpty, sanitizeTaskDescription } from "@/lib/rich-text";

const uploadedFileUrlSchema = z
  .string()
  .regex(/^\/uploads\/submission-files\/[a-zA-Z0-9-_.]+$/, { message: "invalid_url" });

const optionalUrlField = z.preprocess(
  (v) => (v == null || String(v).trim() === "" ? null : String(v).trim()),
  z.union([z.null(), z.url({ message: "invalid_url" }), uploadedFileUrlSchema]),
);

const optionalRichTextField = z.preprocess(
  (v) => (v == null || String(v).trim() === "" ? null : String(v)),
  z
    .string()
    .transform((v) => sanitizeTaskDescription(v))
    .transform((v) => (isRichTextEmpty(v) ? null : v))
    .nullable(),
);

export const upsertSubmissionSchema = z
  .object({
    textReply: optionalRichTextField,
    urlCount: z.preprocess((v) => Number(v), z.number().int().min(0).max(20)),
  })
  .passthrough()
  .transform((data) => {
    const urls: string[] = [];

    for (let i = 0; i < data.urlCount; i++) {
      const raw = (data as Record<string, unknown>)[`url_${i}`];
      const parsed = optionalUrlField.safeParse(raw);

      if (parsed.success && parsed.data) {
        urls.push(parsed.data);
      } else if (!parsed.success) {
        throw new z.ZodError([
          {
            code: "custom",
            message: "invalid_url",
            path: [`url_${i}`],
          },
        ]);
      }
    }

    return {
      textReply: data.textReply as string | null,
      urls,
    };
  });

export type SubmissionActionState = {
  error?: string;
  fieldError?: string;
  success?: string;
};
