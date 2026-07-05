"use client";

import { useActionState, useRef, useState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useTranslations } from "next-intl";

import { deleteAdminTeamAction } from "@/actions/admin-teams";
import { Button } from "@/components/ui/button";
import type { AdminTeamActionState } from "@/lib/validations/admin-team";

const initialState: AdminTeamActionState = {};

type AdminDeleteTeamFormProps = {
  locale: string;
  teamId: string;
};

export function AdminDeleteTeamForm({ locale, teamId }: AdminDeleteTeamFormProps) {
  const t = useTranslations("AdminTeams");
  const formRef = useRef<HTMLFormElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteAdminTeamAction.bind(null, locale),
    initialState,
  );

  return (
    <div className="space-y-3">
      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="teamId" value={teamId} />
      </form>

      {state.error ? <FormErrorMessage>{t(`errors.${state.error}`)}</FormErrorMessage> : null}

      {confirming ? (
        <div className="flex max-w-lg flex-col gap-3 rounded-md border border-red-200 bg-background/80 p-4 dark:border-red-900/50">
          <p className="text-sm text-muted-foreground">{t("confirmDeletePrompt")}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirming(false)}
            >
              {t("cancelConfirm")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => formRef.current?.requestSubmit()}
            >
              {isPending ? t("loading") : t("confirmDeleteAction")}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="destructive" onClick={() => setConfirming(true)}>
          {t("deleteTeam")}
        </Button>
      )}
    </div>
  );
}
