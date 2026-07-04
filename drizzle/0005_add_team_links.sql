ALTER TABLE "teams" ADD COLUMN "github_repo_url" varchar(2048);
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "project_url" varchar(2048);
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "social_urls" jsonb;
