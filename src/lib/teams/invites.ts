import { generateSecureToken } from "@/lib/auth/tokens";

const INVITE_EXPIRY_DAYS = 7;

export function getInviteExpiryDate(): Date {
  return new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

export function createInviteToken(): string {
  return generateSecureToken();
}

export function isInviteExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() < Date.now();
}
