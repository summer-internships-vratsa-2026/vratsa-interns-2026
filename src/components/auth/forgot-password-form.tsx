"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { forgotPasswordAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import type { AuthActionState } from "@/lib/validations/auth";

type ForgotPasswordFormProps = {
  locale: string;
};

const initialState: AuthActionState = {};

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction.bind(null, locale),
    initialState,
  );

  return (
    <AuthCard title={t("forgotPasswordTitle")} description={t("forgotPasswordDescription")}>
      {state.success === "reset_email_sent" ? (
        <p className="text-sm text-zinc-600">{t("resetEmailSent")}</p>
      ) : (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          {state.error ? (
            <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t("loading") : t("sendResetLink")}
          </Button>
        </form>
      )}

      <p className="mt-4 text-sm">
        <Link href="/login" className="underline">
          {t("backToLogin")}
        </Link>
      </p>
    </AuthCard>
  );
}
