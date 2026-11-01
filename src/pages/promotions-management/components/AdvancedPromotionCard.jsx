import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const TYPE_CONFIG = {
  standard:       { label: 'Estándar',          icon: 'Tag',          badgeBg: 'bg-blue-600',    badgeText: 'ESTÁNDAR' },
  flash_deal:     { label: 'Flash Deal',         icon: 'Zap',          badgeBg: 'bg-red-600',     badgeText: 'FLASH DEAL' },
  happy_hour:     { label: 'Happy Hour',         icon: 'Clock',        badgeBg: 'bg-amber-500',   badgeText: 'HAPPY HOUR' },
  limited_drop:   { label: 'Drop Limitado',      icon: 'Flame',        badgeBg: 'bg-purple-600',  badgeText: 'DROP LIMITADO' },
  birthday:       { label: 'Cumpleaños',         icon: 'Cake',         badgeBg: 'bg-pink-500',    badgeText: 'CUMPLEAÑOS' },
  first_visit:    { label: 'Primera Visita',     icon: 'Star',         badgeBg: 'bg-green-600',   badgeText: 'BIENVENIDA' },
  weather:        { label: 'Por Clima',          icon: 'Cloud',        badgeBg: 'bg-cyan-600',    badgeText: 'CLIMA' },
  inverse_demand: { label: 'Demanda Inversa',    icon: 'TrendingDown', badgeBg: 'bg-orange-500',  badgeText: 'HORA MUERTA' },
  advent:         { label: 'Adviento',           icon: 'Gift',         badgeBg: 'bg-yellow-600',  badgeText: 'ADVIENTO' },
  vip_access:     { label: 'Acceso VIP',         icon: 'Crown',        badgeBg: 'bg-gray-900',    badgeText: 'VIP' }
};

const STATUS_CONFIG = {
  draft:    { label: 'Borrador',   color: 'bg-muted text-muted-foreground' },
  active:   { label: 'Activa',     color: 'bg-success text-success-foreground' },
  paused:   { label: 'Pausada',    color: 'bg-warning text-warning-foreground' },
  ended:    { label: 'Finalizada', color: 'bg-muted text-muted-foreground' },
  archived: { label: 'Archivada', color: 'bg-muted text-muted-foreground opacity-60' }
};

const DEFAULT_IMAGES = {
  flash_deal:     'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
  happy_hour:     'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop',
  limited_drop:   'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop',
  birthday:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  first_visit:    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  weather:        'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=300&fit=crop',
  inverse_demand: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
  advent:         'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=300&fit=crop',
  vip_access:     'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=300&fit=crop',
  standard:       'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop'
};

