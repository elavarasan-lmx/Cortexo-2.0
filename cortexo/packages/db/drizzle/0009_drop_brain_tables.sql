-- Drop Source Code Brain tables (feature removed)
-- Order matters: drop children before parents (FK constraints)

DROP INDEX IF EXISTS "idx_brain_violations_status";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_brain_violations_brain";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_brain_patterns_brain";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_project_brains_project";--> statement-breakpoint

ALTER TABLE "brain_violations" DROP CONSTRAINT IF EXISTS "brain_violations_pattern_id_brain_patterns_id_fk";--> statement-breakpoint
ALTER TABLE "brain_violations" DROP CONSTRAINT IF EXISTS "brain_violations_brain_id_project_brains_id_fk";--> statement-breakpoint
ALTER TABLE "brain_patterns" DROP CONSTRAINT IF EXISTS "brain_patterns_brain_id_project_brains_id_fk";--> statement-breakpoint
ALTER TABLE "project_brains" DROP CONSTRAINT IF EXISTS "project_brains_project_id_projects_id_fk";--> statement-breakpoint

DROP TABLE IF EXISTS "brain_violations";--> statement-breakpoint
DROP TABLE IF EXISTS "brain_patterns";--> statement-breakpoint
DROP TABLE IF EXISTS "project_brains";
