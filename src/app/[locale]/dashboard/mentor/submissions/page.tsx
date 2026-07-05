import { getTranslations, setRequestLocale } from "next-intl/server";

import { SubmissionFilters } from "@/components/submission/submission-filters";
import { SubmissionsTable } from "@/components/submission/submissions-table";
import { requireMentorProfile } from "@/lib/auth/session";
import { parseSubmissionListFilters } from "@/lib/submissions/filters";
import {
  getSubmissionFilterOptions,
  getSubmissionsListWithContext,
} from "@/lib/submissions/queries";

type MentorSubmissionsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MentorSubmissionsPage({
  params,
  searchParams,
}: MentorSubmissionsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  await requireMentorProfile(locale);

  const filters = parseSubmissionListFilters(resolvedSearchParams);
  const [submissions, filterOptions] = await Promise.all([
    getSubmissionsListWithContext(filters),
    getSubmissionFilterOptions(),
  ]);
  const t = await getTranslations("SubmissionReviews");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("listTitle")}</h1>
        <p className="text-muted-foreground">{t("listDescription")}</p>
      </div>
      <SubmissionFilters
        groups={filterOptions.groups}
        teams={filterOptions.teams}
        tasks={filterOptions.tasks}
        current={filters}
        clearHref="/dashboard/mentor/submissions"
      />

      {submissions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground ">
          {t("emptySubmissions")}
        </p>
      ) : (
        <SubmissionsTable
          locale={locale}
          submissions={submissions}
          reviewBasePath="/dashboard/mentor/submissions"
        />
      )}
    </section>
  );
}
