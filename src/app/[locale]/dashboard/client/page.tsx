import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClientNav } from "@/components/client/client-nav";
import { Link } from "@/i18n/navigation";
import { requireClientProfile } from "@/lib/auth/session";

type ClientDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ClientDashboardPage({ params }: ClientDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireClientProfile(locale);
  const t = await getTranslations("Dashboard.client");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("description")}</p>
      </div>

      <ClientNav current="dashboard" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/client/teams"
          className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
        >
          <h2 className="font-medium">{t("teamsLinkTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("teamsLinkDescription")}</p>
        </Link>
        <Link
          href="/dashboard/client/submissions"
          className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
        >
          <h2 className="font-medium">{t("submissionsLinkTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("submissionsLinkDescription")}</p>
        </Link>
      </div>
    </section>
  );
}
