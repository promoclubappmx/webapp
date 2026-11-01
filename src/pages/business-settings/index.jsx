import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';

import BusinessProfileTab from './components/BusinessProfileTab';
import ShippingTab from './components/ShippingTab';
import IntegrationsTab from './components/IntegrationsTab';
import RegionalTab from './components/RegionalTab';
import BrandTab from './components/BrandTab';
import VerificationTab from './components/VerificationTab';

const BusinessSettings = () => {
  const { user: authUser } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('business');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params?.get('tab');
    if (tab) setActiveTab(tab);
  }, [location?.search]);

  const tabs = [
    { id: 'business', label: 'Perfil de Negocio', icon: 'Building', description: 'Nombre, categoría, contacto y logo' },
    { id: 'marca', label: 'Marca', icon: 'Palette', description: 'Colores, fuentes e identidad visual' },
    { id: 'verificacion', label: 'Verificación', icon: 'ShieldCheck', description: 'Verificación del negocio y documentos' },
    { id: 'shipping', label: 'Envío', icon: 'Truck', description: 'Zonas y tarifas de envío' },
    { id: 'integrations', label: 'Integraciones', icon: 'Link', description: 'Servicios y plataformas externas' },
    { id: 'regional', label: 'Regional', icon: 'Globe', description: 'Moneda, zona horaria, idioma y formatos' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'business': return <BusinessProfileTab />;
      case 'shipping': return <ShippingTab />;
      case 'integrations': return <IntegrationsTab />;
      case 'regional': return <RegionalTab />;
      case 'marca': return <BrandTab />;
      case 'verificacion': return <VerificationTab />;
      default: return <BusinessProfileTab />;
    }
  };

  const activeTabInfo = tabs?.find(t => t?.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={authUser}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={authUser}
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Configuración del Negocio</h1>
              <p className="text-muted-foreground">Gestiona todos los aspectos de tu negocio</p>
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
                    {renderContent()}
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

export default BusinessSettings;