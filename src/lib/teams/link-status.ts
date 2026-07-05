import type { TeamSocialUrls } from "@/db/schema/teams";

import { normalizeTeamSocialUrls, TEAM_SOCIAL_PLATFORMS, type TeamSocialPlatform } from "./social-urls";

export type TeamImportantLinkKey = "github" | "project" | "facebook" | "otherSocial";

export type TeamImportantLinksStatus = Record<TeamImportantLinkKey, boolean> & {
  complete: boolean;
};

export type TeamImportantLinkUrls = Record<TeamImportantLinkKey, string | null>;

const OTHER_SOCIAL_PLATFORMS = TEAM_SOCIAL_PLATFORMS.filter(
  (platform): platform is Exclude<TeamSocialPlatform, "FACEBOOK"> => platform !== "FACEBOOK",
);

function getFirstOtherSocialUrl(socialUrls: TeamSocialUrls): string | null {
  for (const platform of OTHER_SOCIAL_PLATFORMS) {
    const url = socialUrls[platform];

    if (url) {
      return url;
    }
  }

  return null;
}

export function getTeamImportantLinkUrls(input: {
  githubRepoUrl: string | null;
  projectUrl: string | null;
  socialUrls: TeamSocialUrls | null | undefined;
}): TeamImportantLinkUrls {
  const socialUrls = normalizeTeamSocialUrls(input.socialUrls);

  return {
    github: input.githubRepoUrl?.trim() || null,
    project: input.projectUrl?.trim() || null,
    facebook: socialUrls.FACEBOOK ?? null,
    otherSocial: getFirstOtherSocialUrl(socialUrls),
  };
}

export function getTeamImportantLinksStatus(input: {
  githubRepoUrl: string | null;
  projectUrl: string | null;
  socialUrls: TeamSocialUrls | null | undefined;
}): TeamImportantLinksStatus {
  const urls = getTeamImportantLinkUrls(input);

  const status = {
    github: Boolean(urls.github),
    project: Boolean(urls.project),
    facebook: Boolean(urls.facebook),
    otherSocial: Boolean(urls.otherSocial),
  };

  return {
    ...status,
    complete: status.github && status.project && status.facebook && status.otherSocial,
  };
}
