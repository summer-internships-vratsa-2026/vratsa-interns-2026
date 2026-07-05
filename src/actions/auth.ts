"use server";

import { signIn, signOut } from "@/auth";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/auth/emails";
import {
  generateSecureToken,
  getPasswordResetExpiryDate,
  getVerificationExpiryDate,
  isTokenExpired,
} from "@/lib/auth/tokens";
import {
  createUserWithProfile,
  getUserByEmail,
  getUserByPasswordResetToken,
  getUserByVerificationToken,
  markEmailVerified,
  resetUserPassword,
  resendVerificationToken,
  setPasswordResetToken,
} from "@/lib/auth/users";
import { getDashboardPath } from "@/lib/auth/routes";
import { isMentorApproved } from "@/lib/mentors/approval";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type AuthActionState,
  verifyEmailSchema,
} from "@/lib/validations/auth";

export async function logoutAction(locale: string) {
  await signOut({ redirectTo: `/${locale}` });
}

export async function registerAction(
  locale: string,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const existingUser = await getUserByEmail(parsed.data.email);

  if (existingUser) {
    return { error: "email_exists" };
  }

  const verificationToken = generateSecureToken();
  const passwordHash = await hashPassword(parsed.data.password);

  const user = await createUserWithProfile({
    email: parsed.data.email,
    passwordHash,
    name: parsed.data.name,
    role: parsed.data.role,
    verificationToken,
    verificationExpiresAt: getVerificationExpiryDate(),
  });

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    token: verificationToken,
    locale,
  });

  return { success: "registration_success" };
}

export async function loginAction(
  locale: string,
  callbackUrl: string | undefined,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue : "";

  const parsed = loginSchema.safeParse({
    email: emailValue,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "invalid_credentials", email };
  }

  const user = await getUserByEmail(parsed.data.email);

  if (!user) {
    return { error: "invalid_credentials", email: parsed.data.email };
  }

  if (!user.emailVerifiedAt) {
    return { error: "email_not_verified", email: parsed.data.email };
  }

  if (user.disabledAt) {
    return { error: "account_disabled", email: parsed.data.email };
  }

  if (user.role === "MENTOR" && !(await isMentorApproved(user.id))) {
    return { error: "mentor_not_approved", email: parsed.data.email };
  }

  const passwordValid = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!passwordValid) {
    return { error: "invalid_credentials", email: parsed.data.email };
  }

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: callbackUrl ?? getDashboardPath(user.role, locale),
  });

  return {};
}

export async function verifyEmailAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = verifyEmailSchema.safeParse({
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return { error: "invalid_token" };
  }

  const user = await getUserByVerificationToken(parsed.data.token);

  if (!user) {
    return { error: "invalid_token" };
  }

  if (user.emailVerifiedAt) {
    return { success: "already_verified" };
  }

  if (isTokenExpired(user.emailVerificationTokenExpiresAt)) {
    return { error: "token_expired" };
  }

  await markEmailVerified(user.id);
  return { success: "email_verified" };
}

export async function forgotPasswordAction(
  locale: string,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const user = await getUserByEmail(parsed.data.email);

  if (user) {
    const token = generateSecureToken();
    await setPasswordResetToken(user.id, token, getPasswordResetExpiryDate());
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token,
      locale,
    });
  }

  return { success: "reset_email_sent" };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const user = await getUserByPasswordResetToken(parsed.data.token);

  if (!user) {
    return { error: "invalid_token" };
  }

  if (isTokenExpired(user.passwordResetTokenExpiresAt)) {
    return { error: "token_expired" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await resetUserPassword(user.id, passwordHash);

  return { success: "password_reset" };
}

export async function resendVerificationAction(
  locale: string,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email");

  if (typeof email !== "string") {
    return { error: "invalid_input" };
  }

  const user = await getUserByEmail(email);

  if (!user || user.emailVerifiedAt) {
    return { success: "verification_sent" };
  }

  const token = generateSecureToken();
  await resendVerificationToken(user.id, token, getVerificationExpiryDate());
  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    token,
    locale,
  });

  return { success: "verification_sent" };
}
