"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path from "path";

import { auth } from "@/auth";
import { db } from "@/db";
import { submissions, taskGroups } from "@/db/schema";
import { students, teamMembers } from "@/db/schema";
import { getSubmissionForTeamTask } from "@/lib/submissions/queries";
import { canSubmitTask } from "@/lib/permissions";
import { getTeamMembershipForStudent } from "@/lib/teams/queries";
import {
  type SubmissionActionState,
  upsertSubmissionSchema,
} from "@/lib/validations/submission-form";

const MAX_SUBMISSION_FILE_SIZE = 20 * 1024 * 1024;
const MAX_SUBMISSION_FILES_PER_SAVE = 10;

function getSafeFileExtension(filename: string): string {
  const rawExt = path.extname(filename).toLowerCase();
  if (!rawExt || rawExt.length > 10) {
    return ".bin";
  }
  return rawExt.replace(/[^a-z0-9.]/g, "") || ".bin";
}

function isSubmissionUploadUrl(value: string): boolean {
  return /^\/uploads\/submission-files\/[a-zA-Z0-9-_.]+$/.test(value);
}

async function requireStudentMembership() {
  const session = await auth();

  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("forbidden");
  }

  const [studentRow] = await db
    .select()
    .from(students)
    .where(eq(students.userId, session.user.id))
    .limit(1);

  if (!studentRow) {
    throw new Error("forbidden");
  }

  const membership = await getTeamMembershipForStudent(studentRow.id);

  if (!membership) {
    throw new Error("forbidden");
  }

  return { session, student: studentRow, membership };
}

export async function upsertSubmissionAction(
  locale: string,
  taskGroupId: string,
  _prevState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "forbidden" };
  }

  if (!(await canSubmitTask(session.user.id, session.user.role, taskGroupId))) {
    return { error: "forbidden" };
  }

  let membership: Awaited<ReturnType<typeof requireStudentMembership>>["membership"];

  try {
    ({ membership } = await requireStudentMembership());
  } catch {
    return { error: "forbidden" };
  }

  const teamId = membership.team.id;

  const raw: Record<string, unknown> = {
    textReply: formData.get("textReply"),
    urlCount: formData.get("urlCount"),
  };

  const urlCount = Number(formData.get("urlCount") ?? 0);

  for (let i = 0; i < urlCount; i++) {
    raw[`url_${i}`] = formData.get(`url_${i}`);
  }

  const parsed = upsertSubmissionSchema.safeParse(raw);

  if (!parsed.success) {
    const hasUrlError = parsed.error.issues.some((issue) => issue.message === "invalid_url");
    return { error: hasUrlError ? "invalid_url" : "invalid_input", fieldError: hasUrlError ? "urls" : undefined };
  }

  const existing = await getSubmissionForTeamTask(teamId, taskGroupId);
  const existingFileUrlCount = Number(formData.get("existingFileUrlCount") ?? 0);
  const existingFileUrls: string[] = [];
  for (let i = 0; i < existingFileUrlCount; i++) {
    const value = formData.get(`existingFileUrl_${i}`);
    if (typeof value === "string" && isSubmissionUploadUrl(value)) {
      existingFileUrls.push(value);
    }
  }

  const uploadedFiles = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (uploadedFiles.length > MAX_SUBMISSION_FILES_PER_SAVE) {
    return { error: "too_many_files" };
  }

  for (const file of uploadedFiles) {
    if (file.size > MAX_SUBMISSION_FILE_SIZE) {
      return { error: "file_too_large" };
    }
  }

  const newFileUrls: string[] = [];
  if (uploadedFiles.length > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "submission-files");
    await mkdir(uploadDir, { recursive: true });

    for (const file of uploadedFiles) {
      const extension = getSafeFileExtension(file.name);
      const filename = `${randomUUID()}${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);
      newFileUrls.push(`/uploads/submission-files/${filename}`);
    }
  }

  const allUrls = [...parsed.data.urls, ...existingFileUrls, ...newFileUrls];
  const now = new Date();

  if (existing) {
    await db
      .update(submissions)
      .set({
        textReply: parsed.data.textReply,
        urls: allUrls,
        submittedAt: now,
        updatedAt: now,
      })
      .where(and(eq(submissions.teamId, teamId), eq(submissions.taskGroupId, taskGroupId)));
  } else {
    await db.insert(submissions).values({
      teamId,
      taskGroupId,
      textReply: parsed.data.textReply,
      urls: allUrls,
      submittedAt: now,
    });
  }

  revalidatePath(`/${locale}/dashboard/student/tasks/${taskGroupId}`);
  revalidatePath(`/${locale}/dashboard/student/team`);

  return { success: "submission_saved" };
}

export async function withdrawSubmissionAction(
  locale: string,
  taskGroupId: string,
  _prevState: SubmissionActionState,
  _formData: FormData,
): Promise<SubmissionActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "forbidden" };
  }

  if (!(await canSubmitTask(session.user.id, session.user.role, taskGroupId))) {
    return { error: "forbidden" };
  }

  let membership: Awaited<ReturnType<typeof requireStudentMembership>>["membership"];

  try {
    ({ membership } = await requireStudentMembership());
  } catch {
    return { error: "forbidden" };
  }

  const teamId = membership.team.id;

  const [taskGroup] = await db
    .select()
    .from(taskGroups)
    .where(eq(taskGroups.id, taskGroupId))
    .limit(1);

  if (!taskGroup) {
    return { error: "forbidden" };
  }

  await db
    .update(submissions)
    .set({ submittedAt: null, updatedAt: new Date() })
    .where(and(eq(submissions.teamId, teamId), eq(submissions.taskGroupId, taskGroupId)));

  revalidatePath(`/${locale}/dashboard/student/tasks/${taskGroupId}`);
  revalidatePath(`/${locale}/dashboard/student/team`);

  return { success: "submission_withdrawn" };
}
