import { getTranslations } from "next-intl/server";

import type { Team } from "@/db/schema/teams";
import type { SchoolValue } from "@/lib/teams/constants";

type TeamDetailsDisplayProps = {
  team: Team;
  groupName: string | null;
};

export async function TeamDetailsDisplay({ team, groupName }: TeamDetailsDisplayProps) {
  const t = await getTranslations("Team");

  return (
    <div className="space-y-3 text-sm">
      <p className="text-zinc-600 dark:text-zinc-400">{t("teamDetailsReadOnlyNote")}</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-zinc-500">{t("classroom")}</dt>
          <dd>{team.classroom}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500">{t("schoolClass")}</dt>
          <dd>{team.schoolClass}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500">{t("school")}</dt>
          <dd>{t(`schoolOptions.${team.school as SchoolValue}`)}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500">{t("group")}</dt>
          <dd>{groupName ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
