import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { supabase } from '../../lib/supabase';

const Sidebar = ({ isOpen = false, onClose, user }) => {
  const [businessSettings, setBusinessSettings] = useState(null);

  useEffect(() => {
    const loadBusinessSettings = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase?.from('business_settings')?.select('business_name, business_logo_url, logo_negocio, categoria_nombre')?.eq('owner_id', user?.id)?.maybeSingle();
        if (!error && data) setBusinessSettings(data);
      } catch (err) {
        // silently handle
      }
    };
    loadBusinessSettings();
  }, [user?.id]);

  const menuItems = [
    { 
      label: 'Panel de Control', 
      icon: 'LayoutDashboard', 
      path: '/dashboard-overview',
      roles: ['owner', 'admin', 'staff']
    },
    {
      label: 'Mi Negocio',
      icon: 'Settings',
      roles: ['owner', 'admin'],
      children: [
        {
          label: 'Establecimientos',
          path: '/establishments-portfolio',
          icon: 'Building',
          roles: ['owner', 'admin']
        },
        {
          label: 'Personal',
          path: '/staff-management',
          icon: 'Users',
          roles: ['owner', 'admin', 'manager']
        },
        {
          label: 'Ajustes y herramientas',
          path: '/business-settings',
          icon: 'Building2',
          roles: ['owner', 'admin']
        },
        {
          label: 'Planes y Facturación',
          path: '/planes-facturacion',
          icon: 'CreditCard',
          roles: ['owner', 'admin']
        },
        {
          label: 'Centro de notificaciones',
          path: '/notifications',
          icon: 'Bell',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Catálogo',
          icon: 'Layers',
          roles: ['owner', 'admin', 'staff'],
          children: [
            {
              label: 'Productos y Servicios',
              path: '/catalog-management',
              icon: 'ShoppingBag',
              roles: ['owner', 'admin', 'staff']
            },
            {
              label: 'Inventario',
              path: '/inventory-management',
              icon: 'Package',
              roles: ['owner', 'admin', 'staff']
            },
            {
              label: 'Transferencias',
              path: '/inventory-transfers',
              icon: 'ArrowLeftRight',
              roles: ['owner', 'admin']
            },
            {
              label: 'Ajustes',
              icon: 'Settings2',
              path: '/catalog-settings',
              roles: ['owner', 'admin']
            }
          ]
        }
      ]
    },
    {
      label: 'Compras',
      icon: 'ShoppingBag',
      roles: ['owner', 'admin'],
      children: [
        {
          label: 'Proveedores',
          path: '/suppliers',
          icon: 'Truck',
          roles: ['owner', 'admin']
        },
        {
          label: 'Pedidos de Compra',
          path: '/purchase-orders',
          icon: 'ShoppingCart',
          roles: ['owner', 'admin']
        },
        {
          label: 'Recepción de Mercancía',
          path: '/goods-receipt',
          icon: 'PackageCheck',
          roles: ['owner', 'admin']
        }
      ]
    },
    {
      label: 'Ventas y Canje',
      icon: 'Store',
      roles: ['owner', 'admin', 'manager', 'cashier', 'staff'],
      children: [
        {
          label: 'Punto de Venta',
          path: '/point-of-sale',
          icon: 'ShoppingCart',
          roles: ['owner', 'admin', 'manager', 'cashier']
        },
        {
          label: 'CRM',
          icon: 'UserCircle2',
          path: '/crm-clients-list',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Validaciones Manuales',
          icon: 'ScanLine',
          path: '/manual-validations',
          roles: ['owner', 'admin', 'manager', 'cashier', 'staff']
        }
      ]
    },
    {
      label: 'Fidelización',
      icon: 'Users',
      roles: ['owner', 'admin', 'staff'],
      children: [
        {
          label: 'Automatización',
          icon: 'Zap',
          path: '/engagement-automation'
        },
        {
          label: 'Efectividad de Automatización',
          icon: 'BarChart3',
          path: '/automation-effectiveness-dashboard'
        },
        {
          label: 'Cupones',
          path: '/coupons-management',
          icon: 'Ticket',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Puntos de Lealtad',
          icon: 'Star',
          path: '/loyalty-points-system',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Recompensas',
          path: '/loyalty-points-system/catalogo',
          icon: 'Gift',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Tarjetas de Sellos',
          path: '/punch-cards-management',
          icon: 'CreditCard',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Check-in',
          icon: 'ScanLine',
          path: '/check-in-module',
          roles: ['owner', 'admin', 'manager', 'cashier', 'staff']
        }
      ]
    },
    {
      label: 'Marketing y Campañas',
      icon: 'Megaphone',
      roles: ['owner', 'admin', 'staff'],
      children: [
        {
          label: 'Campañas',
          path: '/campaigns-management',
          icon: 'Send',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Calendario de Actividades',
          path: '/marketing-calendar',
          icon: 'CalendarDays',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Promociones',
          path: '/promotions-management',
          icon: 'Tag',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Audiencias',
          path: '/audience-builder',
          icon: 'Users',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Flujos de Automatización',
          path: '/automation-flows-dashboard',
          icon: 'Workflow',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Geofencing',
          icon: 'MapPin',
          path: '/geofencing',
          roles: ['owner', 'admin', 'staff']
        }
      ]
    },
    {
      label: 'Feedback',
      icon: 'MessageCircle',
      roles: ['owner', 'admin', 'staff'],
      children: [
        {
          label: 'Reseñas',
          icon: 'Star',
          roles: ['owner', 'admin', 'staff'],
          isSubGroup: true,
          children: [
            {
              label: 'Gestionar Reseñas',
              path: '/reviews-management',
              icon: 'Star',
              roles: ['owner', 'admin', 'staff']
            },
            {
              label: 'Solicitar Reseñas',
              path: '/review-requests-management',
              icon: 'Send',
              roles: ['owner', 'admin', 'staff']
            }
          ]
        },
        {
          label: 'Encuestas',
          icon: 'FileText',
          roles: ['owner', 'admin', 'staff'],
          isSubGroup: true,
          children: [
            {
              label: 'NPS',
              path: '/nps-management',
              icon: 'TrendingUp',
              roles: ['owner', 'admin', 'staff']
            },
            {
              label: 'Mis Encuestas',
              path: '/surveys-management',
              icon: 'FileText',
              roles: ['owner', 'admin', 'staff']
            },
            {
              label: 'Benchmark',
              path: '/surveys-benchmark',
              icon: 'BarChart2',
              roles: ['owner', 'admin', 'staff']
            }
          ]
        }
      ]
    },
    {
      label: 'Gamificación',
      icon: 'Trophy',
      roles: ['owner', 'admin', 'staff'],
      children: [
        {
          label: 'Sorpresas',
          path: '/surprises-management',
          icon: 'Gift',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Niveles VIP',
          path: '/vip-levels-management',
          icon: 'Crown',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Rachas de Visitas',
          path: '/visit-streaks-management',
          icon: 'Flame',
          roles: ['owner', 'admin', 'staff']
        },
        {
          label: 'Logros',
          path: '/achievements-management',
          icon: 'Trophy',
          roles: ['owner', 'admin', 'staff']
        }
      ]
    },
    {
      label: 'Analíticas',
      path: '/analytics',
      icon: 'BarChart3',
      roles: ['owner', 'admin']
    }
  ];

  const [expandedGroups, setExpandedGroups] = React.useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentPath = window.location?.pathname;

  const toggleGroup = (label) => {
    setExpandedGroups(prev =>
      prev?.includes(label)
        ? prev?.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const hasAccess = (roles) => {
    if (!user?.role) return true;
    return roles?.includes(user?.role);
  };

  const isActive = (path) => {
    return currentPath === path;
  };

  const isGroupActive = (children) => {
    return children?.some(child => {
      if (child?.children) return isGroupActive(child?.children);
      return isActive(child?.path);
    });
  };

  // Uniform item styles — same font size and padding for all levels
  const baseItemClass = "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 mb-0.5";
  const inactiveGroupClass = "text-gray-700 hover:text-gray-900 hover:bg-gray-100";
  const activeGroupClass = "bg-primary/10 text-primary";
  const inactiveLinkClass = "text-gray-700 hover:text-gray-900 hover:bg-gray-100";
  const activeLinkClass = "bg-primary text-white shadow-sm";

  const renderNavigationItem = (item, isChild = false, depth = 0) => {
    if (!hasAccess(item?.roles)) return null;

    if (item?.children) {
      const isExpanded = expandedGroups?.includes(item?.label);
      const isGroupHighlighted = isGroupActive(item?.children);

      return (
        <div key={item?.label} className="mb-0.5">
          <button
            onClick={() => toggleGroup(item?.label)}
            className={`${baseItemClass} ${isGroupHighlighted ? activeGroupClass : inactiveGroupClass}`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`flex-shrink-0 ${isGroupHighlighted ? 'text-primary' : 'text-gray-500'}`}>
                <Icon name={item?.icon} size={18} />
              </span>
              <span className="text-left leading-tight">{item?.label}</span>
            </div>
            <Icon
              name="ChevronDown"
              size={14}
              className={`flex-shrink-0 transition-transform duration-300 text-gray-400 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
          {isExpanded && (
            <div
              className="mt-1 space-y-0.5 animate-fadeIn"
              style={{
                marginLeft: '8px',
                borderLeft: '2px solid #e2e8f0',
                paddingLeft: '8px',
                paddingTop: '4px',
                paddingBottom: '4px',
                background: '#F8F9FA',
                borderRadius: '0 6px 6px 0'
              }}
            >
              {item?.children?.map(child => renderNavigationItem(child, true, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <a
        key={item?.label}
        href={item?.path}
        className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 mb-0.5 ${
          isActive(item?.path) ? activeLinkClass : inactiveLinkClass
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`flex-shrink-0 ${isActive(item?.path) ? 'text-white' : 'text-gray-500'}`}>
            <Icon name={item?.icon} size={18} />
          </span>
          <span>{item?.label}</span>
        </div>
        {item?.badge && (
          <span className="bg-destructive text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            {item?.badge}
          </span>
        )}
      </a>
    );
  };

  // Role label mapping
  const roleLabels = {
    owner: 'Propietario',
    admin: 'Administrador',
    manager: 'Gerente',
    cashier: 'Cajero',
    staff: 'Personal',
  };

  const displayName = user?.full_name || user?.name || 'Usuario';
  const displayRole = roleLabels?.[user?.role] || user?.role || 'Propietario';
  const businessName = businessSettings?.business_name || user?.business_name || '';
  const businessLogo = businessSettings?.logo_negocio || businessSettings?.business_logo_url || '';
  const businessInitials = businessName
    ? businessName?.split(' ')?.map(w => w?.[0])?.slice(0, 2)?.join('')?.toUpperCase()
    : '?';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#ffffff', borderRight: '1px solid #e5e7eb', boxShadow: '2px 0 12px rgba(0,0,0,0.08)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e5e7eb', background: '#ffffff' }}>
            <div className="flex items-center justify-center flex-1">
              <img 
                src="/assets/images/promoclublogo-1771730627166.png"
                alt="Logo" 
                className="w-44 h-auto object-contain mx-auto"
                onError={(e) => { e.target.src = '/assets/images/promoclublogo-1771626537370.png'; }}
              />
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
            <div className="space-y-0.5">
              {menuItems?.map(item => renderNavigationItem(item))}
            </div>
          </nav>

          {/* User & Business Info — unified block */}
          <div className="px-4 py-4" style={{ borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <div className="flex items-center gap-3">
              {/* Business avatar icon */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-primary/10 ring-2 ring-primary/20">
                {businessLogo ? (
                  <img
                    src={businessLogo}
                    alt={businessName || 'Negocio'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <span
                  className="text-base font-bold text-primary"
                  style={{ display: businessLogo ? 'none' : 'flex' }}
                >
                  {businessInitials}
                </span>
              </div>
              {/* Text info */}
              <div className="flex-1 min-w-0">
                {businessName && (
                  <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                    {businessName}
                  </p>
                )}
                <p className="text-xs font-medium text-gray-600 truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 truncate leading-tight">
                  {displayRole}
                </p>
                <button
                  onClick={async () => { await supabase?.auth?.signOut(); window.location.href = '/login'; }}
                  className="mt-1.5 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors duration-150 font-medium"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;