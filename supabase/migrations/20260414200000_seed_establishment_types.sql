-- Seed business_establishment_types
-- This migration seeds establishment types linked to existing subcategories.
-- It is idempotent: skips if data already exists.

DO $$
DECLARE
  sub_id UUID;
BEGIN
  -- Skip if already seeded
  IF EXISTS (SELECT 1 FROM public.business_establishment_types LIMIT 1) THEN
    RAISE NOTICE 'business_establishment_types already seeded, skipping.';
    RETURN;
  END IF;

  -- ── Restaurantes y comida ──────────────────────────────────────────────────

  -- Restaurantes
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Restaurantes' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Restaurante mexicano'), (sub_id, 'Restaurante italiano'), (sub_id, 'Restaurante japonés'),
      (sub_id, 'Restaurante chino'), (sub_id, 'Restaurante coreano'), (sub_id, 'Restaurante tailandés'),
      (sub_id, 'Restaurante mediterráneo'), (sub_id, 'Restaurante francés'), (sub_id, 'Restaurante español'),
      (sub_id, 'Restaurante argentino'), (sub_id, 'Restaurante brasileño'), (sub_id, 'Restaurante vegetariano'),
      (sub_id, 'Restaurante vegano'), (sub_id, 'Restaurante buffet'), (sub_id, 'Restaurante familiar'),
      (sub_id, 'Restaurante gourmet');
  END IF;

  -- Comida rápida
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Comida rápida' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Taquería'), (sub_id, 'Pizzería'), (sub_id, 'Hamburguesería'), (sub_id, 'Sushi bar'),
      (sub_id, 'Marisquería'), (sub_id, 'Pollería'), (sub_id, 'Tortería'), (sub_id, 'Antojitos mexicanos'),
      (sub_id, 'Food truck'), (sub_id, 'Comida corrida');
  END IF;

  -- Cafés y bebidas
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Cafés y bebidas' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Cafetería'), (sub_id, 'Coffee shop'), (sub_id, 'Casa de té'),
      (sub_id, 'Bar de jugos'), (sub_id, 'Smoothie bar'), (sub_id, 'Chocolatería');
  END IF;

  -- Postres y panadería
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Postres y panadería' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Heladería'), (sub_id, 'Pastelería'), (sub_id, 'Panadería'), (sub_id, 'Donas'), (sub_id, 'Crepería');
  END IF;

  -- ── Bares y vida nocturna ──────────────────────────────────────────────────

  -- Bares
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Bares' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Bar'), (sub_id, 'Bar deportivo'), (sub_id, 'Bar de vinos'),
      (sub_id, 'Bar de cerveza artesanal'), (sub_id, 'Cantina'), (sub_id, 'Pub');
  END IF;

  -- Entretenimiento nocturno
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Entretenimiento nocturno' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Club nocturno'), (sub_id, 'Karaoke bar'), (sub_id, 'Lounge bar'), (sub_id, 'Terraza bar');
  END IF;

  -- ── Compras y retail ──────────────────────────────────────────────────────

  -- Moda
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Moda' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Tienda de ropa'), (sub_id, 'Boutique'), (sub_id, 'Tienda de ropa infantil'),
      (sub_id, 'Tienda de ropa deportiva'), (sub_id, 'Tienda de ropa formal'),
      (sub_id, 'Tienda de ropa interior'), (sub_id, 'Zapatería');
  END IF;

  -- Accesorios
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Accesorios' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Joyería'), (sub_id, 'Relojería'), (sub_id, 'Bolsos y maletas'), (sub_id, 'Sombrerería'), (sub_id, 'Óptica');
  END IF;

  -- Electrónica
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Electrónica' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Tienda de electrónica'), (sub_id, 'Tienda de celulares'), (sub_id, 'Tienda de computadoras'),
      (sub_id, 'Tienda de videojuegos'), (sub_id, 'Tienda de cámaras');
  END IF;

  -- Supermercados y conveniencia
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Supermercados y conveniencia' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Supermercado'), (sub_id, 'Mini super'), (sub_id, 'Tienda de conveniencia'),
      (sub_id, 'Tienda naturista'), (sub_id, 'Tienda orgánica');
  END IF;

  -- Tiendas especializadas
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Tiendas especializadas' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Librería'), (sub_id, 'Papelería'), (sub_id, 'Tienda de mascotas'),
      (sub_id, 'Florería'), (sub_id, 'Tienda de regalos');
  END IF;

  -- ── Salud y medicina ──────────────────────────────────────────────────────

  -- Servicios médicos
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Servicios médicos' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Hospital'), (sub_id, 'Clínica'), (sub_id, 'Consultorio médico'), (sub_id, 'Centro médico');
  END IF;

  -- Especialidades médicas
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Especialidades médicas' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Dentista'), (sub_id, 'Dermatólogo'), (sub_id, 'Pediatra'), (sub_id, 'Ginecólogo'), (sub_id, 'Oftalmólogo');
  END IF;

  -- Terapias
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Terapias' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Fisioterapia'), (sub_id, 'Quiropráctico'), (sub_id, 'Acupuntura'),
      (sub_id, 'Psicólogo'), (sub_id, 'Psiquiatra');
  END IF;

  -- Farmacias
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Farmacias' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Farmacia'), (sub_id, 'Farmacia homeopática');
  END IF;

  -- ── Belleza y cuidado personal ────────────────────────────────────────────

  -- Peluquería
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Peluquería' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Salón de belleza'), (sub_id, 'Peluquería'), (sub_id, 'Barbería');
  END IF;

  -- Spa y estética
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Spa y estética' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Spa'), (sub_id, 'Spa de uñas'), (sub_id, 'Estética'),
      (sub_id, 'Centro de depilación'), (sub_id, 'Clínica estética'), (sub_id, 'Centro de bronceado');
  END IF;

  -- Bienestar
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Bienestar' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Centro de masajes'), (sub_id, 'Terapias alternativas');
  END IF;

  -- ── Entretenimiento ───────────────────────────────────────────────────────

  -- Cultura
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Cultura' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Cine'), (sub_id, 'Teatro'), (sub_id, 'Museo'), (sub_id, 'Galería de arte');
  END IF;

  -- Juegos y recreación
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Juegos y recreación' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Arcade'), (sub_id, 'Boliche'), (sub_id, 'Billar'), (sub_id, 'Escape room');
  END IF;

  -- Diversión
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Diversión' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Parque de diversiones'), (sub_id, 'Casino'), (sub_id, 'Centro de entretenimiento');
  END IF;

  -- ── Deporte y fitness ─────────────────────────────────────────────────────

  -- Gimnasios
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Gimnasios' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Gimnasio'), (sub_id, 'Crossfit'), (sub_id, 'Centro fitness');
  END IF;

  -- Estudios
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Estudios' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Estudio de yoga'), (sub_id, 'Estudio de pilates'), (sub_id, 'Estudio de baile');
  END IF;

  -- Deportes
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Deportes' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Escuela de artes marciales'), (sub_id, 'Alberca'), (sub_id, 'Cancha deportiva'),
      (sub_id, 'Club deportivo'), (sub_id, 'Centro de escalada');
  END IF;

  -- ── Servicios automotrices ────────────────────────────────────────────────

  -- Mantenimiento
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Mantenimiento' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Taller mecánico'), (sub_id, 'Servicio automotriz'), (sub_id, 'Autolavado'),
      (sub_id, 'Llantera'), (sub_id, 'Alineación y balanceo'), (sub_id, 'Cambio de aceite'),
      (sub_id, 'Hojalatería y pintura'), (sub_id, 'Electromecánico automotriz'), (sub_id, 'Vulcanizadora');
  END IF;

  -- Venta
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Venta' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Agencia de autos'), (sub_id, 'Venta de autos usados'), (sub_id, 'Refaccionaria'),
      (sub_id, 'Accesorios automotrices'), (sub_id, 'Venta de motocicletas'), (sub_id, 'Refacciones para motocicleta');
  END IF;

  -- Energía
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Energía' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Gasolinera'), (sub_id, 'Estación de carga eléctrica'), (sub_id, 'Gasera');
  END IF;

  -- Especializados
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Especializados' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Servicio de grúas'), (sub_id, 'Polarizado automotriz'), (sub_id, 'Instalación de alarmas'),
      (sub_id, 'Estéreo automotriz'), (sub_id, 'Verificación vehicular');
  END IF;

  -- ── Servicios profesionales ───────────────────────────────────────────────

  -- Legal
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Legal' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Abogado'), (sub_id, 'Notaría'), (sub_id, 'Despacho jurídico'), (sub_id, 'Mediación legal');
  END IF;

  -- Finanzas
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Finanzas' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Contador'), (sub_id, 'Asesor fiscal'), (sub_id, 'Despacho contable'),
      (sub_id, 'Auditor'), (sub_id, 'Agencia de seguros'), (sub_id, 'Asesor financiero');
  END IF;

  -- Negocios
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Negocios' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Consultoría empresarial'), (sub_id, 'Agencia de marketing'), (sub_id, 'Agencia de publicidad'),
      (sub_id, 'Agencia inmobiliaria'), (sub_id, 'Consultor de recursos humanos'),
      (sub_id, 'Consultor de tecnología'), (sub_id, 'Coworking');
  END IF;

  -- ── Turismo y hospedaje ───────────────────────────────────────────────────

  -- Hospedaje
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Hospedaje' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Hotel'), (sub_id, 'Motel'), (sub_id, 'Hostal'), (sub_id, 'Resort'),
      (sub_id, 'Renta vacacional'), (sub_id, 'Bed and breakfast'), (sub_id, 'Posada');
  END IF;

  -- Turismo
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Turismo' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Agencia de viajes'), (sub_id, 'Tour operador'), (sub_id, 'Guía turístico'),
      (sub_id, 'Tours de aventura'), (sub_id, 'Tours culturales'), (sub_id, 'Tours en barco');
  END IF;

  -- Experiencias
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Experiencias' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Parque ecoturístico'), (sub_id, 'Centro recreativo'), (sub_id, 'Mirador turístico'),
      (sub_id, 'Atracción turística'), (sub_id, 'Centro de actividades acuáticas');
  END IF;

  -- ── Educación ─────────────────────────────────────────────────────────────

  -- Escuelas
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Escuelas' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Preescolar'), (sub_id, 'Escuela primaria'), (sub_id, 'Escuela secundaria'),
      (sub_id, 'Preparatoria'), (sub_id, 'Universidad'), (sub_id, 'Colegio privado');
  END IF;

  -- Academias
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Academias' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Academia de idiomas'), (sub_id, 'Escuela de música'), (sub_id, 'Escuela de arte'),
      (sub_id, 'Academia de danza'), (sub_id, 'Academia de computación'), (sub_id, 'Academia de regularización');
  END IF;

  -- Capacitación
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Capacitación' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Centro de capacitación'), (sub_id, 'Cursos profesionales'), (sub_id, 'Capacitación empresarial'),
      (sub_id, 'Centro de certificación'), (sub_id, 'Escuela técnica');
  END IF;

  -- ── Mascotas ──────────────────────────────────────────────────────────────

  -- Salud (mascotas)
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Salud' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Veterinaria'), (sub_id, 'Hospital veterinario'), (sub_id, 'Clínica veterinaria'),
      (sub_id, 'Farmacia veterinaria');
  END IF;

  -- Servicios (mascotas)
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Servicios' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Guardería para mascotas'), (sub_id, 'Peluquería canina'), (sub_id, 'Paseador de perros'),
      (sub_id, 'Entrenamiento canino'), (sub_id, 'Hotel para mascotas'), (sub_id, 'Adiestramiento');
  END IF;

  -- Tiendas (mascotas)
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Tiendas' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Tienda de mascotas'), (sub_id, 'Boutique para mascotas'),
      (sub_id, 'Alimentos para mascotas'), (sub_id, 'Accesorios para mascotas');
  END IF;

  -- ── Servicios generales ───────────────────────────────────────────────────

  -- Limpieza
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Limpieza' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Lavandería'), (sub_id, 'Tintorería'), (sub_id, 'Servicio de limpieza'),
      (sub_id, 'Limpieza de alfombras'), (sub_id, 'Limpieza industrial');
  END IF;

  -- Reparaciones
  SELECT id INTO sub_id FROM public.business_subcategories
    WHERE nombre = 'Reparaciones' LIMIT 1;
  IF sub_id IS NOT NULL THEN
    INSERT INTO public.business_establishment_types (subcategoria_id, nombre) VALUES
      (sub_id, 'Cerrajería'), (sub_id, 'Reparación de celulares'), (sub_id, 'Reparación de electrodomésticos'),
      (sub_id, 'Reparación de computadoras'), (sub_id, 'Reparación de televisores'), (sub_id, 'Servicio técnico');
  END IF;

  RAISE NOTICE 'business_establishment_types seed data inserted successfully.';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data insertion failed: %', SQLERRM;
END $$;
