import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SubmissionDetailView } from "@/components/submission/submission-detail-view";
import { requireRole } from "@/lib/auth/session";
import { getSubmissionDetailById } from "@/lib/submissions/queries";

type AdminSubmissionDetailPageProps = {
  params: Promise<{ locale: string; submissionId: string }>;
};

export default async function AdminSubmissionDetailPage({
  params,
}: AdminSubmissionDetailPageProps) {
  const { locale, submissionId } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, "ADMIN");

  const detail = await getSubmissionDetailById(submissionId);

  if (!detail) {
    notFound();
  }

  const t = await getTranslations("SubmissionReviews");

  return (
    <SubmissionDetailView
      locale={locale}
      submissionId={submissionId}
      backHref="/dashboard/admin/submissions"
      backLabel={t("backToSubmissions")}
      currentUserId={session.user.id}
      currentUserRole={session.user.role}
    />
  );
}
