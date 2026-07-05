"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  createClientAction,
  updateClientOrganizationAction,
} from "@/actions/admin-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminClientActionState } from "@/lib/validations/admin-client";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  organizationName: string | null;
  teamCount: number;
};

type AdminClientsPanelProps = {
  locale: string;
  clients: ClientRow[];
};

const initialState: AdminClientActionState = {};

export function AdminClientsPanel({ locale, clients }: AdminClientsPanelProps) {
  const t = useTranslations("AdminClients");

  return (
    <div className="space-y-8">
      <CreateClientForm locale={locale} />

      {clients.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("emptyClients")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t("columns.name")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.email")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.organization")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.teams")}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <AdminClientRow key={client.id} locale={locale} client={client} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateClientForm({ locale }: { locale: string }) {
  const t = useTranslations("AdminClients");
  const [state, formAction, isPending] = useActionState(
    createClientAction.bind(null, locale),
    initialState,
  );

  return (
    <form
      action={formAction}
      className="max-w-xl space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h2 className="font-medium">{t("createTitle")}</h2>
      <div className="space-y-2">
        <Label htmlFor="client-name">{t("fields.name")}</Label>
        <Input id="client-name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-email">{t("fields.email")}</Label>
        <Input id="client-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-password">{t("fields.password")}</Label>
        <Input
          id="client-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-organization">{t("fields.organization")}</Label>
        <Input id="client-organization" name="organizationName" />
      </div>
      {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${state.success}`)}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("createClient")}
      </Button>
    </form>
  );
}

function AdminClientRow({ locale, client }: { locale: string; client: ClientRow }) {
  const t = useTranslations("AdminClients");
  const [state, formAction, isPending] = useActionState(
    updateClientOrganizationAction.bind(null, locale),
    initialState,
  );

  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
      <td className="px-4 py-3 font-medium">{client.name}</td>
      <td className="px-4 py-3">{client.email}</td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="clientId" value={client.id} />
          <Input
            name="organizationName"
            defaultValue={client.organizationName ?? ""}
            placeholder={t("fields.organizationPlaceholder")}
            className="max-w-xs"
          />
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? t("loading") : t("save")}
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
      <td className="px-4 py-3">{client.teamCount}</td>
    </tr>
  );
}
