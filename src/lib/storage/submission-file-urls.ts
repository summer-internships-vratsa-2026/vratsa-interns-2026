const LOCAL_UPLOAD_PREFIX = "/uploads/submission-files/";

export function isSubmissionFileUrl(value: string): boolean {
  return (
    value.startsWith(LOCAL_UPLOAD_PREFIX) ||
    /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/submission-files\//.test(value)
  );
}

export function getSubmissionFileLabel(url: string): string {
  return decodeURIComponent(url.split("/").pop() ?? url);
}
