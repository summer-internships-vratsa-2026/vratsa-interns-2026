"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { resetPasswordAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import type { AuthActionState } from "@/lib/validations/auth";

type ResetPasswordFormProps = {
  token?: string;
};

const initialState: AuthActionState = {};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  if (!token) {
    return (
      <AuthCard title={t("resetPasswordTitle")} description={t("resetPasswordDescription")}>
        <p className="text-sm text-red-600">{t("errors.invalid_token")}</p>
        <p className="mt-4 text-sm">
          <Link href="/forgot-password" className="underline">
            {t("forgotPassword")}
          </Link>
        </p>
      </AuthCard>
    );
  }

  if (state.success === "password_reset") {
    return (
      <AuthCard title={t("resetPasswordTitle")} description={t("resetPasswordDescription")}>
        <p className="text-sm text-zinc-600">{t("passwordResetSuccess")}</p>
        <p className="mt-4 text-sm">
          <Link href="/login" className="underline">
            {t("backToLogin")}
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("resetPasswordTitle")} description={t("resetPasswordDescription")}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-2">
          <Label htmlFor="password">{t("newPassword")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("loading") : t("resetPassword")}
        </Button>
      </form>
    </AuthCard>
  );
}
