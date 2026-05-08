CREATE TABLE "client_health_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"error_score" integer,
	"uptime_score" integer,
	"dependency_score" integer,
	"pending_fix_score" integer,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_health_scores" ADD CONSTRAINT "client_health_scores_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_client_health_project" ON "client_health_scores" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_client_health_calc_at" ON "client_health_scores" USING btree ("project_id","calculated_at");