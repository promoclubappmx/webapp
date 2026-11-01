# PromoSpot Admin (PromoClub) — Contexto Completo de la Aplicación

Panel administrativo **B2B** para negocios (dueños y empleados) que gestionan fidelización, promociones, catálogo, POS, CRM, inventario, analíticas y más. Pensado como base de una plataforma **B2B2C** (la app B2C de clientes finales se conectará al mismo Supabase).

- **URL app:** https://promospot7046.builtwithrocket.new
- **URL publicada:** https://promospot-admin-44je168.public.builtwithrocket.new
- **Idioma de UI:** Español (MX). Moneda configurable por negocio.

---

## 1. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 5 + JavaScript |
| Estilos | Tailwind CSS 3.4 (+ forms, typography, aspect-ratio, container-queries, animate) |
| Routing | react-router-dom 6.0.2 (único `BrowserRouter` en `Routes.jsx`) |
| Estado | Redux Toolkit + React Context (Auth, Currency) |
| Backend | Supabase (PostgreSQL, Auth PKCE, Realtime, Storage, Edge Functions) |
| Mapas / Geo | Mapbox GL, mapbox-gl-draw, Turf.js, PostGIS |
| Gráficas | Recharts, D3 |
| Formularios | react-hook-form |
| Calendario | react-big-calendar |
| Animación | framer-motion |
| Íconos | lucide-react |
| QR | qrcode |
| Fechas | date-fns |
| Validación identidad MX | Nubarium (CURP/RFC) |
| Códigos postales MX | Copomex |

### Variables de entorno (`.env`, prefijo `VITE_`)
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_NUBARIUM_API_URL`, `VITE_NUBARIUM_USERNAME`, `VITE_NUBARIUM_PASSWORD`, `VITE_COPOMEX_API_URL`, `VITE_COPOMEX_TOKEN`, `VITE_MAPBOX_TOKEN`. Placeholders sin usar: OpenAI, Gemini, Anthropic, Perplexity, Stripe, Google Analytics, AdSense.

---

## 2. Arquitectura del Frontend

```
src/
├── App.jsx                 # Solo renderiza <Routes />
├── Routes.jsx              # ÚNICO BrowserRouter + todas las rutas
├── index.jsx               # Entry point
├── lib/supabase.js         # Cliente Supabase (PKCE, autoRefresh)
├── contexts/
│   ├── AuthContext.jsx     # user, userProfile, permisos de empleado
│   └── CurrencyContext.jsx # formato de moneda por negocio
├── hooks/
│   ├── useRealtimeData.js            # Suscripciones Realtime multi-tabla
│   ├── useGamificationRealtime.js
│   └── useCategorias.js              # Categoría → Subcategoría → Tipo (cascada)
├── services/
│   ├── analyticsService.js
│   ├── rewardsService.js
│   ├── campaignNotificationService.js
│   ├── geospatial.js
│   ├── copomexService.js
│   └── nubariumService.js
├── components/
│   ├── ui/ (Sidebar, Header, RoleGuard, Button, Input, Select, Checkbox,
│   │        FileUpload, Breadcrumb, SearchableSelector, CatalogItemSelector)
│   ├── ErrorBoundary, ScrollToTop, AppIcon, AppImage, InactiveModule,
│   │   BusinessSelector, NotificationsModule, NotificationDetailModal,
│   │   GamificationNotificationActions
├── pages/                  # ~70 módulos (ver sección 4)
├── utils/                  # currencyFormatter, rfcUtils, estadosMexico, cardValidation, fileUtils, cn
└── styles/                 # index.css (no modificar), tailwind.css
```

### Reglas de arquitectura
- `App.jsx` **solo** renderiza `<Routes />`; todas las rutas viven en `Routes.jsx`.
- Cada módulo: `pages/<modulo>/index.jsx` + `components/` propios.
- Tiempo real: hook `useRealtimeData` (Dashboard, Analytics, Loyalty, CRM, Promociones, Cupones) con indicador "En vivo".

---

## 3. Autenticación, Roles y Permisos

### AuthContext
Expone: `user`, `userProfile`, `loading`, `signIn`, `signOut`, `updateProfile`, `isAuthenticated`, `isOwner`, `isEmployee`, `employeePermissions`, `hasPermission(module, action)`.

**Flujo:**
1. `supabase.auth.getSession()` → `setUser`
2. `onAuthStateChange` (callback sincrónico)
3. `user_profiles` se carga de forma asíncrona
4. Si `account_type === 'employee'` → RPC `get_employee_permissions`

### Modelo de identidad
```
auth.users
 └── user_profiles (id = auth.uid)
      ├── account_type: 'owner' | 'employee'
      ├── business_id
      ├── employer_id → user_profiles.id (empleados)
      └── staff_member_id → staff_members.id
           business_settings (owner_id → user_profiles.id)
            └── business_locations (sucursales)
