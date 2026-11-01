import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_FEATURED = [
  { id: '1', item_name: 'Combo Familiar Premium', position_type: 'top_catalog', status: 'active', start_date: '2026-03-01', end_date: null, impressions: 342, attributed_orders: 28, fee_per_conversion: 15, total_fees: 420, max_budget: 1000, spent_budget: 420 },
  { id: '2', item_name: 'Postre del Día', position_type: 'checkout_suggestion', status: 'active', start_date: '2026-03-05', end_date: '2026-03-31', impressions: 189, attributed_orders: 15, fee_per_conversion: 10, total_fees: 150, max_budget: 500, spent_budget: 150 },
  { id: '3', item_name: 'Menú Especial Fin de Semana', position_type: 'business_banner', status: 'paused', start_date: '2026-02-15', end_date: '2026-03-15', impressions: 95, attributed_orders: 7, fee_per_conversion: 12, total_fees: 84, max_budget: 300, spent_budget: 84 },
];

const MOCK_RULES = [
  { id: '1', is_active: true, rule_type: 'min_amount', condition_min_amount: 150, suggest_item_name: 'Postre del Día' },
  { id: '2', is_active: true, rule_type: 'category', condition_category: 'Bebidas', suggest_item_name: 'Agua Fresca 1L' },
  { id: '3', is_active: false, rule_type: 'min_amount', condition_min_amount: 300, suggest_item_name: 'Combo Familiar Premium' },
];

const CHART_DATA = [
  { name: 'Combo Familiar', conversiones: 28 },
  { name: 'Postre del Día', conversiones: 15 },
  { name: 'Menú Especial', conversiones: 7 },
];

const positionLabel = {
  top_catalog: 'Top del catálogo',
  checkout_suggestion: 'Sugerido en checkout',
  business_banner: 'Banner en ficha',
};

