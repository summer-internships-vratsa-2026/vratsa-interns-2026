import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { requireMentorProfile } from "@/lib/auth/session";
import { getGroupsOverview } from "@/lib/mentors/queries";
import { getGroupName } from "@/lib/teams/queries";
import { hasMainGroupAssigned } from "@/lib/permissions";

type MentorDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MentorDashboardPage({ params }: MentorDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { mentor } = await requireMentorProfile(locale);
  const t = await getTranslations("MentorDashboard");

  const [mainGroupName, groups] = await Promise.all([
    mentor.mainGroupId ? getGroupName(mentor.mainGroupId) : Promise.resolve(null),
    getGroupsOverview(),
  ]);

  const mainGroupTeams = mentor.mainGroupId
    ? (groups.find((group) => group.id === mentor.mainGroupId)?.teamCount ?? 0)
    : 0;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>
      {!hasMainGroupAssigned(mentor) ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900   ">
          {t("noMainGroupWarning")}
        </div>
      ) : (
        <div className="rounded-lg border border-border p-4">
          <h2 className="font-medium">{t("mainGroupTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("mainGroupDescription", { group: mainGroupName ?? "—", teams: mainGroupTeams })}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/mentor/groups"
          className="rounded-lg border border-border p-4 transition hover:bg-brand-dark/30 "
        >
          <h2 className="font-medium">{t("cards.groupsTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("cards.groupsDescription", { count: groups.length })}
          </p>
        </Link>
        <Link
          href="/dashboard/mentor/teams"
          className="rounded-lg border border-border p-4 transition hover:bg-brand-dark/30 "
        >
          <h2 className="font-medium">{t("cards.teamsTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("cards.teamsDescription")}</p>
        </Link>
        <Link
          href="/dashboard/mentor/tasks"
          className="rounded-lg border border-border p-4 transition hover:bg-brand-dark/30 "
        >
          <h2 className="font-medium">{t("cards.tasksTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("cards.tasksDescription")}</p>
        </Link>
        <Link
          href="/dashboard/mentor/submissions"
          className="rounded-lg border border-border p-4 transition hover:bg-brand-dark/30 "
        >
          <h2 className="font-medium">{t("cards.submissionsTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("cards.submissionsDescription")}
          </p>
        </Link>
      </div>

      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground ">
        <p className="font-medium">{t("permissionsTitle")}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{t("permissions.viewAll")}</li>
          <li>{t("permissions.createTasks")}</li>
          <li>{t("permissions.commentAll")}</li>
          <li>{t("permissions.gradeAll")}</li>
        </ul>
      </div>
    </section>
  );
}
