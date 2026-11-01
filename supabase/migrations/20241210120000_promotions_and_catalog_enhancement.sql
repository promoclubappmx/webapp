-- Location: supabase/migrations/20241210120000_promotions_and_catalog_enhancement.sql
-- Schema Analysis: Creating new catalog system and enhancing promotions with images and categories
-- Integration Type: addition/extension/enhancement
-- Dependencies: auth.users for user references

-- 1. Create custom types
CREATE TYPE public.business_type AS ENUM ('product', 'service');
CREATE TYPE public.catalog_status AS ENUM ('draft', 'active', 'inactive', 'discontinued');
CREATE TYPE public.promotion_type AS ENUM ('percentage', 'fixed_amount', 'buy_one_get_one', 'bulk_discount');

-- 2. Create user_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'owner',
    business_name TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    color TEXT DEFAULT '#3B82F6',
    business_type public.business_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create catalog_items table (products and services)
CREATE TABLE public.catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    business_type public.business_type NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    sku TEXT,
    barcode TEXT,
    image_url TEXT,
    image_path TEXT,
    status public.catalog_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    weight DECIMAL(8,2),
    dimensions JSONB,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create enhanced promotions table
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    promotion_type public.promotion_type DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME DEFAULT '09:00',
    end_time TIME DEFAULT '21:00',
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    target_days TEXT[] DEFAULT '{}',
    target_audience TEXT DEFAULT 'all',
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    is_recurring BOOLEAN DEFAULT false,
    recurring_type TEXT,
    status TEXT DEFAULT 'draft',
    image_url TEXT,
    image_path TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    business_type public.business_type,
    applicable_items UUID[] DEFAULT '{}',
    performance JSONB DEFAULT '{"views": 0, "clicks": 0, "conversions": 0}',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create promotion_items junction table (many-to-many relationship)
CREATE TABLE public.promotion_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, catalog_item_id)
);

-- 7. Create essential indexes
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_business_type ON public.categories(business_type);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

CREATE INDEX idx_catalog_items_user_id ON public.catalog_items(user_id);
CREATE INDEX idx_catalog_items_category_id ON public.catalog_items(category_id);
CREATE INDEX idx_catalog_items_business_type ON public.catalog_items(business_type);
CREATE INDEX idx_catalog_items_status ON public.catalog_items(status);
CREATE INDEX idx_catalog_items_is_featured ON public.catalog_items(is_featured);
CREATE INDEX idx_catalog_items_sku ON public.catalog_items(sku);

CREATE INDEX idx_promotions_user_id ON public.promotions(user_id);
CREATE INDEX idx_promotions_category_id ON public.promotions(category_id);
CREATE INDEX idx_promotions_status ON public.promotions(status);
CREATE INDEX idx_promotions_start_date ON public.promotions(start_date);
CREATE INDEX idx_promotions_end_date ON public.promotions(end_date);
CREATE INDEX idx_promotions_business_type ON public.promotions(business_type);

CREATE INDEX idx_promotion_items_promotion_id ON public.promotion_items(promotion_id);
CREATE INDEX idx_promotion_items_catalog_item_id ON public.promotion_items(catalog_item_id);

-- 8. Create storage bucket for promotional and catalog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'promotional-images',
    'promotional-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- 9. Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_items ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies following the established patterns

-- Pattern 1: Core user table (user_profiles)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for categories
CREATE POLICY "users_manage_own_categories"
ON public.categories
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 4: Public read, private write for catalog_items
CREATE POLICY "public_can_read_catalog_items"
ON public.catalog_items
FOR SELECT
TO public
USING (status = 'active');

CREATE POLICY "users_manage_own_catalog_items"
ON public.catalog_items
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 4: Public read, private write for promotions
CREATE POLICY "public_can_read_promotions"
ON public.promotions
FOR SELECT
TO public
USING (status = 'active');

CREATE POLICY "users_manage_own_promotions"
ON public.promotions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple user ownership for promotion_items
CREATE POLICY "users_manage_own_promotion_items"
ON public.promotion_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.promotions p
        WHERE p.id = promotion_id AND p.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.promotions p
        WHERE p.id = promotion_id AND p.user_id = auth.uid()
    )
);

-- 11. Storage RLS policies
CREATE POLICY "public_can_view_promotional_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'promotional-images');

CREATE POLICY "authenticated_users_upload_promotional_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'promotional-images');

CREATE POLICY "owners_manage_promotional_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'promotional-images' AND owner = auth.uid());

CREATE POLICY "owners_update_promotional_images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'promotional-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'promotional-images' AND owner = auth.uid());

-- 12. Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, business_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mi Negocio')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Create helper functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_items_updated_at BEFORE UPDATE ON public.catalog_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Create mock data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
    category_food_id UUID := gen_random_uuid();
    category_drinks_id UUID := gen_random_uuid();
    category_services_id UUID := gen_random_uuid();
    product1_id UUID := gen_random_uuid();
    product2_id UUID := gen_random_uuid();
    service1_id UUID := gen_random_uuid();
    promotion1_id UUID := gen_random_uuid();
    promotion2_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@restaurant.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Carlos Mendoza", "business_name": "Mi Restaurante"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'manager@restaurant.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Ana García", "business_name": "Mi Restaurante"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create categories
    INSERT INTO public.categories (id, name, description, business_type, icon_name, color, user_id) VALUES
        (category_food_id, 'Comida', 'Platos principales, entradas y postres', 'product', 'UtensilsCrossed', '#FF6B35', admin_uuid),
        (category_drinks_id, 'Bebidas', 'Bebidas alcohólicas y no alcohólicas', 'product', 'Coffee', '#4ECDC4', admin_uuid),
        (category_services_id, 'Servicios', 'Servicios adicionales del restaurante', 'service', 'Utensils', '#45B7D1', admin_uuid);

    -- Create catalog items (products)
    INSERT INTO public.catalog_items (id, name, description, business_type, category_id, price, cost, sku, status, is_featured, stock_quantity, user_id) VALUES
        (product1_id, 'Paella Valenciana', 'Auténtica paella valenciana con mariscos frescos, pollo y verduras de temporada', 'product', category_food_id, 18.50, 12.00, 'PAE001', 'active', true, 100, admin_uuid),
        (product2_id, 'Sangría de la Casa', 'Refrescante sangría con frutas naturales y vino tinto seleccionado', 'product', category_drinks_id, 12.00, 6.00, 'SAN001', 'active', true, 50, admin_uuid);

    -- Create catalog items (services)
    INSERT INTO public.catalog_items (id, name, description, business_type, category_id, price, sku, status, user_id) VALUES
        (service1_id, 'Evento Privado', 'Organización completa de eventos privados con menú personalizado', 'service', category_services_id, 150.00, 'EVT001', 'active', admin_uuid);

    -- Create promotions
    INSERT INTO public.promotions (id, title, description, promotion_type, discount_value, start_date, end_date, category_id, business_type, status, user_id) VALUES
        (promotion1_id, 'Descuento de Verano en Paellas', 'Disfruta de un 20% de descuento en todas nuestras paellas durante el verano', 'percentage', 20.00, '2024-06-01', '2024-08-31', category_food_id, 'product', 'active', admin_uuid),
        (promotion2_id, 'Eventos con Descuento', '15% de descuento en la organización de eventos privados', 'percentage', 15.00, '2024-10-01', '2024-12-31', category_services_id, 'service', 'active', admin_uuid);

    -- Link promotions to specific items
    INSERT INTO public.promotion_items (promotion_id, catalog_item_id) VALUES
        (promotion1_id, product1_id),
        (promotion2_id, service1_id);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;