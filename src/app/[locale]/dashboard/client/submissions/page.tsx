import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClientNav } from "@/components/client/client-nav";
import { SubmissionFilters } from "@/components/submission/submission-filters";
import { SubmissionsTable } from "@/components/submission/submissions-table";
import { requireClientProfile } from "@/lib/auth/session";
import { parseSubmissionListFilters } from "@/lib/submissions/filters";
import {
  getSubmissionFilterOptionsForClientUser,
  getSubmissionsForClientUser,
} from "@/lib/submissions/queries";

type ClientSubmissionsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientSubmissionsPage({
  params,
  searchParams,
}: ClientSubmissionsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  const { session } = await requireClientProfile(locale);

  const filters = parseSubmissionListFilters(resolvedSearchParams);
  const [submissions, filterOptions] = await Promise.all([
    getSubmissionsForClientUser(session.user.id, filters),
    getSubmissionFilterOptionsForClientUser(session.user.id),
  ]);
  const t = await getTranslations("ClientSubmissions");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("description")}</p>
      </div>

      <ClientNav current="submissions" />

      <SubmissionFilters
        groups={filterOptions.groups}
        teams={filterOptions.teams}
        tasks={filterOptions.tasks}
        current={filters}
        clearHref="/dashboard/client/submissions"
      />

      {submissions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("emptySubmissions")}
        </p>
      ) : (
        <SubmissionsTable
          locale={locale}
          submissions={submissions}
          reviewBasePath="/dashboard/client/submissions"
        />
      )}
    </section>
  );
}
