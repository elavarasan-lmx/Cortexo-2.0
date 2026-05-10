-- Migration: Add missing updated_at column to menu_items table
-- The Drizzle schema defined this column but the original CREATE TABLE migration omitted it.

ALTER TABLE "menu_items" ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT NOW();