```

### Autorización en UI
- `RoleGuard` + `roles` por ítem del Sidebar (`owner`, `admin`, `manager`, `cashier`, `staff`).
- Permisos granulares por módulo/rol: `custom_roles`, `role_module_permissions`.

### Registro (wizard de 7 pasos) — `/register`
1. Email + OTP → 2. Datos personales → 3. Datos fiscales (RFC/CURP, Nubarium) → 4. Datos del negocio (categoría/subcategoría/tipo) → 5. Ubicación (Mapbox/Copomex) → 6. Selección de plan → 7. Confirmación. Redirige a `/first-time-experience`.

### Login — `/login`
Métodos: contraseña, OTP, Magic Link.

---

## 4. Módulos y Pantallas (Rutas)

### 4.1 Generales
| Ruta | Pantalla |
|------|----------|
| `/`, `/dashboard-overview` | Dashboard (KPIs, actividad, gráficas, campañas próximas, moderación) |
| `/login`, `/register` | Autenticación y registro |
| `/first-time-experience` | Bienvenida y checklist de onboarding |
| `/profile` | Perfil del usuario |
| `/notifications`, `/notification`, `/notification-settings` | Centro y ajustes de notificaciones |
| `/alert-settings` | Configuración de alertas |
| `/staff-confirmation`, `/staff-onboarding` | Confirmación y onboarding de empleados |
| `*` | NotFound |

### 4.2 Negocio y Configuración
| Ruta | Pantalla |
|------|----------|
| `/business-settings` (`/settings` redirige) | Ajustes del negocio: perfil, marca, fiscal, ubicación, categorías, atributos, tags, envíos, integraciones, regional, verificación, facturación |
| `/establishments-portfolio` | Portafolio de establecimientos (KPIs, comparativas) |
| `/business-listings-management` | Fichas de negocio (info básica, horarios, media, amenidades, accesibilidad, QR, etc.) |
| `/business-listing-wizard` | Wizard de alta de ficha |
| `/kpi-por-tipo` | KPIs por tipo de establecimiento |
| `/staff-management` | Personal, roles y permisos, organigrama, turnos, auditoría |
| `/planes-facturacion`, `/billing` | Planes, métodos de pago, perfil fiscal, facturas |

### 4.3 Catálogo e Inventario
| Ruta | Pantalla |
|------|----------|
| `/catalog-management`, `/catalog-management/product/:id` | Productos y servicios (formulario por tabs: general, datos, costo, inventario, medios, SEO, organización, paquete, atributos, visibilidad, reseñas) |
| `/catalog-settings` | Categorías, tags, atributos y atributos personalizados |
| `/inventory-management` | Inventario, ajustes, alertas de stock |
| `/inventory-transfers` | Transferencias entre sucursales |
| `/suppliers`, `/supplier-profile-detail/:id`, `/supplier-full-form/new\|:id` | Proveedores |
| `/purchase-orders` | Pedidos de compra (reorden automático, recurrentes, bulk) |
| `/goods-receipt`, `/goods-receipt/receive/:orderId` | Recepción de mercancía |

### 4.4 Ventas y Clientes
| Ruta | Pantalla |
|------|----------|
| `/point-of-sale` | POS (caja, terminales, retiros, historial, métricas, recibos) |
| `/manual-validations` | Validaciones manuales (cupones/recompensas/check-in) |
| `/crm-clients-list`, `/customer-profile-detail/:id` | CRM: clientes, segmentos, leads, consentimientos, perfil 360° |
| `/crm-segments-management` | Gestión de segmentos |

### 4.5 Promociones y Cupones
| Ruta | Pantalla |
|------|----------|
| `/promotions-management`, `/new`, `/edit/:id` | Promociones (calendario, analytics, inventario) |
| `/coupons-management`, `/new-promotion`, `/edit-promotion/:id`, `/new-recovery` | Cupones (promoción y recuperación, validar, analytics) |
| `/campaigns-management`, `/new`, `/edit/:id` | Campañas |
| `/campaign-dashboard(/:id)` | Dashboard de campaña (A/B, grupo control, secuencias) |
| `/campaign-creation(/edit/:id)` | Creación avanzada de campañas |
| `/audience-builder` | Constructor de audiencias |
| `/marketing-calendar` | Calendario de actividades (anual/mensual/semanal/diario/lista) |

### 4.6 Fidelización y Gamificación
| Ruta | Pantalla |
|------|----------|
| `/loyalty-points-system` (+ `/edit`, `/catalogo`, `/catalogo/nueva-recompensa`) | Programa de puntos, parametrización, catálogo de recompensas |
| `/rewards-management` | Recompensas, experiencias, sorpresas, punch cards, niveles VIP, automatizaciones |
| `/punch-cards-management`, `/new` | Tarjetas de sellos |
| `/vip-levels-management`, `/wizard` | Niveles VIP |
| `/surprises-management`, `/new`, `/edit/:id` | Sorpresas (mecánicas, triggers, anti-saturación) |
| `/visit-streaks-management`, `/wizard` | Rachas de visitas |
| `/achievements-management`, `/wizard` | Logros |
| `/check-in-module`, `/check-in-module/config` | Check-in (QR, NFC, Beacon, Geofence; recompensas, anti-abuso, analytics) |
| `/geofencing` | Geofencing (zona, acciones, actividad, simulador) |

### 4.7 Automatización
| Ruta | Pantalla |
|------|----------|
| `/engagement-automation` | Reglas de automatización de engagement |
| `/automation-effectiveness-dashboard` | Efectividad de automatizaciones |
| `/automation-flows-dashboard` | Hub de flujos (IFTTT, visual, lifecycle, testing, rewards) |
| `/lifecycle-flows-builder`, `/visual-flow-editor` | Constructores de flujos |
| `/ifttt-rules-management`, `/ifttt-rule-builder`, `/flow-testing-interface` | Reglas IFTTT y pruebas |

### 4.8 Reputación y Feedback
| Ruta | Pantalla |
|------|----------|
| `/reviews-management(-dashboard)` | Reseñas |
| `/review-requests-management` | Solicitud de reseñas |
| `/nps-management` | NPS |
| `/surveys-management`, `/surveys-benchmark` | Encuestas y benchmark |

### 4.9 Analíticas
| Ruta | Pantalla |
|------|----------|
| `/analytics`, `/analytics-and-reports` | Resumen, clientes, financiero, mercado, atribución, customer journey, constructor de reportes, auditoría |

### 4.10 Módulos inactivos (`InactiveModule`)
Tarjetas de regalo (`/gift-cards-*`), Reservaciones (`/reservations-management`), Order Ahead (`/order-ahead-management`), Membresías (`/membership-*`). Código y tablas existen, pero las rutas están desactivadas.

### 4.11 Redirecciones
`/check-in-methods-configuration`, `/check-in-rewards-management`, `/check-in-anti-abuse-control` → `/check-in-module`; `/geofence-*` → `/geofencing`; `/settings` → `/business-settings`.

---

## 5. Navegación (Sidebar)

Secciones del `Sidebar.jsx` (con logo/nombre del negocio, usuario y logout):
- **Dashboard**
- **Negocio:** Establecimientos, Personal, Ajustes y herramientas, Planes y Facturación, Centro de notificaciones
- **Catálogo e Inventario:** Productos y Servicios, Inventario, Transferencias, Configuración de catálogo
- **Compras:** Proveedores, Pedidos de Compra, Recepción de Mercancía
- **Operación:** Punto de Venta, CRM/Clientes, Validaciones manuales
- **Marketing/Fidelización:** Automatizaciones, Efectividad, Cupones, Puntos, Recompensas, Tarjetas de Sellos, Check-in, Campañas, Calendario, Promociones, Audiencias, Flujos, Geofencing
- **Reputación:** Reseñas (gestionar/solicitar), NPS, Encuestas, Benchmark
- **Gamificación:** Sorpresas, Niveles VIP, Rachas, Logros
- **Analíticas**

---

## 6. Base de Datos (Supabase / PostgreSQL)

Multi-tenant con `business_id` / `user_id` / `owner_id` y **RLS** activo en la mayoría de tablas. Migraciones en `supabase/migrations/`.

### Identidad y negocio
`user_profiles`, `business_settings`, `business_locations`, `business_categories`, `business_subcategories`, `business_establishment_types`, `business_listing_drafts`, `verification_documents`, `access_logs`, `curp_log`.

**Categorías (normalizadas):** `business_categories (id, nombre)` → `business_subcategories (categoria_id)` → `business_establishment_types (subcategoria_id)`. En `business_settings`: `categoria_id`, `subcategoria_id`, `tipo_establecimiento_id`. Seed idempotente: 13 categorías, ~40 subcategorías, ~150 tipos (lectura pública).

### Clientes / CRM
`customer_profiles`, `owner_customers`, `customer_vip_levels`, `customer_segments`, `customer_segment_assignments`, `crm_segments`, `crm_leads`, `crm_communication_history`, notas de cliente, audiencias (`audience_templates`).

### Fidelización y gamificación
`loyalty_programs`, `loyalty_points`, `loyalty_transactions`, `loyalty_rewards`, `loyalty_reward_redemptions`, `loyalty_planner_config`, `vip_levels`, `vip_level_benefits`, `vip_levels_config`, `punch_cards`, `punch_card_stamps`, `achievement_catalog`, `business_achievements_config`, `customer_achievements`, `custom_achievements`, `surprise_rewards_config`, `surprise_trigger_pools`, `exclusive_experiences`.

### Promociones y campañas
`promotions`, `promotion_analytics`, `coupons`, `coupon_redemptions`, `campaign_notifications`, calendario de marketing.

### Check-in y geofencing
`checkins`, `checkin_methods`, `checkin_rewards`, `checkin_rules`, `nfc_tags`, `ble_beacons`, `geofence_events` (PostGIS).

### Catálogo, POS y pedidos
`catalog_items`, `categories`, tags/atributos/atributos personalizados, `pos_transactions`, `pos_terminals`, `cash_register_sessions`, `cash_withdrawals`, `orders`, `order_ahead_config`, `featured_items`, `upsell_rules`, `gift_cards`.

### Inventario y proveedores
`suppliers`, `purchase_orders`, `goods_receipts`, `inventory_transfers`, `inventory_adjustments`, `stock_alerts`, `reorder_rules`.

### Staff y permisos
`staff_members`, `departments`, `custom_roles`, `role_module_permissions`, `shift_schedules`, auditoría.

### Feedback
`reviews`, `nps_responses`, encuestas.

### Automatización
`engagement_automation_rules`, `recurring_order_config`, reglas IFTTT/lifecycle.

### Facturación SaaS y membresías
`user_subscriptions`, `billing_invoices`, `billing_payment_methods`, `membership_programs`, `membership_subscriptions`.

### Reservaciones
`reservations`, `reservation_services`, `reservation_schedules`, `reservation_blocks`.

---

## 7. Edge Functions (`supabase/functions/`)

| Función | Propósito |
|---------|-----------|
| `copomex-proxy` | Proxy API códigos postales MX |
| `nubarium-proxy` | Proxy validación CURP/RFC |
| `checkin-validation` | Valida check-ins (QR, NFC, Beacon, Geofence) |
| `geofencing` | Procesa eventos de geofencing |
| `campaign-trigger` | Dispara campañas |
| `automation-webhook` | Webhook de automatizaciones |
| `rewards-processor` | Procesa recompensas y puntos |
| `membership-validation` | Valida membresías |
| `survey-processor` | Procesa encuestas |
| `send-notifications` | Notificaciones push/email |
| `process-order` | Procesa pedidos Order Ahead |

`_shared/cors.ts` contiene los headers CORS compartidos.

---

## 8. Storage (Buckets)

| Bucket | Acceso | Límite | Uso |
|--------|--------|--------|-----|
| `promotional-images` | Público | 5MB | Imágenes de promociones |
| `business-assets` | Público | 10MB | Logo y assets |
| `catalog-images` | Público | 5MB | Productos |
| `gift-card-designs` | Público | 5MB | Diseños de gift cards |
| `campaign-media` | Público | 10MB | Media de campañas |
| `survey-media` | Público | 5MB | Encuestas |
| `customer-avatars` | Privado | 2MB | Avatares |
| `staff-documents` | Privado | 20MB | Documentos de empleados |

---

## 9. Tiempo Real

`useRealtimeData` suscribe canales Supabase a tablas con refresco automático en INSERT/UPDATE/DELETE:
- **Dashboard:** promotions, coupon_redemptions, loyalty_transactions, customer_profiles
- **Analytics:** checkins, coupon_redemptions, loyalty_transactions, promotion_analytics, reviews, nps_responses, orders
- **Loyalty, CRM, Promociones, Cupones:** tablas propias del módulo

---

## 10. Contexto de Moneda

`CurrencyContext`: `currencySettings`, `formatPrice(amount)`, `updateCurrencySettings()`. Persistido en `user_profiles.currency_settings (jsonb)`.

---

## 11. Puntos de Conexión para la App B2C (B2B2C)

| Necesidad B2C | Tabla / Endpoint |
|---------------|------------------|
| Registro/login cliente | `auth.users` + `customer_profiles` |
| Negocios cercanos | `business_settings` + `business_locations` (PostGIS) |
| Check-in | Edge Function `checkin-validation` |
| Puntos y nivel | `loyalty_points`, `loyalty_programs`, `vip_levels` |
| Canjes | `loyalty_reward_redemptions`, `coupon_redemptions` |
| Promociones / cupones | `promotions`, `coupons` (filtrar por `business_id`) |
| Punch cards | `punch_cards`, `punch_card_stamps` |
| Sorpresas | `surprise_rewards_config` + `rewards-processor` |
| Logros / rachas | `customer_achievements`, `achievement_catalog` |
| Reservaciones | `reservations`, `reservation_services` |
| Order Ahead | `orders`, `order_ahead_config` + `process-order` |
| Encuestas / NPS / reseñas | `nps_responses`, `reviews` + `survey-processor` |
| Membresías | `membership_programs`, `membership_subscriptions` + `membership-validation` |
| Notificaciones | `send-notifications`, `campaign_notifications` |
| Geofencing | `geofencing`, `geofence_events` |

**Recomendaciones B2B2C**
- Mismo proyecto Supabase; `business_id` es la llave de tenant y vínculo cliente↔negocio.
- Ajustar políticas RLS para que el cliente (`auth.uid()`) solo vea sus propios datos por negocio.
- Decidir si los clientes B2C serán `auth.users` (login propio) o identificación por teléfono/email sin cuenta.

---

## 12. Convenciones de Desarrollo

- Un solo `BrowserRouter` en `Routes.jsx`; nuevas pantallas se registran ahí y se enlazan en el Sidebar.
- No modificar `src/styles/index.css`; los cambios de estilo global van en `tailwind.css`.
- Variables de entorno con prefijo `VITE_` (`import.meta.env.VITE_*`).
- Optional chaining en accesos anidados; todo componente con `export default`.
- Migraciones SQL idempotentes en `supabase/migrations/`.
