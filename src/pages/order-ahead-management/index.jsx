import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import ConfiguracionTab from './components/ConfiguracionTab';
import PedidosEnVivoTab from './components/PedidosEnVivoTab';
import DestacadosUpsellTab from './components/DestacadosUpsellTab';

const TABS = [
  { id: 'config', label: 'Configuración', icon: 'Settings2' },
  { id: 'live', label: 'Pedidos en Vivo', icon: 'LayoutKanban' },
  { id: 'featured', label: 'Destacados & Upsell', icon: 'Crown', premium: true },
];

const OrderAheadManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'config': return <ConfiguracionTab hasCatalogItems={true} onOpenAdjustment={() => {}} />;
      case 'live': return <PedidosEnVivoTab />;
      case 'featured': return <DestacadosUpsellTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}
        style={{ transitionProperty: 'margin-left', transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="p-6">

          {/* Page header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon name="ShoppingBag" size={20} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Order Ahead</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Permite a tus clientes explorar tu catálogo, seleccionar productos y programar su retiro con anticipación.
              </p>
            </div>
          </div>

          {/* Tabs — underline border-b-2 style matching /loyalty-points-system */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-1 overflow-x-auto">
              {TABS?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                  {tab?.premium && (
                    <span className="ml-1 px-1.5 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">
                      PREMIUM
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div className="pb-12">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderAheadManagement;
