import type { TeamSocialPlatform } from "./social-urls";

export function urlContainsDomain(url: string, domains: string | string[]): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const allowed = Array.isArray(domains) ? domains : [domains];

    return allowed.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export const GITHUB_REPO_DOMAINS = ["github.com"] as const;

export const SOCIAL_PLATFORM_DOMAINS: Record<
  TeamSocialPlatform,
  readonly string[] | null
> = {
  FACEBOOK: ["facebook.com", "fb.com"],
  INSTAGRAM: ["instagram.com"],
  TIKTOK: ["tiktok.com"],
  LINKEDIN: ["linkedin.com"],
  PINTEREST: ["pinterest.com"],
  X: ["x.com", "twitter.com"],
  OTHER: null,
};

export const TEAM_LINK_ERROR_CODES = {
  invalid_url: "invalid_url",
  invalid_github_url: "invalid_github_url",
  invalid_facebook_url: "invalid_facebook_url",
  invalid_instagram_url: "invalid_instagram_url",
  invalid_tiktok_url: "invalid_tiktok_url",
  invalid_linkedin_url: "invalid_linkedin_url",
  invalid_pinterest_url: "invalid_pinterest_url",
  invalid_x_url: "invalid_x_url",
} as const;

export type TeamLinkErrorCode = (typeof TEAM_LINK_ERROR_CODES)[keyof typeof TEAM_LINK_ERROR_CODES];

export function getSocialPlatformErrorCode(platform: TeamSocialPlatform): TeamLinkErrorCode {
  switch (platform) {
    case "FACEBOOK":
      return "invalid_facebook_url";
    case "INSTAGRAM":
      return "invalid_instagram_url";
    case "TIKTOK":
      return "invalid_tiktok_url";
    case "LINKEDIN":
      return "invalid_linkedin_url";
    case "PINTEREST":
      return "invalid_pinterest_url";
    case "X":
      return "invalid_x_url";
    case "OTHER":
      return "invalid_url";
  }
}

export function isTeamLinkErrorCode(value: string): value is TeamLinkErrorCode {
  return Object.values(TEAM_LINK_ERROR_CODES).includes(value as TeamLinkErrorCode);
}
