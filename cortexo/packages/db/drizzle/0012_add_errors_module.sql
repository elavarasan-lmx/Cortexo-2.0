-- Add module column to errors table for module-wise bug tracking
ALTER TABLE "errors" ADD COLUMN "module" varchar(50);

-- Create index for fast module-based queries
CREATE INDEX IF NOT EXISTS "idx_errors_module" ON "errors" ("module", "status");

-- Backfill existing errors with module classification
UPDATE "errors" SET "module" = 
  CASE
    WHEN LOWER(COALESCE("type",'') || ' ' || COALESCE("message",'') || ' ' || COALESCE("file",'')) ~ '(register|registration|signup|c_client_main|kyc)' THEN 'registration'
    WHEN LOWER(COALESCE("type",'') || ' ' || COALESCE("message",'') || ' ' || COALESCE("file",'')) ~ '(login|auth|otp|session|password|forgot|token)' THEN 'login_auth'
    WHEN LOWER(COALESCE("type",'') || ' ' || COALESCE("message",'') || ' ' || COALESCE("file",'')) ~ '(rate|getrates|liverate|spot|mcx|socket|feed)' THEN 'rate_engine'
    WHEN LOWER(COALESCE("type",'') || ' ' || COALESCE("message",'') || ' ' || COALESCE("file",'')) ~ '(trade|book|order|booking|close|pnl|sauda)' THEN 'trading'
    WHEN LOWER(COALESCE("type",'') || ' ' || COALESCE("message",'') || ' ' || COALESCE("file",'')) ~ '(client|ledger|margin|limits|ban|unban|customer)' THEN 'client_mgmt'
    WHEN LOWER(COALESCE("type",'') || ' ' || COALESCE("message",'') || ' ' || COALESCE("file",'')) ~ '(report|closing|brokerage|bill|statement|daily)' THEN 'reports'
    WHEN LOWER(COALESCE("type",'') || ' ' || COALESCE("message",'') || ' ' || COALESCE("file",'')) ~ '(notification|push|fcm|sms|whatsapp|alert)' THEN 'notifications'
    WHEN LOWER(COALESCE("type",'') || ' ' || COALESCE("message",'') || ' ' || COALESCE("file",'')) ~ '(admin|settings|config|banner|version|market.?hour)' THEN 'admin_settings'
    WHEN LOWER(COALESCE("type",'') || ' ' || COALESCE("message",'') || ' ' || COALESCE("file",'')) ~ '(server|db|connection|timeout|memory|cpu|disk)' THEN 'infrastructure'
    ELSE 'uncategorized'
  END
WHERE "module" IS NULL;
