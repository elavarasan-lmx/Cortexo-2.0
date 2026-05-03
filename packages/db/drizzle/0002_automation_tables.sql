-- ═══════════════════════════════════════════════════════════════
-- Cortexo Phase 4+ : Automation Tables Migration
-- Applied: 2026-05-03
-- Tables: cron_jobs, cron_executions, alert_channels, alert_rules,
--         alert_history, deprecation_results, judge_scores
-- ═══════════════════════════════════════════════════════════════

-- 1. Cron Jobs
CREATE TABLE IF NOT EXISTS `cron_jobs` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `org_id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `schedule` VARCHAR(50) NOT NULL,
  `command` TEXT NOT NULL,
  `target_server` VARCHAR(100) DEFAULT NULL,
  `timezone` VARCHAR(50) DEFAULT 'UTC',
  `is_active` TINYINT(1) DEFAULT 1,
  `last_run_at` DATETIME DEFAULT NULL,
  `next_run_at` DATETIME DEFAULT NULL,
  `created_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cronjobs_org` (`org_id`),
  INDEX `idx_cronjobs_active` (`org_id`, `is_active`),
  CONSTRAINT `fk_cronjobs_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Cron Executions
CREATE TABLE IF NOT EXISTS `cron_executions` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `cron_job_id` CHAR(36) NOT NULL,
  `status` ENUM('success','failed','running','timeout') DEFAULT 'running',
  `output` TEXT DEFAULT NULL,
  `error_message` TEXT DEFAULT NULL,
  `exit_code` INT DEFAULT NULL,
  `duration_ms` INT DEFAULT NULL,
  `triggered_by` ENUM('schedule','manual') DEFAULT 'schedule',
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  INDEX `idx_cronexec_job` (`cron_job_id`),
  INDEX `idx_cronexec_status` (`status`),
  CONSTRAINT `fk_cronexec_job` FOREIGN KEY (`cron_job_id`) REFERENCES `cron_jobs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Alert Channels
CREATE TABLE IF NOT EXISTS `alert_channels` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `org_id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('slack','discord','email','sms','webhook','telegram') NOT NULL,
  `config` JSON DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `events` JSON DEFAULT NULL,
  `last_triggered_at` DATETIME DEFAULT NULL,
  `total_sent` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_alertch_org` (`org_id`),
  INDEX `idx_alertch_type` (`type`),
  CONSTRAINT `fk_alertch_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Alert Rules
CREATE TABLE IF NOT EXISTS `alert_rules` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `org_id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `condition` VARCHAR(500) NOT NULL,
  `threshold` INT DEFAULT NULL,
  `channel_ids` JSON DEFAULT NULL,
  `severity` ENUM('info','warning','critical') DEFAULT 'warning',
  `is_active` TINYINT(1) DEFAULT 1,
  `cooldown_minutes` INT DEFAULT 30,
  `trigger_count` INT DEFAULT 0,
  `last_triggered_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_alertrules_org` (`org_id`),
  CONSTRAINT `fk_alertrules_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Alert History
CREATE TABLE IF NOT EXISTS `alert_history` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `org_id` CHAR(36) NOT NULL,
  `rule_id` CHAR(36) DEFAULT NULL,
  `channel_id` CHAR(36) DEFAULT NULL,
  `rule_name` VARCHAR(100) DEFAULT NULL,
  `channel_name` VARCHAR(100) DEFAULT NULL,
  `severity` ENUM('info','warning','critical') DEFAULT 'warning',
  `message` TEXT DEFAULT NULL,
  `status` ENUM('delivered','failed','pending') DEFAULT 'pending',
  `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_alerthistory_org` (`org_id`),
  INDEX `idx_alerthistory_sent` (`sent_at`),
  CONSTRAINT `fk_alerthistory_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`),
  CONSTRAINT `fk_alerthistory_rule` FOREIGN KEY (`rule_id`) REFERENCES `alert_rules`(`id`),
  CONSTRAINT `fk_alerthistory_channel` FOREIGN KEY (`channel_id`) REFERENCES `alert_channels`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Deprecation Results
CREATE TABLE IF NOT EXISTS `deprecation_results` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `org_id` CHAR(36) NOT NULL,
  `project_id` CHAR(36) DEFAULT NULL,
  `project_name` VARCHAR(100) DEFAULT NULL,
  `package_name` VARCHAR(200) NOT NULL,
  `current_version` VARCHAR(50) DEFAULT NULL,
  `latest_version` VARCHAR(50) DEFAULT NULL,
  `deprecation_type` ENUM('deprecated','major-upgrade','eol-runtime','security-vuln') NOT NULL,
  `severity` ENUM('critical','warning','info') DEFAULT 'warning',
  `message` TEXT DEFAULT NULL,
  `affected_files` JSON DEFAULT NULL,
  `remediation_url` VARCHAR(500) DEFAULT NULL,
  `is_suppressed` TINYINT(1) DEFAULT 0,
  `suppressed_by` CHAR(36) DEFAULT NULL,
  `suppressed_until` DATETIME DEFAULT NULL,
  `scanned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_deprecation_org` (`org_id`),
  INDEX `idx_deprecation_sev` (`severity`),
  INDEX `idx_deprecation_pkg` (`package_name`),
  CONSTRAINT `fk_deprecation_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. AI Judge Scores
CREATE TABLE IF NOT EXISTS `judge_scores` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `org_id` CHAR(36) NOT NULL,
  `target_type` ENUM('deployment','code-review','error-resolution','agent-task') NOT NULL,
  `target_id` VARCHAR(100) NOT NULL,
  `target_name` VARCHAR(200) DEFAULT NULL,
  `overall_score` INT NOT NULL,
  `quality_score` INT DEFAULT NULL,
  `reliability_score` INT DEFAULT NULL,
  `security_score` INT DEFAULT NULL,
  `performance_score` INT DEFAULT NULL,
  `maintainability_score` INT DEFAULT NULL,
  `grade` VARCHAR(5) DEFAULT NULL,
  `summary` TEXT DEFAULT NULL,
  `suggestions` JSON DEFAULT NULL,
  `ai_model` VARCHAR(50) DEFAULT 'gpt-4o',
  `scored_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_judgescore_org` (`org_id`),
  INDEX `idx_judgescore_target` (`target_type`, `target_id`),
  INDEX `idx_judgescore_overall` (`overall_score`),
  CONSTRAINT `fk_judgescore_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
