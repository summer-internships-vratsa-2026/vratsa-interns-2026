import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminTeamFilters } from "@/components/admin/admin-team-filters";
import { AdminTeamsTable } from "@/components/admin/admin-teams-table";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { parseAdminTeamFilters } from "@/lib/teams/admin-filters";
import {
  getAdminTeamMembersByTeamIds,
  getAdminTeamsList,
  getAllGroups,
} from "@/lib/teams/admin-queries";

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");

  const filters = parseAdminTeamFilters(resolvedSearchParams);
  const teams = await getAdminTeamsList(filters);
  const membersByTeam = await getAdminTeamMembersByTeamIds(teams.map((team) => team.id));
  const teamsWithMembers = teams.map((team) => ({
    ...team,
    members: membersByTeam[team.id] ?? [],
  }));
  const groups = await getAllGroups();

  return (
    <div className="flex min-h-full flex-col bg-brand-deep text-white">
      <header className="border-b border-white/10 bg-brand-dark px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
            <p className="max-w-2xl text-base text-white/70 sm:text-lg">{t("description")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button render={<Link href="/login" />} nativeButton={false}>
              {t("login")}
            </Button>
            <Button render={<Link href="/register" />} nativeButton={false} variant="outline">
              {t("register")}
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <AdminTeamFilters
          groups={groups}
          current={filters}
          showMentorFilter={false}
          showClientFilter={false}
        />
        <AdminTeamsTable teams={teamsWithMembers} linkTeams={false} />
      </main>
    </div>
  );
}
