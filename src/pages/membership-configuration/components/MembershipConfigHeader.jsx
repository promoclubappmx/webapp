import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MembershipConfigHeader = ({ program, onToggleStatus, subscriberCount = 47 }) => {
  const [showPauseModal, setShowPauseModal] = useState(false);

  const statusConfig = {
    active: { label: 'Activa', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    draft: { label: 'Borrador', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    paused: { label: 'Pausada', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  };

  const status = program?.status || 'draft';
  const cfg = statusConfig?.[status] || statusConfig?.draft;
  const isActive = status === 'active';

  const handleToggle = () => {
    if (isActive) {
      setShowPauseModal(true);
    } else {
      onToggleStatus?.('active');
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Mi Membresía
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura y gestiona tu programa de membresía para clientes fieles.
          </p>
        </div>

        {program && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg?.bg} ${cfg?.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot}`} />
              {cfg?.label}
            </span>

            {/* Subscribers badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              <Icon name="Users" size={12} />
              {subscriberCount} suscriptores activos
            </span>

            {/* Toggle */}
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 ${isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 border-border'}`}>
              <span className="text-sm font-medium text-foreground">
                {isActive ? 'Activa' : 'Pausada'}
              </span>
              <button
                onClick={handleToggle}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isActive ? 'bg-emerald-500 focus:ring-emerald-400' : 'bg-slate-300 focus:ring-slate-400'}`}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                  style={{ left: isActive ? '22px' : '2px' }}
                />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Pause confirmation modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Icon name="PauseCircle" size={24} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">¿Pausar membresía?</h3>
                <p className="text-sm text-muted-foreground">Esta acción afecta nuevas suscripciones</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Los suscriptores actuales <strong>mantienen su acceso</strong> hasta el fin de su período vigente.
              No se aceptarán nuevas suscripciones mientras la membresía esté pausada.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { onToggleStatus?.('paused'); setShowPauseModal(false); }}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 transition-colors"
              >
                Sí, pausar
              </button>
              <button
                onClick={() => setShowPauseModal(false)}
                className="flex-1 py-2.5 border border-border rounded-xl font-medium text-sm hover:bg-muted/50 transition-colors text-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MembershipConfigHeader;
