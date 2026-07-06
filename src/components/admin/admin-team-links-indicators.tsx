"use client";

import { Globe, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  getTeamImportantLinkUrls,
  getTeamImportantLinksStatus,
  type TeamImportantLinkKey,
} from "@/lib/teams/link-status";
import type { TeamSocialUrls } from "@/db/schema/teams";
import { cn } from "@/lib/utils";

type AdminTeamLinksIndicatorsProps = {
  githubRepoUrl: string | null;
  projectUrl: string | null;
  socialUrls: TeamSocialUrls | null | undefined;
};

const LINK_ORDER: TeamImportantLinkKey[] = ["github", "project", "facebook", "otherSocial"];

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function LinkIcon({ linkKey, active }: { linkKey: TeamImportantLinkKey; active: boolean }) {
  const className = cn("size-3.5", active ? "text-emerald-950 dark:text-emerald-50" : "text-muted-foreground/70");

  switch (linkKey) {
    case "github":
      return <GithubIcon className={className} />;
    case "project":
      return <Globe className={className} strokeWidth={2} />;
    case "facebook":
      return <FacebookIcon className={className} />;
    case "otherSocial":
      return <Share2 className={className} strokeWidth={2} />;
  }
}

function LinkIndicator({
  linkKey,
  active,
  href,
  label,
}: {
  linkKey: TeamImportantLinkKey;
  active: boolean;
  href: string | null;
  label: string;
}) {
  const className = cn(
    "inline-flex size-7 items-center justify-center rounded-md border transition-colors",
    active
      ? "border-emerald-500/50 bg-emerald-500/25 hover:bg-emerald-500/40"
      : "border-border/60 bg-muted/30",
    href && "cursor-pointer",
  );

  const content = <LinkIcon linkKey={linkKey} active={active} />;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        title={label}
        aria-label={label}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <span title={label} aria-label={label} className={className}>
      {content}
    </span>
  );
}

export function AdminTeamLinksIndicators({
  githubRepoUrl,
  projectUrl,
  socialUrls,
}: AdminTeamLinksIndicatorsProps) {
  const t = useTranslations("AdminTeams.linksIndicators");
  const status = getTeamImportantLinksStatus({ githubRepoUrl, projectUrl, socialUrls });
  const urls = getTeamImportantLinkUrls({ githubRepoUrl, projectUrl, socialUrls });

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg p-1",
        status.complete && "bg-emerald-500/15 ring-1 ring-emerald-500/40",
      )}
      title={status.complete ? t("complete") : t("incomplete")}
    >
      {LINK_ORDER.map((linkKey) => {
        const active = status[linkKey];
        const href = urls[linkKey];
        const stateLabel = active ? t("provided") : t("missing");

        return (
          <LinkIndicator
            key={linkKey}
            linkKey={linkKey}
            active={active}
            href={href}
            label={`${t(linkKey)}: ${stateLabel}`}
          />
        );
      })}
    </div>
  );
}
