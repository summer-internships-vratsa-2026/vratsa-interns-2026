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
      <p className="text-muted-foreground">{t("teamDetailsReadOnlyNote")}</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">{t("classroom")}</dt>
          <dd>{team.classroom}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">{t("schoolClass")}</dt>
          <dd>{team.schoolClass}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">{t("school")}</dt>
          <dd>{t(`schoolOptions.${team.school as SchoolValue}`)}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">{t("group")}</dt>
          <dd>{groupName ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
