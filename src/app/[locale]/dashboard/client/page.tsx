import { getTranslations, setRequestLocale } from "next-intl/server";

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
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/client/teams"
          className="rounded-lg border border-border p-4 transition hover:bg-brand-dark/30 "
        >
          <h2 className="font-medium">{t("teamsLinkTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("teamsLinkDescription")}</p>
        </Link>
        <Link
          href="/dashboard/client/submissions"
          className="rounded-lg border border-border p-4 transition hover:bg-brand-dark/30 "
        >
          <h2 className="font-medium">{t("submissionsLinkTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("submissionsLinkDescription")}</p>
        </Link>
      </div>
    </section>
  );
}
