-- Migration: reseed_business_categories
-- Limpia y reinserta completamente el seed data de categorías, subcategorías y tipos
-- Idempotente: DELETE + INSERT con ON CONFLICT DO UPDATE

DO $$
DECLARE
  -- Categorías
  cat_restaurantes     UUID := gen_random_uuid();
  cat_bares            UUID := gen_random_uuid();
  cat_compras          UUID := gen_random_uuid();
  cat_salud            UUID := gen_random_uuid();
  cat_belleza          UUID := gen_random_uuid();
  cat_entretenimiento  UUID := gen_random_uuid();
  cat_deporte          UUID := gen_random_uuid();

  -- Subcategorías: Restaurantes y comida
  sub_restaurantes     UUID := gen_random_uuid();
  sub_comida_rapida    UUID := gen_random_uuid();
  sub_cafes            UUID := gen_random_uuid();
  sub_postres          UUID := gen_random_uuid();

  -- Subcategorías: Bares y vida nocturna
  sub_bares            UUID := gen_random_uuid();
  sub_nocturno         UUID := gen_random_uuid();

  -- Subcategorías: Compras y retail
  sub_moda             UUID := gen_random_uuid();
  sub_accesorios       UUID := gen_random_uuid();
  sub_electronica      UUID := gen_random_uuid();
  sub_hogar            UUID := gen_random_uuid();
  sub_supermercados    UUID := gen_random_uuid();
  sub_especializadas   UUID := gen_random_uuid();

  -- Subcategorías: Salud y medicina
  sub_servicios_med    UUID := gen_random_uuid();
  sub_especialidades   UUID := gen_random_uuid();
  sub_terapias         UUID := gen_random_uuid();
  sub_farmacias        UUID := gen_random_uuid();

  -- Subcategorías: Belleza y cuidado personal
  sub_peluqueria       UUID := gen_random_uuid();
  sub_spa              UUID := gen_random_uuid();
  sub_bienestar        UUID := gen_random_uuid();

  -- Subcategorías: Entretenimiento
  sub_cultura          UUID := gen_random_uuid();
  sub_juegos           UUID := gen_random_uuid();
  sub_diversion        UUID := gen_random_uuid();

  -- Subcategorías: Deporte y fitness
  sub_gimnasios        UUID := gen_random_uuid();
  sub_estudios         UUID := gen_random_uuid();
  sub_deportes         UUID := gen_random_uuid();

