import { getTranslations, setRequestLocale } from "next-intl/server";

import { requireRole } from "@/lib/auth/session";

type ClientDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ClientDashboardPage({ params }: ClientDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "CLIENT");
  const t = await getTranslations("Dashboard.client");

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{t("description")}</p>
    </section>
  );
}
