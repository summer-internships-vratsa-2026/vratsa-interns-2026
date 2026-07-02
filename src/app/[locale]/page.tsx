import { getTranslations, setRequestLocale } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">{t("description")}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link href="/login" />} nativeButton={false}>
            {t("login")}
          </Button>
          <Button render={<Link href="/register" />} nativeButton={false} variant="outline">
            {t("register")}
          </Button>
          <Link
            href="/"
            locale="bg"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            BG
          </Link>
          <Link
            href="/"
            locale="en"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            EN
          </Link>
        </div>
      </main>
    </div>
  );
}
