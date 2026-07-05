"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { assignClientTeamAction, removeClientTeamAction } from "@/actions/admin-clients";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import type { AdminClientActionState } from "@/lib/validations/admin-client";

type ClientTeamRow = {
  id: string;
  name: string;
  groupName: string;
  classroom: string;
  schoolClass: string;
  school: string;
};

type AvailableTeam = {
  id: string;
  name: string;
  groupName: string;
};

type AdminClientTeamsPanelProps = {
  locale: string;
  clientId: string;
  assignedTeams: ClientTeamRow[];
  availableTeams: AvailableTeam[];
};

const initialState: AdminClientActionState = {};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function AdminClientTeamsPanel({
  locale,
  clientId,
  assignedTeams,
  availableTeams,
}: AdminClientTeamsPanelProps) {
  const t = useTranslations("AdminUsers.clientTeams");

  return (
    <div className="space-y-6">
      {assignedTeams.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("emptyAssigned")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t("columns.team")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.group")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.classroom")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {assignedTeams.map((team) => (
                <AssignedTeamRow
                  key={team.id}
                  locale={locale}
                  clientId={clientId}
                  team={team}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AssignTeamForm locale={locale} clientId={clientId} availableTeams={availableTeams} />
    </div>
  );
}

function AssignedTeamRow({
  locale,
  clientId,
  team,
}: {
  locale: string;
  clientId: string;
  team: ClientTeamRow;
}) {
  const t = useTranslations("AdminUsers.clientTeams");
  const [state, formAction, isPending] = useActionState(
    removeClientTeamAction.bind(null, locale),
    initialState,
  );

  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
      <td className="px-4 py-3 font-medium">
        <Link href={`/dashboard/admin/teams/${team.id}`} className="underline">
          {team.name}
        </Link>
      </td>
      <td className="px-4 py-3">{team.groupName}</td>
      <td className="px-4 py-3">{team.classroom}</td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="teamId" value={team.id} />
          <Button type="submit" size="sm" variant="outline" disabled={isPending}>
            {isPending ? t("loading") : t("remove")}
          </Button>
          {state.error ? (
            <span className="text-xs text-red-600">{t(`errors.${state.error}`)}</span>
          ) : null}
          {state.success ? (
            <span className="text-xs text-green-700 dark:text-green-400">
              {t(`success.${state.success}`)}
            </span>
          ) : null}
        </form>
      </td>
    </tr>
  );
}

function AssignTeamForm({
  locale,
  clientId,
  availableTeams,
}: {
  locale: string;
  clientId: string;
  availableTeams: AvailableTeam[];
}) {
  const t = useTranslations("AdminUsers.clientTeams");
  const [state, formAction, isPending] = useActionState(
    assignClientTeamAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="font-medium">{t("assignTitle")}</h3>
      <input type="hidden" name="clientId" value={clientId} />
      <div className="space-y-2">
        <Label htmlFor="assign-team">{t("fields.team")}</Label>
        {availableTeams.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("noAvailableTeams")}</p>
        ) : (
          <select id="assign-team" name="teamId" className={selectClassName} required>
            <option value="">{t("selectTeam")}</option>
            {availableTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.groupName})
              </option>
            ))}
          </select>
        )}
      </div>
      {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${state.success}`)}</p>
      ) : null}
      <Button type="submit" disabled={isPending || availableTeams.length === 0}>
        {isPending ? t("loading") : t("assign")}
      </Button>
    </form>
  );
}
