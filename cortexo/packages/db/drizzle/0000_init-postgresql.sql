CREATE TABLE "alert_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"events" jsonb DEFAULT '[]'::jsonb,
	"last_triggered_at" timestamp,
	"total_sent" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"rule_id" uuid,
	"channel_id" uuid,
	"rule_name" varchar(100),
	"channel_name" varchar(100),
	"severity" varchar(20) DEFAULT 'warning',
	"message" text,
	"status" varchar(20) DEFAULT 'pending',
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"condition" varchar(500) NOT NULL,
	"threshold" integer,
	"channel_ids" jsonb DEFAULT '[]'::jsonb,
	"severity" varchar(20) DEFAULT 'warning',
	"is_active" boolean DEFAULT true,
	"cooldown_minutes" integer DEFAULT 30,
	"trigger_count" integer DEFAULT 0,
	"last_triggered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"resource" varchar(100) NOT NULL,
	"resource_id" varchar(100),
	"description" text,
	"metadata" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"client_slug" varchar(100) NOT NULL,
	"display_name" varchar(200) NOT NULL,
	"domain" varchar(255),
	"server_id" integer,
	"config_data" jsonb NOT NULL,
	"deploy_path" varchar(500),
	"git_branch" varchar(100) DEFAULT 'main',
	"status" varchar(20) DEFAULT 'draft',
	"migration_status" varchar(20) DEFAULT 'pending',
	"deployed_version" varchar(20),
	"last_config_pushed_at" timestamp,
	"last_deployed_at" timestamp,
	"last_health_check_at" timestamp,
	"health_score" integer DEFAULT 100,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_configs_client_slug_unique" UNIQUE("client_slug")
);
--> statement-breakpoint
CREATE TABLE "config_change_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_config_id" integer NOT NULL,
	"changed_by" varchar(100),
	"change_type" varchar(20) NOT NULL,
	"previous_values" jsonb,
	"new_values" jsonb,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cron_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cron_job_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'running',
	"output" text,
	"error_message" text,
	"exit_code" integer,
	"duration_ms" integer,
	"triggered_by" varchar(20) DEFAULT 'schedule',
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cron_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"schedule" varchar(50) NOT NULL,
	"command" text NOT NULL,
	"target_server" varchar(100),
	"timezone" varchar(50) DEFAULT 'UTC',
	"is_active" boolean DEFAULT true,
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "db_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"host" varchar(255) NOT NULL,
	"port" integer DEFAULT 3306,
	"username" varchar(100) NOT NULL,
	"password" text,
	"database_name" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deploy_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"server_id" integer,
	"client_slug" varchar(100),
	"domain" varchar(255),
	"protocol" varchar(10) DEFAULT 'https',
	"deploy_path" varchar(500),
	"deploy_user" varchar(50) DEFAULT 'ubuntu',
	"db_host" varchar(255),
	"db_name" varchar(100),
	"db_user" varchar(100),
	"db_port" integer DEFAULT 3306,
	"git_repo" varchar(500),
	"git_branch" varchar(100) DEFAULT 'main',
	"app_framework" varchar(50),
	"app_version" varchar(20),
	"socket_io_port" integer,
	"ws_port" integer,
	"rate_port" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deploy_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) DEFAULT 'ssh',
	"host" varchar(255) NOT NULL,
	"port" integer DEFAULT 22,
	"username" varchar(100) NOT NULL,
	"auth_method" varchar(20) DEFAULT 'key',
	"encrypted_key" text,
	"encrypted_password" text,
	"remote_path" varchar(500),
	"pre_deploy_cmd" text,
	"post_deploy_cmd" text,
	"is_active" boolean DEFAULT true,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deployment_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"deployment_id" integer NOT NULL,
	"action" varchar(20) NOT NULL,
	"acted_by" varchar(100) NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"pipeline_run_id" uuid,
	"deploy_target_id" uuid,
	"environment" varchar(50) DEFAULT 'production',
	"status" varchar(20) DEFAULT 'pending',
	"branch" varchar(100),
	"commit_sha" varchar(40),
	"commit_message" text,
	"deployed_by" uuid,
	"strategy" varchar(20) DEFAULT 'rolling',
	"rollback_from_id" uuid,
	"started_at" timestamp,
	"finished_at" timestamp,
	"duration_ms" integer,
	"health_check_url" varchar(500),
	"health_check_status" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deprecation_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"project_id" uuid,
	"project_name" varchar(100),
	"package_name" varchar(200) NOT NULL,
	"current_version" varchar(50),
	"latest_version" varchar(50),
	"deprecation_type" varchar(30) NOT NULL,
	"severity" varchar(20) DEFAULT 'warning',
	"message" text,
	"affected_files" jsonb DEFAULT '[]'::jsonb,
	"remediation_url" varchar(500),
	"is_suppressed" boolean DEFAULT false,
	"suppressed_by" uuid,
	"suppressed_until" timestamp,
	"scanned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "divergence_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" varchar(100) NOT NULL,
	"client_name" varchar(200),
	"divergence_score" integer DEFAULT 0,
	"files_added" integer DEFAULT 0,
	"files_modified" integer DEFAULT 0,
	"files_deleted" integer DEFAULT 0,
	"module_summary" jsonb,
	"file_details" jsonb,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "error_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"error_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"stack_trace" text,
	"context" jsonb DEFAULT '{}'::jsonb,
	"breadcrumbs" jsonb,
	"user_context" jsonb,
	"environment" varchar(50),
	"release" varchar(50),
	"server_name" varchar(200),
	"url" varchar(1000),
	"method" varchar(10),
	"ip_address" varchar(45),
	"user_agent" text,
	"sdk_version" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"fingerprint" varchar(64) NOT NULL,
	"type" varchar(200) NOT NULL,
	"message" text,
	"file" varchar(500),
	"line" integer,
	"severity" varchar(20) DEFAULT 'error',
	"status" varchar(20) DEFAULT 'unresolved',
	"assigned_to" uuid,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"event_count" integer DEFAULT 1,
	"linked_deploy_id" uuid,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_regression" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"webhook_url" varchar(500),
	"webhook_secret" varchar(100),
	"config" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "judge_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"target_type" varchar(30) NOT NULL,
	"target_id" varchar(100) NOT NULL,
	"target_name" varchar(200),
	"overall_score" integer NOT NULL,
	"quality_score" integer,
	"reliability_score" integer,
	"security_score" integer,
	"performance_score" integer,
	"maintainability_score" integer,
	"grade" varchar(5),
	"summary" text,
	"suggestions" jsonb DEFAULT '[]'::jsonb,
	"ai_model" varchar(50) DEFAULT 'gpt-4o',
	"scored_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "load_test_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"org_id" uuid,
	"name" varchar(200),
	"url" varchar(1000) NOT NULL,
	"method" varchar(10) DEFAULT 'GET',
	"headers" jsonb,
	"body" text,
	"concurrency" integer DEFAULT 10,
	"duration_seconds" integer DEFAULT 10,
	"timeout_ms" integer DEFAULT 10000,
	"status" varchar(20) DEFAULT 'pending',
	"results" jsonb,
	"started_at" timestamp,
	"finished_at" timestamp,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) DEFAULT 'file',
	"path" varchar(500) NOT NULL,
	"server" varchar(100) DEFAULT 'localhost',
	"description" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "managed_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"display_name" varchar(200) NOT NULL,
	"description" text,
	"version" varchar(20) DEFAULT '1.0.0',
	"framework" jsonb,
	"base_path" varchar(500),
	"config_schema_path" varchar(500),
	"template_path" varchar(500),
	"manifest_path" varchar(500),
	"deploy_checklist" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "managed_sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "module_test_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suite_id" uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"module_name" varchar(200) NOT NULL,
	"endpoint" varchar(500) NOT NULL,
	"method" varchar(10) DEFAULT 'GET',
	"status" varchar(20) DEFAULT 'pending',
	"latency_ms" integer,
	"status_code" integer,
	"response_size" integer,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_test_suites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"name" varchar(200) NOT NULL,
	"base_url" varchar(500) NOT NULL,
	"modules" jsonb,
	"last_run_at" timestamp,
	"last_pass_count" integer,
	"last_fail_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mono_deployments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" varchar(100) NOT NULL,
	"client_name" varchar(200),
	"environment" varchar(20) DEFAULT 'staging',
	"branch" varchar(100),
	"status" varchar(20) DEFAULT 'pending_approval',
	"triggered_by" varchar(100),
	"deploy_notes" text,
	"duration_seconds" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200),
	"message" text,
	"link" varchar(500),
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"plan" varchar(20) DEFAULT 'free',
	"stripe_customer_id" varchar(100),
	"stripe_subscription_id" varchar(100),
	"usage_deploys" integer DEFAULT 0,
	"usage_errors" integer DEFAULT 0,
	"usage_ai_calls" integer DEFAULT 0,
	"usage_reset_at" timestamp,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pipeline_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"run_number" integer NOT NULL,
	"status" varchar(20) DEFAULT 'queued',
	"branch" varchar(100),
	"commit_sha" varchar(40),
	"commit_message" text,
	"triggered_by" uuid,
	"trigger_type" varchar(20),
	"stages" jsonb,
	"started_at" timestamp,
	"finished_at" timestamp,
	"duration_ms" integer,
	"log_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"trigger_config" jsonb,
	"stages" jsonb,
	"yaml_config" text,
	"is_active" boolean DEFAULT true,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"repo_provider" varchar(20) NOT NULL,
	"repo_url" varchar(500) NOT NULL,
	"repo_full_name" varchar(200),
	"default_branch" varchar(50) DEFAULT 'main',
	"sdk_api_key" varchar(64) NOT NULL,
	"health_score" integer DEFAULT 100,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_sdk_api_key_unique" UNIQUE("sdk_api_key")
);
--> statement-breakpoint
CREATE TABLE "root_causes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"error_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"org_id" uuid,
	"deployment_id" uuid,
	"analysis" text,
	"similar_bugs" jsonb DEFAULT '[]'::jsonb,
	"suggested_fix" text,
	"diff_context" text,
	"confidence" integer,
	"model" varchar(50),
	"token_usage" jsonb,
	"feedback_rating" integer,
	"feedback_comment" text,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "server_mounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"server_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"remote_path" varchar(500) NOT NULL,
	"local_mount_path" varchar(500) NOT NULL,
	"ssh_user" varchar(50) DEFAULT 'ubuntu' NOT NULL,
	"status" varchar(20) DEFAULT 'unmounted',
	"auto_mount" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_mounted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "server_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"server_ip" varchar(45) NOT NULL,
	"cpu_percent" numeric(5, 2),
	"ram_used_mb" integer,
	"ram_total_mb" integer,
	"disk_used_gb" numeric(10, 2),
	"disk_total_gb" numeric(10, 2),
	"load_avg" varchar(50),
	"uptime_hours" integer,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"private_ip" varchar(45),
	"public_address" varchar(255),
	"ssh_key" varchar(500),
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"repo_url" varchar(500) NOT NULL,
	"branch" varchar(100) DEFAULT 'main',
	"auth_type" varchar(20) DEFAULT 'token',
	"auth_value" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" varchar(100) NOT NULL,
	"client_name" varchar(200) NOT NULL,
	"repo_org" varchar(200),
	"repo_name" varchar(200),
	"branch" varchar(100) DEFAULT 'STAGING',
	"client_type" varchar(50) DEFAULT 'retail',
	"sync_workflow" varchar(200) DEFAULT 'sync-batch.yml',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sync_clients_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "sync_exclude_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"app_category" varchar(50) DEFAULT 'all',
	"layer" varchar(50) DEFAULT 'all',
	"pattern" varchar(300) NOT NULL,
	"reason" varchar(500),
	"is_active" boolean DEFAULT true,
	"created_by" varchar(100) DEFAULT 'system',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" varchar(100) NOT NULL,
	"client_name" varchar(200),
	"source_branch" varchar(100) DEFAULT 'main',
	"target_branch" varchar(100) DEFAULT 'STAGING',
	"status" varchar(20) DEFAULT 'pending',
	"commit_sha" varchar(64),
	"pr_number" integer,
	"pr_url" varchar(500),
	"error_message" text,
	"triggered_by" varchar(100),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_menu_permissions" (
	"user_id" uuid NOT NULL,
	"menu_key" varchar(100) NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"avatar_url" varchar(500),
	"phone" varchar(20),
	"role" varchar(20) DEFAULT 'member',
	"provider" varchar(20),
	"provider_id" varchar(100),
	"github_id" varchar(100),
	"reset_token" varchar(255),
	"reset_token_expires_at" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "winbull_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_slug" varchar(100) NOT NULL,
	"client_id" varchar(100) NOT NULL,
	"display_name" varchar(200) NOT NULL,
	"domain" varchar(255),
	"config_json" jsonb,
	"server_ip" varchar(45),
	"migration_status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "alert_channels" ADD CONSTRAINT "alert_channels_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_history" ADD CONSTRAINT "alert_history_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_history" ADD CONSTRAINT "alert_history_rule_id_alert_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."alert_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_history" ADD CONSTRAINT "alert_history_channel_id_alert_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."alert_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cron_executions" ADD CONSTRAINT "cron_executions_cron_job_id_cron_jobs_id_fk" FOREIGN KEY ("cron_job_id") REFERENCES "public"."cron_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cron_jobs" ADD CONSTRAINT "cron_jobs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_profiles" ADD CONSTRAINT "db_profiles_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deploy_targets" ADD CONSTRAINT "deploy_targets_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deprecation_results" ADD CONSTRAINT "deprecation_results_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_events" ADD CONSTRAINT "error_events_error_id_errors_id_fk" FOREIGN KEY ("error_id") REFERENCES "public"."errors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_events" ADD CONSTRAINT "error_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "errors" ADD CONSTRAINT "errors_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "errors" ADD CONSTRAINT "errors_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judge_scores" ADD CONSTRAINT "judge_scores_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "load_test_runs" ADD CONSTRAINT "load_test_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "load_test_runs" ADD CONSTRAINT "load_test_runs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_test_results" ADD CONSTRAINT "module_test_results_suite_id_module_test_suites_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."module_test_suites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_test_suites" ADD CONSTRAINT "module_test_suites_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "root_causes" ADD CONSTRAINT "root_causes_error_id_errors_id_fk" FOREIGN KEY ("error_id") REFERENCES "public"."errors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "root_causes" ADD CONSTRAINT "root_causes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "root_causes" ADD CONSTRAINT "root_causes_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_profiles" ADD CONSTRAINT "source_profiles_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_menu_permissions" ADD CONSTRAINT "user_menu_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_alertch_org" ON "alert_channels" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_alertch_type" ON "alert_channels" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_alerthistory_org" ON "alert_history" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_alerthistory_sent" ON "alert_history" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_alertrules_org" ON "alert_rules" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_created" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_resource" ON "audit_logs" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_client_source" ON "client_configs" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_client_slug" ON "client_configs" USING btree ("client_slug");--> statement-breakpoint
