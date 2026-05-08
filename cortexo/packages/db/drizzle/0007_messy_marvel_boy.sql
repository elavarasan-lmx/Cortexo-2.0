CREATE TABLE "test_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suite_id" uuid NOT NULL,
	"triggered_by" varchar(30),
	"status" varchar(20) DEFAULT 'pending',
	"passed" integer DEFAULT 0,
	"failed" integer DEFAULT 0,
	"duration" integer,
	"screenshot_url" text,
	"report_json" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_suites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(200),
	"type" varchar(30),
	"config" jsonb,
	"schedule" varchar(50),
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "test_runs" ADD CONSTRAINT "test_runs_suite_id_test_suites_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."test_suites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_suites" ADD CONSTRAINT "test_suites_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_test_runs_suite" ON "test_runs" USING btree ("suite_id");--> statement-breakpoint
CREATE INDEX "idx_test_runs_status" ON "test_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_test_suites_project" ON "test_suites" USING btree ("project_id");