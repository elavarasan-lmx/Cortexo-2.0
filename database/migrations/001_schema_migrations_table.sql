-- Migration: 001_schema_migrations_table.sql
-- Creates the migration tracking table itself.
-- This file is for reference only — run-migrations.sh creates this table automatically.

CREATE TABLE IF NOT EXISTS schema_migrations (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    migration    VARCHAR(255) NOT NULL UNIQUE COMMENT 'Filename of the migration SQL file',
    environment  VARCHAR(50)  DEFAULT 'unknown' COMMENT 'Which env ran this: staging / prod',
    executed_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    checksum     VARCHAR(64)  DEFAULT NULL COMMENT 'MD5 of the SQL file at time of execution'
);
