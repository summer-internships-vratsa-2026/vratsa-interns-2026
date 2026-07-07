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

export type NonFacebookSocialPlatform = (typeof OTHER_SOCIAL_PLATFORMS)[number];

export type AdditionalSocialLink = {
  platform: NonFacebookSocialPlatform;
  url: string;
};

function getNonFacebookSocialLinks(
  socialUrls: TeamSocialUrls,
): AdditionalSocialLink[] {
  return OTHER_SOCIAL_PLATFORMS.flatMap((platform) => {
    const url = socialUrls[platform];
    return url ? [{ platform, url }] : [];
  });
}

function getFirstOtherSocialLink(
  socialUrls: TeamSocialUrls,
): AdditionalSocialLink | null {
  return getNonFacebookSocialLinks(socialUrls)[0] ?? null;
}

export function getAdditionalSocialLinks(
  socialUrls: TeamSocialUrls | null | undefined,
): AdditionalSocialLink[] {
  const normalized = normalizeTeamSocialUrls(socialUrls);
  return getNonFacebookSocialLinks(normalized).slice(1);
}

export function getFirstOtherSocialPlatform(
  socialUrls: TeamSocialUrls | null | undefined,
): NonFacebookSocialPlatform | null {
  const normalized = normalizeTeamSocialUrls(socialUrls);
  return getFirstOtherSocialLink(normalized)?.platform ?? null;
}

export function getTeamImportantLinkUrls(input: {
  githubRepoUrl: string | null;
  projectUrl: string | null;
  socialUrls: TeamSocialUrls | null | undefined;
}): TeamImportantLinkUrls {
  const socialUrls = normalizeTeamSocialUrls(input.socialUrls);
  const firstOtherSocial = getFirstOtherSocialLink(socialUrls);

  return {
    github: input.githubRepoUrl?.trim() || null,
    project: input.projectUrl?.trim() || null,
    facebook: socialUrls.FACEBOOK ?? null,
    otherSocial: firstOtherSocial?.url ?? null,
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
