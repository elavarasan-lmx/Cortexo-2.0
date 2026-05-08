CREATE TABLE "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"trigger" text DEFAULT 'manual',
	"duration_ms" integer,
	"input" jsonb,
	"output" jsonb,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "agent_type" DEFAULT 'custom' NOT NULL,
	"status" "agent_status" DEFAULT 'idle' NOT NULL,
	"description" text,
	"avatar" text,
	"config" jsonb DEFAULT '{}'::jsonb,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"accuracy" integer DEFAULT 0,
	"total_runs" integer DEFAULT 0,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code_review_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"file" text NOT NULL,
	"line" integer,
	"end_line" integer,
	"column" integer,
	"rule_id" varchar(100) NOT NULL,
	"rule_name" varchar(200),
	"category" varchar(50),
	"severity" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"snippet" text,
	"suggestion" text,
	"suggested_fix" text,
	"auto_fixable" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'open',
	"source" varchar(20) DEFAULT 'rule',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"commit_sha" varchar(40),
	"branch" varchar(200),
	"trigger_type" varchar(30) DEFAULT 'manual',
	"status" varchar(20) DEFAULT 'pending',
	"total_findings" integer DEFAULT 0,
	"critical_count" integer DEFAULT 0,
	"high_count" integer DEFAULT 0,
	"medium_count" integer DEFAULT 0,
	"low_count" integer DEFAULT 0,
	"info_count" integer DEFAULT 0,
	"ai_enabled" boolean DEFAULT false,
	"files_scanned" integer DEFAULT 0,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_review_findings" ADD CONSTRAINT "code_review_findings_review_id_code_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."code_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_review_findings" ADD CONSTRAINT "code_review_findings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_reviews" ADD CONSTRAINT "code_reviews_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_reviews" ADD CONSTRAINT "code_reviews_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_findings_review" ON "code_review_findings" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "idx_findings_severity" ON "code_review_findings" USING btree ("review_id","severity");--> statement-breakpoint
CREATE INDEX "idx_findings_rule" ON "code_review_findings" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "idx_code_reviews_project" ON "code_reviews" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "idx_code_reviews_org" ON "code_reviews" USING btree ("org_id");