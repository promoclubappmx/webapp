import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import CurrencySettings from './components/CurrencySettings';
import RegionalSettings from './components/RegionalSettings';
import NotificationSettings from './components/NotificationSettings';
import IntegrationsSettings from './components/IntegrationsSettings';
import TaxSettings from './components/TaxSettings';
import ShippingSettings from './components/ShippingSettings';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user: authUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('currency');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const user = userProfile || authUser || { name: 'Usuario', role: 'owner' };

  const tabs = [
    {
      id: 'currency',
      label: 'Moneda y Precios',
      icon: 'DollarSign',
      description: 'Moneda, formato de números y precios',
      component: CurrencySettings
    },
    {
      id: 'tax',
      label: 'Impuestos (IVA)',
      icon: 'Receipt',
      description: 'Tasas de IVA y reglas de cálculo',
      component: TaxSettings
    },
    {
      id: 'shipping',
      label: 'Envío',
      icon: 'Truck',
      description: 'Zonas y tarifas de envío',
      component: ShippingSettings
    },
    {
      id: 'regional',
      label: 'Regional',
      icon: 'Globe',
      description: 'Zona horaria, idioma y formatos',
      component: RegionalSettings
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: 'Bell',
      description: 'Email, push y SMS',
      component: NotificationSettings
    },
    {
      id: 'integrations',
      label: 'Integraciones',
      icon: 'Link',
      description: 'Servicios y plataformas externas',
      component: IntegrationsSettings
    }
  ];

  const ActiveComponent = tabs?.find(tab => tab?.id === activeTab)?.component;
  const activeTabInfo = tabs?.find(tab => tab?.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
              <p className="text-muted-foreground">Administra la configuración de tu cuenta y preferencias</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Lateral Menu */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-card rounded-lg border border-border p-4 sticky top-20">
                  <nav className="space-y-1">
                    {tabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                          activeTab === tab?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon name={tab?.icon} size={20} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{tab?.label}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 min-w-0">
                <div className="bg-card rounded-lg border border-border">
                  {/* Tab Header */}
                  <div className="px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name={activeTabInfo?.icon || 'Settings'} size={20} className="text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">{activeTabInfo?.label}</h2>
                        <p className="text-sm text-muted-foreground">{activeTabInfo?.description}</p>
                      </div>
                    </div>
                  </div>
                  {/* Tab Content */}
                  <div className="p-6">
                    {ActiveComponent && <ActiveComponent />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;