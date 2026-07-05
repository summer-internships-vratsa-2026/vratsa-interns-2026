"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { registerAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import type { AuthActionState } from "@/lib/validations/auth";

type RegisterFormProps = {
  locale: string;
};

const initialState: AuthActionState = {};

export function RegisterForm({ locale }: RegisterFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState(
    registerAction.bind(null, locale),
    initialState,
  );

  if (state.success === "registration_success") {
    return (
      <AuthCard title={t("verifyEmailTitle")} description={t("verifyEmailDescription")}>
        <p className="text-sm text-muted-foreground">{t("checkInbox")}</p>
        <p className="mt-4 text-sm">
          <Link href="/login" className="underline">
            {t("backToLogin")}
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("registerTitle")} description={t("registerDescription")}>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">{t("role")}</Label>
          <select
            id="role"
            name="role"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            defaultValue="STUDENT"
            required
          >
            <option value="STUDENT">{t("roles.STUDENT")}</option>
            <option value="MENTOR">{t("roles.MENTOR")}</option>
          </select>
        </div>

        {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("loading") : t("register")}
        </Button>
      </form>

      <p className="mt-4 text-sm">
        {t("hasAccount")}{" "}
        <Link href="/login" className="underline">
          {t("login")}
        </Link>
      </p>
    </AuthCard>
  );
}
