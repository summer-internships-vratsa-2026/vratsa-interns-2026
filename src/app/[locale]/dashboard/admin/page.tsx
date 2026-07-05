import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";

type AdminDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");
  const t = await getTranslations("Dashboard.admin");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/admin/teams"
          className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
        >
          <h2 className="font-medium">{t("teamsLinkTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("teamsLinkDescription")}</p>
        </Link>
        <Link
          href="/dashboard/admin/mentors"
          className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
        >
          <h2 className="font-medium">{t("mentorsLinkTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("mentorsLinkDescription")}</p>
        </Link>
        <Link
          href="/dashboard/admin/tasks"
          className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
        >
          <h2 className="font-medium">{t("tasksLinkTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("tasksLinkDescription")}</p>
        </Link>
        <Link
          href="/dashboard/admin/topics"
          className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
        >
          <h2 className="font-medium">{t("topicsLinkTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("topicsLinkDescription")}</p>
        </Link>
        <Link
          href="/dashboard/admin/clients"
          className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
        >
          <h2 className="font-medium">{t("clientsLinkTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("clientsLinkDescription")}</p>
        </Link>
        <Link
          href="/dashboard/admin/submissions"
          className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
        >
          <h2 className="font-medium">{t("submissionsLinkTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("submissionsLinkDescription")}</p>
        </Link>
      </div>
    </section>
  );
}
