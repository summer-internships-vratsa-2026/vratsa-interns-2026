import { getTranslations, setRequestLocale } from "next-intl/server";

import { MentorNav } from "@/components/mentor/mentor-nav";
import { requireMentorProfile } from "@/lib/auth/session";
import { getGroupsOverview } from "@/lib/mentors/queries";

type MentorGroupsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MentorGroupsPage({ params }: MentorGroupsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireMentorProfile(locale);

  const groups = await getGroupsOverview();
  const t = await getTranslations("MentorDashboard");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("groupsPageTitle")}</h1>
      </div>

      <MentorNav current="groups" />

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 font-medium">{t("groupsColumns.name")}</th>
              <th className="px-4 py-3 font-medium">{t("groupsColumns.teams")}</th>
              <th className="px-4 py-3 font-medium">{t("groupsColumns.mainMentors")}</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr
                key={group.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3 font-medium">{group.name}</td>
                <td className="px-4 py-3">{group.teamCount}</td>
                <td className="px-4 py-3">
                  {group.mainMentors.length > 0 ? group.mainMentors.join(", ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
