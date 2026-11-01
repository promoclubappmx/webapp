import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const PLAN_STYLES = {
  FREE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  PRO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  PREMIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-500',
};

const STATUS_CONFIG = {
  published: { label: '✅ Publicado', color: 'text-emerald-600 dark:text-emerald-400' },
  setup: { label: '⚙️ En configuración', color: 'text-amber-600 dark:text-amber-400' },
  paused: { label: '⏸ Pausado', color: 'text-gray-500' },
  expired: { label: '⚠️ Plan vencido', color: 'text-red-500' },
};

const ThreeDotsMenu = ({ establishment, onClose }) => {
  const navigate = useNavigate();
  const [deleteStep, setDeleteStep] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef?.current && !menuRef?.current?.contains(e?.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const options = [
    { label: 'Editar ficha rápida', icon: 'Edit3', action: () => { navigate('/business-listings-management'); onClose(); } },
    { label: establishment?.status === 'paused' ? 'Reactivar negocio' : 'Pausar negocio', icon: establishment?.status === 'paused' ? 'Play' : 'Pause', action: onClose },
    { label: 'Cambiar plan', icon: 'CreditCard', action: () => { navigate('/billing'); onClose(); } },
    { label: 'Duplicar negocio', icon: 'Copy', action: onClose },
    { label: 'Transferir propiedad', icon: 'ArrowRightLeft', action: onClose },
    { label: deleteStep === 0 ? 'Eliminar' : deleteStep === 1 ? '¿Seguro? Confirmar' : '⚠️ Eliminar definitivamente', icon: 'Trash2', danger: true, action: () => { if (deleteStep < 2) setDeleteStep(s => s + 1); else { setDeleteStep(0); onClose(); } } },
  ];

  return (
    <div ref={menuRef} className="absolute right-0 top-8 z-30 bg-card border border-border rounded-xl shadow-xl w-52 py-1 overflow-hidden">
      {options?.map((opt, i) => (
        <button
          key={i}
          onClick={opt?.action}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
            opt?.danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-foreground hover:bg-muted'
          }`}
        >
          <Icon name={opt?.icon} size={15} />
          {opt?.label}
        </button>
      ))}
    </div>
  );
};

const EstablishmentCard = ({ establishment, onKPIs, onManage }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const alertCount = (establishment?.alerts || [])?.filter(a => a?.type === 'red' || a?.type === 'yellow')?.length;
  const isExpired = establishment?.status === 'expired';
  const isPaused = establishment?.status === 'paused';
  const isSetup = establishment?.status === 'setup';

  const borderClass = isExpired
    ? 'border-l-4 border-l-red-500'
    : isPaused
    ? 'border-l-4 border-l-gray-400'
    : isSetup
    ? 'border-l-4 border-l-amber-400 border-l-dashed'
    : alertCount > 0
    ? 'border-l-4 border-l-amber-400' :'border-l-4 border-l-emerald-500';

  const cardOpacity = isPaused ? 'opacity-70' : 'opacity-100';

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg relative ${borderClass} ${cardOpacity}`}>
      {/* Paused badge */}
      {isPaused && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          PAUSADO
        </div>
      )}
      {/* Expired badge */}
      {isExpired && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          PLAN VENCIDO
        </div>
      )}
      {/* Alert badge */}
      {alertCount > 0 && !isPaused && !isExpired && (
        <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {alertCount}
        </div>
      )}
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: establishment?.logoColor }}
          >
            {establishment?.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-foreground text-base leading-tight truncate">{establishment?.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{establishment?.category} · {establishment?.subcategory}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-xs font-medium ${STATUS_CONFIG?.[establishment?.status]?.color}`}>
                  {STATUS_CONFIG?.[establishment?.status]?.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <Icon name="MapPin" size={13} className="text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {establishment?.branches > 1 ? `${establishment?.branches} sucursales` : establishment?.location}
          </span>
        </div>
      </div>
      {/* Setup progress bar */}
      {isSetup && (
        <div className="px-4 pb-3">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Ficha {establishment?.profileCompletion}% completa</span>
            </div>
            <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-1.5">
              <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: `${establishment?.profileCompletion}%` }} />
            </div>
          </div>
        </div>
      )}
      {/* Mini dashboard 2x2 */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: 'Visitas hoy',
              value: establishment?.metrics?.visitsToday,
              icon: 'Users',
              color: establishment?.metrics?.visitsToday > 0 ? 'text-emerald-600' : 'text-muted-foreground'
            },
            {
              label: 'Clientes activos',
              value: establishment?.metrics?.activeCustomers30d,
              icon: 'UserCheck',
              color: 'text-foreground'
            },
            {
              label: 'Promos activas',
              value: establishment?.metrics?.activePromos,
              icon: 'Megaphone',
              color: establishment?.metrics?.activePromos > 0 ? 'text-foreground' : 'text-red-400'
            },
            {
              label: `Rating (${establishment?.metrics?.reviewCount})`,
              value: establishment?.metrics?.rating > 0 ? `⭐ ${establishment?.metrics?.rating}` : '—',
              icon: 'Star',
              color: 'text-foreground'
            },
          ]?.map((metric, i) => (
            <div key={i} className="bg-muted/40 rounded-lg p-2 flex items-center gap-2">
              <Icon name={metric?.icon} size={13} className="text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className={`text-sm font-bold leading-tight ${metric?.color}`}>{metric?.value}</p>
                <p className="text-xs text-muted-foreground truncate">{metric?.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer actions */}
      <div className="mt-auto border-t border-border px-4 py-3 flex items-center gap-2">
        {isExpired ? (
          <button
            onClick={() => navigate('/billing')}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            Renovar plan
          </button>
        ) : (
          <button
            onClick={() => onManage ? onManage(establishment) : navigate('/business-listings-management')}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            Administrar
          </button>
        )}
        <button
          onClick={() => onKPIs(establishment)}
          className="flex-1 border border-border hover:bg-muted text-foreground text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
        >
          KPIs
        </button>
      </div>
    </div>
  );
};

export default EstablishmentCard;
