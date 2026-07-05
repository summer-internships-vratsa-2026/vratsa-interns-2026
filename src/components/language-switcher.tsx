"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_LABEL_KEYS = {
  bg: "localeBg",
  en: "localeEn",
} as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Common");

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        aria-label={t("language")}
        onChange={(event) => {
          const nextLocale = event.target.value;
          if (nextLocale !== locale) {
            router.replace(pathname, { locale: nextLocale });
          }
        }}
        className="h-8 appearance-none rounded-lg border border-white/20 bg-brand-medium/50 py-1 pr-7 pl-2.5 text-sm font-medium text-white outline-none transition-colors hover:bg-brand-medium focus-visible:border-brand-accent focus-visible:ring-3 focus-visible:ring-brand-accent/50"
      >
        {routing.locales.map((item) => (
          <option key={item} value={item} className="bg-brand-dark text-white">
            {t(LOCALE_LABEL_KEYS[item])}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute right-2 size-3.5 text-white/70"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  );
}