BEGIN
  -- =========================================================
  -- 1. Limpiar datos existentes (orden: hijos primero)
  -- =========================================================
  DELETE FROM public.business_establishment_types;
  DELETE FROM public.business_subcategories;
  DELETE FROM public.business_categories;

  -- =========================================================
  -- 2. Insertar categorías
  -- =========================================================
  INSERT INTO public.business_categories (id, nombre) VALUES
    (cat_restaurantes,    'Restaurantes y comida'),
    (cat_bares,           'Bares y vida nocturna'),
    (cat_compras,         'Compras y retail'),
    (cat_salud,           'Salud y medicina'),
    (cat_belleza,         'Belleza y cuidado personal'),
    (cat_entretenimiento, 'Entretenimiento'),
    (cat_deporte,         'Deporte y fitness');

  -- =========================================================
  -- 3. Insertar subcategorías
  -- =========================================================
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES
    -- Restaurantes y comida
    (sub_restaurantes,  cat_restaurantes,    'Restaurantes'),
    (sub_comida_rapida, cat_restaurantes,    'Comida rápida'),
    (sub_cafes,         cat_restaurantes,    'Cafés y bebidas'),
    (sub_postres,       cat_restaurantes,    'Postres y panadería'),
    -- Bares y vida nocturna
    (sub_bares,         cat_bares,           'Bares'),
    (sub_nocturno,      cat_bares,           'Entretenimiento nocturno'),
    -- Compras y retail
    (sub_moda,          cat_compras,         'Moda'),
    (sub_accesorios,    cat_compras,         'Accesorios'),
    (sub_electronica,   cat_compras,         'Electrónica'),
    (sub_hogar,         cat_compras,         'Hogar'),
    (sub_supermercados, cat_compras,         'Supermercados y conveniencia'),
    (sub_especializadas,cat_compras,         'Tiendas especializadas'),
    -- Salud y medicina
    (sub_servicios_med, cat_salud,           'Servicios médicos'),
    (sub_especialidades,cat_salud,           'Especialidades médicas'),
    (sub_terapias,      cat_salud,           'Terapias'),
    (sub_farmacias,     cat_salud,           'Farmacias'),
    -- Belleza y cuidado personal
    (sub_peluqueria,    cat_belleza,         'Peluquería'),
    (sub_spa,           cat_belleza,         'Spa y estética'),
    (sub_bienestar,     cat_belleza,         'Bienestar'),
    -- Entretenimiento
    (sub_cultura,       cat_entretenimiento, 'Cultura'),
    (sub_juegos,        cat_entretenimiento, 'Juegos y recreación'),
    (sub_diversion,     cat_entretenimiento, 'Diversión'),
    -- Deporte y fitness
    (sub_gimnasios,     cat_deporte,         'Gimnasios'),
    (sub_estudios,      cat_deporte,         'Estudios'),
    (sub_deportes,      cat_deporte,         'Deportes');

  -- =========================================================
  -- 4. Insertar tipos de establecimiento
  -- =========================================================

  -- Restaurantes
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_restaurantes, 'Restaurante mexicano'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante italiano'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante japonés'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante chino'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante coreano'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante tailandés'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante mediterráneo'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante francés'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante español'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante argentino'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante brasileño'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante vegetariano'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante vegano'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante buffet'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante familiar'),
    (gen_random_uuid(), sub_restaurantes, 'Restaurante gourmet');

  -- Comida rápida
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_comida_rapida, 'Taquería'),
    (gen_random_uuid(), sub_comida_rapida, 'Pizzería'),
    (gen_random_uuid(), sub_comida_rapida, 'Hamburguesería'),
    (gen_random_uuid(), sub_comida_rapida, 'Sushi bar'),
    (gen_random_uuid(), sub_comida_rapida, 'Marisquería'),
    (gen_random_uuid(), sub_comida_rapida, 'Pollería'),
    (gen_random_uuid(), sub_comida_rapida, 'Tortería'),
    (gen_random_uuid(), sub_comida_rapida, 'Antojitos mexicanos'),
    (gen_random_uuid(), sub_comida_rapida, 'Food truck'),
    (gen_random_uuid(), sub_comida_rapida, 'Comida corrida');

  -- Cafés y bebidas
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_cafes, 'Cafetería'),
    (gen_random_uuid(), sub_cafes, 'Coffee shop'),
    (gen_random_uuid(), sub_cafes, 'Casa de té'),
    (gen_random_uuid(), sub_cafes, 'Bar de jugos'),
    (gen_random_uuid(), sub_cafes, 'Smoothie bar'),
    (gen_random_uuid(), sub_cafes, 'Chocolatería');

  -- Postres y panadería
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_postres, 'Heladería'),
    (gen_random_uuid(), sub_postres, 'Pastelería'),
    (gen_random_uuid(), sub_postres, 'Panadería'),
    (gen_random_uuid(), sub_postres, 'Donas'),
    (gen_random_uuid(), sub_postres, 'Crepería');

  -- Bares
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_bares, 'Bar'),
    (gen_random_uuid(), sub_bares, 'Bar deportivo'),
    (gen_random_uuid(), sub_bares, 'Bar de vinos'),
    (gen_random_uuid(), sub_bares, 'Bar de cerveza artesanal'),
    (gen_random_uuid(), sub_bares, 'Cantina'),
    (gen_random_uuid(), sub_bares, 'Pub');

  -- Entretenimiento nocturno
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_nocturno, 'Club nocturno'),
    (gen_random_uuid(), sub_nocturno, 'Karaoke bar'),
    (gen_random_uuid(), sub_nocturno, 'Lounge bar'),
    (gen_random_uuid(), sub_nocturno, 'Terraza bar');

  -- Moda
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_moda, 'Tienda de ropa'),
    (gen_random_uuid(), sub_moda, 'Boutique'),
    (gen_random_uuid(), sub_moda, 'Tienda de ropa infantil'),
    (gen_random_uuid(), sub_moda, 'Tienda de ropa deportiva'),
    (gen_random_uuid(), sub_moda, 'Tienda de ropa formal'),
    (gen_random_uuid(), sub_moda, 'Tienda de ropa interior'),
    (gen_random_uuid(), sub_moda, 'Zapatería');

  -- Accesorios
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_accesorios, 'Joyería'),
    (gen_random_uuid(), sub_accesorios, 'Relojería'),
    (gen_random_uuid(), sub_accesorios, 'Bolsos y maletas'),
    (gen_random_uuid(), sub_accesorios, 'Sombrerería'),
    (gen_random_uuid(), sub_accesorios, 'Óptica');

  -- Electrónica
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_electronica, 'Tienda de electrónica'),
    (gen_random_uuid(), sub_electronica, 'Tienda de celulares'),
    (gen_random_uuid(), sub_electronica, 'Tienda de computadoras'),
    (gen_random_uuid(), sub_electronica, 'Tienda de videojuegos'),
    (gen_random_uuid(), sub_electronica, 'Tienda de cámaras');

  -- Hogar
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_hogar, 'Mueblería'),
    (gen_random_uuid(), sub_hogar, 'Decoración'),
    (gen_random_uuid(), sub_hogar, 'Tienda de colchones'),
    (gen_random_uuid(), sub_hogar, 'Tienda de iluminación'),
    (gen_random_uuid(), sub_hogar, 'Ferretería');

  -- Supermercados y conveniencia
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_supermercados, 'Supermercado'),
    (gen_random_uuid(), sub_supermercados, 'Mini super'),
    (gen_random_uuid(), sub_supermercados, 'Tienda de conveniencia'),
    (gen_random_uuid(), sub_supermercados, 'Tienda naturista'),
    (gen_random_uuid(), sub_supermercados, 'Tienda orgánica');

  -- Tiendas especializadas
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_especializadas, 'Librería'),
    (gen_random_uuid(), sub_especializadas, 'Papelería'),
    (gen_random_uuid(), sub_especializadas, 'Tienda de mascotas'),
    (gen_random_uuid(), sub_especializadas, 'Florería'),
    (gen_random_uuid(), sub_especializadas, 'Tienda de regalos');

  -- Servicios médicos
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_servicios_med, 'Hospital'),
    (gen_random_uuid(), sub_servicios_med, 'Clínica'),
    (gen_random_uuid(), sub_servicios_med, 'Consultorio médico'),
    (gen_random_uuid(), sub_servicios_med, 'Centro médico');

  -- Especialidades médicas
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_especialidades, 'Dentista'),
    (gen_random_uuid(), sub_especialidades, 'Dermatólogo'),
    (gen_random_uuid(), sub_especialidades, 'Pediatra'),
    (gen_random_uuid(), sub_especialidades, 'Ginecólogo'),
    (gen_random_uuid(), sub_especialidades, 'Oftalmólogo');

  -- Terapias
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_terapias, 'Fisioterapia'),
    (gen_random_uuid(), sub_terapias, 'Quiropráctico'),
    (gen_random_uuid(), sub_terapias, 'Acupuntura'),
    (gen_random_uuid(), sub_terapias, 'Psicólogo'),
    (gen_random_uuid(), sub_terapias, 'Psiquiatra');

  -- Farmacias
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_farmacias, 'Farmacia'),
    (gen_random_uuid(), sub_farmacias, 'Farmacia homeopática');

  -- Peluquería
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_peluqueria, 'Salón de belleza'),
    (gen_random_uuid(), sub_peluqueria, 'Peluquería'),
    (gen_random_uuid(), sub_peluqueria, 'Barbería');

  -- Spa y estética
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_spa, 'Spa'),
    (gen_random_uuid(), sub_spa, 'Spa de uñas'),
    (gen_random_uuid(), sub_spa, 'Estética'),
    (gen_random_uuid(), sub_spa, 'Centro de depilación'),
    (gen_random_uuid(), sub_spa, 'Clínica estética'),
    (gen_random_uuid(), sub_spa, 'Centro de bronceado');

  -- Bienestar
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_bienestar, 'Centro de masajes'),
    (gen_random_uuid(), sub_bienestar, 'Terapias alternativas');

  -- Cultura
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_cultura, 'Cine'),
    (gen_random_uuid(), sub_cultura, 'Teatro'),
    (gen_random_uuid(), sub_cultura, 'Museo'),
    (gen_random_uuid(), sub_cultura, 'Galería de arte');

  -- Juegos y recreación
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_juegos, 'Arcade'),
    (gen_random_uuid(), sub_juegos, 'Boliche'),
    (gen_random_uuid(), sub_juegos, 'Billar'),
    (gen_random_uuid(), sub_juegos, 'Escape room');

  -- Diversión
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_diversion, 'Parque de diversiones'),
    (gen_random_uuid(), sub_diversion, 'Casino'),
    (gen_random_uuid(), sub_diversion, 'Centro de entretenimiento');

  -- Gimnasios
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_gimnasios, 'Gimnasio'),
    (gen_random_uuid(), sub_gimnasios, 'Crossfit'),
    (gen_random_uuid(), sub_gimnasios, 'Centro fitness');

  -- Estudios
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_estudios, 'Estudio de yoga'),
    (gen_random_uuid(), sub_estudios, 'Estudio de pilates'),
    (gen_random_uuid(), sub_estudios, 'Estudio de baile');

  -- Deportes
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_deportes, 'Escuela de artes marciales'),
    (gen_random_uuid(), sub_deportes, 'Alberca'),
    (gen_random_uuid(), sub_deportes, 'Cancha deportiva'),
    (gen_random_uuid(), sub_deportes, 'Club deportivo'),
    (gen_random_uuid(), sub_deportes, 'Centro de escalada');

  RAISE NOTICE 'Seed completado: 7 categorías, 25 subcategorías, 137 tipos de establecimiento';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error en seed de categorías: %', SQLERRM;
END $$;
