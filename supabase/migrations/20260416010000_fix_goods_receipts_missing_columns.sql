-- Fix: Add missing columns to goods_receipts that were omitted in master schema rebuild
-- The master schema rebuild (20260414180000) created goods_receipts without several columns

ALTER TABLE public.goods_receipts
  ADD COLUMN IF NOT EXISTS supplier_name TEXT,
  ADD COLUMN IF NOT EXISTS supplier_email TEXT,
  ADD COLUMN IF NOT EXISTS receiver_name TEXT,
  ADD COLUMN IF NOT EXISTS total_ordered NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_received NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supplier_notified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS supplier_notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS received_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
