"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";

import { verifyEmailAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Link } from "@/i18n/navigation";
import type { AuthActionState } from "@/lib/validations/auth";

type VerifyEmailContentProps = {
  token?: string;
};

const initialState: AuthActionState = {};

export function VerifyEmailContent({ token }: VerifyEmailContentProps) {
  const t = useTranslations("Auth");
  const [state, formAction] = useActionState(verifyEmailAction, initialState);

  useEffect(() => {
    if (token) {
      const formData = new FormData();
      formData.set("token", token);
      formAction(formData);
    }
  }, [token, formAction]);

  if (!token) {
    return (
      <AuthCard title={t("verifyEmailTitle")} description={t("verifyEmailDescription")}>
        <p className="text-sm text-red-600">{t("errors.invalid_token")}</p>
      </AuthCard>
    );
  }

  if (state.error) {
    return (
      <AuthCard title={t("verifyEmailTitle")} description={t("verifyEmailDescription")}>
        <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p>
        <p className="mt-4 text-sm">
          <Link href="/login" className="underline">
            {t("backToLogin")}
          </Link>
        </p>
      </AuthCard>
    );
  }

  if (state.success) {
    return (
      <AuthCard title={t("verifyEmailTitle")} description={t("verifyEmailDescription")}>
        <p className="text-sm text-muted-foreground">
          {state.success === "already_verified" ? t("alreadyVerified") : t("emailVerified")}
        </p>
        <p className="mt-4 text-sm">
          <Link href="/login" className="underline">
            {t("backToLogin")}
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("verifyEmailTitle")} description={t("verifyEmailDescription")}>
      <p className="text-sm text-muted-foreground">{t("loading")}</p>
    </AuthCard>
  );
}
