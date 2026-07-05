import { getTranslations, setRequestLocale } from "next-intl/server";

import { SubmissionFilters } from "@/components/submission/submission-filters";
import { SubmissionsTable } from "@/components/submission/submissions-table";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { parseSubmissionListFilters } from "@/lib/submissions/filters";
import {
  getSubmissionFilterOptions,
  getSubmissionsListWithContext,
} from "@/lib/submissions/queries";

type AdminSubmissionsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSubmissionsPage({
  params,
  searchParams,
}: AdminSubmissionsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const filters = parseSubmissionListFilters(resolvedSearchParams);
  const [submissions, filterOptions] = await Promise.all([
    getSubmissionsListWithContext(filters),
    getSubmissionFilterOptions(),
  ]);
  const t = await getTranslations("SubmissionReviews");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/admin" className="text-sm text-zinc-500 underline">
          {t("backToDashboard")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("listTitle")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("listDescription")}</p>
      </div>

      <SubmissionFilters
        groups={filterOptions.groups}
        teams={filterOptions.teams}
        tasks={filterOptions.tasks}
        current={filters}
        clearHref="/dashboard/admin/submissions"
      />

      {submissions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("emptySubmissions")}
        </p>
      ) : (
        <SubmissionsTable
          locale={locale}
          submissions={submissions}
          reviewBasePath="/dashboard/admin/submissions"
        />
      )}
    </section>
  );
}
