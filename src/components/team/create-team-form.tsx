"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { createTeamAction } from "@/actions/teams";
import { GroupField, SchoolClassField, SchoolField } from "@/components/team/team-form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Group } from "@/db/schema/groups";
import type { TeamActionState } from "@/lib/validations/team-form";

type CreateTeamFormProps = {
  locale: string;
  groups: Group[];
};

const initialState: TeamActionState = {};

export function CreateTeamForm({ locale, groups }: CreateTeamFormProps) {
  const t = useTranslations("Team");
  const [state, formAction, isPending] = useActionState(
    createTeamAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("teamName")}</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classroom">{t("classroom")}</Label>
        <Input id="classroom" name="classroom" required />
      </div>

      <SchoolClassField />

      <SchoolField />

      <GroupField groups={groups} />

      <div className="space-y-2">
        <Label htmlFor="projectRole">{t("yourRole")}</Label>
        <select
          id="projectRole"
          name="projectRole"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          defaultValue="SOFTWARE_DEVELOPER"
          required
        >
          <option value="SOFTWARE_DEVELOPER">{t("roles.SOFTWARE_DEVELOPER")}</option>
          <option value="MARKETING_EXPERT">{t("roles.MARKETING_EXPERT")}</option>
          <option value="PRODUCT_OWNER">{t("roles.PRODUCT_OWNER")}</option>
        </select>
      </div>

      {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("createTeam")}
      </Button>
    </form>
  );
}
