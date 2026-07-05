"use client";

import { useActionState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useTranslations } from "next-intl";

import { updateTeamNameAction } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Team } from "@/db/schema/teams";
import type { TeamActionState } from "@/lib/validations/team-form";

type UpdateTeamNameFormProps = {
  locale: string;
  team: Team;
};

const initialState: TeamActionState = {};

export function UpdateTeamNameForm({ locale, team }: UpdateTeamNameFormProps) {
  const t = useTranslations("Team");
  const [state, formAction, isPending] = useActionState(
    updateTeamNameAction.bind(null, locale, team.id),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("teamName")}</Label>
        <Input id="name" name="name" defaultValue={team.name} required />
      </div>

      {state.error ? <FormErrorMessage>{t(`errors.${state.error}`)}</FormErrorMessage> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("saveTeamName")}
      </Button>
    </form>
  );
}
