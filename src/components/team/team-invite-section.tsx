"use client";

import { useActionState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useTranslations } from "next-intl";

import { generateInviteLinkAction, inviteByEmailAction } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeamActionState } from "@/lib/validations/team-form";

type TeamInviteSectionProps = {
  locale: string;
  teamId: string;
  memberCount: number;
  maxMembers: number;
};

const initialState: TeamActionState = {};

export function TeamInviteSection({
  locale,
  teamId,
  memberCount,
  maxMembers,
}: TeamInviteSectionProps) {
  const t = useTranslations("Team");
  const [linkState, linkAction, linkPending] = useActionState(
    generateInviteLinkAction.bind(null, locale, teamId),
    initialState,
  );
  const [emailState, emailAction, emailPending] = useActionState(
    inviteByEmailAction.bind(null, locale, teamId),
    initialState,
  );

  const teamFull = memberCount >= maxMembers;

  return (
    <div className="space-y-6 rounded-lg border border-border p-4">
      <div>
        <h2 className="text-lg font-medium">{t("inviteTeammates")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("membersCount", { count: memberCount, max: maxMembers })}
        </p>
        {memberCount < 2 ? (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{t("teamSizeWarning")}</p>
        ) : null}
      </div>

      {teamFull ? (
        <p className="text-sm text-muted-foreground">{t("teamFullMessage")}</p>
      ) : (
        <>
          <form action={linkAction} className="space-y-2">
            <Button type="submit" variant="outline" disabled={linkPending}>
              {linkPending ? t("loading") : t("generateInviteLink")}
            </Button>
            {linkState.inviteUrl ? (
              <p className="break-all text-sm text-muted-foreground">{linkState.inviteUrl}</p>
            ) : null}
            {linkState.error ? (
              <FormErrorMessage>{t(`errors.${linkState.error}`)}</FormErrorMessage>
            ) : null}
          </form>

          <form action={emailAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">{t("inviteEmail")}</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            {emailState.error ? (
              <FormErrorMessage>{t(`errors.${emailState.error}`)}</FormErrorMessage>
            ) : null}
            {emailState.success === "invite_sent" ? (
              <p className="text-sm text-green-700 dark:text-green-400">{t("inviteSent")}</p>
            ) : null}
            <Button type="submit" disabled={emailPending}>
              {emailPending ? t("loading") : t("sendInvite")}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
