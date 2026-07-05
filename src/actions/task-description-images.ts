"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { auth } from "@/auth";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export type TaskDescriptionImageUploadResult = {
  url?: string;
  error?: "forbidden" | "invalid_file" | "file_too_large" | "invalid_file_type" | "upload_failed";
};

export async function uploadTaskDescriptionImageAction(
  formData: FormData,
): Promise<TaskDescriptionImageUploadResult> {
  const session = await auth();

  const allowedRoles = new Set(["ADMIN", "MENTOR", "STUDENT"]);

  if (!session?.user || !allowedRoles.has(session.user.role)) {
    return { error: "forbidden" };
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "invalid_file" };
  }

  if (file.size > MAX_SIZE) {
    return { error: "file_too_large" };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "invalid_file_type" };
  }

  const extension = EXTENSIONS[file.type];

  if (!extension) {
    return { error: "invalid_file_type" };
  }

  try {
    const filename = `${randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "task-images");
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return { url: `/uploads/task-images/${filename}` };
  } catch {
    return { error: "upload_failed" };
  }
}
