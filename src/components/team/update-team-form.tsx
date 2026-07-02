"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { updateTeamDetailsAction } from "@/actions/teams";
import { GroupField, SchoolClassField, SchoolField } from "@/components/team/team-form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Group } from "@/db/schema/groups";
import type { Team } from "@/db/schema/teams";
import type { SchoolValue } from "@/lib/teams/constants";
import type { TeamActionState } from "@/lib/validations/team-form";

type UpdateTeamFormProps = {
  locale: string;
  team: Team;
  groups: Group[];
};

const initialState: TeamActionState = {};

export function UpdateTeamForm({ locale, team, groups }: UpdateTeamFormProps) {
  const t = useTranslations("Team");
  const [state, formAction, isPending] = useActionState(
    updateTeamDetailsAction.bind(null, locale, team.id),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("teamName")}</Label>
        <Input id="name" name="name" defaultValue={team.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classroom">{t("classroom")}</Label>
        <Input id="classroom" name="classroom" defaultValue={team.classroom} required />
      </div>

      <SchoolClassField defaultValue={team.schoolClass} />

      <SchoolField defaultValue={team.school as SchoolValue} />

      <GroupField groups={groups} defaultValue={team.groupId} />

      {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("saveTeam")}
      </Button>
    </form>
  );
}
