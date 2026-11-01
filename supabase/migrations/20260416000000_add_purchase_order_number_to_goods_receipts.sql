-- Fix: Add missing purchase_order_number column to goods_receipts
-- The master schema rebuild (20260414180000) omitted this column that existed in the original migration

ALTER TABLE public.goods_receipts
ADD COLUMN IF NOT EXISTS purchase_order_number TEXT;
