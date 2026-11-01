-- Check-in Module Migration
-- Tables: checkin_methods, checkins, checkin_rewards, checkin_rules, nfc_tags, ble_beacons

-- 1. ENUM TYPES
DROP TYPE IF EXISTS public.checkin_method_type CASCADE;
CREATE TYPE public.checkin_method_type AS ENUM ('qr_static', 'qr_dynamic', 'geofence', 'manual', 'nfc', 'beacon');

DROP TYPE IF EXISTS public.checkin_status CASCADE;
CREATE TYPE public.checkin_status AS ENUM ('success', 'rejected', 'suspicious', 'pending');

DROP TYPE IF EXISTS public.nfc_action_type CASCADE;
CREATE TYPE public.nfc_action_type AS ENUM ('checkin_only', 'checkin_coupon', 'checkin_menu', 'promo_only');

DROP TYPE IF EXISTS public.beacon_sensitivity CASCADE;
CREATE TYPE public.beacon_sensitivity AS ENUM ('high', 'medium', 'low');

DROP TYPE IF EXISTS public.frequency_type CASCADE;
CREATE TYPE public.frequency_type AS ENUM ('once_per_day', 'every_x_hours', 'x_per_day', 'unlimited');

-- 2. CORE TABLES

CREATE TABLE IF NOT EXISTS public.checkin_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    method_type public.checkin_method_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    checkins_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_code TEXT,
    method public.checkin_method_type NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    validated_by TEXT,
    checkin_status public.checkin_status DEFAULT 'success',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.checkin_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    base_points INTEGER DEFAULT 10,
    points_by_method JSONB DEFAULT '{}',
    multipliers JSONB DEFAULT '[]',
    streak_config JSONB DEFAULT '{}',
    differentiate_by_method BOOLEAN DEFAULT false,
    streak_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.checkin_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    frequency_type public.frequency_type DEFAULT 'once_per_day',
    frequency_value INTEGER DEFAULT 1,
    cooldown_minutes INTEGER DEFAULT 30,
    rules_by_method JSONB DEFAULT '{}',
    abuse_alerts_enabled BOOLEAN DEFAULT true,
    abuse_threshold INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.nfc_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tag_uid TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    location TEXT,
    action_type public.nfc_action_type DEFAULT 'checkin_only',
    is_active BOOLEAN DEFAULT true,
    taps_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.ble_beacons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    beacon_id TEXT NOT NULL,
    beacon_name TEXT NOT NULL,
    location TEXT,
    sensitivity public.beacon_sensitivity DEFAULT 'medium',
    min_presence_minutes INTEGER DEFAULT 2,
    detection_radius_meters INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    battery_level INTEGER DEFAULT 100,
    checkins_this_month INTEGER DEFAULT 0,
    dwell_time_avg_minutes INTEGER DEFAULT 15,
    last_signal_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_checkin_methods_business ON public.checkin_methods(business_id);
