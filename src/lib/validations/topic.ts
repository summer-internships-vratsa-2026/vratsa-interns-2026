import { z } from "zod";

export const topicFormSchema = z.object({
  title: z.string().trim().min(2).max(255),
  description: z.string().trim().min(2).max(500),
});

export const createTopicSchema = topicFormSchema;

export const updateTopicSchema = topicFormSchema.extend({
  topicId: z.uuid(),
});

export const deleteTopicSchema = z.object({
  topicId: z.uuid(),
});

export type AdminTopicActionState = {
  error?: string;
  success?: string;
};