const AdvancedPromotionCard = ({ promotion, onEdit, onDelete, onToggleStatus, onDuplicate, onArchive, onViewAnalytics, viewMode = 'grid', actionLoading }) => {
  const typeCfg = TYPE_CONFIG?.[promotion?.promoType] || TYPE_CONFIG?.standard;
  const statusCfg = STATUS_CONFIG?.[promotion?.status] || STATUS_CONFIG?.draft;

  const imageUrl = promotion?.imageUrl || DEFAULT_IMAGES?.[promotion?.promoType] || DEFAULT_IMAGES?.standard;

  const usagePercent = promotion?.totalLimit
    ? Math.min(100, ((promotion?.usageCount || 0) / promotion?.totalLimit) * 100)
    : null;

  const isAlmostExpired = promotion?.endDate &&
    new Date(promotion?.endDate) > new Date() &&
    (new Date(promotion?.endDate) - new Date()) < 3 * 24 * 60 * 60 * 1000;

  const isAlmostFull = usagePercent !== null && usagePercent >= 90;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString)?.toLocaleDateString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getDiscountLabel = () => {
    switch (promotion?.discountType) {
      case 'percentage': return `${promotion?.discountValue}% OFF`;
      case 'fixed': return `$${promotion?.discountValue} OFF`;
      case '2x1': return '2x1';
      case '3x2': return '3x2';
      case 'free_product': return 'Producto gratis';
      case 'free_upgrade': return 'Upgrade gratis';
      default: return 'Precio especial';
    }
  };

  // Horizontal action buttons row (used in both grid and list)
  const ActionButtons = () => {
    const isLoading = actionLoading === promotion?.id;
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => onViewAnalytics?.(promotion?.id)}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <Icon name="BarChart3" size={13} />
          <span>Analíticas</span>
        </button>
        <button
          onClick={() => onEdit?.(promotion?.id)}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Icon name="Edit" size={13} />
          <span>Editar</span>
        </button>
        <button
          onClick={() => onToggleStatus?.(promotion?.id, promotion?.status === 'active' ? 'paused' : 'active')}
          disabled={isLoading}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors disabled:opacity-50 ${
            promotion?.status === 'active' ?'text-amber-600 hover:text-amber-700 hover:bg-amber-50' :'text-green-600 hover:text-green-700 hover:bg-green-50'
          }`}
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon name={promotion?.status === 'active' ? 'Pause' : 'Play'} size={13} />
          )}
          <span>{promotion?.status === 'active' ? 'Pausar' : 'Activar'}</span>
        </button>
        {onDuplicate && (
          <button
            onClick={() => onDuplicate?.(promotion?.id)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Icon name="Copy" size={13} />
            <span>Duplicar</span>
          </button>
        )}
        <button
          onClick={() => onDelete?.(promotion?.id)}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <Icon name="Trash2" size={13} />
          <span>Eliminar</span>
        </button>
      </div>
    );
  };

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (viewMode === 'table') {
    return (
      <div className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 ${promotion?.status === 'archived' ? 'opacity-60' : ''}`}>
        <div className="flex items-stretch">
          {/* Small image on the left */}
          <div className="relative w-28 flex-shrink-0">
            <img
              src={imageUrl}
              alt={promotion?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1.5 left-1.5">
              <span className={`${typeCfg?.badgeBg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow`}>
                <Icon name={typeCfg?.icon} size={9} />
                {typeCfg?.badgeText}
              </span>
            </div>
            <div className="absolute bottom-1.5 left-1.5">
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                {getDiscountLabel()}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground truncate">{promotion?.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusCfg?.color}`}>
                    {statusCfg?.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{promotion?.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  {promotion?.startDate && (
                    <span>Inicio: <span className="text-foreground">{formatDate(promotion?.startDate)}</span></span>
                  )}
                  {promotion?.endDate && (
                    <span>Fin: <span className="text-foreground">{formatDate(promotion?.endDate)}</span></span>
                  )}
                  <span>Canjes: <span className="text-foreground font-medium">{promotion?.usageCount || 0}/{promotion?.totalLimit || '∞'}</span></span>
                  <span>Audiencia: <span className="text-foreground capitalize">
                    {promotion?.targetAudience === 'all' ? 'Todos' :
                     promotion?.targetAudience === 'new' ? 'Nuevos' :
                     promotion?.targetAudience === 'returning' ? 'Recurrentes' :
                     promotion?.targetAudience === 'vip' ? 'VIP' : 'Segmento'}
                  </span></span>
                </div>

                {usagePercent !== null && (
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden w-48">
                    <div
                      className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-destructive' : usagePercent >= 70 ? 'bg-warning' : 'bg-primary'}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Performance + actions */}
              <div className="flex-shrink-0 text-right">
                {promotion?.performance && (
                  <div className="flex items-center gap-4 text-xs mb-2">
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{promotion?.performance?.views || 0}</div>
                      <div className="text-muted-foreground">Vistas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{promotion?.performance?.clicks || 0}</div>
                      <div className="text-muted-foreground">Clics</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{promotion?.performance?.conversions || 0}</div>
                      <div className="text-muted-foreground">Canjes</div>
                    </div>
                  </div>
                )}
                <ActionButtons />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GRID VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 ${
      promotion?.status === 'archived' ? 'opacity-60' : ''
    }`}>
      {/* Image with overlays */}
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={promotion?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className={`${typeCfg?.badgeBg} text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md`}>
            <Icon name={typeCfg?.icon} size={11} />
            {typeCfg?.badgeText}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCfg?.color}`}>
            {statusCfg?.label}
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow">
            {getDiscountLabel()}
          </span>
        </div>
        {promotion?.plan && promotion?.plan !== 'PRO' && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {promotion?.plan}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-1">{promotion?.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{promotion?.description}</p>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-muted-foreground">Inicio:</span>
            <span className="ml-1 text-foreground">{formatDate(promotion?.startDate)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Fin:</span>
            <span className="ml-1 text-foreground">{promotion?.endDate ? formatDate(promotion?.endDate) : '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Canjes:</span>
            <span className="ml-1 text-foreground font-medium">{promotion?.usageCount || 0}/{promotion?.totalLimit || '∞'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Audiencia:</span>
            <span className="ml-1 text-foreground capitalize">
              {promotion?.targetAudience === 'all' ? 'Todos' :
               promotion?.targetAudience === 'new' ? 'Nuevos' :
               promotion?.targetAudience === 'returning' ? 'Recurrentes' :
               promotion?.targetAudience === 'vip' ? 'VIP' : 'Segmento'}
            </span>
          </div>
        </div>

        {usagePercent !== null && (
          <div className="mb-3">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent >= 90 ? 'bg-destructive' : usagePercent >= 70 ? 'bg-warning' : 'bg-primary'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        {isAlmostExpired && (
          <div className="flex items-center gap-1.5 text-xs text-warning mb-1">
            <Icon name="Clock" size={12} />
            Vence en menos de 3 días
          </div>
        )}
        {isAlmostFull && (
          <div className="flex items-center gap-1.5 text-xs text-destructive mb-1">
            <Icon name="AlertCircle" size={12} />
            90% de canjes usados
          </div>
        )}

        {/* Horizontal action buttons */}
        <div className="border-t border-border pt-3 mt-3">
          <ActionButtons />
        </div>

        {/* Performance metrics */}
        {promotion?.performance && (
          <div className="border-t border-border pt-3 mt-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-semibold text-foreground">{promotion?.performance?.views || 0}</div>
                <div className="text-xs text-muted-foreground">Vistas</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{promotion?.performance?.clicks || 0}</div>
                <div className="text-xs text-muted-foreground">Clics</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{promotion?.performance?.conversions || 0}</div>
                <div className="text-xs text-muted-foreground">Canjes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPromotionCard;
