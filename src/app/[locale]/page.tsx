import { getTranslations, setRequestLocale } from "next-intl/server";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-brand-deep px-6 py-24 text-white">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-white/70">{t("description")}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link href="/login" />} nativeButton={false}>
            {t("login")}
          </Button>
          <Button render={<Link href="/register" />} nativeButton={false} variant="outline">
            {t("register")}
          </Button>
          <LanguageSwitcher />
        </div>
      </main>
    </div>
  );
}
