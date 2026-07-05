import { z } from "zod";

import {
  GITHUB_REPO_DOMAINS,
  getSocialPlatformErrorCode,
  isTeamLinkErrorCode,
  SOCIAL_PLATFORM_DOMAINS,
  urlContainsDomain,
} from "@/lib/teams/link-validation";
import { TEAM_SOCIAL_PLATFORMS, type TeamSocialPlatform } from "@/lib/teams/social-urls";

function optionalUrlField() {
  return z.preprocess(
    (value) => (value == null || value === "" ? null : value),
    z.union([z.null(), z.url({ message: "invalid_url" })]),
  );
}

function optionalUrlWithDomains(domains: readonly string[], errorCode: string) {
  return z.preprocess(
    (value) => (value == null || value === "" ? null : value),
    z.union([
      z.null(),
      z
        .url({ message: "invalid_url" })
        .refine((url) => urlContainsDomain(url, [...domains]), { message: errorCode }),
    ]),
  );
}

function optionalSocialUrlField(platform: TeamSocialPlatform) {
  const domains = SOCIAL_PLATFORM_DOMAINS[platform];

  if (!domains) {
    return optionalUrlField();
  }

  return optionalUrlWithDomains(domains, getSocialPlatformErrorCode(platform));
}

const socialUrlFields = Object.fromEntries(
  TEAM_SOCIAL_PLATFORMS.map((platform) => [
    `social_${platform}`,
    optionalSocialUrlField(platform),
  ]),
) as Record<`social_${TeamSocialPlatform}`, ReturnType<typeof optionalSocialUrlField>>;

export const updateTeamLinksSchema = z
  .object({
    githubRepoUrl: optionalUrlWithDomains(GITHUB_REPO_DOMAINS, "invalid_github_url"),
    projectUrl: optionalUrlField(),
    ...socialUrlFields,
  })
  .transform((data) => {
    const socialUrls: Partial<Record<TeamSocialPlatform, string>> = {};

    for (const platform of TEAM_SOCIAL_PLATFORMS) {
      const key = `social_${platform}` as const;
      const url = data[key];

      if (url) {
        socialUrls[platform] = url;
      }
    }

    return {
      githubRepoUrl: data.githubRepoUrl,
      projectUrl: data.projectUrl,
      socialUrls: Object.keys(socialUrls).length > 0 ? socialUrls : null,
    };
  });

export function extractTeamLinksFormData(formData: FormData) {
  return {
    githubRepoUrl: formData.get("githubRepoUrl"),
    projectUrl: formData.get("projectUrl"),
    ...Object.fromEntries(
      TEAM_SOCIAL_PLATFORMS.map((platform) => [`social_${platform}`, formData.get(`social_${platform}`)]),
    ),
  };
}

export function getTeamLinksValidationError(issues: z.ZodIssue[]): string {
  for (const issue of issues) {
    if (typeof issue.message === "string" && isTeamLinkErrorCode(issue.message)) {
      return issue.message;
    }
  }

  return "invalid_input";
}
