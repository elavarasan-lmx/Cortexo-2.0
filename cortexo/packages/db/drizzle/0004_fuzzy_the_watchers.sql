CREATE TABLE "fix_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"affected_files" jsonb DEFAULT '[]'::jsonb,
	"diff_patch" text,
	"error_pattern" text,
	"source_project_id" uuid,
	"applied_count" integer DEFAULT 0,
	"total_targets" integer DEFAULT 0,
	"success_rate" integer,
	"status" varchar(20) DEFAULT 'draft',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fix_rollouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"client_project_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"conflict_type" varchar(30),
	"diff_preview" text,
	"failure_reason" text,
	"applied_at" timestamp,
	"rolled_back_at" timestamp,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fix_recipes" ADD CONSTRAINT "fix_recipes_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fix_recipes" ADD CONSTRAINT "fix_recipes_source_project_id_projects_id_fk" FOREIGN KEY ("source_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fix_recipes" ADD CONSTRAINT "fix_recipes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fix_rollouts" ADD CONSTRAINT "fix_rollouts_recipe_id_fix_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."fix_recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fix_rollouts" ADD CONSTRAINT "fix_rollouts_client_project_id_projects_id_fk" FOREIGN KEY ("client_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_fix_recipes_org" ON "fix_recipes" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_fix_recipes_status" ON "fix_recipes" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "idx_fix_rollouts_recipe" ON "fix_rollouts" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "idx_fix_rollouts_client" ON "fix_rollouts" USING btree ("client_project_id");--> statement-breakpoint
CREATE INDEX "idx_fix_rollouts_status" ON "fix_rollouts" USING btree ("recipe_id","status");