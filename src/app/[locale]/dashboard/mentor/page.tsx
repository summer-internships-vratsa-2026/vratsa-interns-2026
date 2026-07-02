import { getTranslations, setRequestLocale } from "next-intl/server";

import { requireRole } from "@/lib/auth/session";

type MentorDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MentorDashboardPage({ params }: MentorDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "MENTOR");
  const t = await getTranslations("Dashboard.mentor");

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{t("description")}</p>
    </section>
  );
}
