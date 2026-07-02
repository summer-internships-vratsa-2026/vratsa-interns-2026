import { setRequestLocale } from "next-intl/server";

import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { callbackUrl } = await searchParams;

  setRequestLocale(locale);

  return <LoginForm locale={locale} callbackUrl={callbackUrl} />;
}
