"use client";

import { BookOpen, ExternalLink, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const RESOURCES_URL = "https://student-programming-resources.vercel.app/";

export function ResourcesPopup() {
  const t = useTranslations("ResourcesPopup");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-brand-dark px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-brand-medium focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-accent/50"
      >
        <BookOpen className="size-4 shrink-0" aria-hidden />
        {t("title")}
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-72 rounded-xl border border-white/15 bg-brand-dark p-4 shadow-xl"
      role="dialog"
      aria-labelledby="resources-popup-title"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 shrink-0 text-brand-accent" aria-hidden />
          <h2 id="resources-popup-title" className="text-sm font-semibold text-white">
            {t("title")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("close")}
          className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-white/70">{t("description")}</p>
      <Button
        size="sm"
        className="w-full"
        render={
          <a href={RESOURCES_URL} target="_blank" rel="noopener noreferrer" />
        }
        nativeButton={false}
      >
        {t("openLink")}
        <ExternalLink className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}
