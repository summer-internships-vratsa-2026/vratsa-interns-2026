"use client";

import { useActionState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useTranslations } from "next-intl";

import { updateTeamLinksAction } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Team } from "@/db/schema/teams";
import { TEAM_SOCIAL_PLATFORMS } from "@/lib/teams/social-urls";
import { normalizeTeamSocialUrls } from "@/lib/teams/social-urls";
import type { TeamActionState } from "@/lib/validations/team-form";

type TeamLinksFormProps = {
  locale: string;
  team: Team;
};

const initialState: TeamActionState = {};

export function TeamLinksForm({ locale, team }: TeamLinksFormProps) {
  const t = useTranslations("Team");
  const [state, formAction, isPending] = useActionState(
    updateTeamLinksAction.bind(null, locale, team.id),
    initialState,
  );
  const socialUrls = normalizeTeamSocialUrls(team.socialUrls);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="githubRepoUrl">{t("githubRepoUrl")}</Label>
        <Input
          id="githubRepoUrl"
          name="githubRepoUrl"
          type="url"
          defaultValue={team.githubRepoUrl ?? ""}
          placeholder="https://github.com/org/repo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectUrl">{t("projectUrl")}</Label>
        <Input
          id="projectUrl"
          name="projectUrl"
          type="url"
          defaultValue={team.projectUrl ?? ""}
          placeholder="https://example.com"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">{t("socialUrls")}</legend>
        <p className="text-sm text-muted-foreground">{t("socialUrlsHint")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEAM_SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform} className="space-y-1">
              <Label htmlFor={`social_${platform}`}>{t(`socialPlatforms.${platform}`)}</Label>
              <Input
                id={`social_${platform}`}
                name={`social_${platform}`}
                type="url"
                defaultValue={socialUrls[platform] ?? ""}
                placeholder="https://"
              />
            </div>
          ))}
        </div>
      </fieldset>

      {state.error ? <FormErrorMessage>{t(`errors.${state.error}`)}</FormErrorMessage> : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${state.success}`)}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("saveTeamLinks")}
      </Button>
    </form>
  );
}