CREATE INDEX "idx_client_server" ON "client_configs" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_client_status" ON "client_configs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_config_history_client" ON "config_change_history" USING btree ("client_config_id");--> statement-breakpoint
CREATE INDEX "idx_config_history_created" ON "config_change_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_cronexec_job" ON "cron_executions" USING btree ("cron_job_id");--> statement-breakpoint
CREATE INDEX "idx_cronexec_status" ON "cron_executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_cronjobs_org" ON "cron_jobs" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_cronjobs_active" ON "cron_jobs" USING btree ("org_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_db_profiles_org" ON "db_profiles" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_deploy_project" ON "deploy_configs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_deploy_server" ON "deploy_configs" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_deploy_slug" ON "deploy_configs" USING btree ("client_slug");--> statement-breakpoint
CREATE INDEX "idx_deploy_targets_org" ON "deploy_targets" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_approval_deploy" ON "deployment_approvals" USING btree ("deployment_id");--> statement-breakpoint
CREATE INDEX "idx_deployments_project" ON "deployments" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "idx_deprecation_org" ON "deprecation_results" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_deprecation_sev" ON "deprecation_results" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_deprecation_pkg" ON "deprecation_results" USING btree ("package_name");--> statement-breakpoint
CREATE INDEX "idx_divergence_client" ON "divergence_analyses" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_events_error" ON "error_events" USING btree ("error_id");--> statement-breakpoint
CREATE INDEX "idx_events_project_time" ON "error_events" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_errors_project" ON "errors" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "idx_errors_fingerprint" ON "errors" USING btree ("project_id","fingerprint");--> statement-breakpoint
CREATE INDEX "idx_errors_project_time" ON "errors" USING btree ("project_id","last_seen_at");--> statement-breakpoint
CREATE INDEX "idx_integrations_org" ON "integrations" USING btree ("org_id","provider");--> statement-breakpoint
CREATE INDEX "idx_judgescore_org" ON "judge_scores" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_judgescore_target" ON "judge_scores" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_judgescore_overall" ON "judge_scores" USING btree ("overall_score");--> statement-breakpoint
CREATE INDEX "idx_load_runs_project" ON "load_test_runs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_load_runs_status" ON "load_test_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_load_runs_created" ON "load_test_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_source_slug" ON "managed_sources" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_results_suite" ON "module_test_results" USING btree ("suite_id");--> statement-breakpoint
CREATE INDEX "idx_results_run" ON "module_test_results" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "idx_suites_org" ON "module_test_suites" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_mono_deploy_client" ON "mono_deployments" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_mono_deploy_status" ON "mono_deployments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_runs_pipeline" ON "pipeline_runs" USING btree ("pipeline_id");--> statement-breakpoint
CREATE INDEX "idx_runs_project" ON "pipeline_runs" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "idx_pipelines_project" ON "pipelines" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_projects_org" ON "projects" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_root_causes_error" ON "root_causes" USING btree ("error_id");--> statement-breakpoint
CREATE INDEX "idx_mounts_server" ON "server_mounts" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_mounts_status" ON "server_mounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_resources_ip" ON "server_resources" USING btree ("server_ip");--> statement-breakpoint
CREATE INDEX "idx_resources_checked" ON "server_resources" USING btree ("checked_at");--> statement-breakpoint
CREATE INDEX "idx_servers_name" ON "servers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_source_profiles_org" ON "source_profiles" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_sync_clients_id" ON "sync_clients" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_sync_client" ON "sync_history" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_sync_status" ON "sync_history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sync_created" ON "sync_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ump_user" ON "user_menu_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_ump_user_menu_uniq" ON "user_menu_permissions" USING btree ("user_id","menu_key");--> statement-breakpoint
CREATE INDEX "idx_users_org" ON "users" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");