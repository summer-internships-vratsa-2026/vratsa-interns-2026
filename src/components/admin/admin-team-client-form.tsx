"use client";

import { useActionState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useTranslations } from "next-intl";

import { assignTeamClientAction } from "@/actions/admin-teams";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AdminTeamActionState } from "@/lib/validations/admin-team";

type AdminTeamClientFormProps = {
  locale: string;
  teamId: string;
  currentClientId: string | null;
  clients: Array<{ id: string; name: string; organizationName: string | null }>;
};

const initialState: AdminTeamActionState = {};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function AdminTeamClientForm({
  locale,
  teamId,
  currentClientId,
  clients,
}: AdminTeamClientFormProps) {
  const t = useTranslations("AdminTeams");
  const [state, formAction, isPending] = useActionState(
    assignTeamClientAction.bind(null, locale, teamId),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientId">{t("client.label")}</Label>
        <select
          id="clientId"
          name="clientId"
          className={selectClassName}
          defaultValue={currentClientId ?? ""}
        >
          <option value="">{t("client.none")}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.organizationName ?? client.name}
            </option>
          ))}
        </select>
      </div>

      {state.error ? <FormErrorMessage>{t(`errors.${state.error}`)}</FormErrorMessage> : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${state.success}`)}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("client.save")}
      </Button>
    </form>
  );
}
