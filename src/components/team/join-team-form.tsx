"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { joinTeamAction } from "@/actions/teams";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import type { ProjectRole } from "@/db/schema/enums";
import { ALL_PROJECT_ROLES } from "@/lib/validations/team";
import type { TeamActionState } from "@/lib/validations/team-form";

type JoinTeamFormProps = {
  locale: string;
  token: string;
  teamName: string;
  isLoggedIn: boolean;
  isStudent: boolean;
  callbackUrl: string;
};

const initialState: TeamActionState = {};

export function JoinTeamForm({
  locale,
  token,
  teamName,
  isLoggedIn,
  isStudent,
  callbackUrl,
}: JoinTeamFormProps) {
  const t = useTranslations("Team");
  const [state, formAction, isPending] = useActionState(
    joinTeamAction.bind(null, locale),
    initialState,
  );

  if (!isLoggedIn) {
    return (
      <AuthCard title={t("joinTeamTitle")} description={t("joinTeamLoginRequired", { teamName })}>
        <div className="flex flex-col gap-3 text-sm">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="underline"
          >
            {t("loginToJoin")}
          </Link>
          <Link
            href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="underline"
          >
            {t("registerToJoin")}
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (!isStudent) {
    return (
      <AuthCard title={t("joinTeamTitle")} description={t("joinTeamStudentOnly")}>
        <Link href="/" className="text-sm underline">
          {t("backHome")}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("joinTeamTitle")} description={t("joinTeamDescription", { teamName })}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-2">
          <Label htmlFor="projectRole">{t("yourRole")}</Label>
          <select
            id="projectRole"
            name="projectRole"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            defaultValue={ALL_PROJECT_ROLES[0]}
            required
          >
            {ALL_PROJECT_ROLES.map((role: ProjectRole) => (
              <option key={role} value={role}>
                {t(`roles.${role}`)}
              </option>
            ))}
          </select>
        </div>

        {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("loading") : t("joinTeam")}
        </Button>
      </form>
    </AuthCard>
  );
}
