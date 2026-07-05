import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClientNav } from "@/components/client/client-nav";
import { SubmissionDetailView } from "@/components/submission/submission-detail-view";
import { requireClientProfile } from "@/lib/auth/session";
import { canAccessSubmission } from "@/lib/permissions/submission";
import { getSubmissionDetailById } from "@/lib/submissions/queries";

type ClientSubmissionDetailPageProps = {
  params: Promise<{ locale: string; submissionId: string }>;
};

export default async function ClientSubmissionDetailPage({
  params,
}: ClientSubmissionDetailPageProps) {
  const { locale, submissionId } = await params;
  setRequestLocale(locale);
  const { session } = await requireClientProfile(locale);

  const detail = await getSubmissionDetailById(submissionId);

  if (!detail) {
    notFound();
  }

  const hasAccess = await canAccessSubmission(session.user.id, session.user.role, detail.teamId);

  if (!hasAccess) {
    notFound();
  }

  const t = await getTranslations("ClientSubmissions");

  return (
    <section className="space-y-6">
      <ClientNav current="submissions" />
      <SubmissionDetailView
        locale={locale}
        submissionId={submissionId}
        backHref="/dashboard/client/submissions"
        backLabel={t("backToSubmissions")}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
      />
    </section>
  );
}
