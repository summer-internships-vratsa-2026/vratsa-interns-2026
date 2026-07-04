import { z } from "zod";

import { TEAM_SOCIAL_PLATFORMS, type TeamSocialPlatform } from "@/lib/teams/social-urls";

const optionalUrlField = z.preprocess(
  (value) => (value == null || value === "" ? null : value),
  z.union([z.null(), z.url({ message: "invalid_url" })]),
);

const socialUrlFields = Object.fromEntries(
  TEAM_SOCIAL_PLATFORMS.map((platform) => [`social_${platform}`, optionalUrlField]),
) as Record<`social_${TeamSocialPlatform}`, typeof optionalUrlField>;

export const updateTeamLinksSchema = z
  .object({
    githubRepoUrl: optionalUrlField,
    projectUrl: optionalUrlField,
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
