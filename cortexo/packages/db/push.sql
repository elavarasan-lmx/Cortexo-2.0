-- Cortexo Database Schema — Manual Push
-- Run: mysql -u root -proot cortexo < push.sql

-- Organizations
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `plan` varchar(20) DEFAULT 'free',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB;

-- Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` char(36) NOT NULL,
  `name` varchar(100),
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255),
  `role` varchar(20) DEFAULT 'member',
  `org_id` char(36),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB;

-- Auth tables
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_account_id` varchar(255) NOT NULL,
  `refresh_token` text,
  `access_token` text,
  `expires_at` int,
  `token_type` varchar(50),
  `scope` varchar(255),
  `id_token` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` char(36) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `user_id` char(36) NOT NULL,
  `expires` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `verification_tokens` (
  `identifier` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires` datetime NOT NULL,
  PRIMARY KEY (`identifier`, `token`)
) ENGINE=InnoDB;

-- Projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `repo_url` varchar(500),
  `repo_provider` varchar(20) DEFAULT 'github',
  `default_branch` varchar(100) DEFAULT 'main',
  `stack` varchar(100),
  `description` text,
  `api_key` varchar(100),
  `org_id` char(36),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text,
  `is_read` tinyint(1) DEFAULT 0,
  `user_id` char(36),
  `org_id` char(36),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Audit Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50),
  `entity_id` varchar(100),
  `user_id` char(36),
  `details` json,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Pipelines
