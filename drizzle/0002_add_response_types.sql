ALTER TABLE "tasks" ADD COLUMN "response_types" jsonb DEFAULT '["URL"]'::jsonb NOT NULL;
