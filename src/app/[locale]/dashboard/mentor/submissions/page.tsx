import { getTranslations, setRequestLocale } from "next-intl/server";

import { MentorNav } from "@/components/mentor/mentor-nav";
import { requireMentorProfile } from "@/lib/auth/session";
import { getAllSubmissionsWithContext } from "@/lib/mentors/queries";

type MentorSubmissionsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MentorSubmissionsPage({ params }: MentorSubmissionsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireMentorProfile(locale);

  const submissions = await getAllSubmissionsWithContext();
  const t = await getTranslations("MentorDashboard");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("submissionsPageTitle")}</h1>
      </div>

      <MentorNav current="submissions" />

      {submissions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("emptySubmissions")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t("submissionsColumns.task")}</th>
                <th className="px-4 py-3 font-medium">{t("submissionsColumns.team")}</th>
                <th className="px-4 py-3 font-medium">{t("submissionsColumns.group")}</th>
                <th className="px-4 py-3 font-medium">{t("submissionsColumns.status")}</th>
                <th className="px-4 py-3 font-medium">{t("submissionsColumns.updated")}</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr
                  key={submission.submissionId}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 font-medium">{submission.taskTitle}</td>
                  <td className="px-4 py-3">{submission.teamName}</td>
                  <td className="px-4 py-3">{submission.groupName}</td>
                  <td className="px-4 py-3">
                    {submission.submittedAt ? t("submitted") : t("notSubmitted")}
                  </td>
                  <td className="px-4 py-3">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(submission.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("submissionsReviewNote")}</p>
    </section>
  );
}