CREATE TABLE IF NOT EXISTS `pipelines` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `project_id` char(36),
  `trigger_type` varchar(20) DEFAULT 'push',
  `trigger_branch` varchar(100) DEFAULT 'main',
  `steps` json,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `pipeline_runs` (
  `id` char(36) NOT NULL,
  `pipeline_id` char(36),
  `status` enum('queued','running','success','failed','cancelled') DEFAULT 'queued',
  `trigger` varchar(50) DEFAULT 'manual',
  `commit_sha` varchar(64),
  `commit_message` varchar(500),
  `branch` varchar(100),
  `started_at` datetime,
  `finished_at` datetime,
  `duration_ms` int,
  `step_results` json,
  `error_message` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_runs_pipeline` (`pipeline_id`),
  KEY `idx_runs_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `deploy_targets` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(20) DEFAULT 'ssh',
  `host` varchar(255),
  `port` int DEFAULT 22,
  `username` varchar(100),
  `deploy_path` varchar(500),
  `environment` varchar(50) DEFAULT 'production',
  `project_id` char(36),
  `is_active` tinyint(1) DEFAULT 1,
  `last_tested_at` datetime,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `deployments` (
  `id` char(36) NOT NULL,
  `pipeline_run_id` char(36),
  `target_id` char(36),
  `status` enum('pending','deploying','success','failed','rolled_back') DEFAULT 'pending',
  `version` varchar(100),
  `commit_sha` varchar(64),
  `deployed_by` varchar(100),
  `rollback_version` varchar(100),
  `started_at` datetime,
  `finished_at` datetime,
  `duration_ms` int,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_deploy_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `canary_deploys` (
  `id` char(36) NOT NULL,
  `deployment_id` char(36),
  `traffic_percent` int DEFAULT 5,
  `status` enum('ramping','stable','failed','promoted','rolled_back') DEFAULT 'ramping',
  `error_rate_threshold` decimal(5,2) DEFAULT 1.00,
  `current_error_rate` decimal(5,2) DEFAULT 0.00,
  `promoted_at` datetime,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Errors
CREATE TABLE IF NOT EXISTS `errors` (
  `id` char(36) NOT NULL,
  `project_id` char(36),
  `type` varchar(100),
  `message` text,
  `stack_trace` longtext,
  `fingerprint` varchar(64),
  `severity` varchar(20) DEFAULT 'medium',
  `status` varchar(20) DEFAULT 'unresolved',
  `first_seen_at` datetime,
  `last_seen_at` datetime,
  `occurrence_count` int DEFAULT 1,
  `assigned_to` varchar(36),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_errors_project` (`project_id`),
  KEY `idx_errors_fingerprint` (`fingerprint`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `error_events` (
  `id` char(36) NOT NULL,
  `error_id` char(36),
  `environment` varchar(50),
  `release` varchar(100),
  `user_agent` varchar(500),
  `url` varchar(1000),
  `metadata` json,
  `breadcrumbs` json,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_error` (`error_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `root_causes` (
  `id` char(36) NOT NULL,
  `error_id` char(36),
  `analysis` longtext,
  `confidence` decimal(3,2),
  `model` varchar(50),
  `status` varchar(20) DEFAULT 'pending',
  `feedback_rating` int,
  `feedback_comment` text,
  `tokens_used` int,
  `latency_ms` int,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rca_error` (`error_id`)
) ENGINE=InnoDB;

-- Agent
CREATE TABLE IF NOT EXISTS `agent_sessions` (
  `id` char(36) NOT NULL,
  `project_id` char(36),
  `task_type` varchar(50),
  `status` varchar(20) DEFAULT 'active',
  `context_tokens` int DEFAULT 0,
  `max_tokens` int DEFAULT 128000,
  `steps_completed` int DEFAULT 0,
  `result` longtext,
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `agent_memories` (
  `id` char(36) NOT NULL,
  `project_id` char(36),
  `type` varchar(30) DEFAULT 'fact',
  `content` text NOT NULL,
  `importance` decimal(3,2) DEFAULT 0.50,
  `access_count` int DEFAULT 0,
  `last_accessed_at` datetime,
  `expires_at` datetime,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `skill_registry` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `category` varchar(50),
  `version` varchar(20) DEFAULT '1.0.0',
  `is_active` tinyint(1) DEFAULT 1,
  `usage_count` int DEFAULT 0,
  `success_rate` decimal(5,2) DEFAULT 0.00,
  `avg_latency_ms` int DEFAULT 0,
  `config` json,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `bug_patterns` (
  `id` char(36) NOT NULL,
  `pattern_hash` varchar(64),
  `description` text,
  `frequency` int DEFAULT 1,
  `auto_fix_available` tinyint(1) DEFAULT 0,
  `fix_template` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Operations
CREATE TABLE IF NOT EXISTS `integrations` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `config` json,
  `status` varchar(20) DEFAULT 'active',
  `org_id` char(36),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `postmortems` (
  `id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `incident_date` datetime,
  `severity` varchar(20) DEFAULT 'medium',
  `status` varchar(20) DEFAULT 'draft',
  `summary` text,
  `timeline` json,
  `root_cause` text,
  `action_items` json,
  `created_by` varchar(100),
  `org_id` char(36),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- WinBull Configs
CREATE TABLE IF NOT EXISTS `winbull_configs` (
  `id` char(36) NOT NULL,
  `client_slug` varchar(100) NOT NULL,
  `client_id` varchar(100) NOT NULL,
  `display_name` varchar(200) NOT NULL,
  `domain` varchar(255),
  `config_json` json,
  `migration_status` varchar(20) DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_slug` (`client_slug`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `config_change_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(50) NOT NULL,
  `entity_id` varchar(100),
  `entity_name` varchar(200),
  `field_changed` varchar(200),
  `old_value` text,
  `new_value` text,
  `username` varchar(100),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Sync
CREATE TABLE IF NOT EXISTS `sync_history` (
  `id` int NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`id`),
  KEY `idx_sync_client` (`client_id`),
  KEY `idx_sync_status` (`status`),
  KEY `idx_sync_created` (`created_at`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `sync_exclude_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_category` varchar(50) DEFAULT 'all',
  `layer` varchar(50) DEFAULT 'all',
  `pattern` varchar(300) NOT NULL,
  `reason` varchar(500),
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` varchar(100) DEFAULT 'system',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `sync_clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` varchar(100) NOT NULL,
  `client_name` varchar(200) NOT NULL,
  `repo_org` varchar(200),
  `repo_name` varchar(200),
  `branch` varchar(100) DEFAULT 'STAGING',
  `client_type` varchar(50) DEFAULT 'retail',
  `sync_workflow` varchar(200) DEFAULT 'sync-batch.yml',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_id` (`client_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `divergence_analyses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` varchar(100) NOT NULL,
  `client_name` varchar(200),
  `divergence_score` int DEFAULT 0,
  `files_added` int DEFAULT 0,
  `files_modified` int DEFAULT 0,
  `files_deleted` int DEFAULT 0,
  `module_summary` json,
  `file_details` json,
  `analyzed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_divergence_client` (`client_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `mono_deployments` (
  `id` int NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`id`),
  KEY `idx_mono_deploy_client` (`client_id`),
  KEY `idx_mono_deploy_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `deployment_approvals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deployment_id` int NOT NULL,
  `action` enum('approved','rejected') NOT NULL,
  `acted_by` varchar(100) NOT NULL,
  `reason` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_approval_deploy` (`deployment_id`)
) ENGINE=InnoDB;

-- Infrastructure
CREATE TABLE IF NOT EXISTS `servers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `private_ip` varchar(45),
  `public_address` varchar(255),
  `ssh_key` varchar(500),
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_servers_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `server_resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `server_ip` varchar(45) NOT NULL,
  `cpu_percent` decimal(5,2),
  `ram_used_mb` int,
  `ram_total_mb` int,
  `disk_used_gb` decimal(10,2),
  `disk_total_gb` decimal(10,2),
  `load_avg` varchar(50),
  `uptime_hours` int,
  `checked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resources_ip` (`server_ip`),
  KEY `idx_resources_checked` (`checked_at`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `log_sources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(20) DEFAULT 'file',
  `path` varchar(500) NOT NULL,
  `server` varchar(100) DEFAULT 'localhost',
  `description` varchar(255),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `server_mounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `server_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `remote_path` varchar(500) NOT NULL,
  `local_mount_path` varchar(500) NOT NULL,
  `ssh_user` varchar(50) NOT NULL DEFAULT 'ubuntu',
  `status` varchar(20) DEFAULT 'unmounted',
  `auto_mount` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_mounted_at` datetime,
  PRIMARY KEY (`id`),
  KEY `idx_mounts_server` (`server_id`),
  KEY `idx_mounts_status` (`status`)
) ENGINE=InnoDB;

-- Insert default org + user for dev
INSERT IGNORE INTO `organizations` (`id`, `name`, `slug`) VALUES ('default-org', 'Logimax', 'logimax');
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `role`, `org_id`) VALUES ('dev-user', 'LMX', 'elavarasan@logimaxindia.com', 'admin', 'default-org');

SELECT CONCAT('✅ Created ', COUNT(*), ' tables') AS result FROM information_schema.tables WHERE table_schema = 'cortexo';
