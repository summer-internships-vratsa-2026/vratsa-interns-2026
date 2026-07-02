import { getTranslations, setRequestLocale } from "next-intl/server";

import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { requireAuth } from "@/lib/auth/session";

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireAuth(locale);
  const t = await getTranslations("Dashboard");

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">{t("welcome")}</p>
            <p className="font-medium">{session.user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <LogoutButton locale={locale} label={t("logout")} />
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">{children}</main>
    </div>
  );
}
