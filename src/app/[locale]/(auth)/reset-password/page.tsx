import { setRequestLocale } from "next-intl/server";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  const { locale } = await params;
  const { token } = await searchParams;

  setRequestLocale(locale);

  return <ResetPasswordForm token={token} />;
}
