import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

const StaffOnboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staffInfo, setStaffInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const staffId = searchParams?.get('staff_id');

  useEffect(() => {
    if (!staffId) {
      navigate('/login');
      return;
    }
    fetchStaffInfo();
  }, [staffId]);

  const fetchStaffInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('staff_members')
        ?.select('*')
        ?.eq('id', staffId)
        ?.single();

      if (error) throw error;
      setStaffInfo(data);
    } catch (error) {
      console.error('Error fetching staff info:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    const roleConfig = {
      admin: {
        label: 'Administrador',
        color: 'purple',
        icon: 'Shield',
        description: 'Tienes acceso completo al sistema excepto gestión de personal. Puedes ver reportes, gestionar inventario, procesar ventas y reembolsos, y ajustar precios.',
        features: [
          { icon: 'BarChart3', title: 'Reportes Completos', description: 'Acceso a todos los análisis y reportes del negocio' },
          { icon: 'Package', title: 'Gestión de Inventario', description: 'Control total sobre productos y stock' },
          { icon: 'ShoppingCart', title: 'Ventas y Reembolsos', description: 'Procesar transacciones y devoluciones' },
          { icon: 'TrendingUp', title: 'Ajuste de Precios', description: 'Modificar precios de productos' }
        ],
        firstActions: [
          { icon: 'BarChart3', title: 'Revisar Dashboard', description: 'Familiarízate con las métricas principales', link: '/dashboard-overview' },
          { icon: 'Package', title: 'Verificar Inventario', description: 'Revisa el estado actual del stock', link: '/inventory-management' },
          { icon: 'Settings', title: 'Configurar Perfil', description: 'Completa tu información personal', link: '/profile' }
        ]
      },
      manager: {
        label: 'Gerente',
        color: 'blue',
        icon: 'Briefcase',
        description: 'Eres responsable de la gestión operativa y supervisión. Puedes ver reportes, gestionar inventario, procesar ventas y reembolsos, y abrir/cerrar caja.',
        features: [
          { icon: 'BarChart3', title: 'Reportes', description: 'Acceso a reportes operativos y análisis' },
          { icon: 'Package', title: 'Inventario', description: 'Gestión de productos y stock' },
          { icon: 'ShoppingCart', title: 'Ventas', description: 'Procesar ventas y reembolsos' },
          { icon: 'DollarSign', title: 'Caja', description: 'Abrir y cerrar caja registradora' }
        ],
        firstActions: [
          { icon: 'DollarSign', title: 'Abrir Caja', description: 'Inicia el turno abriendo la caja', link: '/point-of-sale' },
          { icon: 'Package', title: 'Revisar Inventario', description: 'Verifica alertas de stock bajo', link: '/inventory-management' },
          { icon: 'Users', title: 'Supervisar Personal', description: 'Revisa los turnos del equipo', link: '/staff-management' }
        ]
      },
      cashier: {
        label: 'Cajero',
        color: 'orange',
        icon: 'CreditCard',
        description: 'Tu rol principal es procesar ventas y manejar la caja. Puedes procesar transacciones, reembolsos, y abrir/cerrar caja.',
        features: [
          { icon: 'ShoppingCart', title: 'Procesar Ventas', description: 'Realizar transacciones de venta' },
          { icon: 'RefreshCw', title: 'Reembolsos', description: 'Procesar devoluciones de clientes' },
          { icon: 'DollarSign', title: 'Caja', description: 'Abrir y cerrar caja registradora' }
        ],
        firstActions: [
          { icon: 'DollarSign', title: 'Abrir Caja', description: 'Comienza tu turno abriendo la caja', link: '/point-of-sale' },
          { icon: 'ShoppingCart', title: 'Procesar Primera Venta', description: 'Familiarízate con el sistema POS', link: '/point-of-sale' },
          { icon: 'HelpCircle', title: 'Ver Ayuda', description: 'Consulta la guía de uso del sistema', link: '/settings' }
        ]
      },
      clerk: {
        label: 'Empleado',
        color: 'gray',
        icon: 'User',
        description: 'Tu rol se enfoca en operaciones básicas de ventas. Puedes procesar transacciones de venta.',
        features: [
          { icon: 'ShoppingCart', title: 'Procesar Ventas', description: 'Realizar transacciones de venta básicas' }
        ],
        firstActions: [
          { icon: 'ShoppingCart', title: 'Ir al POS', description: 'Accede al sistema de punto de venta', link: '/point-of-sale' },
          { icon: 'BookOpen', title: 'Ver Catálogo', description: 'Familiarízate con los productos', link: '/catalog-management' },
          { icon: 'User', title: 'Completar Perfil', description: 'Actualiza tu información personal', link: '/profile' }
        ]
      }
    };
    return roleConfig?.[role] || roleConfig?.clerk;
  };

  const handleCompleteOnboarding = async () => {
    try {
      const { error } = await supabase?.rpc('complete_staff_onboarding', {
        p_staff_id: staffId
      });

      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      navigate('/login');
    }
  };

  const handleActionClick = (link) => {
    handleCompleteOnboarding();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!staffInfo) {
    return null;
  }

  const roleInfo = getRoleInfo(staffInfo?.staff_role);
  const steps = [
    { title: 'Bienvenida', icon: 'Heart' },
    { title: 'Tu Rol', icon: roleInfo?.icon },
    { title: 'Características', icon: 'Star' },
    { title: 'Primeros Pasos', icon: 'Zap' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps?.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      index <= currentStep
                        ? 'bg-primary text-white' :'bg-white dark:bg-gray-800 text-muted-foreground border-2 border-border'
                    }`}
                  >
                    <Icon name={step?.icon} size={20} />
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">{step?.title}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <Icon name="Heart" size={40} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                ¡Bienvenido, {staffInfo?.full_name}!
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Estamos emocionados de tenerte en el equipo. Esta guía rápida te ayudará a familiarizarte con tu rol y comenzar a trabajar.
              </p>
              <div className="flex justify-center pt-4">
                <Button onClick={() => setCurrentStep(1)} size="lg" iconName="ArrowRight" iconPosition="right">
                  Comenzar
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Role Introduction */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-${roleInfo?.color}-100 dark:bg-${roleInfo?.color}-900/20 rounded-full mb-4`}>
                  <Icon name={roleInfo?.icon} size={40} className={`text-${roleInfo?.color}-600 dark:text-${roleInfo?.color}-400`} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Tu Rol: {roleInfo?.label}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{roleInfo?.description}</p>
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

          {/* Step 2: Key Features */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Características Clave</h2>
                <p className="text-muted-foreground">Estas son las funcionalidades disponibles para tu rol</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleInfo?.features?.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border"
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

          {/* Step 3: First Actions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                  <Icon name="Zap" size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Primeros Pasos Recomendados</h2>
                <p className="text-muted-foreground">Te sugerimos comenzar con estas acciones</p>
              </div>
              <div className="space-y-3">
                {roleInfo?.firstActions?.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name={action?.icon} size={20} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{action?.title}</h4>
                        <p className="text-xs text-muted-foreground">{action?.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActionClick(action?.link)}
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      Ir
                    </Button>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Puedes acceder a estas funciones en cualquier momento desde el menú principal. Si tienes dudas, contacta al administrador.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)} iconName="ArrowLeft">
                  Anterior
                </Button>
                <Button onClick={handleCompleteOnboarding} size="lg" iconName="CheckCircle" iconPosition="right">
                  Completar e Ir al Login
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            © 2024 PromoClub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffOnboarding;