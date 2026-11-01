-- Migration: add_6_new_categories
-- Agrega 6 categorías adicionales con sus subcategorías y tipos
-- NO elimina las 7 categorías existentes — solo INSERT de lo nuevo
-- Idempotente: usa ON CONFLICT DO NOTHING

DO $$
DECLARE
  -- Nuevas categorías
  cat_automotriz       UUID := gen_random_uuid();
  cat_profesionales    UUID := gen_random_uuid();
  cat_educacion        UUID := gen_random_uuid();
  cat_turismo          UUID := gen_random_uuid();
  cat_mascotas         UUID := gen_random_uuid();
  cat_generales        UUID := gen_random_uuid();

  -- Subcategorías: Servicios automotrices
  sub_mant             UUID := gen_random_uuid();
  sub_venta_auto       UUID := gen_random_uuid();
  sub_energia          UUID := gen_random_uuid();
  sub_esp_auto         UUID := gen_random_uuid();

  -- Subcategorías: Servicios profesionales
  sub_legal            UUID := gen_random_uuid();
  sub_finanzas         UUID := gen_random_uuid();
  sub_negocios         UUID := gen_random_uuid();

  -- Subcategorías: Educación
  sub_escuelas         UUID := gen_random_uuid();
  sub_academias        UUID := gen_random_uuid();
  sub_capacitacion     UUID := gen_random_uuid();
  sub_esp_edu          UUID := gen_random_uuid();

  -- Subcategorías: Turismo y hospedaje
  sub_hospedaje        UUID := gen_random_uuid();
  sub_turismo          UUID := gen_random_uuid();
  sub_transp_tur       UUID := gen_random_uuid();
  sub_experiencias     UUID := gen_random_uuid();

  -- Subcategorías: Mascotas
  sub_salud_masc       UUID := gen_random_uuid();
  sub_serv_masc        UUID := gen_random_uuid();
  sub_tiendas_masc     UUID := gen_random_uuid();
  sub_esp_masc         UUID := gen_random_uuid();

  -- Subcategorías: Servicios generales
  sub_limpieza         UUID := gen_random_uuid();
  sub_reparaciones     UUID := gen_random_uuid();

BEGIN
  -- =========================================================
  -- 1. Insertar nuevas categorías
  -- =========================================================
  INSERT INTO public.business_categories (id, nombre) VALUES
    (cat_automotriz,    'Servicios automotrices'),
    (cat_profesionales, 'Servicios profesionales'),
    (cat_educacion,     'Educación'),
    (cat_turismo,       'Turismo y hospedaje'),
    (cat_mascotas,      'Mascotas'),
    (cat_generales,     'Servicios generales')
  ON CONFLICT DO NOTHING;

  -- =========================================================
  -- 2. Insertar subcategorías
  -- =========================================================
  INSERT INTO public.business_subcategories (id, categoria_id, nombre) VALUES
    -- Servicios automotrices
    (sub_mant,         cat_automotriz,    'Mantenimiento'),
    (sub_venta_auto,   cat_automotriz,    'Venta'),
    (sub_energia,      cat_automotriz,    'Energía'),
    (sub_esp_auto,     cat_automotriz,    'Especializados'),
    -- Servicios profesionales
    (sub_legal,        cat_profesionales, 'Legal'),
    (sub_finanzas,     cat_profesionales, 'Finanzas'),
    (sub_negocios,     cat_profesionales, 'Negocios'),
    -- Educación
    (sub_escuelas,     cat_educacion,     'Escuelas'),
    (sub_academias,    cat_educacion,     'Academias'),
    (sub_capacitacion, cat_educacion,     'Capacitación'),
    (sub_esp_edu,      cat_educacion,     'Especializada'),
    -- Turismo y hospedaje
    (sub_hospedaje,    cat_turismo,       'Hospedaje'),
    (sub_turismo,      cat_turismo,       'Turismo'),
    (sub_transp_tur,   cat_turismo,       'Transporte turístico'),
    (sub_experiencias, cat_turismo,       'Experiencias'),
    -- Mascotas
    (sub_salud_masc,   cat_mascotas,      'Salud'),
    (sub_serv_masc,    cat_mascotas,      'Servicios'),
    (sub_tiendas_masc, cat_mascotas,      'Tiendas'),
    (sub_esp_masc,     cat_mascotas,      'Especializados'),
    -- Servicios generales
    (sub_limpieza,     cat_generales,     'Limpieza'),
    (sub_reparaciones, cat_generales,     'Reparaciones')
  ON CONFLICT DO NOTHING;

  -- =========================================================
  -- 3. Insertar tipos de establecimiento
  -- =========================================================

  -- Mantenimiento automotriz
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_mant, 'Taller mecánico'),
    (gen_random_uuid(), sub_mant, 'Servicio automotriz'),
    (gen_random_uuid(), sub_mant, 'Autolavado'),
    (gen_random_uuid(), sub_mant, 'Llantera'),
    (gen_random_uuid(), sub_mant, 'Alineación y balanceo'),
    (gen_random_uuid(), sub_mant, 'Cambio de aceite'),
    (gen_random_uuid(), sub_mant, 'Hojalatería y pintura'),
    (gen_random_uuid(), sub_mant, 'Electromecánico automotriz'),
    (gen_random_uuid(), sub_mant, 'Vulcanizadora')
  ON CONFLICT DO NOTHING;

  -- Venta automotriz
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_venta_auto, 'Agencia de autos'),
    (gen_random_uuid(), sub_venta_auto, 'Venta de autos usados'),
    (gen_random_uuid(), sub_venta_auto, 'Refaccionaria'),
    (gen_random_uuid(), sub_venta_auto, 'Accesorios automotrices'),
    (gen_random_uuid(), sub_venta_auto, 'Venta de motocicletas'),
    (gen_random_uuid(), sub_venta_auto, 'Refacciones para motocicleta')
  ON CONFLICT DO NOTHING;

  -- Energía automotriz
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_energia, 'Gasolinera'),
    (gen_random_uuid(), sub_energia, 'Estación de carga eléctrica'),
    (gen_random_uuid(), sub_energia, 'Gasera')
  ON CONFLICT DO NOTHING;

  -- Especializados automotriz
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_esp_auto, 'Servicio de grúas'),
    (gen_random_uuid(), sub_esp_auto, 'Polarizado automotriz'),
    (gen_random_uuid(), sub_esp_auto, 'Instalación de alarmas'),
    (gen_random_uuid(), sub_esp_auto, 'Estéreo automotriz'),
    (gen_random_uuid(), sub_esp_auto, 'Verificación vehicular')
  ON CONFLICT DO NOTHING;

  -- Legal
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_legal, 'Abogado'),
    (gen_random_uuid(), sub_legal, 'Notaría'),
    (gen_random_uuid(), sub_legal, 'Despacho jurídico'),
    (gen_random_uuid(), sub_legal, 'Mediación legal')
  ON CONFLICT DO NOTHING;

  -- Finanzas
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_finanzas, 'Contador'),
    (gen_random_uuid(), sub_finanzas, 'Asesor fiscal'),
    (gen_random_uuid(), sub_finanzas, 'Despacho contable'),
    (gen_random_uuid(), sub_finanzas, 'Auditor'),
    (gen_random_uuid(), sub_finanzas, 'Agencia de seguros'),
    (gen_random_uuid(), sub_finanzas, 'Asesor financiero')
  ON CONFLICT DO NOTHING;

  -- Negocios
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_negocios, 'Consultoría empresarial'),
    (gen_random_uuid(), sub_negocios, 'Agencia de marketing'),
    (gen_random_uuid(), sub_negocios, 'Agencia de publicidad'),
    (gen_random_uuid(), sub_negocios, 'Agencia inmobiliaria'),
    (gen_random_uuid(), sub_negocios, 'Consultor de recursos humanos'),
    (gen_random_uuid(), sub_negocios, 'Consultor de tecnología'),
    (gen_random_uuid(), sub_negocios, 'Coworking')
  ON CONFLICT DO NOTHING;

  -- Escuelas
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_escuelas, 'Preescolar'),
    (gen_random_uuid(), sub_escuelas, 'Escuela primaria'),
    (gen_random_uuid(), sub_escuelas, 'Escuela secundaria'),
    (gen_random_uuid(), sub_escuelas, 'Preparatoria'),
    (gen_random_uuid(), sub_escuelas, 'Universidad'),
    (gen_random_uuid(), sub_escuelas, 'Colegio privado')
  ON CONFLICT DO NOTHING;

  -- Academias
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_academias, 'Academia de idiomas'),
    (gen_random_uuid(), sub_academias, 'Escuela de música'),
    (gen_random_uuid(), sub_academias, 'Escuela de arte'),
    (gen_random_uuid(), sub_academias, 'Academia de danza'),
    (gen_random_uuid(), sub_academias, 'Academia de computación'),
    (gen_random_uuid(), sub_academias, 'Academia de regularización')
  ON CONFLICT DO NOTHING;

  -- Capacitación
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_capacitacion, 'Centro de capacitación'),
    (gen_random_uuid(), sub_capacitacion, 'Cursos profesionales'),
    (gen_random_uuid(), sub_capacitacion, 'Capacitación empresarial'),
    (gen_random_uuid(), sub_capacitacion, 'Centro de certificación'),
    (gen_random_uuid(), sub_capacitacion, 'Escuela técnica')
  ON CONFLICT DO NOTHING;

  -- Educación especializada
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_esp_edu, 'Guardería'),
    (gen_random_uuid(), sub_esp_edu, 'Centro de estimulación temprana'),
    (gen_random_uuid(), sub_esp_edu, 'Educación especial'),
    (gen_random_uuid(), sub_esp_edu, 'Biblioteca'),
    (gen_random_uuid(), sub_esp_edu, 'Centro de investigación')
  ON CONFLICT DO NOTHING;

  -- Hospedaje
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_hospedaje, 'Hotel'),
    (gen_random_uuid(), sub_hospedaje, 'Motel'),
    (gen_random_uuid(), sub_hospedaje, 'Hostal'),
    (gen_random_uuid(), sub_hospedaje, 'Resort'),
    (gen_random_uuid(), sub_hospedaje, 'Renta vacacional'),
    (gen_random_uuid(), sub_hospedaje, 'Bed and breakfast'),
    (gen_random_uuid(), sub_hospedaje, 'Posada')
  ON CONFLICT DO NOTHING;

  -- Turismo
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_turismo, 'Agencia de viajes'),
    (gen_random_uuid(), sub_turismo, 'Tour operador'),
    (gen_random_uuid(), sub_turismo, 'Guía turístico'),
    (gen_random_uuid(), sub_turismo, 'Tours de aventura'),
    (gen_random_uuid(), sub_turismo, 'Tours culturales'),
    (gen_random_uuid(), sub_turismo, 'Tours en barco')
  ON CONFLICT DO NOTHING;

  -- Transporte turístico
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_transp_tur, 'Renta de autos'),
    (gen_random_uuid(), sub_transp_tur, 'Transporte turístico'),
    (gen_random_uuid(), sub_transp_tur, 'Renta de bicicletas'),
    (gen_random_uuid(), sub_transp_tur, 'Renta de scooters'),
    (gen_random_uuid(), sub_transp_tur, 'Servicio de traslado al aeropuerto')
  ON CONFLICT DO NOTHING;

  -- Experiencias
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_experiencias, 'Parque ecoturístico'),
    (gen_random_uuid(), sub_experiencias, 'Centro recreativo'),
    (gen_random_uuid(), sub_experiencias, 'Mirador turístico'),
    (gen_random_uuid(), sub_experiencias, 'Atracción turística'),
    (gen_random_uuid(), sub_experiencias, 'Centro de actividades acuáticas')
  ON CONFLICT DO NOTHING;

  -- Salud mascotas
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_salud_masc, 'Veterinaria'),
    (gen_random_uuid(), sub_salud_masc, 'Hospital veterinario'),
    (gen_random_uuid(), sub_salud_masc, 'Clínica veterinaria'),
    (gen_random_uuid(), sub_salud_masc, 'Farmacia veterinaria')
  ON CONFLICT DO NOTHING;

  -- Servicios mascotas
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_serv_masc, 'Guardería para mascotas'),
    (gen_random_uuid(), sub_serv_masc, 'Peluquería canina'),
    (gen_random_uuid(), sub_serv_masc, 'Paseador de perros'),
    (gen_random_uuid(), sub_serv_masc, 'Entrenamiento canino'),
    (gen_random_uuid(), sub_serv_masc, 'Hotel para mascotas'),
    (gen_random_uuid(), sub_serv_masc, 'Adiestramiento')
  ON CONFLICT DO NOTHING;

  -- Tiendas mascotas
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_tiendas_masc, 'Tienda de mascotas'),
    (gen_random_uuid(), sub_tiendas_masc, 'Boutique para mascotas'),
    (gen_random_uuid(), sub_tiendas_masc, 'Alimentos para mascotas'),
    (gen_random_uuid(), sub_tiendas_masc, 'Accesorios para mascotas')
  ON CONFLICT DO NOTHING;

  -- Especializados mascotas
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_esp_masc, 'Estética felina'),
    (gen_random_uuid(), sub_esp_masc, 'Rescate animal'),
    (gen_random_uuid(), sub_esp_masc, 'Adopción de mascotas'),
    (gen_random_uuid(), sub_esp_masc, 'Criadero')
  ON CONFLICT DO NOTHING;

  -- Limpieza
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_limpieza, 'Lavandería'),
    (gen_random_uuid(), sub_limpieza, 'Tintorería'),
    (gen_random_uuid(), sub_limpieza, 'Servicio de limpieza'),
    (gen_random_uuid(), sub_limpieza, 'Limpieza de alfombras'),
    (gen_random_uuid(), sub_limpieza, 'Limpieza industrial')
  ON CONFLICT DO NOTHING;

  -- Reparaciones
  INSERT INTO public.business_establishment_types (id, subcategoria_id, nombre) VALUES
    (gen_random_uuid(), sub_reparaciones, 'Cerrajería'),
    (gen_random_uuid(), sub_reparaciones, 'Reparación de celulares'),
    (gen_random_uuid(), sub_reparaciones, 'Reparación de electrodomésticos'),
    (gen_random_uuid(), sub_reparaciones, 'Reparación de computadoras'),
    (gen_random_uuid(), sub_reparaciones, 'Reparación de televisores'),
    (gen_random_uuid(), sub_reparaciones, 'Servicio técnico')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed completado: 6 nuevas categorías, 21 subcategorías, 103 tipos de establecimiento agregados';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error al agregar nuevas categorías: %', SQLERRM;
END $$;
