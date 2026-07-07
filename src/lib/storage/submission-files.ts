import "server-only";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { put } from "@vercel/blob";

const LOCAL_UPLOAD_PREFIX = "/uploads/submission-files/";
const BLOB_PATH_PREFIX = "submission-files/";

function getSafeFileExtension(filename: string): string {
  const rawExt = path.extname(filename).toLowerCase();
  if (!rawExt || rawExt.length > 10) {
    return ".bin";
  }
  return rawExt.replace(/[^a-z0-9.]/g, "") || ".bin";
}

export async function uploadSubmissionFile(file: File): Promise<string> {
  const extension = getSafeFileExtension(file.name);
  const filename = `${randomUUID()}${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${BLOB_PATH_PREFIX}${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "submission-files");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);
  return `${LOCAL_UPLOAD_PREFIX}${filename}`;
}
