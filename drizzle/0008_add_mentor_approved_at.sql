ALTER TABLE "mentors" ADD COLUMN "approved_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "mentors" SET "approved_at" = NOW() WHERE "approved_at" IS NULL;
