import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingChecklistStatus from './components/OnboardingChecklistStatus';
import NextActionsPanel from './components/NextActionsPanel';

const FirstTimeExperience = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fteData, setFteData] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Wait a moment for auth session to settle after registration redirect
    const timer = setTimeout(() => {
      loadFTEData();
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  const loadFTEData = async () => {
    try {
      setLoading(true);

      // Get current user from supabase directly in case useAuth hasn't updated yet
      const { data: { user: currentUser } } = await supabase?.auth?.getUser();
      const activeUser = currentUser || user;

      if (!activeUser) {
        // Not logged in, redirect to login
        navigate('/login');
        return;
      }

      // Load business settings
      const { data: business } = await supabase
        ?.from('business_settings')
        ?.select('*')
        ?.eq('owner_id', activeUser?.id)
        ?.single();

      if (business) {
        setBusinessData(business);
      }

      // Try to load FTE record — ignore errors if table doesn't exist
      try {
        let { data: fte, error: fteError } = await supabase
          ?.from('first_time_experience')
          ?.select('*')
          ?.eq('user_id', activeUser?.id)
          ?.single();

        if (fteError && fteError?.code === 'PGRST116' && business) {
          // Record not found — try to create via RPC
          try {
            await supabase?.rpc('initialize_first_time_experience', {
              p_user_id: activeUser?.id,
              p_business_id: business?.business_id,
              p_subscription_plan: business?.subscription_plan || 'free'
            });

            const { data: fetchedFte } = await supabase
              ?.from('first_time_experience')
              ?.select('*')
              ?.eq('user_id', activeUser?.id)
              ?.single();

            if (fetchedFte) fte = fetchedFte;
          } catch {
            // RPC doesn't exist — continue without FTE data
          }
        }

        if (fte) setFteData(fte);
      } catch {
        // first_time_experience table may not exist — continue without it
      }
    } catch (error) {
      console.error('Error loading FTE data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanInfo = (plan) => {
    const planConfig = {
      free: {
        name: 'Free',
        price: '$0',
        color: 'muted',
        icon: 'Package',
        features: [
          { icon: 'FileText', title: 'Perfil de negocio básico', description: 'Crea tu ficha digital' },
          { icon: 'Package', title: 'Hasta 10 productos', description: 'Gestiona tu catálogo inicial' },
          { icon: 'BarChart3', title: 'Estadísticas básicas', description: 'Monitorea tu desempeño' },
          { icon: 'Mail', title: 'Soporte por email', description: 'Estamos aquí para ayudarte' }
        ],
        nextSteps: [
          { icon: 'FileText', title: 'Completa tu perfil', description: 'Agrega descripción y datos de contacto', link: '/business-settings' },
          { icon: 'Package', title: 'Agrega productos', description: 'Sube tus primeros 10 productos', link: '/catalog-management' },
          { icon: 'Clock', title: 'Configura horarios', description: 'Define tu horario de atención', link: '/business-settings' }
        ]
      },
      pro: {
        name: 'Pro',
        price: '$499 MXN/mes',
        color: 'primary',
        icon: 'Zap',
        features: [
          { icon: 'Package', title: 'Productos ilimitados', description: 'Sin límites en tu catálogo' },
          { icon: 'Megaphone', title: 'Sistema de promociones', description: 'Crea campañas personalizadas' },
          { icon: 'Star', title: 'Programa de puntos', description: 'Fideliza a tus clientes' },
          { icon: 'Ticket', title: 'Cupones y descuentos', description: 'Atrae más ventas' },
          { icon: 'BarChart3', title: 'Estadísticas avanzadas', description: 'Análisis detallados' },
          { icon: 'Headphones', title: 'Soporte prioritario', description: 'Respuesta rápida' }
        ],
        nextSteps: [
          { icon: 'Megaphone', title: 'Crea tu primera promoción', description: 'Atrae clientes con ofertas', link: '/promotions-management' },
          { icon: 'Star', title: 'Configura programa de puntos', description: 'Define cómo ganan puntos', link: '/loyalty-points-system' },
          { icon: 'Ticket', title: 'Genera cupones', description: 'Crea cupones de descuento', link: '/coupons-management' },
          { icon: 'Package', title: 'Agrega productos', description: 'Sube tu catálogo completo', link: '/catalog-management' }
        ]
      },
      premium: {
        name: 'Premium',
        price: '$1,299 MXN/mes',
        color: 'secondary',
        icon: 'Crown',
        features: [
          { icon: 'MapPin', title: 'Geofencing', description: 'Notificaciones por ubicación' },
          { icon: 'TrendingUp', title: 'Boosts de visibilidad', description: 'Destaca tu negocio' },
          { icon: 'Map', title: 'Mapas de calor', description: 'Analiza comportamiento de clientes' },
          { icon: 'Activity', title: 'Análisis predictivo', description: 'Anticipa tendencias' },
          { icon: 'Building', title: 'Múltiples ubicaciones', description: 'Gestiona sucursales' },
          { icon: 'Code', title: 'API personalizada', description: 'Integraciones avanzadas' },
          { icon: 'Clock', title: 'Soporte 24/7', description: 'Asistencia inmediata' }
        ],
        nextSteps: [
          { icon: 'MapPin', title: 'Configura geofencing', description: 'Define zonas de notificación', link: '/business-settings' },
          { icon: 'TrendingUp', title: 'Activa boosts', description: 'Aumenta tu visibilidad', link: '/dashboard-overview' },
          { icon: 'Map', title: 'Explora mapas de calor', description: 'Analiza tus clientes', link: '/analytics-and-reports' },
          { icon: 'Building', title: 'Agrega ubicaciones', description: 'Gestiona múltiples sucursales', link: '/multi-location' }
        ]
      }
    };
    return planConfig?.[plan] || planConfig?.free;
  };

  const handleChecklistToggle = async (itemId) => {
    const checklist = fteData?.checklist_items || [];
    const item = checklist?.find(i => i?.id === itemId);
    const newStatus = !item?.completed;

    try {
      const { error } = await supabase
        ?.rpc('update_fte_checklist_item', {
          p_user_id: user?.id,
          p_item_id: itemId,
          p_completed: newStatus
        });

      if (error) throw error;
      await loadFTEData();
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      if (fteData) {
        await supabase
          ?.from('first_time_experience')
          ?.update({
            is_completed: true,
            completed_at: new Date()?.toISOString(),
            updated_at: new Date()?.toISOString()
          })
          ?.eq('user_id', user?.id);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      navigate('/dashboard-overview');
    }
  };

  const handleActionClick = (link) => {
    navigate(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use available data or fallback values — never block rendering
  const planInfo = getPlanInfo(businessData?.subscription_plan || 'free');
  const checklist = fteData?.checklist_items || [];
  const completedItems = fteData?.completed_items || [];
  const progressPercentage = checklist?.length > 0
    ? Math.round((completedItems?.length / checklist?.length) * 100)
    : 0;

  const userName = userProfile?.first_name || user?.user_metadata?.full_name?.split(' ')?.[0] || 'Emprendedor';
  const businessName = businessData?.business_name || 'tu negocio';

  const steps = [
    { title: 'Bienvenida', icon: 'Heart' },
    { title: 'Tu Plan', icon: planInfo?.icon },
    { title: 'Características', icon: 'Star' },
    { title: 'Primeros Pasos', icon: 'Rocket' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps?.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      index <= currentStep
                        ? 'bg-primary text-white' : 'bg-white text-muted-foreground border-2 border-border'
                    }`}
                  >
                    <Icon name={step?.icon} size={20} />
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 hidden sm:block">{step?.title}</span>
                </div>
                {index < steps?.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      index < currentStep ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <Icon name="Heart" size={40} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                ¡Bienvenido a PromoClub, {userName}!
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {businessData
                  ? <>Tu negocio <strong>{businessName}</strong> ha sido registrado exitosamente.</>
                  : 'Tu cuenta ha sido creada exitosamente.'
                }{' '}
                Esta guía rápida te ayudará a aprovechar al máximo tu cuenta.
              </p>
              <div className="flex justify-center pt-4">
                <Button onClick={() => setCurrentStep(1)} size="lg" iconName="ArrowRight" iconPosition="right">
                  Comenzar
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Plan Overview */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-${planInfo?.color}/10 rounded-full mb-4`}>
                  <Icon name={planInfo?.icon} size={40} className={`text-${planInfo?.color}`} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Tu Plan: {planInfo?.name}</h2>
                <p className="text-lg text-primary font-semibold">{planInfo?.price}</p>
                <p className="text-muted-foreground mt-2">Has seleccionado el plan perfecto para tu negocio</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Resumen de tu Negocio</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Negocio:</span>
                    <span className="text-sm font-medium text-foreground">{businessData?.business_name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Categoría:</span>
                    <span className="text-sm font-medium text-foreground capitalize">{businessData?.categoria_nombre || businessData?.categoria || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ubicación:</span>
                    <span className="text-sm font-medium text-foreground">
                      {[businessData?.business_city, businessData?.business_state]?.filter(Boolean)?.join(', ') || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Plan:</span>
                    <span className="text-sm font-medium text-primary">{planInfo?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(0)} iconName="ArrowLeft">
                  Anterior
                </Button>
                <Button onClick={() => setCurrentStep(2)} iconName="ArrowRight" iconPosition="right">
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Características de tu Plan {planInfo?.name}</h2>
                <p className="text-muted-foreground">Estas son las funcionalidades disponibles para ti</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planInfo?.features?.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-all"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={feature?.icon} size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">{feature?.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature?.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {(businessData?.subscription_plan === 'free' || !businessData) && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Sparkles" size={20} className="text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        ¿Quieres más funcionalidades?
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Actualiza a Plan Pro o Premium para desbloquear promociones, programa de puntos, cupones, geofencing y mucho más.
                      </p>
                      <Button size="sm" variant="default" onClick={() => navigate('/business-settings')}>
                        Ver Planes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)} iconName="ArrowLeft">
                  Anterior
                </Button>
                <Button onClick={() => setCurrentStep(3)} iconName="ArrowRight" iconPosition="right">
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Next Steps & Checklist */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Primeros Pasos</h2>
                <p className="text-muted-foreground">Completa estos pasos para comenzar a usar PromoClub</p>
              </div>

              {checklist?.length > 0 ? (
                <>
                  <OnboardingChecklistStatus
                    checklist={checklist}
                    completedItems={completedItems}
                    onToggleItem={handleChecklistToggle}
                  />
                  <NextActionsPanel
                    checklist={checklist}
                    planInfo={planInfo}
                  />
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planInfo?.nextSteps?.map((step, index) => (
                    <div
                      key={index}
                      onClick={() => handleActionClick(step?.link)}
                      className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name={step?.icon} size={20} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">{step?.title}</h4>
                        <p className="text-xs text-muted-foreground">{step?.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)} iconName="ArrowLeft">
                  Anterior
                </Button>
                <Button onClick={handleCompleteOnboarding} iconName="Check" iconPosition="right">
                  Completar y Comenzar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Skip Button */}
        {currentStep < 3 && (
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCompleteOnboarding}
              className="text-muted-foreground"
            >
              Saltar introducción
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirstTimeExperience;