import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SubmissionDetailView } from "@/components/submission/submission-detail-view";
import { MentorNav } from "@/components/mentor/mentor-nav";
import { requireMentorProfile } from "@/lib/auth/session";
import { getSubmissionDetailById } from "@/lib/submissions/queries";

type MentorSubmissionDetailPageProps = {
  params: Promise<{ locale: string; submissionId: string }>;
};

export default async function MentorSubmissionDetailPage({
  params,
}: MentorSubmissionDetailPageProps) {
  const { locale, submissionId } = await params;
  setRequestLocale(locale);
  const { session } = await requireMentorProfile(locale);

  const detail = await getSubmissionDetailById(submissionId);

  if (!detail) {
    notFound();
  }

  const t = await getTranslations("SubmissionReviews");

  return (
    <section className="space-y-6">
      <MentorNav current="submissions" />
      <SubmissionDetailView
        locale={locale}
        submissionId={submissionId}
        backHref="/dashboard/mentor/submissions"
        backLabel={t("backToSubmissions")}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
      />
    </section>
  );
}
