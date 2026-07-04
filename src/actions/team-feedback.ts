"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { teamFeedback, teamFeedbackComments } from "@/db/schema";
import {
  canCommentTeamFeedback,
  canCreateTeamFeedback,
  canMarkTeamFeedbackDone,
} from "@/lib/team-feedback/queries";
import {
  createTeamFeedbackCommentSchema,
  createTeamFeedbackSchema,
  markTeamFeedbackDoneSchema,
  type TeamFeedbackActionState,
} from "@/lib/validations/team-feedback";

function revalidateTeamFeedbackPaths(locale: string, teamId: string) {
  revalidatePath(`/${locale}/dashboard/student/team`);
  revalidatePath(`/${locale}/dashboard/admin/teams/${teamId}`);
  revalidatePath(`/${locale}/dashboard/mentor/teams/${teamId}`);
  revalidatePath(`/${locale}/dashboard/client/teams`);
  revalidatePath(`/${locale}/dashboard/client/teams/${teamId}`);
}

async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function createTeamFeedbackAction(
  locale: string,
  _prevState: TeamFeedbackActionState,
  formData: FormData,
): Promise<TeamFeedbackActionState> {
  const user = await getSessionUser();

  if (!user) {
    return { error: "forbidden" };
  }

  const parsed = createTeamFeedbackSchema.safeParse({
    teamId: formData.get("teamId"),
    category: formData.get("category"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    const contentIssue = parsed.error.issues.find((issue) => issue.path[0] === "content");
    if (contentIssue?.message === "feedback_content_required") {
      return { error: "feedback_content_required" };
    }

    return { error: "invalid_input" };
  }

  const canCreate = await canCreateTeamFeedback(user.id, user.role, parsed.data.teamId);

  if (!canCreate) {
    return { error: "forbidden" };
  }

  await db.insert(teamFeedback).values({
    teamId: parsed.data.teamId,
    authorUserId: user.id,
    category: parsed.data.category,
    title: parsed.data.title,
    content: parsed.data.content,
  });

  revalidateTeamFeedbackPaths(locale, parsed.data.teamId);
  return { success: "feedback_created" };
}

export async function addTeamFeedbackCommentAction(
  locale: string,
  _prevState: TeamFeedbackActionState,
  formData: FormData,
): Promise<TeamFeedbackActionState> {
  const user = await getSessionUser();

  if (!user) {
    return { error: "forbidden" };
  }

  const parsed = createTeamFeedbackCommentSchema.safeParse({
    teamId: formData.get("teamId"),
    feedbackId: formData.get("feedbackId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const canComment = await canCommentTeamFeedback(user.id, user.role, parsed.data.teamId);

  if (!canComment) {
    return { error: "forbidden" };
  }

  const [feedback] = await db
    .select({ id: teamFeedback.id })
    .from(teamFeedback)
    .where(and(eq(teamFeedback.id, parsed.data.feedbackId), eq(teamFeedback.teamId, parsed.data.teamId)))
    .limit(1);

  if (!feedback) {
    return { error: "feedback_not_found" };
  }

  await db.insert(teamFeedbackComments).values({
    feedbackId: parsed.data.feedbackId,
    authorUserId: user.id,
    content: parsed.data.content,
  });

  revalidateTeamFeedbackPaths(locale, parsed.data.teamId);
  return { success: "comment_added" };
}

export async function markTeamFeedbackDoneAction(
  locale: string,
  _prevState: TeamFeedbackActionState,
  formData: FormData,
): Promise<TeamFeedbackActionState> {
  const user = await getSessionUser();

  if (!user) {
    return { error: "forbidden" };
  }

  const parsed = markTeamFeedbackDoneSchema.safeParse({
    teamId: formData.get("teamId"),
    feedbackId: formData.get("feedbackId"),
    done: formData.get("done"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const canMarkDone = await canMarkTeamFeedbackDone(user.id, user.role, parsed.data.teamId);

  if (!canMarkDone) {
    return { error: "forbidden" };
  }

  const [feedback] = await db
    .select({ id: teamFeedback.id })
    .from(teamFeedback)
    .where(and(eq(teamFeedback.id, parsed.data.feedbackId), eq(teamFeedback.teamId, parsed.data.teamId)))
    .limit(1);

  if (!feedback) {
    return { error: "feedback_not_found" };
  }

  await db
    .update(teamFeedback)
    .set({
      status: parsed.data.done ? "DONE" : "OPEN",
      doneByUserId: parsed.data.done ? user.id : null,
      doneAt: parsed.data.done ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(teamFeedback.id, parsed.data.feedbackId));

  revalidateTeamFeedbackPaths(locale, parsed.data.teamId);
  return { success: parsed.data.done ? "feedback_marked_done" : "feedback_marked_open" };
}
