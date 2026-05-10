-- ============================================================================
-- Migration 0010: Cleanup dead tables + sync missing schema
-- Tables dropped: agent_runs, integrations (the only 2 dead in live DB)
-- Tables created: alert_channels, alert_rules, alert_history, judge_scores,
--                 menu_items, log_sources (schema-defined but never migrated)
-- Columns added: root_causes Sprint 2 expansion (F8)
-- ============================================================================

-- ── STEP 1: Drop dead tables ───────────────────────────────────────────────
DROP TABLE IF EXISTS "agent_runs" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "integrations" CASCADE;--> statement-breakpoint

-- ── STEP 2: Create missing tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "alert_channels" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL REFERENCES "organizations"("id"),
  "name" VARCHAR(100) NOT NULL,
  "type" VARCHAR(20) NOT NULL,
  "config" JSONB DEFAULT '{}',
  "is_active" BOOLEAN DEFAULT true,
  "events" JSONB DEFAULT '[]',
  "last_triggered_at" TIMESTAMP,
  "total_sent" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alertch_org" ON "alert_channels"("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alertch_type" ON "alert_channels"("type");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "alert_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL REFERENCES "organizations"("id"),
  "name" VARCHAR(100) NOT NULL,
  "condition" VARCHAR(500) NOT NULL,
  "threshold" INTEGER,
  "channel_ids" JSONB DEFAULT '[]',
  "severity" VARCHAR(20) DEFAULT 'warning',
  "is_active" BOOLEAN DEFAULT true,
  "cooldown_minutes" INTEGER DEFAULT 30,
  "trigger_count" INTEGER DEFAULT 0,
  "last_triggered_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alertrules_org" ON "alert_rules"("org_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "alert_history" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL REFERENCES "organizations"("id"),
  "rule_id" UUID REFERENCES "alert_rules"("id"),
  "channel_id" UUID REFERENCES "alert_channels"("id"),
  "rule_name" VARCHAR(100),
  "channel_name" VARCHAR(100),
  "severity" VARCHAR(20) DEFAULT 'warning',
  "message" TEXT,
  "status" VARCHAR(20) DEFAULT 'pending',
  "sent_at" TIMESTAMP NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alerthistory_org" ON "alert_history"("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alerthistory_sent" ON "alert_history"("sent_at");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "judge_scores" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL REFERENCES "organizations"("id"),
  "target_type" VARCHAR(30) NOT NULL,
  "target_id" VARCHAR(100) NOT NULL,
  "target_name" VARCHAR(200),
  "overall_score" INTEGER NOT NULL,
  "quality_score" INTEGER,
  "reliability_score" INTEGER,
  "security_score" INTEGER,
  "performance_score" INTEGER,
  "maintainability_score" INTEGER,
  "grade" VARCHAR(5),
  "summary" TEXT,
  "suggestions" JSONB DEFAULT '[]',
  "ai_model" VARCHAR(50) DEFAULT 'gpt-4o',
  "scored_at" TIMESTAMP NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_judgescore_org" ON "judge_scores"("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_judgescore_target" ON "judge_scores"("target_type", "target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_judgescore_overall" ON "judge_scores"("overall_score");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "menu_items" (
  "id" SERIAL PRIMARY KEY,
  "label" VARCHAR(100) NOT NULL,
  "href" VARCHAR(255) NOT NULL,
  "emoji" VARCHAR(10) DEFAULT '',
  "section_title" VARCHAR(100) DEFAULT 'General',
  "section_color" VARCHAR(20) DEFAULT '#6366f1',
  "sort_order" INTEGER DEFAULT 0,
  "visible" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "log_sources" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "type" VARCHAR(20) DEFAULT 'file',
  "path" VARCHAR(500) NOT NULL,
  "server" VARCHAR(100) DEFAULT 'localhost',
  "description" VARCHAR(255),
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);--> statement-breakpoint

-- ── STEP 3: Add missing columns to root_causes (Sprint 2 — F8) ────────────
ALTER TABLE "root_causes" ADD COLUMN IF NOT EXISTS "summary" TEXT;--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN IF NOT EXISTS "root_cause" TEXT;--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN IF NOT EXISTS "category" VARCHAR(30);--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN IF NOT EXISTS "affected_files" JSONB DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN IF NOT EXISTS "provider" VARCHAR(30);--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN IF NOT EXISTS "fix_applied" BOOLEAN DEFAULT false;--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN IF NOT EXISTS "user_feedback" VARCHAR(10);--> statement-breakpoint
ALTER TABLE "root_causes" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP;--> statement-breakpoint

-- ── STEP 4: Add missing indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "idx_root_causes_project" ON "root_causes"("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_root_causes_deploy" ON "root_causes"("deployment_id");
