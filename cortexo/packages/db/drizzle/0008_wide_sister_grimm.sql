CREATE TABLE "security_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"type" varchar(30),
	"severity" varchar(20),
	"package" varchar(200),
	"installed_version" varchar(50),
	"fixed_version" varchar(50),
	"cve_id" varchar(30),
	"description" text,
	"file" text,
	"line" integer,
	"secret_type" varchar(50),
	"status" varchar(20) DEFAULT 'open',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "security_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" varchar(30),
	"status" varchar(20) DEFAULT 'pending',
	"critical_count" integer DEFAULT 0,
	"high_count" integer DEFAULT 0,
	"medium_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "security_findings" ADD CONSTRAINT "security_findings_scan_id_security_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."security_scans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_scans" ADD CONSTRAINT "security_scans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_security_findings_scan" ON "security_findings" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX "idx_security_findings_status" ON "security_findings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_security_scans_project" ON "security_scans" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_security_scans_status" ON "security_scans" USING btree ("status");