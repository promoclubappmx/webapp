import React from 'react';
import Icon from '../../../components/AppIcon';

const POSSidebar = ({ activeView, onViewChange, cashRegisterSession }) => {
  const isOpen = cashRegisterSession?.status === 'open';

  const navItems = [
    {
      id: 'pos',
      label: 'Terminales PDV',
      icon: 'Monitor',
      description: isOpen ? 'Caja Abierta' : 'Caja Cerrada',
      statusColor: isOpen ? 'text-emerald-500' : 'text-rose-500',
      statusDot: isOpen ? 'bg-emerald-500' : 'bg-rose-500',
    },
    {
      id: 'history',
      label: 'Historial',
      icon: 'ClipboardList',
      description: 'Transacciones del día',
    },
    {
      id: 'metrics',
      label: 'Métricas',
      icon: 'BarChart3',
      description: 'Análisis de ventas',
    },
  ];

  return (
    <aside className="w-56 shrink-0 bg-card border-r border-border flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems?.map((item) => {
          const isActive = activeView === item?.id;
          return (
            <button
              key={item?.id}
              onClick={() => onViewChange(item?.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                isActive ? 'bg-white/20' : 'bg-muted group-hover:bg-background'
              }`}>
                <Icon name={item?.icon} size={14} className={isActive ? 'text-primary-foreground' : ''} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium leading-tight ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {item?.label}
                </p>
                {item?.description && item?.id === 'pos' ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white/70' : item?.statusDot}`} />
                    <span className={`text-xs truncate ${isActive ? 'text-primary-foreground/70' : item?.statusColor}`}>
                      {item?.description}
                    </span>
                  </div>
                ) : item?.description ? (
                  <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {item?.description}
                  </p>
                ) : null}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Cash Register Status Footer */}
      <div className="px-3 py-3 border-t border-border">
        <div className={`rounded-lg p-2.5 ${isOpen ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className={`text-xs font-semibold ${isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
            </span>
          </div>
          {isOpen && cashRegisterSession?.openedAt && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Desde {new Date(cashRegisterSession.openedAt)?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default POSSidebar;
