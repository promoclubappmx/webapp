-- Staff Management Enhancements Migration
-- Adds: icon column to custom_roles, location_id filter for activity logs

-- 1. Add icon column to custom_roles if not exists
ALTER TABLE public.custom_roles
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Shield';

-- 2. Add location_id to staff_activity_logs for establishment filtering
ALTER TABLE public.staff_activity_logs
  ADD COLUMN IF NOT EXISTS location_id UUID;

-- 3. Add location_id index
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_location_id ON public.staff_activity_logs(location_id);

-- 4. Ensure staff_members has status column
ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 5. Ensure staff_members has email_confirmed column
ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;

-- 6. Update default roles to include icons
UPDATE public.custom_roles SET icon = 'ShieldCheck' WHERE role_key = 'admin' AND icon IS NULL;
UPDATE public.custom_roles SET icon = 'Briefcase' WHERE role_key = 'manager' AND icon IS NULL;
UPDATE public.custom_roles SET icon = 'ShoppingCart' WHERE role_key = 'cashier' AND icon IS NULL;
