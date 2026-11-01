import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EFFECTIVENESS = {
  high: { label: 'Alto', color: 'text-green-700 bg-green-100' },
  medium: { label: 'Medio', color: 'text-yellow-700 bg-yellow-100' },
  low: { label: 'Bajo', color: 'text-red-700 bg-red-100' }
};

const getEffectiveness = (promo) => {
  const views = promo?.performance?.views || 0;
  const conversions = promo?.performance?.conversions || 0;
  if (views === 0) return 'low';
  const rate = conversions / views;
  if (rate >= 0.15) return 'high';
  if (rate >= 0.05) return 'medium';
  return 'low';
};

const PromoInventory = ({ promotions, onRenew, onBoost, onPause, onReactivate, onViewAnalytics }) => {
  const active = promotions?.filter(p => p?.status === 'active')?.length;
  const expiringSoon = promotions?.filter(p => {
    if (!p?.endDate || p?.status !== 'active') return false;
    return (new Date(p?.endDate) - new Date()) < 3 * 24 * 60 * 60 * 1000 && new Date(p?.endDate) > new Date();
  })?.length;
  const almostFull = promotions?.filter(p => {
    if (!p?.totalLimit) return false;
    return ((p?.usageCount || 0) / p?.totalLimit) >= 0.9;
  })?.length;
  const avgEffectiveness = promotions?.length > 0
    ? promotions?.filter(p => getEffectiveness(p) === 'high')?.length / promotions?.length
    : 0;

  const alerts = [];
  promotions?.forEach(p => {
    if (p?.status === 'active' && p?.endDate) {
      const daysLeft = Math.ceil((new Date(p?.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0 && daysLeft <= 3) alerts?.push({ type: 'expiring', promo: p, msg: `"${p?.title}" vence en ${daysLeft} día(s)` });
    }
    if (p?.totalLimit && ((p?.usageCount || 0) / p?.totalLimit) >= 0.9) {
      alerts?.push({ type: 'full', promo: p, msg: `"${p?.title}" tiene 90% de canjes usados` });
    }
  });

  const lastFlash = promotions?.filter(p => p?.promoType === 'flash_deal' && p?.status === 'ended')?.slice(-1)?.[0];
  if (lastFlash && (lastFlash?.performance?.conversions || 0) > 5) {
    alerts?.push({ type: 'suggestion', promo: lastFlash, msg: `Tu flash deal "${lastFlash?.title}" tuvo buen desempeño — ¿Repetir?` });
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Icon name="Zap" size={18} className="text-green-600" />
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ active >= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700' }`}>
              {active >= 5 ? 'Límite PRO' : 'Activas'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{active}</p>
          <p className="text-xs text-muted-foreground">Promociones activas</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Icon name="Clock" size={18} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{expiringSoon}</p>
          <p className="text-xs text-muted-foreground">Próximas a vencer</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Icon name="AlertCircle" size={18} className="text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{almostFull}</p>
          <p className="text-xs text-muted-foreground">Casi agotadas</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Icon name="TrendingUp" size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{Math.round(avgEffectiveness * 100)}%</p>
          <p className="text-xs text-muted-foreground">Efectividad promedio</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts?.length > 0 && (
        <div className="space-y-2">
          {alerts?.map((alert, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
              alert?.type === 'expiring' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
              alert?.type === 'full'? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                <Icon name={alert?.type === 'suggestion' ? 'Lightbulb' : 'AlertTriangle'} size={15} />
                <span>{alert?.msg}</span>
              </div>
              {alert?.type === 'expiring' && onRenew && (
                <Button variant="outline" size="sm" onClick={() => onRenew(alert?.promo?.id)} className="text-yellow-700 border-yellow-300">Renovar</Button>
              )}
              {alert?.type === 'suggestion' && onRenew && (
                <Button variant="outline" size="sm" onClick={() => onRenew(alert?.promo?.id)} className="text-blue-700 border-blue-300">Repetir</Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <h3 className="text-sm font-semibold text-foreground">Inventario de Promociones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Promoción</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Estado</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Canjes</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Efectividad</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Revenue est.</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promotions?.map(promo => {
                const eff = getEffectiveness(promo);
                const effCfg = EFFECTIVENESS?.[eff];
                const usagePercent = promo?.totalLimit ? Math.min(100, ((promo?.usageCount || 0) / promo?.totalLimit) * 100) : null;
                const revenue = (promo?.performance?.conversions || 0) * (promo?.discountValue || 0) * 2.5;
                return (
                  <tr key={promo?.id} className="hover:bg-muted/10">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{promo?.title}</p>
                      <p className="text-xs text-muted-foreground">{promo?.promoTypeLabel || 'Estándar'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        promo?.status === 'active' ? 'bg-green-100 text-green-700' :
                        promo?.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        promo?.status === 'draft'? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'
                      }`}>{promo?.status === 'active' ? 'Activa' : promo?.status === 'paused' ? 'Pausada' : promo?.status === 'draft' ? 'Borrador' : 'Finalizada'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{promo?.usageCount || 0}</span>
                        {promo?.totalLimit && <span className="text-xs text-muted-foreground">/{promo?.totalLimit}</span>}
                      </div>
                      {usagePercent !== null && (
                        <div className="h-1 bg-muted rounded-full mt-1 w-20">
                          <div className={`h-full rounded-full ${ usagePercent >= 90 ? 'bg-red-500' : 'bg-primary' }`} style={{ width: `${usagePercent}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${effCfg?.color}`}>{effCfg?.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground">${revenue?.toFixed(0)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {onViewAnalytics && <button onClick={() => onViewAnalytics(promo?.id)} className="p-1.5 hover:bg-muted rounded" title="Analytics"><Icon name="BarChart2" size={14} className="text-muted-foreground" /></button>}
                        {onBoost && <button onClick={() => onBoost(promo?.id)} className="p-1.5 hover:bg-muted rounded" title="Boost"><Icon name="Rocket" size={14} className="text-muted-foreground" /></button>}
                        {promo?.status === 'active' && onPause && <button onClick={() => onPause(promo?.id)} className="p-1.5 hover:bg-yellow-50 rounded" title="Pausar"><Icon name="Pause" size={14} className="text-yellow-600" /></button>}
                        {promo?.status === 'paused' && onReactivate && <button onClick={() => onReactivate(promo?.id)} className="p-1.5 hover:bg-green-50 rounded" title="Reactivar"><Icon name="Play" size={14} className="text-green-600" /></button>}
                        {onRenew && <button onClick={() => onRenew(promo?.id)} className="p-1.5 hover:bg-blue-50 rounded" title="Renovar"><Icon name="RefreshCw" size={14} className="text-blue-600" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromoInventory;
