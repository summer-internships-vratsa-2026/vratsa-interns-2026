import { setRequestLocale } from "next-intl/server";

import { VerifyEmailContent } from "@/components/auth/verify-email-content";

type VerifyEmailPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ params, searchParams }: VerifyEmailPageProps) {
  const { locale } = await params;
  const { token } = await searchParams;

  setRequestLocale(locale);

  return <VerifyEmailContent token={token} />;
}
