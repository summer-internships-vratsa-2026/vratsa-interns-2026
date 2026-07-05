"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { createAdminUserAction } from "@/actions/admin-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/db/schema/enums";
import type { AdminUserActionState } from "@/lib/validations/admin-user";

const ROLES: UserRole[] = ["ADMIN", "MENTOR", "STUDENT", "CLIENT"];

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const initialState: AdminUserActionState = {};

export function AdminCreateUserForm({ locale }: { locale: string }) {
  const t = useTranslations("AdminUsers");
  const [state, formAction, isPending] = useActionState(
    createAdminUserAction.bind(null, locale),
    initialState,
  );

  return (
    <form
      action={formAction}
      className="max-w-xl space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h2 className="font-medium">{t("createTitle")}</h2>
      <div className="space-y-2">
        <Label htmlFor="new-user-name">{t("fields.name")}</Label>
        <Input id="new-user-name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-user-email">{t("fields.email")}</Label>
        <Input id="new-user-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-user-password">{t("fields.password")}</Label>
        <Input
          id="new-user-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-user-role">{t("fields.role")}</Label>
        <select id="new-user-role" name="role" className={selectClassName} required defaultValue="STUDENT">
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`roles.${role}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-user-organization">{t("fields.organization")}</Label>
        <Input id="new-user-organization" name="organizationName" />
        <p className="text-xs text-zinc-500">{t("fields.organizationHint")}</p>
      </div>
      {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${state.success}`)}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("createUser")}
      </Button>
    </form>
  );
}
