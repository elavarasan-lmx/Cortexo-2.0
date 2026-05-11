-- Custom DevOps Docs (user-created runbooks)
CREATE TABLE IF NOT EXISTS "custom_docs" (
  "id" serial PRIMARY KEY,
  "tool" varchar(50) NOT NULL,
  "color" varchar(20) DEFAULT '#6366F1',
  "category" varchar(50) DEFAULT 'Custom',
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "commands" jsonb DEFAULT '[]'::jsonb,
  "config_snippets" jsonb DEFAULT '[]'::jsonb,
  "tips" jsonb DEFAULT '[]'::jsonb,
  "created_by" varchar(100),
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_custom_docs_tool" ON "custom_docs" ("tool");
CREATE INDEX IF NOT EXISTS "idx_custom_docs_active" ON "custom_docs" ("is_active");

-- Deployment Checklists (interactive step tracking per client)
CREATE TABLE IF NOT EXISTS "deploy_checklists" (
  "id" serial PRIMARY KEY,
  "client_name" varchar(100) NOT NULL,
  "project_type" varchar(50) DEFAULT 'bullion',
  "steps" jsonb DEFAULT '[]'::jsonb,
  "status" varchar(20) DEFAULT 'pending',
  "created_by" varchar(100),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_deploy_checklists_client" ON "deploy_checklists" ("client_name");
CREATE INDEX IF NOT EXISTS "idx_deploy_checklists_status" ON "deploy_checklists" ("status");
