import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CreateTeamForm } from "@/components/team/create-team-form";
import { getInternshipGroups, getStudentByUserId, getTeamMembershipForStudent } from "@/lib/teams/queries";
import { requireRole } from "@/lib/auth/session";

type CreateTeamPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CreateTeamPage({ params }: CreateTeamPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, "STUDENT");
  const student = await getStudentByUserId(session.user.id);

  if (student) {
    const membership = await getTeamMembershipForStudent(student.id);

    if (membership) {
      redirect(`/${locale}/dashboard/student/team`);
    }
  }

  const groups = await getInternshipGroups();
  const t = await getTranslations("Team");

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("createTeamTitle")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("createTeamDescription")}</p>
      </div>
      <CreateTeamForm locale={locale} groups={groups} />
    </section>
  );
}
