"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { topics } from "@/db/schema";
import {
  createTopicSchema,
  deleteTopicSchema,
  updateTopicSchema,
  type AdminTopicActionState,
} from "@/lib/validations/topic";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

function revalidateTopicPaths(locale: string) {
  revalidatePath(`/${locale}/dashboard/admin/topics`);
  revalidatePath(`/${locale}/dashboard/admin/tasks/create`);
  revalidatePath(`/${locale}/dashboard/mentor/tasks/create`);
}

export async function createTopicAction(
  locale: string,
  _prevState: AdminTopicActionState,
  formData: FormData,
): Promise<AdminTopicActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = createTopicSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  await db.insert(topics).values({
    title: parsed.data.title,
    description: parsed.data.description,
  });

  revalidateTopicPaths(locale);
  return { success: "topic_created" };
}

export async function updateTopicAction(
  locale: string,
  _prevState: AdminTopicActionState,
  formData: FormData,
): Promise<AdminTopicActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = updateTopicSchema.safeParse({
    topicId: formData.get("topicId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const [topic] = await db
    .select({ id: topics.id })
    .from(topics)
    .where(eq(topics.id, parsed.data.topicId))
    .limit(1);

  if (!topic) {
    return { error: "topic_not_found" };
  }

  await db
    .update(topics)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      updatedAt: new Date(),
    })
    .where(eq(topics.id, parsed.data.topicId));

  revalidateTopicPaths(locale);
  return { success: "topic_updated" };
}

export async function deleteTopicAction(
  locale: string,
  _prevState: AdminTopicActionState,
  formData: FormData,
): Promise<AdminTopicActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = deleteTopicSchema.safeParse({
    topicId: formData.get("topicId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const [topic] = await db
    .select({ id: topics.id })
    .from(topics)
    .where(eq(topics.id, parsed.data.topicId))
    .limit(1);

  if (!topic) {
    return { error: "topic_not_found" };
  }

  await db.delete(topics).where(eq(topics.id, parsed.data.topicId));

  revalidateTopicPaths(locale);
  return { success: "topic_deleted" };
}
