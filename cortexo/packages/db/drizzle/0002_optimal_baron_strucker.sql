ALTER TABLE "root_causes" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN "root_cause" text;--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN "category" varchar(30);--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN "affected_files" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN "provider" varchar(30);--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN "fix_applied" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN "user_feedback" varchar(10);--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_root_causes_project" ON "root_causes" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_root_causes_deploy" ON "root_causes" USING btree ("deployment_id");