CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` char(36) NOT NULL,
	`user_name` varchar(100) NOT NULL,
	`action` varchar(50) NOT NULL,
	`resource` varchar(100) NOT NULL,
	`resource_id` varchar(100),
	`description` text,
	`metadata` text,
	`ip_address` varchar(45),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source_id` int NOT NULL,
	`client_slug` varchar(100) NOT NULL,
	`display_name` varchar(200) NOT NULL,
	`domain` varchar(255),
	`server_id` int,
	`config_data` json NOT NULL,
	`deploy_path` varchar(500),
	`git_branch` varchar(100) DEFAULT 'main',
	`status` enum('draft','provisioning','active','maintenance','degraded','archived') DEFAULT 'draft',
	`migration_status` enum('pending','in_progress','current','diverged','failed') DEFAULT 'pending',
	`deployed_version` varchar(20),
	`last_config_pushed_at` datetime,
	`last_deployed_at` datetime,
	`last_health_check_at` datetime,
	`health_score` int DEFAULT 100,
	`notes` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_configs_client_slug_unique` UNIQUE(`client_slug`)
);
--> statement-breakpoint
CREATE TABLE `config_change_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_config_id` int NOT NULL,
	`changed_by` varchar(100),
	`change_type` enum('create','update','deploy','rollback','migrate') NOT NULL,
	`previous_values` json,
	`new_values` json,
	`description` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `config_change_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `db_profiles` (
	`id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`host` varchar(255) NOT NULL,
	`port` int DEFAULT 3306,
	`username` varchar(100) NOT NULL,
	`password` text,
	`database_name` varchar(100),
	`notes` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `db_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deploy_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` char(36) NOT NULL,
	`server_id` int,
	`client_slug` varchar(100),
	`domain` varchar(255),
	`protocol` varchar(10) DEFAULT 'https',
	`deploy_path` varchar(500),
	`deploy_user` varchar(50) DEFAULT 'ubuntu',
	`db_host` varchar(255),
	`db_name` varchar(100),
	`db_user` varchar(100),
	`db_port` int DEFAULT 3306,
	`git_repo` varchar(500),
	`git_branch` varchar(100) DEFAULT 'main',
	`app_framework` varchar(50),
	`app_version` varchar(20),
	`socket_io_port` int,
	`ws_port` int,
	`rate_port` int,
	`notes` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `deploy_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deploy_targets` (
	`id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` varchar(20) DEFAULT 'ssh',
	`host` varchar(255) NOT NULL,
	`port` int DEFAULT 22,
	`username` varchar(100) NOT NULL,
	`auth_method` varchar(20) DEFAULT 'key',
	`encrypted_key` text,
	`encrypted_password` text,
	`remote_path` varchar(500),
	`pre_deploy_cmd` text,
	`post_deploy_cmd` text,
	`is_active` boolean DEFAULT true,
	`last_used_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `deploy_targets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deployment_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deployment_id` int NOT NULL,
	`action` enum('approved','rejected') NOT NULL,
	`acted_by` varchar(100) NOT NULL,
	`reason` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `deployment_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deployments` (
	`id` char(36) NOT NULL,
	`project_id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`pipeline_run_id` char(36),
	`deploy_target_id` char(36),
	`environment` varchar(50) DEFAULT 'production',
	`status` varchar(20) DEFAULT 'pending',
	`branch` varchar(100),
	`commit_sha` varchar(40),
	`commit_message` text,
	`deployed_by` char(36),
	`strategy` varchar(20) DEFAULT 'rolling',
	`rollback_from_id` char(36),
	`started_at` datetime,
	`finished_at` datetime,
	`duration_ms` int,
	`health_check_url` varchar(500),
	`health_check_status` varchar(20),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `deployments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `divergence_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` varchar(100) NOT NULL,
	`client_name` varchar(200),
	`divergence_score` int DEFAULT 0,
	`files_added` int DEFAULT 0,
	`files_modified` int DEFAULT 0,
	`files_deleted` int DEFAULT 0,
	`module_summary` json,
	`file_details` json,
	`analyzed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `divergence_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `error_events` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`error_id` char(36) NOT NULL,
	`project_id` char(36) NOT NULL,
	`stack_trace` text,
	`context` json DEFAULT ('{}'),
	`breadcrumbs` json,
	`user_context` json,
	`environment` varchar(50),
	`release` varchar(50),
	`server_name` varchar(200),
	`url` varchar(1000),
	`method` varchar(10),
	`ip_address` varchar(45),
	`user_agent` text,
	`sdk_version` varchar(20),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `error_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `errors` (
	`id` char(36) NOT NULL,
	`project_id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`fingerprint` varchar(64) NOT NULL,
	`type` varchar(200) NOT NULL,
	`message` text,
	`file` varchar(500),
	`line` int,
	`severity` varchar(20) DEFAULT 'error',
	`status` varchar(20) DEFAULT 'unresolved',
	`assigned_to` char(36),
	`first_seen_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_seen_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`event_count` int DEFAULT 1,
	`linked_deploy_id` char(36),
	`tags` json DEFAULT ('[]'),
	`is_regression` boolean DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `errors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`provider` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`webhook_url` varchar(500),
	`webhook_secret` varchar(100),
	`config` json DEFAULT ('{}'),
	`is_active` boolean DEFAULT true,
	`last_sync_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `log_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` varchar(20) DEFAULT 'file',
	`path` varchar(500) NOT NULL,
	`server` varchar(100) DEFAULT 'localhost',
	`description` varchar(255),
	`is_active` boolean DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `log_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `managed_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(50) NOT NULL,
	`display_name` varchar(200) NOT NULL,
	`description` text,
	`version` varchar(20) DEFAULT '1.0.0',
	`framework` json,
	`base_path` varchar(500),
	`config_schema_path` varchar(500),
	`template_path` varchar(500),
	`manifest_path` varchar(500),
	`deploy_checklist` json,
	`is_active` boolean DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `managed_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `managed_sources_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `mono_deployments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` varchar(100) NOT NULL,
	`client_name` varchar(200),
	`environment` enum('staging','production','support') DEFAULT 'staging',
	`branch` varchar(100),
	`status` enum('pending_approval','running','success','failed','cancelled') DEFAULT 'pending_approval',
	`triggered_by` varchar(100),
	`deploy_notes` text,
	`duration_seconds` int,
	`completed_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `mono_deployments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(200),
	`message` text,
	`link` varchar(500),
	`is_read` boolean DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`plan` varchar(20) DEFAULT 'free',
	`stripe_customer_id` varchar(100),
	`stripe_subscription_id` varchar(100),
	`usage_deploys` int DEFAULT 0,
	`usage_errors` int DEFAULT 0,
	`usage_ai_calls` int DEFAULT 0,
	`usage_reset_at` datetime,
	`settings` json DEFAULT ('{}'),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `pipeline_runs` (
	`id` char(36) NOT NULL,
	`pipeline_id` char(36) NOT NULL,
	`project_id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`run_number` int NOT NULL,
	`status` varchar(20) DEFAULT 'queued',
	`branch` varchar(100),
	`commit_sha` varchar(40),
	`commit_message` text,
	`triggered_by` char(36),
	`trigger_type` varchar(20),
	`stages` json,
	`started_at` datetime,
	`finished_at` datetime,
	`duration_ms` int,
	`log_url` varchar(500),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `pipeline_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipelines` (
	`id` char(36) NOT NULL,
	`project_id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`trigger_config` json,
	`stages` json,
	`yaml_config` text,
	`is_active` boolean DEFAULT true,
	`last_run_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pipelines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`repo_provider` varchar(20) NOT NULL,
	`repo_url` varchar(500) NOT NULL,
	`repo_full_name` varchar(200),
	`default_branch` varchar(50) DEFAULT 'main',
	`sdk_api_key` varchar(64) NOT NULL,
	`health_score` int DEFAULT 100,
	`settings` json DEFAULT ('{}'),
	`is_active` boolean DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_sdk_api_key_unique` UNIQUE(`sdk_api_key`)
);
--> statement-breakpoint
CREATE TABLE `root_causes` (
	`id` char(36) NOT NULL,
	`error_id` char(36) NOT NULL,
	`project_id` char(36) NOT NULL,
	`org_id` char(36),
	`deployment_id` char(36),
	`analysis` text,
	`similar_bugs` json DEFAULT ('[]'),
	`suggested_fix` text,
	`diff_context` text,
	`confidence` int,
	`model` varchar(50),
	`token_usage` json,
	`feedback_rating` int,
	`feedback_comment` text,
	`status` varchar(20) DEFAULT 'pending',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `root_causes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `server_mounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`server_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`remote_path` varchar(500) NOT NULL,
	`local_mount_path` varchar(500) NOT NULL,
	`ssh_user` varchar(50) NOT NULL DEFAULT 'ubuntu',
	`status` varchar(20) DEFAULT 'unmounted',
	`auto_mount` boolean DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_mounted_at` datetime,
	CONSTRAINT `server_mounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `server_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`server_ip` varchar(45) NOT NULL,
	`cpu_percent` decimal(5,2),
	`ram_used_mb` int,
	`ram_total_mb` int,
	`disk_used_gb` decimal(10,2),
	`disk_total_gb` decimal(10,2),
	`load_avg` varchar(50),
	`uptime_hours` int,
	`checked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `server_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`private_ip` varchar(45),
	`public_address` varchar(255),
	`ssh_key` varchar(500),
	`status` varchar(20) DEFAULT 'active',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `servers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` varchar(255) NOT NULL,
	`user_id` char(36) NOT NULL,
	`expires` datetime NOT NULL,
	CONSTRAINT `sessions_session_token` PRIMARY KEY(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `source_profiles` (
	`id` char(36) NOT NULL,
	`org_id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`repo_url` varchar(500) NOT NULL,
	`branch` varchar(100) DEFAULT 'main',
	`auth_type` varchar(20) DEFAULT 'token',
	`auth_value` text,
	`notes` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `source_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` varchar(100) NOT NULL,
	`client_name` varchar(200) NOT NULL,
	`repo_org` varchar(200),
	`repo_name` varchar(200),
	`branch` varchar(100) DEFAULT 'STAGING',
	`client_type` varchar(50) DEFAULT 'retail',
	`sync_workflow` varchar(200) DEFAULT 'sync-batch.yml',
	`is_active` boolean DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sync_clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `sync_clients_client_id_unique` UNIQUE(`client_id`)
);
--> statement-breakpoint
CREATE TABLE `sync_exclude_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`app_category` varchar(50) DEFAULT 'all',
	`layer` varchar(50) DEFAULT 'all',
	`pattern` varchar(300) NOT NULL,
	`reason` varchar(500),
	`is_active` boolean DEFAULT true,
	`created_by` varchar(100) DEFAULT 'system',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sync_exclude_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` varchar(100) NOT NULL,
	`client_name` varchar(200),
	`source_branch` varchar(100) DEFAULT 'main',
	`target_branch` varchar(100) DEFAULT 'STAGING',
	`status` enum('pending','syncing','success','failed','conflict') DEFAULT 'pending',
	`commit_sha` varchar(64),
	`pr_number` int,
	`pr_url` varchar(500),
	`error_message` text,
	`triggered_by` varchar(100),
	`completed_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sync_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_menu_permissions` (
	`user_id` char(36) NOT NULL,
	`menu_key` varchar(100) NOT NULL,
	`visible` boolean NOT NULL DEFAULT true,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `idx_ump_user_menu_uniq` UNIQUE(`user_id`,`menu_key`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`org_id` char(36),
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255),
	`avatar_url` varchar(500),
	`phone` varchar(20),
	`role` varchar(20) DEFAULT 'member',
	`provider` varchar(20),
	`provider_id` varchar(100),
	`github_id` varchar(100),
	`reset_token` varchar(255),
	`reset_token_expires_at` datetime,
	`last_login_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `db_profiles` ADD CONSTRAINT `db_profiles_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deploy_targets` ADD CONSTRAINT `deploy_targets_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deployments` ADD CONSTRAINT `deployments_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deployments` ADD CONSTRAINT `deployments_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `error_events` ADD CONSTRAINT `error_events_error_id_errors_id_fk` FOREIGN KEY (`error_id`) REFERENCES `errors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `error_events` ADD CONSTRAINT `error_events_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `errors` ADD CONSTRAINT `errors_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `errors` ADD CONSTRAINT `errors_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integrations` ADD CONSTRAINT `integrations_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pipeline_runs` ADD CONSTRAINT `pipeline_runs_pipeline_id_pipelines_id_fk` FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pipeline_runs` ADD CONSTRAINT `pipeline_runs_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pipeline_runs` ADD CONSTRAINT `pipeline_runs_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pipelines` ADD CONSTRAINT `pipelines_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pipelines` ADD CONSTRAINT `pipelines_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `root_causes` ADD CONSTRAINT `root_causes_error_id_errors_id_fk` FOREIGN KEY (`error_id`) REFERENCES `errors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `root_causes` ADD CONSTRAINT `root_causes_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `root_causes` ADD CONSTRAINT `root_causes_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_profiles` ADD CONSTRAINT `source_profiles_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_menu_permissions` ADD CONSTRAINT `user_menu_permissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_audit_user` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_action` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `idx_audit_created` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_resource` ON `audit_logs` (`resource`);--> statement-breakpoint
CREATE INDEX `idx_client_source` ON `client_configs` (`source_id`);--> statement-breakpoint
CREATE INDEX `idx_client_slug` ON `client_configs` (`client_slug`);--> statement-breakpoint
CREATE INDEX `idx_client_server` ON `client_configs` (`server_id`);--> statement-breakpoint
CREATE INDEX `idx_client_status` ON `client_configs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_config_history_client` ON `config_change_history` (`client_config_id`);--> statement-breakpoint
CREATE INDEX `idx_config_history_created` ON `config_change_history` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_db_profiles_org` ON `db_profiles` (`org_id`);--> statement-breakpoint
CREATE INDEX `idx_deploy_project` ON `deploy_configs` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_deploy_server` ON `deploy_configs` (`server_id`);--> statement-breakpoint
CREATE INDEX `idx_deploy_slug` ON `deploy_configs` (`client_slug`);--> statement-breakpoint
CREATE INDEX `idx_deploy_targets_org` ON `deploy_targets` (`org_id`);--> statement-breakpoint
CREATE INDEX `idx_approval_deploy` ON `deployment_approvals` (`deployment_id`);--> statement-breakpoint
CREATE INDEX `idx_deployments_project` ON `deployments` (`project_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_divergence_client` ON `divergence_analyses` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_events_error` ON `error_events` (`error_id`);--> statement-breakpoint
CREATE INDEX `idx_events_project_time` ON `error_events` (`project_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_errors_project` ON `errors` (`project_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_errors_fingerprint` ON `errors` (`project_id`,`fingerprint`);--> statement-breakpoint
CREATE INDEX `idx_errors_project_time` ON `errors` (`project_id`,`last_seen_at`);--> statement-breakpoint
CREATE INDEX `idx_integrations_org` ON `integrations` (`org_id`,`provider`);--> statement-breakpoint
CREATE INDEX `idx_source_slug` ON `managed_sources` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_mono_deploy_client` ON `mono_deployments` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_mono_deploy_status` ON `mono_deployments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_notifications_user` ON `notifications` (`user_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `idx_runs_pipeline` ON `pipeline_runs` (`pipeline_id`);--> statement-breakpoint
CREATE INDEX `idx_runs_project` ON `pipeline_runs` (`project_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_pipelines_project` ON `pipelines` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_org` ON `projects` (`org_id`);--> statement-breakpoint
CREATE INDEX `idx_root_causes_error` ON `root_causes` (`error_id`);--> statement-breakpoint
CREATE INDEX `idx_mounts_server` ON `server_mounts` (`server_id`);--> statement-breakpoint
CREATE INDEX `idx_mounts_status` ON `server_mounts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_resources_ip` ON `server_resources` (`server_ip`);--> statement-breakpoint
CREATE INDEX `idx_resources_checked` ON `server_resources` (`checked_at`);--> statement-breakpoint
CREATE INDEX `idx_servers_name` ON `servers` (`name`);--> statement-breakpoint
CREATE INDEX `idx_source_profiles_org` ON `source_profiles` (`org_id`);--> statement-breakpoint
CREATE INDEX `idx_sync_clients_id` ON `sync_clients` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_sync_client` ON `sync_history` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_sync_status` ON `sync_history` (`status`);--> statement-breakpoint
CREATE INDEX `idx_sync_created` ON `sync_history` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_ump_user` ON `user_menu_permissions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_users_org` ON `users` (`org_id`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);