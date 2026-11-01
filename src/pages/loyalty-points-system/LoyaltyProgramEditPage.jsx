import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ConfiguracionTab from './components/ConfiguracionTab';
import ParametrizacionValorPunto from './components/ParametrizacionValorPunto';
import EstablecimientosTab from './components/EstablecimientosTab';

const CONFIG_SUB_TABS = [
  { id: 'rules', label: 'Reglas de acumulación', icon: 'Star' },
  { id: 'parametrizacion', label: 'Planificador de Costos', icon: 'BarChart3' },
  { id: 'establecimientos', label: 'Establecimientos', icon: 'MapPin' },
];

const LoyaltyProgramEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialSubTab = location?.state?.subTab || 'rules';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeConfigSubTab, setActiveConfigSubTab] = useState(initialSubTab);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  const mainClasses = `pt-16 transition-all duration-500 ease-in-out relative z-10 ${
    isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
  }`;

  const handleSaveParametrizacion = (data) => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
      <main className={mainClasses}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button
              onClick={() => navigate('/loyalty-points-system')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Puntos de Lealtad
            </button>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
            <span className="text-foreground font-medium">Configurar Programa</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurar Programa de Puntos</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Ajusta las reglas de acumulación, valor del punto y establecimientos participantes
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Icon name="CheckCircle" size={14} className="text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">Guardado correctamente</span>
                </div>
              )}
              <Button variant="outline" onClick={() => navigate('/loyalty-points-system')}>
                Cancelar
              </Button>
            </div>
          </div>

          {/* Config sub-tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {CONFIG_SUB_TABS?.map(sub => (
              <button
                key={sub?.id}
                onClick={() => setActiveConfigSubTab(sub?.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  activeConfigSubTab === sub?.id
                    ? 'bg-primary text-white border-primary' :'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <Icon name={sub?.icon} size={14} />
                {sub?.label}
              </button>
            ))}
          </div>

          {/* Sub-tab content */}
          <div className="pb-12">
            {activeConfigSubTab === 'rules' && (
              <ConfiguracionTab cheapestReward={100} />
            )}
            {activeConfigSubTab === 'parametrizacion' && (
              <ParametrizacionValorPunto onSave={handleSaveParametrizacion} />
            )}
            {activeConfigSubTab === 'establecimientos' && (
              <EstablecimientosTab />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoyaltyProgramEditPage;
