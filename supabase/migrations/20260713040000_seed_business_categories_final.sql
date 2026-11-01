-- Migration: seed_business_categories_final
-- Pobla las tablas de categorías, subcategorías y tipos de establecimiento
-- Idempotente: usa ON CONFLICT DO NOTHING en categorías y verifica existencia antes de insertar

-- Asegurar que las políticas RLS permitan lectura pública (por si acaso)
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

-- Seed data idempotente
DO $$
DECLARE
  -- IDs de categorías
  cat_restaurantes     UUID;
  cat_bares            UUID;
  cat_compras          UUID;
  cat_salud            UUID;
  cat_belleza          UUID;
  cat_entretenimiento  UUID;
  cat_deporte          UUID;
  cat_automotriz       UUID;
  cat_profesionales    UUID;
  cat_turismo          UUID;
  cat_educacion        UUID;
  cat_mascotas         UUID;
  cat_generales        UUID;

  sub_id UUID;
BEGIN

  -- =========================================================
  -- 1. Insertar categorías (ON CONFLICT DO NOTHING por nombre único)
  -- =========================================================
  INSERT INTO public.business_categories (nombre) VALUES
    ('Restaurantes y comida'),
    ('Bares y vida nocturna'),
    ('Compras y retail'),
    ('Salud y medicina'),
    ('Belleza y cuidado personal'),
    ('Entretenimiento'),
    ('Deporte y fitness'),
    ('Servicios automotrices'),
    ('Servicios profesionales'),
    ('Turismo y hospedaje'),
    ('Educación'),
    ('Mascotas'),
    ('Servicios generales')
  ON CONFLICT (nombre) DO NOTHING;

  -- Obtener IDs de categorías
  SELECT id INTO cat_restaurantes    FROM public.business_categories WHERE nombre = 'Restaurantes y comida' LIMIT 1;
  SELECT id INTO cat_bares           FROM public.business_categories WHERE nombre = 'Bares y vida nocturna' LIMIT 1;
  SELECT id INTO cat_compras         FROM public.business_categories WHERE nombre = 'Compras y retail' LIMIT 1;
  SELECT id INTO cat_salud           FROM public.business_categories WHERE nombre = 'Salud y medicina' LIMIT 1;
  SELECT id INTO cat_belleza         FROM public.business_categories WHERE nombre = 'Belleza y cuidado personal' LIMIT 1;
  SELECT id INTO cat_entretenimiento FROM public.business_categories WHERE nombre = 'Entretenimiento' LIMIT 1;
  SELECT id INTO cat_deporte         FROM public.business_categories WHERE nombre = 'Deporte y fitness' LIMIT 1;
  SELECT id INTO cat_automotriz      FROM public.business_categories WHERE nombre = 'Servicios automotrices' LIMIT 1;
  SELECT id INTO cat_profesionales   FROM public.business_categories WHERE nombre = 'Servicios profesionales' LIMIT 1;
  SELECT id INTO cat_turismo         FROM public.business_categories WHERE nombre = 'Turismo y hospedaje' LIMIT 1;
  SELECT id INTO cat_educacion       FROM public.business_categories WHERE nombre = 'Educación' LIMIT 1;
  SELECT id INTO cat_mascotas        FROM public.business_categories WHERE nombre = 'Mascotas' LIMIT 1;
  SELECT id INTO cat_generales       FROM public.business_categories WHERE nombre = 'Servicios generales' LIMIT 1;

  -- =========================================================
  -- 2. Insertar subcategorías (solo si no existen para esa categoría)
  -- =========================================================

  -- Restaurantes y comida
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Restaurantes') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_restaurantes, 'Restaurantes');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Comida rápida') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_restaurantes, 'Comida rápida');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Cafés y bebidas') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_restaurantes, 'Cafés y bebidas');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Postres y panadería') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_restaurantes, 'Postres y panadería');
  END IF;

  -- Bares y vida nocturna
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_bares AND nombre = 'Bares') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_bares, 'Bares');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_bares AND nombre = 'Entretenimiento nocturno') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_bares, 'Entretenimiento nocturno');
  END IF;

  -- Compras y retail
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Moda') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_compras, 'Moda');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Accesorios') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_compras, 'Accesorios');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Electrónica') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_compras, 'Electrónica');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Hogar') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_compras, 'Hogar');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Supermercados y conveniencia') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_compras, 'Supermercados y conveniencia');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Tiendas especializadas') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_compras, 'Tiendas especializadas');
  END IF;

  -- Salud y medicina
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Servicios médicos') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_salud, 'Servicios médicos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Especialidades médicas') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_salud, 'Especialidades médicas');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Terapias') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_salud, 'Terapias');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Farmacias') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_salud, 'Farmacias');
  END IF;

  -- Belleza y cuidado personal
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_belleza AND nombre = 'Peluquería') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_belleza, 'Peluquería');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_belleza AND nombre = 'Spa y estética') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_belleza, 'Spa y estética');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_belleza AND nombre = 'Bienestar') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_belleza, 'Bienestar');
  END IF;

  -- Entretenimiento
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_entretenimiento AND nombre = 'Cultura') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_entretenimiento, 'Cultura');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_entretenimiento AND nombre = 'Juegos y recreación') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_entretenimiento, 'Juegos y recreación');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_entretenimiento AND nombre = 'Diversión') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_entretenimiento, 'Diversión');
  END IF;

  -- Deporte y fitness
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_deporte AND nombre = 'Gimnasios') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_deporte, 'Gimnasios');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_deporte AND nombre = 'Estudios') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_deporte, 'Estudios');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_deporte AND nombre = 'Deportes') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_deporte, 'Deportes');
  END IF;

  -- Servicios automotrices
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Mantenimiento') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_automotriz, 'Mantenimiento');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Venta de vehículos') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_automotriz, 'Venta de vehículos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Accesorios automotrices') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_automotriz, 'Accesorios automotrices');
  END IF;

  -- Servicios profesionales
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Servicios legales') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_profesionales, 'Servicios legales');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Servicios financieros') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_profesionales, 'Servicios financieros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Consultoría') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_profesionales, 'Consultoría');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Tecnología') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_profesionales, 'Tecnología');
  END IF;

  -- Turismo y hospedaje
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_turismo AND nombre = 'Hospedaje') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_turismo, 'Hospedaje');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_turismo AND nombre = 'Agencias de viaje') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_turismo, 'Agencias de viaje');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_turismo AND nombre = 'Actividades turísticas') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_turismo, 'Actividades turísticas');
  END IF;

  -- Educación
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_educacion AND nombre = 'Escuelas y colegios') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_educacion, 'Escuelas y colegios');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_educacion AND nombre = 'Cursos y talleres') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_educacion, 'Cursos y talleres');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_educacion AND nombre = 'Idiomas') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_educacion, 'Idiomas');
  END IF;

  -- Mascotas
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_mascotas AND nombre = 'Veterinaria') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_mascotas, 'Veterinaria');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_mascotas AND nombre = 'Estética y cuidado') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_mascotas, 'Estética y cuidado');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_mascotas AND nombre = 'Tiendas de mascotas') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_mascotas, 'Tiendas de mascotas');
  END IF;

  -- Servicios generales
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_generales AND nombre = 'Limpieza') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_generales, 'Limpieza');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_generales AND nombre = 'Reparaciones') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_generales, 'Reparaciones');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.business_subcategories WHERE categoria_id = cat_generales AND nombre = 'Mensajería y paquetería') THEN
    INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES (cat_generales, 'Mensajería y paquetería');
  END IF;

  -- =========================================================
  -- 3. Insertar tipos de establecimiento (solo si no existen)
  -- =========================================================

  -- Restaurantes
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Restaurantes' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Restaurante mexicano'), (sub_id, 'Restaurante italiano'), (sub_id, 'Restaurante japonés'),
      (sub_id, 'Restaurante chino'), (sub_id, 'Restaurante coreano'), (sub_id, 'Restaurante tailandés'),
      (sub_id, 'Restaurante mediterráneo'), (sub_id, 'Restaurante francés'), (sub_id, 'Restaurante español'),
      (sub_id, 'Restaurante argentino'), (sub_id, 'Restaurante brasileño'), (sub_id, 'Restaurante vegetariano'),
      (sub_id, 'Restaurante vegano'), (sub_id, 'Restaurante buffet'), (sub_id, 'Restaurante familiar'),
      (sub_id, 'Restaurante gourmet');
  END IF;

  -- Comida rápida
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Comida rápida' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Taquería'), (sub_id, 'Pizzería'), (sub_id, 'Hamburguesería'), (sub_id, 'Sushi bar'),
      (sub_id, 'Marisquería'), (sub_id, 'Pollería'), (sub_id, 'Tortería'), (sub_id, 'Antojitos mexicanos'),
      (sub_id, 'Food truck'), (sub_id, 'Comida corrida');
  END IF;

  -- Cafés y bebidas
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Cafés y bebidas' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Cafetería'), (sub_id, 'Coffee shop'), (sub_id, 'Casa de té'),
      (sub_id, 'Bar de jugos'), (sub_id, 'Smoothie bar'), (sub_id, 'Chocolatería');
  END IF;

  -- Postres y panadería
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_restaurantes AND nombre = 'Postres y panadería' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Heladería'), (sub_id, 'Pastelería'), (sub_id, 'Panadería'), (sub_id, 'Donas'), (sub_id, 'Crepería');
  END IF;

  -- Bares
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_bares AND nombre = 'Bares' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Bar'), (sub_id, 'Bar deportivo'), (sub_id, 'Bar de vinos'),
      (sub_id, 'Bar de cerveza artesanal'), (sub_id, 'Cantina'), (sub_id, 'Pub');
  END IF;

  -- Entretenimiento nocturno
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_bares AND nombre = 'Entretenimiento nocturno' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Club nocturno'), (sub_id, 'Karaoke bar'), (sub_id, 'Lounge bar'), (sub_id, 'Terraza bar');
  END IF;

  -- Moda
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Moda' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Tienda de ropa'), (sub_id, 'Boutique'), (sub_id, 'Tienda de ropa infantil'),
      (sub_id, 'Tienda de ropa deportiva'), (sub_id, 'Tienda de ropa formal'),
      (sub_id, 'Tienda de ropa interior'), (sub_id, 'Zapatería');
  END IF;

  -- Accesorios
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Accesorios' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Joyería'), (sub_id, 'Relojería'), (sub_id, 'Bolsos y maletas'), (sub_id, 'Sombrerería'), (sub_id, 'Óptica');
  END IF;

  -- Electrónica
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Electrónica' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Tienda de electrónica'), (sub_id, 'Tienda de celulares'), (sub_id, 'Tienda de computadoras'),
      (sub_id, 'Tienda de videojuegos'), (sub_id, 'Tienda de cámaras');
  END IF;

  -- Hogar
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Hogar' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Mueblería'), (sub_id, 'Decoración'), (sub_id, 'Tienda de colchones'),
      (sub_id, 'Tienda de iluminación'), (sub_id, 'Ferretería');
  END IF;

  -- Supermercados y conveniencia
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Supermercados y conveniencia' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Supermercado'), (sub_id, 'Mini super'), (sub_id, 'Tienda de conveniencia'),
      (sub_id, 'Tienda naturista'), (sub_id, 'Tienda orgánica');
  END IF;

  -- Tiendas especializadas
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_compras AND nombre = 'Tiendas especializadas' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Librería'), (sub_id, 'Papelería'), (sub_id, 'Tienda de mascotas'),
      (sub_id, 'Florería'), (sub_id, 'Tienda de regalos');
  END IF;

  -- Servicios médicos
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Servicios médicos' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Hospital'), (sub_id, 'Clínica'), (sub_id, 'Consultorio médico'), (sub_id, 'Centro médico');
  END IF;

  -- Especialidades médicas
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Especialidades médicas' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Dentista'), (sub_id, 'Dermatólogo'), (sub_id, 'Pediatra'), (sub_id, 'Ginecólogo'), (sub_id, 'Oftalmólogo');
  END IF;

  -- Terapias
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Terapias' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Fisioterapia'), (sub_id, 'Quiropráctico'), (sub_id, 'Acupuntura'),
      (sub_id, 'Psicólogo'), (sub_id, 'Psiquiatra');
  END IF;

  -- Farmacias
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_salud AND nombre = 'Farmacias' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Farmacia'), (sub_id, 'Farmacia homeopática');
  END IF;

  -- Peluquería
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_belleza AND nombre = 'Peluquería' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Salón de belleza'), (sub_id, 'Peluquería'), (sub_id, 'Barbería');
  END IF;

  -- Spa y estética
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_belleza AND nombre = 'Spa y estética' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Spa'), (sub_id, 'Spa de uñas'), (sub_id, 'Estética'),
      (sub_id, 'Centro de depilación'), (sub_id, 'Clínica estética'), (sub_id, 'Centro de bronceado');
  END IF;

  -- Bienestar
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_belleza AND nombre = 'Bienestar' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Centro de masajes'), (sub_id, 'Terapias alternativas'), (sub_id, 'Meditación y mindfulness');
  END IF;

  -- Cultura
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_entretenimiento AND nombre = 'Cultura' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Cine'), (sub_id, 'Teatro'), (sub_id, 'Museo'), (sub_id, 'Galería de arte');
  END IF;

  -- Juegos y recreación
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_entretenimiento AND nombre = 'Juegos y recreación' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Arcade'), (sub_id, 'Boliche'), (sub_id, 'Billar'), (sub_id, 'Escape room');
  END IF;

  -- Diversión
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_entretenimiento AND nombre = 'Diversión' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Parque de diversiones'), (sub_id, 'Casino'), (sub_id, 'Centro de entretenimiento');
  END IF;

  -- Gimnasios
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_deporte AND nombre = 'Gimnasios' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Gimnasio'), (sub_id, 'Crossfit'), (sub_id, 'Centro fitness');
  END IF;

  -- Estudios
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_deporte AND nombre = 'Estudios' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Estudio de yoga'), (sub_id, 'Estudio de pilates'), (sub_id, 'Estudio de baile');
  END IF;

  -- Deportes
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_deporte AND nombre = 'Deportes' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Escuela de artes marciales'), (sub_id, 'Alberca'), (sub_id, 'Cancha deportiva'),
      (sub_id, 'Club deportivo'), (sub_id, 'Centro de escalada');
  END IF;

  -- Mantenimiento automotriz
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Mantenimiento' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Taller mecánico'), (sub_id, 'Servicio automotriz'), (sub_id, 'Autolavado'),
      (sub_id, 'Llantera'), (sub_id, 'Alineación y balanceo'), (sub_id, 'Cambio de aceite'),
      (sub_id, 'Hojalatería y pintura'), (sub_id, 'Vulcanizadora');
  END IF;

  -- Venta de vehículos
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Venta de vehículos' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Agencia de autos'), (sub_id, 'Agencia de motos'), (sub_id, 'Autos seminuevos');
  END IF;

  -- Accesorios automotrices
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_automotriz AND nombre = 'Accesorios automotrices' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Tienda de accesorios'), (sub_id, 'Refaccionaria'), (sub_id, 'Taller de audio y alarmas');
  END IF;

  -- Servicios legales
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Servicios legales' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Despacho de abogados'), (sub_id, 'Notaría'), (sub_id, 'Gestoría');
  END IF;

  -- Servicios financieros
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Servicios financieros' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Despacho contable'), (sub_id, 'Asesoría financiera'), (sub_id, 'Seguros');
  END IF;

  -- Consultoría
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Consultoría' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Consultoría empresarial'), (sub_id, 'Consultoría de marketing'), (sub_id, 'Consultoría de RH');
  END IF;

  -- Tecnología
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_profesionales AND nombre = 'Tecnología' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Desarrollo de software'), (sub_id, 'Soporte técnico'), (sub_id, 'Diseño web'), (sub_id, 'Agencia digital');
  END IF;

  -- Hospedaje
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_turismo AND nombre = 'Hospedaje' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Hotel'), (sub_id, 'Hostal'), (sub_id, 'Motel'), (sub_id, 'Airbnb / Renta vacacional'), (sub_id, 'Glamping');
  END IF;

  -- Agencias de viaje
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_turismo AND nombre = 'Agencias de viaje' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Agencia de viajes'), (sub_id, 'Tour operadora');
  END IF;

  -- Actividades turísticas
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_turismo AND nombre = 'Actividades turísticas' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Tours y excursiones'), (sub_id, 'Aventura y ecoturismo'), (sub_id, 'Parque temático');
  END IF;

  -- Escuelas y colegios
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_educacion AND nombre = 'Escuelas y colegios' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Guardería'), (sub_id, 'Preescolar'), (sub_id, 'Primaria'), (sub_id, 'Secundaria'), (sub_id, 'Preparatoria'), (sub_id, 'Universidad');
  END IF;

  -- Cursos y talleres
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_educacion AND nombre = 'Cursos y talleres' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Centro de capacitación'), (sub_id, 'Taller artístico'), (sub_id, 'Clases particulares');
  END IF;

  -- Idiomas
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_educacion AND nombre = 'Idiomas' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Centro de idiomas'), (sub_id, 'Instituto de inglés'), (sub_id, 'Clases de idiomas online');
  END IF;

  -- Veterinaria
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_mascotas AND nombre = 'Veterinaria' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Veterinaria'), (sub_id, 'Clínica veterinaria'), (sub_id, 'Hospital veterinario');
  END IF;

  -- Estética y cuidado mascotas
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_mascotas AND nombre = 'Estética y cuidado' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Estética canina'), (sub_id, 'Guardería de mascotas'), (sub_id, 'Hotel para mascotas');
  END IF;

  -- Tiendas de mascotas
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_mascotas AND nombre = 'Tiendas de mascotas' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Pet shop'), (sub_id, 'Tienda de alimentos para mascotas');
  END IF;

  -- Limpieza
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_generales AND nombre = 'Limpieza' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Lavandería'), (sub_id, 'Tintorería'), (sub_id, 'Limpieza de hogares'), (sub_id, 'Limpieza de oficinas');
  END IF;

  -- Reparaciones
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_generales AND nombre = 'Reparaciones' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Reparación de electrodomésticos'), (sub_id, 'Plomería'), (sub_id, 'Electricista'),
      (sub_id, 'Carpintería'), (sub_id, 'Cerrajería');
  END IF;

  -- Mensajería y paquetería
  SELECT id INTO sub_id FROM public.business_subcategories WHERE categoria_id = cat_generales AND nombre = 'Mensajería y paquetería' LIMIT 1;
  IF sub_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.business_establishment_types WHERE subcategoria_id = sub_id LIMIT 1) THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Paquetería'), (sub_id, 'Mensajería local'), (sub_id, 'Envíos internacionales');
  END IF;

  RAISE NOTICE 'Seed de categorías, subcategorías y tipos completado exitosamente.';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error en seed de categorías: %', SQLERRM;
END $$;
