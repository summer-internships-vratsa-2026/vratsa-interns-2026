import { getTranslations, setRequestLocale } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";

type TeamSetupPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TeamSetupPage({ params }: TeamSetupPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "STUDENT");
  const t = await getTranslations("Team");

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("setupTitle")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("setupDescription")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button render={<Link href="/dashboard/student/team/create" />} nativeButton={false}>
          {t("createTeam")}
        </Button>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("setupJoinHint")}</p>
    </section>
  );
}
