-- Migration: First-Time Experience Dashboard and Registration Email Templates
-- Description: Adds tables for tracking first-time user experience, onboarding checklist, and registration email templates
-- Created: 2026-02-23

-- =============================================
-- 1. FIRST TIME EXPERIENCE TRACKING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.first_time_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id TEXT,
  subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('free', 'pro', 'premium')),
  is_completed BOOLEAN DEFAULT FALSE,
  current_step INTEGER DEFAULT 0,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  completed_items JSONB DEFAULT '[]'::jsonb,
  skipped_items JSONB DEFAULT '[]'::jsonb,
  last_viewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_fte_user_id ON public.first_time_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_fte_business_id ON public.first_time_experience(business_id);
CREATE INDEX IF NOT EXISTS idx_fte_completed ON public.first_time_experience(is_completed);

-- =============================================
-- 2. REGISTRATION EMAIL TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.registration_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL CHECK (template_type IN ('otp_verification', 'welcome_message', 'plan_confirmation', 'setup_reminder')),
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  plan_specific TEXT CHECK (plan_specific IN ('free', 'pro', 'premium', 'all')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for template lookups
CREATE INDEX IF NOT EXISTS idx_reg_email_template_type ON public.registration_email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_reg_email_active ON public.registration_email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_reg_email_plan ON public.registration_email_templates(plan_specific);

-- =============================================
-- 3. INSERT DEFAULT REGISTRATION EMAIL TEMPLATES
-- =============================================

-- OTP Verification Template
INSERT INTO public.registration_email_templates (template_type, template_name, subject, body, variables, is_active, is_default, plan_specific)
VALUES (
  'otp_verification',
  'Verificación de Email - PromoClub',
  'Verifica tu email para continuar con PromoClub',
  E'<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .otp-code { background: #f7f7f7; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
    .footer { background: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎯 PromoClub</div>
      <p>Tu código de verificación está listo</p>
    </div>
    <div class="content">
      <h2>¡Hola!</h2>
      <p>Gracias por registrarte en PromoClub. Para continuar con tu registro, por favor verifica tu dirección de email usando el siguiente código:</p>
      <div class="otp-code">{{otpCode}}</div>
      <p><strong>Este código expira en 10 minutos.</strong></p>
      <p>Si no solicitaste este código, puedes ignorar este email de forma segura.</p>
      <p>¿Necesitas ayuda? Contáctanos en soporte@promoclub.com</p>
    </div>
    <div class="footer">
      <p>© 2026 PromoClub. Todos los derechos reservados.</p>
      <p>Este es un email automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>',
  '[{"name": "{{otpCode}}", "description": "Código OTP de 6 dígitos"}]'::jsonb,
  TRUE,
  TRUE,
  'all'
) ON CONFLICT DO NOTHING;

-- Welcome Message Template (Free Plan)
INSERT INTO public.registration_email_templates (template_type, template_name, subject, body, variables, is_active, is_default, plan_specific)
VALUES (
  'welcome_message',
  'Bienvenida Plan Free - PromoClub',
  '¡Bienvenido a PromoClub! 🎉',
  E'<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .feature { background: #f7f7f7; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 4px; }
    .cta { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Bienvenido a PromoClub!</h1>
      <p>Estamos emocionados de tenerte con nosotros</p>
    </div>
    <div class="content">
      <h2>¡Hola {{ownerName}}! 👋</h2>
      <p>Tu negocio <strong>{{businessName}}</strong> ha sido registrado exitosamente en PromoClub con el <strong>Plan Free</strong>.</p>
      
      <h3>✨ Características de tu Plan Free:</h3>
      <div class="feature">📋 <strong>Perfil de negocio básico</strong> - Crea tu ficha digital</div>
      <div class="feature">📦 <strong>Hasta 10 productos</strong> - Gestiona tu catálogo inicial</div>
      <div class="feature">📊 <strong>Estadísticas básicas</strong> - Monitorea tu desempeño</div>
      <div class="feature">📧 <strong>Soporte por email</strong> - Estamos aquí para ayudarte</div>
      
      <h3>🚀 Próximos Pasos:</h3>
      <ol>
        <li>Completa tu perfil de negocio</li>
        <li>Agrega tus primeros productos al catálogo</li>
        <li>Configura tus horarios de atención</li>
        <li>Explora el panel de control</li>
      </ol>
      
      <div class="cta">
        <a href="{{dashboardLink}}" class="button">Ir a Mi Panel de Control</a>
      </div>
      
      <p><strong>💡 Consejo:</strong> ¿Quieres más funcionalidades? Actualiza a Plan Pro o Premium en cualquier momento para desbloquear promociones, programa de puntos, cupones y mucho más.</p>
    </div>
    <div class="footer">
      <p>© 2026 PromoClub. Todos los derechos reservados.</p>
      <p>¿Necesitas ayuda? Contáctanos en soporte@promoclub.com</p>
    </div>
  </div>
</body>
</html>',
  '[{"name": "{{ownerName}}", "description": "Nombre del propietario"}, {"name": "{{businessName}}", "description": "Nombre del negocio"}, {"name": "{{dashboardLink}}", "description": "Enlace al dashboard"}]'::jsonb,
  TRUE,
  TRUE,
  'free'
) ON CONFLICT DO NOTHING;

-- Welcome Message Template (Pro Plan)
INSERT INTO public.registration_email_templates (template_type, template_name, subject, body, variables, is_active, is_default, plan_specific)
VALUES (
  'welcome_message',
  'Bienvenida Plan Pro - PromoClub',
  '¡Bienvenido a PromoClub Pro! 🚀',
  E'<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .feature { background: #f7f7f7; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981; border-radius: 4px; }
    .cta { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
    .badge { display: inline-block; background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 ¡Bienvenido a PromoClub Pro!</h1>
      <p><span class="badge">PLAN PRO ACTIVADO</span></p>
    </div>
    <div class="content">
      <h2>¡Hola {{ownerName}}! 👋</h2>
      <p>Tu negocio <strong>{{businessName}}</strong> ahora tiene acceso completo al <strong>Plan Pro</strong> de PromoClub.</p>
      
      <h3>🎯 Características Premium Desbloqueadas:</h3>
      <div class="feature">📦 <strong>Productos ilimitados</strong> - Sin límites en tu catálogo</div>
      <div class="feature">🎯 <strong>Sistema de promociones</strong> - Crea campañas personalizadas</div>
      <div class="feature">⭐ <strong>Programa de puntos</strong> - Fideliza a tus clientes</div>
      <div class="feature">🎟️ <strong>Cupones y descuentos</strong> - Atrae más ventas</div>
      <div class="feature">📊 <strong>Estadísticas avanzadas</strong> - Análisis detallados</div>
      <div class="feature">🚀 <strong>Soporte prioritario</strong> - Respuesta rápida</div>
      
      <h3>🚀 Próximos Pasos:</h3>
      <ol>
        <li>Crea tu primera promoción</li>
        <li>Configura el programa de puntos de lealtad</li>
        <li>Genera cupones de descuento</li>
        <li>Agrega productos ilimitados a tu catálogo</li>
        <li>Revisa tus estadísticas avanzadas</li>
      </ol>
      
      <div class="cta">
        <a href="{{dashboardLink}}" class="button">Comenzar Ahora</a>
      </div>
      
      <p><strong>💰 Inversión:</strong> $499 MXN/mes - Cancela en cualquier momento</p>
    </div>
    <div class="footer">
      <p>© 2026 PromoClub. Todos los derechos reservados.</p>
      <p>Soporte prioritario: soporte@promoclub.com</p>
    </div>
  </div>
</body>
</html>',
  '[{"name": "{{ownerName}}", "description": "Nombre del propietario"}, {"name": "{{businessName}}", "description": "Nombre del negocio"}, {"name": "{{dashboardLink}}", "description": "Enlace al dashboard"}]'::jsonb,
  TRUE,
  TRUE,
  'pro'
) ON CONFLICT DO NOTHING;

-- Welcome Message Template (Premium Plan)
INSERT INTO public.registration_email_templates (template_type, template_name, subject, body, variables, is_active, is_default, plan_specific)
VALUES (
  'welcome_message',
  'Bienvenida Plan Premium - PromoClub',
  '¡Bienvenido a PromoClub Premium! 💎',
  E'<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .feature { background: #fffbeb; padding: 15px; margin: 10px 0; border-left: 4px solid #f59e0b; border-radius: 4px; }
    .cta { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
    .badge { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💎 ¡Bienvenido a PromoClub Premium!</h1>
      <p><span class="badge">PLAN PREMIUM ACTIVADO</span></p>
    </div>
    <div class="content">
      <h2>¡Hola {{ownerName}}! 👋</h2>
      <p>Tu negocio <strong>{{businessName}}</strong> ahora tiene acceso completo al <strong>Plan Premium</strong> - nuestra solución más avanzada.</p>
      
      <h3>💎 Características Premium Elite:</h3>
      <div class="feature">🌍 <strong>Geofencing</strong> - Notificaciones por ubicación</div>
      <div class="feature">🚀 <strong>Boosts de visibilidad</strong> - Destaca tu negocio</div>
      <div class="feature">🗺️ <strong>Mapas de calor</strong> - Analiza comportamiento de clientes</div>
      <div class="feature">🔮 <strong>Análisis predictivo</strong> - Anticipa tendencias</div>
      <div class="feature">📍 <strong>Múltiples ubicaciones</strong> - Gestiona sucursales</div>
      <div class="feature">🔌 <strong>API personalizada</strong> - Integraciones avanzadas</div>
      <div class="feature">⚡ <strong>Soporte 24/7</strong> - Asistencia inmediata</div>
      <div class="feature">✅ <strong>Todo de Plan Pro incluido</strong></div>
      
      <h3>🚀 Próximos Pasos:</h3>
      <ol>
        <li>Configura geofencing para tu ubicación</li>
        <li>Activa boosts de visibilidad</li>
        <li>Explora mapas de calor de clientes</li>
        <li>Configura múltiples ubicaciones (si aplica)</li>
        <li>Accede a análisis predictivo</li>
        <li>Solicita acceso a API personalizada</li>
      </ol>
      
      <div class="cta">
        <a href="{{dashboardLink}}" class="button">Acceder al Dashboard Premium</a>
      </div>
      
      <p><strong>💰 Inversión:</strong> $1,299 MXN/mes - Cancela en cualquier momento</p>
      <p><strong>🎁 Bonus:</strong> Consultoría gratuita de 1 hora con nuestro equipo de expertos</p>
    </div>
    <div class="footer">
      <p>© 2026 PromoClub. Todos los derechos reservados.</p>
      <p>Soporte Premium 24/7: premium@promoclub.com | WhatsApp: +52 55 1234 5678</p>
    </div>
  </div>
</body>
</html>',
  '[{"name": "{{ownerName}}", "description": "Nombre del propietario"}, {"name": "{{businessName}}", "description": "Nombre del negocio"}, {"name": "{{dashboardLink}}", "description": "Enlace al dashboard"}]'::jsonb,
  TRUE,
  TRUE,
  'premium'
) ON CONFLICT DO NOTHING;

-- Plan Confirmation Template
INSERT INTO public.registration_email_templates (template_type, template_name, subject, body, variables, is_active, is_default, plan_specific)
VALUES (
  'plan_confirmation',
  'Confirmación de Plan - PromoClub',
  'Confirmación de tu Plan {{planName}} en PromoClub',
  E'<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .summary-box { background: #f7f7f7; border: 2px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .footer { background: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Plan Confirmado</h1>
    </div>
    <div class="content">
      <h2>Hola {{ownerName}},</h2>
      <p>Tu suscripción al <strong>Plan {{planName}}</strong> ha sido confirmada exitosamente.</p>
      
      <div class="summary-box">
        <h3>📋 Resumen de Suscripción</h3>
        <div class="summary-row">
          <span><strong>Negocio:</strong></span>
          <span>{{businessName}}</span>
        </div>
        <div class="summary-row">
          <span><strong>Plan:</strong></span>
          <span>{{planName}}</span>
        </div>
        <div class="summary-row">
          <span><strong>Precio:</strong></span>
          <span>{{planPrice}}</span>
        </div>
        <div class="summary-row">
          <span><strong>Fecha de inicio:</strong></span>
          <span>{{startDate}}</span>
        </div>
        <div class="summary-row">
          <span><strong>Próxima facturación:</strong></span>
          <span>{{nextBillingDate}}</span>
        </div>
      </div>
      
      <p>Puedes gestionar tu suscripción, actualizar tu plan o cancelar en cualquier momento desde la configuración de tu cuenta.</p>
      
      <div style="text-align: center;">
        <a href="{{dashboardLink}}" class="button">Ir a Mi Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 PromoClub. Todos los derechos reservados.</p>
      <p>¿Preguntas sobre facturación? Contáctanos en facturacion@promoclub.com</p>
    </div>
  </div>
</body>
</html>',
  '[{"name": "{{ownerName}}", "description": "Nombre del propietario"}, {"name": "{{businessName}}", "description": "Nombre del negocio"}, {"name": "{{planName}}", "description": "Nombre del plan"}, {"name": "{{planPrice}}", "description": "Precio del plan"}, {"name": "{{startDate}}", "description": "Fecha de inicio"}, {"name": "{{nextBillingDate}}", "description": "Próxima fecha de facturación"}, {"name": "{{dashboardLink}}", "description": "Enlace al dashboard"}]'::jsonb,
  TRUE,
  TRUE,
  'all'
) ON CONFLICT DO NOTHING;

-- Setup Reminder Template
INSERT INTO public.registration_email_templates (template_type, template_name, subject, body, variables, is_active, is_default, plan_specific)
VALUES (
  'setup_reminder',
  'Recordatorio de Configuración - PromoClub',
  '⏰ Completa la configuración de tu negocio en PromoClub',
  E'<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .checklist-item { background: #f7f7f7; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 4px; display: flex; align-items: center; }
    .checklist-item.completed { border-left-color: #10b981; opacity: 0.6; }
    .checkbox { width: 24px; height: 24px; margin-right: 15px; }
    .cta { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ ¡No olvides completar tu configuración!</h1>
    </div>
    <div class="content">
      <h2>Hola {{ownerName}},</h2>
      <p>Notamos que aún no has completado la configuración de <strong>{{businessName}}</strong> en PromoClub.</p>
      
      <p>Completa estos pasos para aprovechar al máximo tu cuenta:</p>
      
      <div class="checklist-item {{step1Status}}">
        <span class="checkbox">{{step1Icon}}</span>
        <div>
          <strong>Completa tu perfil de negocio</strong>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Agrega descripción, horarios y datos de contacto</p>
        </div>
      </div>
      
      <div class="checklist-item {{step2Status}}">
        <span class="checkbox">{{step2Icon}}</span>
        <div>
          <strong>Agrega productos a tu catálogo</strong>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Sube tus productos o servicios</p>
        </div>
      </div>
      
      <div class="checklist-item {{step3Status}}">
        <span class="checkbox">{{step3Icon}}</span>
        <div>
          <strong>Configura tu primera promoción</strong>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Atrae clientes con ofertas especiales</p>
        </div>
      </div>
      
      <div class="checklist-item {{step4Status}}">
        <span class="checkbox">{{step4Icon}}</span>
        <div>
          <strong>Invita a tu equipo</strong>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Agrega personal para gestionar tu negocio</p>
        </div>
      </div>
      
      <p><strong>Progreso:</strong> {{completedSteps}} de {{totalSteps}} pasos completados ({{progressPercentage}}%)</p>
      
      <div class="cta">
        <a href="{{dashboardLink}}" class="button">Continuar Configuración</a>
      </div>
      
      <p style="font-size: 14px; color: #666;">💡 <strong>Consejo:</strong> Los negocios que completan su configuración obtienen hasta 3x más visibilidad en la plataforma.</p>
    </div>
    <div class="footer">
      <p>© 2026 PromoClub. Todos los derechos reservados.</p>
      <p>¿Necesitas ayuda? Contáctanos en soporte@promoclub.com</p>
    </div>
  </div>
</body>
</html>',
  '[{"name": "{{ownerName}}", "description": "Nombre del propietario"}, {"name": "{{businessName}}", "description": "Nombre del negocio"}, {"name": "{{completedSteps}}", "description": "Pasos completados"}, {"name": "{{totalSteps}}", "description": "Total de pasos"}, {"name": "{{progressPercentage}}", "description": "Porcentaje de progreso"}, {"name": "{{dashboardLink}}", "description": "Enlace al dashboard"}, {"name": "{{step1Status}}", "description": "Estado paso 1"}, {"name": "{{step1Icon}}", "description": "Icono paso 1"}, {"name": "{{step2Status}}", "description": "Estado paso 2"}, {"name": "{{step2Icon}}", "description": "Icono paso 2"}, {"name": "{{step3Status}}", "description": "Estado paso 3"}, {"name": "{{step3Icon}}", "description": "Icono paso 3"}, {"name": "{{step4Status}}", "description": "Estado paso 4"}, {"name": "{{step4Icon}}", "description": "Icono paso 4"}]'::jsonb,
  TRUE,
  TRUE,
  'all'
) ON CONFLICT DO NOTHING;

-- =============================================
-- 4. RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.first_time_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_email_templates ENABLE ROW LEVEL SECURITY;

-- First Time Experience Policies
CREATE POLICY "Users can view their own FTE"
  ON public.first_time_experience
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own FTE"
  ON public.first_time_experience
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own FTE"
  ON public.first_time_experience
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Registration Email Templates Policies (public read for active templates)
CREATE POLICY "Anyone can view active registration email templates"
  ON public.registration_email_templates
  FOR SELECT
  USING (is_active = TRUE);

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to initialize first-time experience for new user
CREATE OR REPLACE FUNCTION public.initialize_first_time_experience(
  p_user_id UUID,
  p_business_id TEXT,
  p_subscription_plan TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_fte_id UUID;
  v_checklist JSONB;
BEGIN
  -- Define checklist based on plan
  IF p_subscription_plan = 'free' THEN
    v_checklist := '[
      {"id": "complete_profile", "title": "Completa tu perfil de negocio", "description": "Agrega descripción, horarios y datos de contacto", "completed": false},
      {"id": "add_products", "title": "Agrega productos (hasta 10)", "description": "Sube tus primeros productos al catálogo", "completed": false},
      {"id": "setup_hours", "title": "Configura horarios de atención", "description": "Define cuándo está abierto tu negocio", "completed": false},
      {"id": "explore_dashboard", "title": "Explora el dashboard", "description": "Familiarízate con las estadísticas básicas", "completed": false}
    ]'::jsonb;
  ELSIF p_subscription_plan = 'pro' THEN
    v_checklist := '[
      {"id": "complete_profile", "title": "Completa tu perfil de negocio", "description": "Agrega descripción, horarios y datos de contacto", "completed": false},
      {"id": "add_products", "title": "Agrega productos ilimitados", "description": "Sube todos tus productos al catálogo", "completed": false},
      {"id": "create_promotion", "title": "Crea tu primera promoción", "description": "Atrae clientes con ofertas especiales", "completed": false},
      {"id": "setup_loyalty", "title": "Configura programa de puntos", "description": "Define cómo los clientes ganan puntos", "completed": false},
      {"id": "generate_coupons", "title": "Genera cupones de descuento", "description": "Crea cupones para tus clientes", "completed": false},
      {"id": "view_analytics", "title": "Revisa estadísticas avanzadas", "description": "Analiza el desempeño de tu negocio", "completed": false}
    ]'::jsonb;
  ELSE -- premium
    v_checklist := '[
      {"id": "complete_profile", "title": "Completa tu perfil de negocio", "description": "Agrega descripción, horarios y datos de contacto", "completed": false},
      {"id": "add_products", "title": "Agrega productos ilimitados", "description": "Sube todos tus productos al catálogo", "completed": false},
      {"id": "setup_geofencing", "title": "Configura geofencing", "description": "Define zonas para notificaciones por ubicación", "completed": false},
      {"id": "activate_boosts", "title": "Activa boosts de visibilidad", "description": "Destaca tu negocio en la plataforma", "completed": false},
      {"id": "explore_heatmaps", "title": "Explora mapas de calor", "description": "Analiza comportamiento de clientes", "completed": false},
      {"id": "setup_locations", "title": "Configura múltiples ubicaciones", "description": "Gestiona todas tus sucursales", "completed": false},
      {"id": "request_api", "title": "Solicita acceso a API", "description": "Integra PromoClub con tus sistemas", "completed": false}
    ]'::jsonb;
  END IF;

  -- Insert FTE record
  INSERT INTO public.first_time_experience (
    user_id,
    business_id,
    subscription_plan,
    checklist_items,
    current_step,
    is_completed
  ) VALUES (
    p_user_id,
    p_business_id,
    p_subscription_plan,
    v_checklist,
    0,
    FALSE
  )
  RETURNING id INTO v_fte_id;

  RETURN v_fte_id;
END;
$$;

-- Function to update checklist item
CREATE OR REPLACE FUNCTION public.update_fte_checklist_item(
  p_user_id UUID,
  p_item_id TEXT,
  p_completed BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_checklist JSONB;
  v_completed_items JSONB;
  v_item JSONB;
BEGIN
  -- Get current checklist
  SELECT checklist_items, completed_items
  INTO v_checklist, v_completed_items
  FROM public.first_time_experience
  WHERE user_id = p_user_id;

  IF v_checklist IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update the specific item
  v_checklist := (
    SELECT jsonb_agg(
      CASE 
        WHEN item->>'id' = p_item_id THEN
          jsonb_set(item, '{completed}', to_jsonb(p_completed))
        ELSE
          item
      END
    )
    FROM jsonb_array_elements(v_checklist) AS item
  );

  -- Update completed_items array
  IF p_completed THEN
    IF v_completed_items IS NULL THEN
      v_completed_items := '[]'::jsonb;
    END IF;
    IF NOT v_completed_items ? p_item_id THEN
      v_completed_items := v_completed_items || jsonb_build_array(p_item_id);
    END IF;
  ELSE
    v_completed_items := (
      SELECT jsonb_agg(item)
      FROM jsonb_array_elements_text(v_completed_items) AS item
      WHERE item != p_item_id
    );
  END IF;

  -- Update the record
  UPDATE public.first_time_experience
  SET 
    checklist_items = v_checklist,
    completed_items = COALESCE(v_completed_items, '[]'::jsonb),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- =============================================
-- 6. COMMENTS
-- =============================================
COMMENT ON TABLE public.first_time_experience IS 'Tracks first-time user experience and onboarding progress';
COMMENT ON TABLE public.registration_email_templates IS 'Email templates for registration flow (OTP, welcome, plan confirmation, setup reminders)';
COMMENT ON FUNCTION public.initialize_first_time_experience IS 'Initializes first-time experience with plan-specific checklist';
COMMENT ON FUNCTION public.update_fte_checklist_item IS 'Updates completion status of a checklist item';