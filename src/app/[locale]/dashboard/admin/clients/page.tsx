import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminClientsPanel } from "@/components/admin/admin-clients-panel";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { getClientsWithTeamCounts } from "@/lib/clients/queries";

type AdminClientsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminClientsPage({ params }: AdminClientsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const clients = await getClientsWithTeamCounts();
  const t = await getTranslations("AdminClients");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/admin" className="text-sm text-zinc-500 underline">
          {t("backToDashboard")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("description")}</p>
      </div>

      <AdminClientsPanel locale={locale} clients={clients} />
    </section>
  );
}
