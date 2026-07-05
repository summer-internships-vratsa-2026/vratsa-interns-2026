CREATE TYPE "public"."task_status" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "status" "task_status" DEFAULT 'PUBLISHED' NOT NULL;
