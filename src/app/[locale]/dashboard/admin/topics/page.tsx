import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminTopicsPanel } from "@/components/admin/admin-topics-panel";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { getAllTopics } from "@/lib/topics/queries";

type AdminTopicsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminTopicsPage({ params }: AdminTopicsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const topics = await getAllTopics();
  const t = await getTranslations("AdminTopics");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <AdminTopicsPanel locale={locale} topics={topics} />
    </section>
  );
}
