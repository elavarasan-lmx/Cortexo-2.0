CREATE TABLE "brain_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brain_id" uuid NOT NULL,
	"category" varchar(50),
	"name" varchar(200),
	"detected_value" text,
	"occurrence_count" integer DEFAULT 0,
	"example_files" jsonb DEFAULT '[]'::jsonb,
	"rule_regex" text,
	"violation_message" text,
	"severity" varchar(20) DEFAULT 'medium',
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brain_violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brain_id" uuid NOT NULL,
	"pattern_id" uuid,
	"commit_sha" varchar(40),
	"file" text,
	"line" integer,
	"detected" text,
	"expected" text,
	"status" varchar(20) DEFAULT 'open',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"source_url" varchar(500),
	"category" varchar(50) DEFAULT 'general',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_brains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"freshness" integer,
	"last_scanned_at" timestamp,
	"total_files_scanned" integer,
	"patterns_detected" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_brains_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "qa_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"user_id" uuid,
	"sources_used" jsonb DEFAULT '[]'::jsonb,
	"helpful" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brain_patterns" ADD CONSTRAINT "brain_patterns_brain_id_project_brains_id_fk" FOREIGN KEY ("brain_id") REFERENCES "public"."project_brains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brain_violations" ADD CONSTRAINT "brain_violations_brain_id_project_brains_id_fk" FOREIGN KEY ("brain_id") REFERENCES "public"."project_brains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brain_violations" ADD CONSTRAINT "brain_violations_pattern_id_brain_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."brain_patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_brains" ADD CONSTRAINT "project_brains_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_brain_patterns_brain" ON "brain_patterns" USING btree ("brain_id");--> statement-breakpoint
CREATE INDEX "idx_brain_violations_brain" ON "brain_violations" USING btree ("brain_id");--> statement-breakpoint
CREATE INDEX "idx_brain_violations_status" ON "brain_violations" USING btree ("brain_id","status");--> statement-breakpoint
CREATE INDEX "idx_knowledge_docs_category" ON "knowledge_docs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_project_brains_project" ON "project_brains" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_qa_history_created" ON "qa_history" USING btree ("created_at");