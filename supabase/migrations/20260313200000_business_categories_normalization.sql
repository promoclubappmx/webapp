-- Business Categories Normalization
-- Creates 3 normalized tables: business_categories, business_subcategories, business_establishment_types
-- with full seed data from the 13-category taxonomy

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.business_categories (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_subcategories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid NOT NULL REFERENCES public.business_categories(id) ON DELETE CASCADE,
  nombre       text NOT NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_establishment_types (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategoria_id uuid NOT NULL REFERENCES public.business_subcategories(id) ON DELETE CASCADE,
  nombre          text NOT NULL,
  created_at      timestamptz DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_business_subcategories_categoria_id
  ON public.business_subcategories(categoria_id);

CREATE INDEX IF NOT EXISTS idx_business_establishment_types_subcategoria_id
  ON public.business_establishment_types(subcategoria_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_establishment_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_business_categories" ON public.business_categories;
CREATE POLICY "public_read_business_categories"
  ON public.business_categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_write_business_categories" ON public.business_categories;
CREATE POLICY "auth_write_business_categories"
  ON public.business_categories FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_business_subcategories" ON public.business_subcategories;
CREATE POLICY "public_read_business_subcategories"
  ON public.business_subcategories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_write_business_subcategories" ON public.business_subcategories;
CREATE POLICY "auth_write_business_subcategories"
  ON public.business_subcategories FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_business_establishment_types" ON public.business_establishment_types;
CREATE POLICY "public_read_business_establishment_types"
  ON public.business_establishment_types FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_write_business_establishment_types" ON public.business_establishment_types;
CREATE POLICY "auth_write_business_establishment_types"
  ON public.business_establishment_types FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ─── Seed Data ───────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Category UUIDs
  cat_restaurantes    uuid;
  cat_bares           uuid;
  cat_compras         uuid;
  cat_salud           uuid;
  cat_belleza         uuid;
  cat_entretenimiento uuid;
  cat_deporte         uuid;
  cat_automotriz      uuid;
  cat_profesionales   uuid;
  cat_turismo         uuid;
  cat_educacion       uuid;
  cat_mascotas        uuid;
  cat_generales       uuid;

  -- Subcategory UUIDs
  sub_id uuid;

BEGIN
  -- Skip if already seeded
  IF EXISTS (SELECT 1 FROM public.business_categories LIMIT 1) THEN
    RAISE NOTICE 'business_categories already seeded, skipping.';
    RETURN;
  END IF;

  -- ── Insert Categories ──────────────────────────────────────────────────────
  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Restaurantes y comida')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_restaurantes FROM public.business_categories WHERE nombre = 'Restaurantes y comida';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Bares y vida nocturna')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_bares FROM public.business_categories WHERE nombre = 'Bares y vida nocturna';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Compras y retail')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_compras FROM public.business_categories WHERE nombre = 'Compras y retail';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Salud y medicina')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_salud FROM public.business_categories WHERE nombre = 'Salud y medicina';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Belleza y cuidado personal')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_belleza FROM public.business_categories WHERE nombre = 'Belleza y cuidado personal';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Entretenimiento')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_entretenimiento FROM public.business_categories WHERE nombre = 'Entretenimiento';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Deporte y fitness')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_deporte FROM public.business_categories WHERE nombre = 'Deporte y fitness';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Servicios automotrices')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_automotriz FROM public.business_categories WHERE nombre = 'Servicios automotrices';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Servicios profesionales')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_profesionales FROM public.business_categories WHERE nombre = 'Servicios profesionales';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Turismo y hospedaje')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_turismo FROM public.business_categories WHERE nombre = 'Turismo y hospedaje';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Educación')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_educacion FROM public.business_categories WHERE nombre = 'Educación';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Mascotas')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_mascotas FROM public.business_categories WHERE nombre = 'Mascotas';

  INSERT INTO public.business_categories (id, nombre) VALUES
    (gen_random_uuid(), 'Servicios generales')
    ON CONFLICT (nombre) DO NOTHING;
  SELECT id INTO cat_generales FROM public.business_categories WHERE nombre = 'Servicios generales';

  -- ── Restaurantes y comida ──────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_restaurantes, 'Restaurantes');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Restaurantes' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Restaurante mexicano'), (sub_id, 'Restaurante italiano'), (sub_id, 'Restaurante japonés'),
    (sub_id, 'Restaurante chino'), (sub_id, 'Restaurante coreano'), (sub_id, 'Restaurante tailandés'),
    (sub_id, 'Restaurante mediterráneo'), (sub_id, 'Restaurante francés'), (sub_id, 'Restaurante español'),
    (sub_id, 'Restaurante argentino'), (sub_id, 'Restaurante brasileño'), (sub_id, 'Restaurante vegetariano'),
    (sub_id, 'Restaurante vegano'), (sub_id, 'Restaurante buffet'), (sub_id, 'Restaurante familiar'),
    (sub_id, 'Restaurante gourmet');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_restaurantes, 'Comida rápida');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Comida rápida' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Taquería'), (sub_id, 'Pizzería'), (sub_id, 'Hamburguesería'), (sub_id, 'Sushi bar'),
    (sub_id, 'Marisquería'), (sub_id, 'Pollería'), (sub_id, 'Tortería'), (sub_id, 'Antojitos mexicanos'),
    (sub_id, 'Food truck'), (sub_id, 'Comida corrida');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_restaurantes, 'Cafés y bebidas');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Cafés y bebidas' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Cafetería'), (sub_id, 'Coffee shop'), (sub_id, 'Casa de té'),
    (sub_id, 'Bar de jugos'), (sub_id, 'Smoothie bar'), (sub_id, 'Chocolatería');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_restaurantes, 'Postres y panadería');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Postres y panadería' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Heladería'), (sub_id, 'Pastelería'), (sub_id, 'Panadería'), (sub_id, 'Donas'), (sub_id, 'Crepería');

  -- ── Bares y vida nocturna ──────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_bares, 'Bares');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_bares AND nombre = 'Bares' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Bar'), (sub_id, 'Bar deportivo'), (sub_id, 'Bar de vinos'),
    (sub_id, 'Bar de cerveza artesanal'), (sub_id, 'Cantina'), (sub_id, 'Pub');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_bares, 'Entretenimiento nocturno');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_bares AND nombre = 'Entretenimiento nocturno' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Club nocturno'), (sub_id, 'Karaoke bar'), (sub_id, 'Lounge bar'), (sub_id, 'Terraza bar');

  -- ── Compras y retail ──────────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_compras, 'Moda');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Moda' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Tienda de ropa'), (sub_id, 'Boutique'), (sub_id, 'Tienda de ropa infantil'),
    (sub_id, 'Tienda de ropa deportiva'), (sub_id, 'Tienda de ropa formal'),
    (sub_id, 'Tienda de ropa interior'), (sub_id, 'Zapatería');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_compras, 'Accesorios');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Accesorios' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Joyería'), (sub_id, 'Relojería'), (sub_id, 'Bolsos y maletas'), (sub_id, 'Sombrerería'), (sub_id, 'Óptica');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_compras, 'Electrónica');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Electrónica' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Tienda de electrónica'), (sub_id, 'Tienda de celulares'), (sub_id, 'Tienda de computadoras'),
    (sub_id, 'Tienda de videojuegos'), (sub_id, 'Tienda de cámaras');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_compras, 'Supermercados y conveniencia');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Supermercados y conveniencia' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Supermercado'), (sub_id, 'Mini super'), (sub_id, 'Tienda de conveniencia'),
    (sub_id, 'Tienda naturista'), (sub_id, 'Tienda orgánica');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_compras, 'Tiendas especializadas');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Tiendas especializadas' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Librería'), (sub_id, 'Papelería'), (sub_id, 'Tienda de mascotas'),
    (sub_id, 'Florería'), (sub_id, 'Tienda de regalos');

  -- ── Salud y medicina ──────────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_salud, 'Servicios médicos');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Servicios médicos' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Hospital'), (sub_id, 'Clínica'), (sub_id, 'Consultorio médico'), (sub_id, 'Centro médico');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_salud, 'Especialidades médicas');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Especialidades médicas' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Dentista'), (sub_id, 'Dermatólogo'), (sub_id, 'Pediatra'), (sub_id, 'Ginecólogo'), (sub_id, 'Oftalmólogo');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_salud, 'Terapias');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Terapias' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Fisioterapia'), (sub_id, 'Quiropráctico'), (sub_id, 'Acupuntura'),
    (sub_id, 'Psicólogo'), (sub_id, 'Psiquiatra');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_salud, 'Farmacias');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Farmacias' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Farmacia'), (sub_id, 'Farmacia homeopática');

  -- ── Belleza y cuidado personal ────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_belleza, 'Peluquería');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_belleza AND nombre = 'Peluquería' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Salón de belleza'), (sub_id, 'Peluquería'), (sub_id, 'Barbería');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_belleza, 'Spa y estética');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_belleza AND nombre = 'Spa y estética' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Spa'), (sub_id, 'Spa de uñas'), (sub_id, 'Estética'),
    (sub_id, 'Centro de depilación'), (sub_id, 'Clínica estética'), (sub_id, 'Centro de bronceado');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_belleza, 'Bienestar');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_belleza AND nombre = 'Bienestar' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Centro de masajes'), (sub_id, 'Terapias alternativas');

  -- ── Entretenimiento ───────────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_entretenimiento, 'Cultura');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_entretenimiento AND nombre = 'Cultura' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Cine'), (sub_id, 'Teatro'), (sub_id, 'Museo'), (sub_id, 'Galería de arte');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_entretenimiento, 'Juegos y recreación');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_entretenimiento AND nombre = 'Juegos y recreación' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Arcade'), (sub_id, 'Boliche'), (sub_id, 'Billar'), (sub_id, 'Escape room');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_entretenimiento, 'Diversión');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_entretenimiento AND nombre = 'Diversión' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Parque de diversiones'), (sub_id, 'Casino'), (sub_id, 'Centro de entretenimiento');

  -- ── Deporte y fitness ─────────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_deporte, 'Gimnasios');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_deporte AND nombre = 'Gimnasios' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Gimnasio'), (sub_id, 'Crossfit'), (sub_id, 'Centro fitness');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_deporte, 'Estudios');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_deporte AND nombre = 'Estudios' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Estudio de yoga'), (sub_id, 'Estudio de pilates'), (sub_id, 'Estudio de baile');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_deporte, 'Deportes');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_deporte AND nombre = 'Deportes' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Escuela de artes marciales'), (sub_id, 'Alberca'), (sub_id, 'Cancha deportiva'),
    (sub_id, 'Club deportivo'), (sub_id, 'Centro de escalada');

  -- ── Servicios automotrices ────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_automotriz, 'Mantenimiento');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Mantenimiento' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Taller mecánico'), (sub_id, 'Servicio automotriz'), (sub_id, 'Autolavado'),
    (sub_id, 'Llantera'), (sub_id, 'Alineación y balanceo'), (sub_id, 'Cambio de aceite'),
    (sub_id, 'Hojalatería y pintura'), (sub_id, 'Electromecánico automotriz'), (sub_id, 'Vulcanizadora');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_automotriz, 'Venta');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Venta' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Agencia de autos'), (sub_id, 'Venta de autos usados'), (sub_id, 'Refaccionaria'),
    (sub_id, 'Accesorios automotrices'), (sub_id, 'Venta de motocicletas'), (sub_id, 'Refacciones para motocicleta');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_automotriz, 'Energía');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Energía' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Gasolinera'), (sub_id, 'Estación de carga eléctrica'), (sub_id, 'Gasera');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_automotriz, 'Especializados');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Especializados' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Servicio de grúas'), (sub_id, 'Polarizado automotriz'), (sub_id, 'Instalación de alarmas'),
    (sub_id, 'Estéreo automotriz'), (sub_id, 'Verificación vehicular');

  -- ── Servicios profesionales ───────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_profesionales, 'Legal');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Legal' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Abogado'), (sub_id, 'Notaría'), (sub_id, 'Despacho jurídico'), (sub_id, 'Mediación legal');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_profesionales, 'Finanzas');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Finanzas' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Contador'), (sub_id, 'Asesor fiscal'), (sub_id, 'Despacho contable'),
    (sub_id, 'Auditor'), (sub_id, 'Agencia de seguros'), (sub_id, 'Asesor financiero');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_profesionales, 'Negocios');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Negocios' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Consultoría empresarial'), (sub_id, 'Agencia de marketing'), (sub_id, 'Agencia de publicidad'),
    (sub_id, 'Agencia inmobiliaria'), (sub_id, 'Consultor de recursos humanos'),
    (sub_id, 'Consultor de tecnología'), (sub_id, 'Coworking');

  -- ── Turismo y hospedaje ───────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_turismo, 'Hospedaje');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_turismo AND nombre = 'Hospedaje' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Hotel'), (sub_id, 'Motel'), (sub_id, 'Hostal'), (sub_id, 'Resort'),
    (sub_id, 'Renta vacacional'), (sub_id, 'Bed and breakfast'), (sub_id, 'Posada');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_turismo, 'Turismo');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_turismo AND nombre = 'Turismo' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Agencia de viajes'), (sub_id, 'Tour operador'), (sub_id, 'Guía turístico'),
    (sub_id, 'Tours de aventura'), (sub_id, 'Tours culturales'), (sub_id, 'Tours en barco');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_turismo, 'Experiencias');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_turismo AND nombre = 'Experiencias' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Parque ecoturístico'), (sub_id, 'Centro recreativo'), (sub_id, 'Mirador turístico'),
    (sub_id, 'Atracción turística'), (sub_id, 'Centro de actividades acuáticas');

  -- ── Educación ─────────────────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_educacion, 'Escuelas');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_educacion AND nombre = 'Escuelas' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Preescolar'), (sub_id, 'Escuela primaria'), (sub_id, 'Escuela secundaria'),
    (sub_id, 'Preparatoria'), (sub_id, 'Universidad'), (sub_id, 'Colegio privado');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_educacion, 'Academias');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_educacion AND nombre = 'Academias' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Academia de idiomas'), (sub_id, 'Escuela de música'), (sub_id, 'Escuela de arte'),
    (sub_id, 'Academia de danza'), (sub_id, 'Academia de computación'), (sub_id, 'Academia de regularización');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_educacion, 'Capacitación');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_educacion AND nombre = 'Capacitación' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Centro de capacitación'), (sub_id, 'Cursos profesionales'), (sub_id, 'Capacitación empresarial'),
    (sub_id, 'Centro de certificación'), (sub_id, 'Escuela técnica');

  -- ── Mascotas ──────────────────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_mascotas, 'Salud');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_mascotas AND nombre = 'Salud' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Veterinaria'), (sub_id, 'Hospital veterinario'), (sub_id, 'Clínica veterinaria'),
    (sub_id, 'Farmacia veterinaria');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_mascotas, 'Servicios');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_mascotas AND nombre = 'Servicios' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Guardería para mascotas'), (sub_id, 'Peluquería canina'), (sub_id, 'Paseador de perros'),
    (sub_id, 'Entrenamiento canino'), (sub_id, 'Hotel para mascotas'), (sub_id, 'Adiestramiento');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_mascotas, 'Tiendas');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_mascotas AND nombre = 'Tiendas' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Tienda de mascotas'), (sub_id, 'Boutique para mascotas'),
    (sub_id, 'Alimentos para mascotas'), (sub_id, 'Accesorios para mascotas');

  -- ── Servicios generales ───────────────────────────────────────────────────
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_generales, 'Limpieza');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_generales AND nombre = 'Limpieza' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Lavandería'), (sub_id, 'Tintorería'), (sub_id, 'Servicio de limpieza'),
    (sub_id, 'Limpieza de alfombras'), (sub_id, 'Limpieza industrial');

  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES (gen_random_uuid(), cat_generales, 'Reparaciones');
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_generales AND nombre = 'Reparaciones' LIMIT 1;
  INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
    (sub_id, 'Cerrajería'), (sub_id, 'Reparación de celulares'), (sub_id, 'Reparación de electrodomésticos'),
    (sub_id, 'Reparación de computadoras'), (sub_id, 'Reparación de televisores'), (sub_id, 'Servicio técnico');

  RAISE NOTICE 'business_categories seed data inserted successfully.';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data insertion failed: %', SQLERRM;
END $$;