const FeaturedItemsUpsell = () => {
  const [featuredItems, setFeaturedItems] = useState(MOCK_FEATURED);
  const [upsellRules, setUpsellRules] = useState(MOCK_RULES);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: '', position_type: 'top_catalog', start_date: '', end_date: '', max_budget: '' });
  const [simulatorQty, setSimulatorQty] = useState(20);

  const totalImpressions = featuredItems?.reduce((s, i) => s + i?.impressions, 0);
  const totalOrders = featuredItems?.reduce((s, i) => s + i?.attributed_orders, 0);
  const totalFees = featuredItems?.reduce((s, i) => s + i?.total_fees, 0);
  const avgROI = totalFees > 0 ? ((totalOrders * 185 - totalFees) / totalFees * 100)?.toFixed(0) : 0;

  const toggleItemStatus = (id) => {
    setFeaturedItems(prev => prev?.map(item =>
      item?.id === id ? { ...item, status: item?.status === 'active' ? 'paused' : 'active' } : item
    ));
  };

  const toggleRule = (id) => {
    setUpsellRules(prev => prev?.map(r => r?.id === id ? { ...r, is_active: !r?.is_active } : r));
  };

  const activeRulesCount = upsellRules?.filter(r => r?.is_active)?.length;

  return (
    <div className="space-y-6">
      {/* Premium badge banner */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="Sparkles" size={24} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-bold text-amber-900">Destacados & Upsell</h3>
            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">PREMIUM</span>
          </div>
          <p className="text-xs text-amber-700">Aumenta tus ventas dando visibilidad privilegiada a tus mejores ítems. Se cobra únicamente por conversión atribuida.</p>
        </div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Impresiones totales', value: totalImpressions?.toLocaleString(), icon: 'Eye', color: 'bg-blue-100 text-blue-600' },
          { label: 'Pedidos atribuidos', value: totalOrders, icon: 'ShoppingBag', color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Fee total del período', value: `$${totalFees?.toFixed(0)} MXN`, icon: 'DollarSign', color: 'bg-amber-100 text-amber-600' },
          { label: 'ROI promedio', value: `${avgROI}%`, icon: 'TrendingUp', color: 'bg-violet-100 text-violet-600' },
        ]?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi?.color}`}>
              <Icon name={kpi?.icon} size={18} />
            </div>
            <p className="text-xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi?.label}</p>
          </div>
        ))}
      </div>
      {/* Featured items table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Destacados activos</h3>
          <button onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
            <Icon name="Plus" size={16} />
            Nuevo destacado
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Ítem', 'Posición', 'Vigencia', 'Impresiones', 'Pedidos', 'Fee acumulado', 'Estado', 'Acciones']?.map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featuredItems?.map(item => (
                <tr key={item?.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{item?.item_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-muted px-2 py-1 rounded-lg text-muted-foreground">{positionLabel?.[item?.position_type]}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {item?.start_date} {item?.end_date ? `→ ${item?.end_date}` : '→ Indefinido'}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{item?.impressions?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{item?.attributed_orders}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">${item?.total_fees?.toFixed(0)}</p>
                      {item?.max_budget && (
                        <div className="w-20 h-1.5 bg-muted rounded-full mt-1">
                          <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (item?.spent_budget / item?.max_budget) * 100)}%` }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${item?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {item?.status === 'active' ? 'Activo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleItemStatus(item?.id)}
                      className="text-xs px-2 py-1 border border-border rounded-lg hover:bg-muted/50 text-foreground">
                      {item?.status === 'active' ? 'Pausar' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Upsell rules */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Reglas de upsell en checkout</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{activeRulesCount}/3 reglas activas</p>
          </div>
        </div>
        <div className="space-y-3">
          {upsellRules?.map(rule => (
            <div key={rule?.id} className={`flex items-center justify-between p-4 border rounded-xl transition-all ${rule?.is_active ? 'border-border bg-card' : 'border-border/40 bg-muted/20 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <Icon name="Zap" size={16} className={rule?.is_active ? 'text-amber-500' : 'text-muted-foreground'} />
                <div>
                  {rule?.rule_type === 'min_amount' ? (
                    <p className="text-sm text-foreground">Si el total es menor a <strong>${rule?.condition_min_amount} MXN</strong> → sugerir <strong>{rule?.suggest_item_name}</strong></p>
                  ) : (
                    <p className="text-sm text-foreground">Si el pedido contiene categoría <strong>{rule?.condition_category}</strong> → sugerir <strong>{rule?.suggest_item_name}</strong></p>
                  )}
                </div>
              </div>
              <button onClick={() => toggleRule(rule?.id)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${rule?.is_active ? 'bg-primary' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${rule?.is_active ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
          {upsellRules?.length < 3 && (
            <button className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2">
              <Icon name="Plus" size={16} />
              Agregar regla (máx. 3)
            </button>
          )}
        </div>
      </div>
      {/* Performance chart */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Rendimiento por ítem destacado</h3>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg">
            <Icon name="Download" size={12} />
            Exportar CSV
          </button>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="conversiones" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Fee model + simulator */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Modelo de cobro</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="Info" size={16} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">Fee por conversión únicamente</p>
            </div>
            <p className="text-xs text-muted-foreground">No se cobra por impresiones. Solo pagas cuando un cliente incluye tu ítem destacado en un pedido confirmado.</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg font-medium">$10–$15 MXN por pedido</span>
              <span className="text-xs text-muted-foreground">según posición</span>
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Simulador de costos</p>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ítems destacados vendidos al mes</label>
              <input type="range" min={1} max={200} value={simulatorQty} onChange={e => setSimulatorQty(Number(e?.target?.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span><span className="font-semibold text-foreground">{simulatorQty} ítems</span><span>200</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700">Si vendes <strong>{simulatorQty} ítems destacados</strong> al mes, pagarás aproximadamente</p>
              <p className="text-xl font-bold text-amber-800 mt-1">${(simulatorQty * 12.5)?.toFixed(0)} MXN</p>
              <p className="text-xs text-amber-600">en fees de conversión</p>
            </div>
          </div>
        </div>
      </div>
      {/* New featured item modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Nuevo ítem destacado</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 hover:bg-muted rounded-lg"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Ítem del catálogo</label>
                <input type="text" value={newItem?.item_name} onChange={e => setNewItem(p => ({ ...p, item_name: e?.target?.value }))}
                  placeholder="Buscar ítem activo del catálogo..."
                  className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Tipo de posición</label>
                <div className="space-y-2">
                  {Object.entries(positionLabel)?.map(([val, lbl]) => (
                    <label key={val} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${newItem?.position_type === val ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
                      <input type="radio" name="position" value={val} checked={newItem?.position_type === val} onChange={() => setNewItem(p => ({ ...p, position_type: val }))} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{lbl}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Fecha inicio</label>
                  <input type="date" value={newItem?.start_date} onChange={e => setNewItem(p => ({ ...p, start_date: e?.target?.value }))}
                    className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Fecha fin (opcional)</label>
                  <input type="date" value={newItem?.end_date} onChange={e => setNewItem(p => ({ ...p, end_date: e?.target?.value }))}
                    className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Presupuesto máximo (MXN)</label>
                <input type="number" value={newItem?.max_budget} onChange={e => setNewItem(p => ({ ...p, max_budget: e?.target?.value }))}
                  placeholder="Sin límite si se deja vacío"
                  className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (newItem?.item_name) {
                    setFeaturedItems(prev => [...prev, { id: Date.now()?.toString(), ...newItem, status: 'active', impressions: 0, attributed_orders: 0, fee_per_conversion: 12, total_fees: 0, spent_budget: 0 }]);
                    setShowNewModal(false);
                    setNewItem({ item_name: '', position_type: 'top_catalog', start_date: '', end_date: '', max_budget: '' });
                  }
                }}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90"
              >
                Crear destacado
              </button>
              <button onClick={() => setShowNewModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedItemsUpsell;
