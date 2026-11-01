import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import AutoRequestConfig from './components/AutoRequestConfig';
import IncentiveConfig from './components/IncentiveConfig';
import ManualRequests from './components/ManualRequests';
import RequestsStats from './components/RequestsStats';

const BRANCHES = [
  { id: 'centro', label: 'Sucursal Centro' },
  { id: 'norte', label: 'Sucursal Norte' },
  { id: 'sur', label: 'Sucursal Sur' },
  { id: 'poniente', label: 'Sucursal Poniente' },
];

const ReviewRequestsManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('centro');

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  const currentBranch = BRANCHES?.find(b => b?.id === selectedBranch);

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

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 mt-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Solicitar Reseñas
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configura cómo y cuándo solicitar reseñas a tus clientes por sucursal
              </p>
            </div>

            {/* Branch Selector */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
              <Icon name="MapPin" size={16} className="text-primary shrink-0" />
              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e?.target?.value)}
                className="text-sm font-medium text-foreground bg-transparent focus:outline-none cursor-pointer pr-2"
              >
                {BRANCHES?.map(b => (
                  <option key={b?.id} value={b?.id}>{b?.label}</option>
                ))}
              </select>
              <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
            </div>
          </div>

          {/* Branch badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
              <Icon name="MapPin" size={12} />
              Configurando: {currentBranch?.label}
            </span>
            <span className="text-xs text-muted-foreground">Los cambios aplican únicamente a esta sucursal</span>
          </div>

          {/* Content */}
          <div className="space-y-0">
            <AutoRequestConfig branch={selectedBranch} />
            <IncentiveConfig branch={selectedBranch} />
            <ManualRequests branch={selectedBranch} />
            <RequestsStats branch={selectedBranch} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewRequestsManagement;