CREATE INDEX IF NOT EXISTS idx_checkins_business ON public.checkins(business_id);
CREATE INDEX IF NOT EXISTS idx_checkins_customer ON public.checkins(customer_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created ON public.checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nfc_tags_business ON public.nfc_tags(business_id);
CREATE INDEX IF NOT EXISTS idx_ble_beacons_business ON public.ble_beacons(business_id);

-- 4. ENABLE RLS
ALTER TABLE public.checkin_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ble_beacons ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
DROP POLICY IF EXISTS "users_manage_checkin_methods" ON public.checkin_methods;
CREATE POLICY "users_manage_checkin_methods" ON public.checkin_methods
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_checkins" ON public.checkins;
CREATE POLICY "users_manage_checkins" ON public.checkins
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_checkin_rewards" ON public.checkin_rewards;
CREATE POLICY "users_manage_checkin_rewards" ON public.checkin_rewards
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_checkin_rules" ON public.checkin_rules;
CREATE POLICY "users_manage_checkin_rules" ON public.checkin_rules
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_nfc_tags" ON public.nfc_tags;
CREATE POLICY "users_manage_nfc_tags" ON public.nfc_tags
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_ble_beacons" ON public.ble_beacons;
CREATE POLICY "users_manage_ble_beacons" ON public.ble_beacons
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

-- 6. MOCK DATA
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

        IF existing_user_id IS NOT NULL THEN

            -- Insert checkin_methods
            INSERT INTO public.checkin_methods (business_id, method_type, is_active, config, checkins_this_month) VALUES
                (existing_user_id, 'qr_static', true, jsonb_build_object('qr_type', 'static', 'location', 'mostrador', 'require_staff_validation', false), 142),
                (existing_user_id, 'qr_dynamic', true, jsonb_build_object('qr_type', 'dynamic', 'rotation_minutes', 5, 'location', 'entrada'), 89),
                (existing_user_id, 'geofence', true, jsonb_build_object('radius_meters', 50, 'min_presence_minutes', 2, 'notify_user', true, 'message', '¡Bienvenido! Tu visita fue registrada 🎉'), 67),
                (existing_user_id, 'manual', true, jsonb_build_object('require_reason', false, 'allowed_roles', ARRAY['owner','admin','cashier']), 23),
                (existing_user_id, 'nfc', false, jsonb_build_object(), 0),
                (existing_user_id, 'beacon', false, jsonb_build_object(), 0)
            ON CONFLICT (id) DO NOTHING;

            -- Insert checkin_rewards
            INSERT INTO public.checkin_rewards (business_id, base_points, points_by_method, multipliers, streak_config, differentiate_by_method, streak_enabled) VALUES
                (existing_user_id, 10,
                 jsonb_build_object('qr_static', 10, 'qr_dynamic', 10, 'geofence', 5, 'manual', 5, 'nfc', 15, 'beacon', 10),
                 jsonb_build_array(
                     jsonb_build_object('id', gen_random_uuid(), 'type', 'day', 'condition', 'Martes', 'multiplier', 2.0, 'active', true),
                     jsonb_build_object('id', gen_random_uuid(), 'type', 'time', 'condition', '14:00-17:00', 'multiplier', 1.5, 'active', true)
                 ),
                 jsonb_build_object('milestones', ARRAY[2,3,5,7,10], 'bonuses', ARRAY[5,10,25,35,50], 'window_days', 7),
                 true, true)
            ON CONFLICT (id) DO NOTHING;

            -- Insert checkin_rules
            INSERT INTO public.checkin_rules (business_id, frequency_type, frequency_value, cooldown_minutes, abuse_alerts_enabled, abuse_threshold) VALUES
                (existing_user_id, 'once_per_day', 1, 30, true, 5)
            ON CONFLICT (id) DO NOTHING;

            -- Insert NFC tags
            INSERT INTO public.nfc_tags (business_id, tag_uid, tag_name, location, action_type, is_active, taps_this_month) VALUES
                (existing_user_id, 'NFC-A1B2C3D4', 'Tag Mostrador', 'mostrador', 'checkin_only', true, 45),
                (existing_user_id, 'NFC-E5F6G7H8', 'Tag Mesa 1', 'Mesa 1', 'checkin_menu', true, 23),
                (existing_user_id, 'NFC-I9J0K1L2', 'Tag Entrada', 'entrada', 'checkin_coupon', true, 67)
            ON CONFLICT (id) DO NOTHING;

            -- Insert BLE beacons
            INSERT INTO public.ble_beacons (business_id, beacon_id, beacon_name, location, sensitivity, min_presence_minutes, is_active, battery_level, checkins_this_month, dwell_time_avg_minutes, last_signal_at) VALUES
                (existing_user_id, 'BLE-BEACON-001', 'Beacon Entrada', 'Entrada principal', 'medium', 2, true, 87, 156, 18, NOW() - INTERVAL '5 minutes'),
                (existing_user_id, 'BLE-BEACON-002', 'Beacon Terraza', 'Zona terraza', 'low', 5, true, 45, 89, 25, NOW() - INTERVAL '2 hours')
            ON CONFLICT (id) DO NOTHING;

            -- Insert sample checkins (last 30 days)
            INSERT INTO public.checkins (business_id, customer_name, customer_code, method, points_awarded, validated_by, checkin_status, created_at) VALUES
                (existing_user_id, 'María García', 'MGA-001', 'qr_static', 10, NULL, 'success', NOW() - INTERVAL '2 hours'),
                (existing_user_id, 'Carlos López', 'CLO-002', 'manual', 5, 'Ana (Cajera)', 'success', NOW() - INTERVAL '3 hours'),
                (existing_user_id, 'Sofia Martínez', 'SMA-003', 'geofence', 5, NULL, 'success', NOW() - INTERVAL '4 hours'),
                (existing_user_id, 'Roberto Hernández', 'RHE-004', 'qr_dynamic', 10, NULL, 'success', NOW() - INTERVAL '5 hours'),
                (existing_user_id, 'Laura Sánchez', 'LSA-005', 'nfc', 15, NULL, 'success', NOW() - INTERVAL '6 hours'),
                (existing_user_id, 'Diego Torres', 'DTO-006', 'qr_static', 10, NULL, 'success', NOW() - INTERVAL '1 day'),
                (existing_user_id, 'Ana Flores', 'AFL-007', 'manual', 5, 'Pedro (Admin)', 'success', NOW() - INTERVAL '1 day'),
                (existing_user_id, 'Miguel Ramírez', 'MRA-008', 'geofence', 5, NULL, 'suspicious', NOW() - INTERVAL '1 day'),
                (existing_user_id, 'Carmen Jiménez', 'CJI-009', 'qr_static', 10, NULL, 'success', NOW() - INTERVAL '2 days'),
                (existing_user_id, 'José Morales', 'JMO-010', 'qr_dynamic', 10, NULL, 'success', NOW() - INTERVAL '2 days'),
                (existing_user_id, 'Patricia Ruiz', 'PRU-011', 'nfc', 15, NULL, 'success', NOW() - INTERVAL '2 days'),
                (existing_user_id, 'Fernando Castro', 'FCA-012', 'manual', 5, 'Ana (Cajera)', 'rejected', NOW() - INTERVAL '3 days'),
                (existing_user_id, 'Isabel Vargas', 'IVA-013', 'qr_static', 10, NULL, 'success', NOW() - INTERVAL '3 days'),
                (existing_user_id, 'Alejandro Díaz', 'ADI-014', 'geofence', 5, NULL, 'success', NOW() - INTERVAL '3 days'),
                (existing_user_id, 'Valentina Cruz', 'VCR-015', 'qr_dynamic', 10, NULL, 'success', NOW() - INTERVAL '4 days'),
                (existing_user_id, 'Andrés Medina', 'AME-016', 'qr_static', 10, NULL, 'success', NOW() - INTERVAL '4 days'),
                (existing_user_id, 'Gabriela Ortiz', 'GOR-017', 'nfc', 15, NULL, 'success', NOW() - INTERVAL '5 days'),
                (existing_user_id, 'Ricardo Gutiérrez', 'RGU-018', 'manual', 5, 'Pedro (Admin)', 'success', NOW() - INTERVAL '5 days'),
                (existing_user_id, 'Natalia Reyes', 'NRE-019', 'geofence', 5, NULL, 'success', NOW() - INTERVAL '6 days'),
                (existing_user_id, 'Eduardo Moreno', 'EMO-020', 'qr_static', 10, NULL, 'success', NOW() - INTERVAL '6 days'),
                (existing_user_id, 'Daniela Aguilar', 'DAG-021', 'qr_dynamic', 10, NULL, 'success', NOW() - INTERVAL '7 days'),
                (existing_user_id, 'Sebastián Peña', 'SPE-022', 'nfc', 15, NULL, 'success', NOW() - INTERVAL '7 days'),
                (existing_user_id, 'Camila Ríos', 'CRI-023', 'qr_static', 10, NULL, 'success', NOW() - INTERVAL '8 days'),
                (existing_user_id, 'Mateo Herrera', 'MHE-024', 'geofence', 5, NULL, 'suspicious', NOW() - INTERVAL '8 days'),
                (existing_user_id, 'Lucía Mendoza', 'LME-025', 'manual', 5, 'Ana (Cajera)', 'success', NOW() - INTERVAL '9 days'),
                (existing_user_id, 'Tomás Guerrero', 'TGU-026', 'qr_static', 10, NULL, 'success', NOW() - INTERVAL '10 days'),
                (existing_user_id, 'Valeria Romero', 'VRO-027', 'qr_dynamic', 10, NULL, 'success', NOW() - INTERVAL '11 days'),
                (existing_user_id, 'Nicolás Navarro', 'NNA-028', 'nfc', 15, NULL, 'success', NOW() - INTERVAL '12 days'),
                (existing_user_id, 'Sofía Domínguez', 'SDO-029', 'geofence', 5, NULL, 'success', NOW() - INTERVAL '13 days'),
                (existing_user_id, 'Emilio Vega', 'EVE-030', 'qr_static', 10, NULL, 'success', NOW() - INTERVAL '14 days')
            ON CONFLICT (id) DO NOTHING;

        ELSE
            RAISE NOTICE 'No users found in user_profiles. Skipping mock data.';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Check-in mock data insertion failed: %', SQLERRM;
END $$;
