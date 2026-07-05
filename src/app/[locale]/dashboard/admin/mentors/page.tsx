import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminMentorsTable } from "@/components/admin/admin-mentors-table";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { getAllGroups } from "@/lib/teams/admin-queries";
import { getMentorsWithMainGroup } from "@/lib/mentors/queries";

type AdminMentorsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminMentorsPage({ params }: AdminMentorsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const [mentors, groups] = await Promise.all([getMentorsWithMainGroup(), getAllGroups()]);
  const t = await getTranslations("AdminMentors");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <AdminMentorsTable locale={locale} mentors={mentors} groups={groups} />
    </section>
  );
}
