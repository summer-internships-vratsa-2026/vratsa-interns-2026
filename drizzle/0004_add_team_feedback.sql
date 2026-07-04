CREATE TYPE "public"."feedback_category" AS ENUM('POSITIVE', 'SUGGESTION', 'INDIVIDUAL_TASK');
--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('OPEN', 'DONE');
--> statement-breakpoint
CREATE TABLE "team_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"author_user_id" uuid NOT NULL,
	"category" "feedback_category" NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" "feedback_status" DEFAULT 'OPEN' NOT NULL,
	"done_by_user_id" uuid,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_feedback_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feedback_id" uuid NOT NULL,
	"author_user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_feedback" ADD CONSTRAINT "team_feedback_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "team_feedback" ADD CONSTRAINT "team_feedback_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "team_feedback" ADD CONSTRAINT "team_feedback_done_by_user_id_users_id_fk" FOREIGN KEY ("done_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "team_feedback_comments" ADD CONSTRAINT "team_feedback_comments_feedback_id_team_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."team_feedback"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "team_feedback_comments" ADD CONSTRAINT "team_feedback_comments_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
