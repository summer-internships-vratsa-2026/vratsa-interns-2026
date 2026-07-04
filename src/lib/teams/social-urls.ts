import type { TeamSocialUrls } from "@/db/schema/teams";

export const TEAM_SOCIAL_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "LINKEDIN",
  "PINTEREST",
  "X",
  "OTHER",
] as const;

export type TeamSocialPlatform = (typeof TEAM_SOCIAL_PLATFORMS)[number];

export function normalizeTeamSocialUrls(value: TeamSocialUrls | null | undefined): TeamSocialUrls {
  if (!value) {
    return {};
  }

  const normalized: TeamSocialUrls = {};

  for (const platform of TEAM_SOCIAL_PLATFORMS) {
    const url = value[platform];

    if (typeof url === "string" && url.trim().length > 0) {
      normalized[platform] = url.trim();
    }
  }

  return normalized;
}

export function hasTeamSocialUrls(value: TeamSocialUrls | null | undefined): boolean {
  return Object.keys(normalizeTeamSocialUrls(value)).length > 0;
}
