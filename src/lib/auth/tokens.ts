import { randomBytes } from "crypto";

const TOKEN_BYTES = 32;
const VERIFICATION_EXPIRY_HOURS = 24;
const RESET_EXPIRY_HOURS = 1;

export function generateSecureToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function getVerificationExpiryDate(): Date {
  return new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);
}

export function getPasswordResetExpiryDate(): Date {
  return new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);
}

export function isTokenExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) {
    return true;
  }

  return expiresAt.getTime() < Date.now();
}
