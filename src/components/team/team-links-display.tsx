import { getTranslations } from "next-intl/server";

import type { Team } from "@/db/schema/teams";
import { hasTeamSocialUrls, normalizeTeamSocialUrls, TEAM_SOCIAL_PLATFORMS } from "@/lib/teams/social-urls";

type TeamLinksDisplayProps = {
  team: Team;
};

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <div>
      <dt className="font-medium text-zinc-500">{label}</dt>
      <dd>
        <a href={href} target="_blank" rel="noreferrer" className="break-all underline">
          {href}
        </a>
      </dd>
    </div>
  );
}

export async function TeamLinksDisplay({ team }: TeamLinksDisplayProps) {
  const t = await getTranslations("Team");
  const socialUrls = normalizeTeamSocialUrls(team.socialUrls);
  const hasLinks = team.githubRepoUrl || team.projectUrl || hasTeamSocialUrls(socialUrls);

  if (!hasLinks) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("noTeamLinks")}</p>;
  }

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {team.githubRepoUrl ? <LinkRow label={t("githubRepoUrl")} href={team.githubRepoUrl} /> : null}
      {team.projectUrl ? <LinkRow label={t("projectUrl")} href={team.projectUrl} /> : null}
      {TEAM_SOCIAL_PLATFORMS.map((platform) => {
        const href = socialUrls[platform];

        if (!href) {
          return null;
        }

        return <LinkRow key={platform} label={t(`socialPlatforms.${platform}`)} href={href} />;
      })}
    </dl>
  );
}
