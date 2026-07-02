"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { loginAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import type { AuthActionState } from "@/lib/validations/auth";

type LoginFormProps = {
  locale: string;
  callbackUrl?: string;
};

const initialState: AuthActionState = {};

export function LoginForm({ locale, callbackUrl }: LoginFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState(
    loginAction.bind(null, locale, callbackUrl),
    initialState,
  );

  return (
    <AuthCard title={t("loginTitle")} description={t("loginDescription")}>
      <form action={formAction} className="space-y-4">
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
            autoComplete="current-password"
            required
          />
        </div>

        {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("loading") : t("login")}
        </Button>
      </form>

      <div className="mt-4 space-y-2 text-sm">
        <p>
          <Link href="/forgot-password" className="underline">
            {t("forgotPassword")}
          </Link>
        </p>
        <p>
          {t("noAccount")}{" "}
          <Link href="/register" className="underline">
            {t("register")}
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
