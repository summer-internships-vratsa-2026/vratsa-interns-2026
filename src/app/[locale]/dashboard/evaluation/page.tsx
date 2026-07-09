import { getTranslations, setRequestLocale } from "next-intl/server";

import { requireAuth } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/auth/routes";
import { redirect } from "next/navigation";

type EvaluationPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAuth(locale);

  if (session.user.role !== "ADMIN" && session.user.role !== "MENTOR") {
    redirect(getDashboardPath(session.user.role, locale));
  }

  const t = await getTranslations("Evaluation");

  return (
    <section className="space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* ── 1. Идея ──────────────────────────────────────────────────── */}
      <CriterionCard
        number="1"
        title={t("idea.title")}
        items={[
          t("idea.originality"),
          t("idea.clarity"),
          t("idea.applicable"),
        ]}
      />

      {/* ── 2. Представяне ───────────────────────────────────────────── */}
      <CriterionCard
        number="2"
        title={t("presentation.title")}
        items={[
          t("presentation.elevatorPitch"),
          t("presentation.skills"),
          t("presentation.teamPresentation"),
        ]}
      />

      {/* ── 3. Индивидуално оценяване ────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeading number="3" title={t("individual.title")} />

        {/* Marketing */}
        <RoleCard
          role={t("individual.marketing.role")}
          color="amber"
          items={[
            t("individual.marketing.content"),
            t("individual.marketing.engagement"),
          ]}
        />

        {/* Programming */}
        <RoleCard
          role={t("individual.programming.role")}
          color="sky"
          items={[
            t("individual.programming.features"),
            t("individual.programming.ux"),
          ]}
          subSection={{
            title: t("individual.programming.quality.title"),
            items: [
              t("individual.programming.quality.attention"),
              t("individual.programming.quality.performance"),
              t("individual.programming.quality.errorHandling"),
              t("individual.programming.quality.stability"),
            ],
          }}
        />
      </div>
    </section>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────── */

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-accent text-sm font-bold text-white">
        {number}
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function CriterionCard({
  number,
  title,
  items,
}: {
  number: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-brand-dark/20 p-5 space-y-4">
      <SectionHeading number={number} title={title} />
      <ul className="ml-11 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-accent/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RoleCard({
  role,
  color,
  items,
  subSection,
}: {
  role: string;
  color: "amber" | "sky";
  items: string[];
  subSection?: { title: string; items: string[] };
}) {
  const badge =
    color === "amber"
      ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
      : "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40";

  return (
    <div className="rounded-lg border border-border bg-brand-dark/20 p-5 space-y-4">
      <span className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
        {role}
      </span>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-accent/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {subSection ? (
        <div className="ml-1 space-y-2 rounded-md border border-white/10 bg-brand-dark/30 p-4">
          <p className="text-sm font-medium text-white/80">{subSection.title}</p>
          <ul className="space-y-1.5">
            {subSection.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-white/30" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
