import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const POSITION_OPTIONS = [
  { value: 'top_catalog', label: 'Top del catálogo', icon: 'ArrowUp', desc: 'Aparece primero en la lista al abrir Order Ahead' },
  { value: 'checkout_suggestion', label: 'Sugerido en checkout', icon: 'ShoppingCart', desc: 'Aparece como add-on en la pantalla de confirmación' },
  { value: 'business_banner', label: 'Banner en ficha', icon: 'Image', desc: 'Imagen destacada en la parte superior de la ficha del negocio' },
];

const RULE_TYPES = [
  { value: 'category_contains', label: 'Si el pedido contiene ítems de categoría [X]' },
  { value: 'total_less_than', label: 'Si el total del pedido es menor a [$Z MXN]' },
  { value: 'always', label: 'Siempre mostrar' },
];

export default function DestacadosUpsellTab() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [upsellRules, setUpsellRules] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    catalog_item_id: '',
    position_type: 'top_catalog',
    start_date: '',
    end_date: '',
    is_indefinite: true,
    max_budget_mxn: '',
  });
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({ rule_type: 'total_less_than', condition_value: '', suggest_item_id: '' });
  const [saving, setSaving] = useState(false);
  const [simulatorX, setSimulatorX] = useState(20);
  const [feePerConversion] = useState(15);
  const [catalogSearch, setCatalogSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) { setLoading(false); return; }
      const [fiResult, urResult, ciResult] = await Promise.all([
        supabase?.from('featured_items')?.select('*')?.eq('business_id', user?.id)?.order('created_at', { ascending: false }),
        supabase?.from('upsell_rules')?.select('*')?.eq('business_id', user?.id)?.order('sort_order'),
        supabase?.from('catalog_items')?.select('id, name, price, is_active')?.eq('is_active', true)?.limit(100),
      ]);
      setFeaturedItems(fiResult?.data || []);
      setUpsellRules(urResult?.data || []);
      setCatalogItems(ciResult?.data || []);
    } catch (err) { console.log('Error loading data:', err?.message); }
    finally { setLoading(false); }
  };

  const handleSaveFeatured = async () => {
    if (!modalForm?.catalog_item_id) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return;
      const selectedItem = catalogItems?.find(c => c?.id === modalForm?.catalog_item_id);
      const { data, error } = await supabase?.from('featured_items')?.insert({
        business_id: user?.id,
        catalog_item_id: modalForm?.catalog_item_id,
        item_name: selectedItem?.name || 'Ítem',
        position_type: modalForm?.position_type,
        start_date: modalForm?.is_indefinite ? null : (modalForm?.start_date || null),
        end_date: modalForm?.is_indefinite ? null : (modalForm?.end_date || null),
        is_indefinite: modalForm?.is_indefinite,
        max_budget_mxn: modalForm?.max_budget_mxn ? Number(modalForm?.max_budget_mxn) : null,
        item_status: 'active',
        status: 'active',
        impressions: 0,
        attributed_orders: 0,
        accumulated_fee: 0,
        total_fees: 0,
      })?.select()?.single();
      if (!error && data) {
        setFeaturedItems(prev => [data, ...prev]);
        setShowModal(false);
        setModalForm({ catalog_item_id: '', position_type: 'top_catalog', start_date: '', end_date: '', is_indefinite: true, max_budget_mxn: '' });
        setCatalogSearch('');
      }
    } catch (err) { console.log(err?.message); }
    finally { setSaving(false); }
  };

  const toggleFeaturedStatus = async (item) => {
    const newStatus = (item?.item_status || item?.status) === 'active' ? 'paused' : 'active';
    await supabase?.from('featured_items')?.update({ item_status: newStatus, status: newStatus })?.eq('id', item?.id);
    setFeaturedItems(prev => prev?.map(f => f?.id === item?.id ? { ...f, item_status: newStatus, status: newStatus } : f));
  };

  const handleSaveRule = async () => {
    if (ruleForm?.rule_type !== 'always' && !ruleForm?.condition_value) return;
    if (!ruleForm?.suggest_item_id) return;
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return;
      const selectedItem = catalogItems?.find(c => c?.id === ruleForm?.suggest_item_id);
      const { data, error } = await supabase?.from('upsell_rules')?.insert({
        business_id: user?.id,
        rule_type: ruleForm?.rule_type,
        condition_value: ruleForm?.condition_value || null,
        condition_min_amount: ruleForm?.rule_type === 'total_less_than' ? Number(ruleForm?.condition_value) : null,
        condition_category: ruleForm?.rule_type === 'category_contains' ? ruleForm?.condition_value : null,
        suggest_item_id: ruleForm?.suggest_item_id,
        suggest_item_name: selectedItem?.name || '',
        is_active: true,
        sort_order: upsellRules?.length,
      })?.select()?.single();
      if (!error && data) {
        setUpsellRules(prev => [...prev, data]);
        setShowRuleForm(false);
        setRuleForm({ rule_type: 'total_less_than', condition_value: '', suggest_item_id: '' });
      }
    } catch (err) { console.log(err?.message); }
  };

  const toggleRule = async (rule) => {
    await supabase?.from('upsell_rules')?.update({ is_active: !rule?.is_active })?.eq('id', rule?.id);
    setUpsellRules(prev => prev?.map(r => r?.id === rule?.id ? { ...r, is_active: !r?.is_active } : r));
  };

  const deleteRule = async (id) => {
    await supabase?.from('upsell_rules')?.delete()?.eq('id', id);
    setUpsellRules(prev => prev?.filter(r => r?.id !== id));
  };

  const getRuleDescription = (rule) => {
    if (rule?.rule_type === 'total_less_than') return `Si el total es menor a $${rule?.condition_value || rule?.condition_min_amount} MXN`;
    if (rule?.rule_type === 'category_contains') return `Si el pedido contiene categoría "${rule?.condition_value || rule?.condition_category}"`;
    return 'Siempre mostrar';
  };

  const chartData = featuredItems?.slice(0, 6)?.map(f => ({
    name: (f?.item_name?.length > 14 ? f?.item_name?.slice(0, 14) + '…' : f?.item_name),
    conversiones: f?.attributed_orders || 0,
    impresiones: Math.round((f?.impressions || 0) / 10),
  }));

  const totalImpressions = featuredItems?.reduce((s, f) => s + (f?.impressions || 0), 0);
  const totalOrders = featuredItems?.reduce((s, f) => s + (f?.attributed_orders || 0), 0);
  const totalFee = featuredItems?.reduce((s, f) => s + (f?.accumulated_fee || f?.total_fees || 0), 0);
  const roi = totalFee > 0 ? ((totalOrders * 250 - totalFee) / totalFee * 100)?.toFixed(0) : '—';

  const filteredCatalog = catalogItems?.filter(c => c?.name?.toLowerCase()?.includes(catalogSearch?.toLowerCase()));
  const selectedCatalogItem = catalogItems?.find(c => c?.id === modalForm?.catalog_item_id);
  const selectedPositionOption = POSITION_OPTIONS?.find(p => p?.value === modalForm?.position_type);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Premium banner */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="Crown" size={20} className="text-violet-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-violet-900">Función Premium — Destacados & Upsell</p>
          <p className="text-sm text-violet-700">Ítems con visibilidad privilegiada en el flujo de pedido. Fee solo por conversión atribuida.</p>
        </div>
        <span className="px-3 py-1 bg-violet-600 text-white text-xs font-bold rounded-full flex-shrink-0">PREMIUM</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Impresiones', value: totalImpressions?.toLocaleString(), icon: 'Eye', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pedidos atribuidos', value: totalOrders, icon: 'ShoppingBag', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Fee total', value: `$${totalFee?.toFixed(2)}`, icon: 'DollarSign', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'ROI estimado', value: `${roi}%`, icon: 'TrendingUp', color: 'text-violet-600', bg: 'bg-violet-50' },
        ]?.map(kpi => (
          <div key={kpi?.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-9 h-9 ${kpi?.bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon name={kpi?.icon} size={18} className={kpi?.color} />
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi?.label}</p>
          </div>
        ))}
      </div>

      {/* Featured items table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Ítems destacados activos</h3>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Plus" size={14} />
            Nuevo destacado
          </button>
        </div>
        {featuredItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="Star" size={32} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No hay ítems destacados. Crea el primero.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {['Ítem', 'Posición', 'Vigencia', 'Impresiones', 'Pedidos', 'Fee acum.', 'Estado', 'Acciones']?.map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {featuredItems?.map(item => {
                  const itemStatus = item?.item_status || item?.status || 'active';
                  const posOpt = POSITION_OPTIONS?.find(p => p?.value === item?.position_type);
                  return (
                    <tr key={item?.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{item?.item_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Icon name={posOpt?.icon || 'Star'} size={12} className="text-violet-600" />
                          <span className="text-xs text-muted-foreground">{posOpt?.label || item?.position_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {item?.is_indefinite ? 'Indefinido' : `${item?.start_date || '—'} → ${item?.end_date || '—'}`}
                      </td>
                      <td className="px-4 py-3 text-foreground">{(item?.impressions || 0)?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-foreground">{item?.attributed_orders || 0}</td>
                      <td className="px-4 py-3 font-medium text-foreground">${(item?.accumulated_fee || item?.total_fees || 0)?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${itemStatus === 'active' ? 'bg-emerald-100 text-emerald-700' : itemStatus === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${itemStatus === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {itemStatus === 'active' ? 'Activo' : itemStatus === 'paused' ? 'Pausado' : 'Expirado'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleFeaturedStatus(item)}
                          className={`text-xs px-3 py-1 rounded-lg border transition-colors ${itemStatus === 'active' ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                        >
                          {itemStatus === 'active' ? 'Pausar' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upsell rules */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Reglas de upsell en checkout</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Máximo 3 reglas activas simultáneas</p>
          </div>
          {upsellRules?.length < 3 && (
            <button
              onClick={() => setShowRuleForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-sm text-foreground hover:bg-muted/50 transition-colors"
            >
              <Icon name="Plus" size={14} />
              Nueva regla
            </button>
          )}
        </div>
        <div className="space-y-3">
          {upsellRules?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay reglas configuradas</p>
          )}
          {upsellRules?.map(rule => (
            <div
              key={rule?.id}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${rule?.is_active ? 'border-primary/20 bg-primary/2' : 'border-border opacity-60'}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {getRuleDescription(rule)}
                  {' → '}
                  <span className="text-primary">sugerir {rule?.suggest_item_name}</span>
                </p>
              </div>
              <button
                onClick={() => toggleRule(rule)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${rule?.is_active ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300" style={{ left: rule?.is_active ? '22px' : '2px' }} />
              </button>
              <button onClick={() => deleteRule(rule?.id)} className="text-red-500 hover:text-red-700 flex-shrink-0 transition-colors">
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Performance chart */}
      {chartData?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Dashboard de rendimiento</h3>
            <button className="flex items-center gap-1.5 text-sm text-primary hover:underline transition-colors">
              <Icon name="Download" size={14} />
              Exportar CSV
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="conversiones" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Conversiones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Fee model + simulator */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Modelo de cobro</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Fee por conversión únicamente</p>
                <p className="text-xs text-muted-foreground">No se cobra por impresión. Solo pagas cuando un cliente realiza un pedido que incluye tu ítem destacado.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Icon name="CreditCard" size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Tarifa: ${feePerConversion} MXN por pedido</p>
                <p className="text-xs text-muted-foreground">Cargos consolidados en tu ciclo de facturación mensual de Stripe.</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-violet-900 mb-3">Simulador de costos</p>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-violet-700 whitespace-nowrap">Si se atribuyen</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={simulatorX}
                onChange={e => setSimulatorX(Number(e?.target?.value))}
                className="w-20 px-2 py-1.5 border border-violet-300 rounded-lg bg-white text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-400/30"
              />
              <label className="text-sm text-violet-700">pedidos/mes</label>
            </div>
            <div className="p-3 bg-white rounded-lg border border-violet-200">
              <p className="text-xs text-violet-600 mb-1">Pagarás en fees:</p>
              <p className="text-2xl font-bold text-violet-900">${(simulatorX * feePerConversion)?.toFixed(2)} MXN</p>
              <p className="text-xs text-violet-600 mt-1">= {simulatorX} conversiones × ${feePerConversion} MXN</p>
            </div>
          </div>
        </div>
      </div>

      {/* New featured modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">Nuevo ítem destacado</h3>
              <button onClick={() => { setShowModal(false); setCatalogSearch(''); }} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Item selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ítem del catálogo (solo activos)</label>
                <input
                  type="text"
                  placeholder="Buscar ítem..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="max-h-40 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                  {filteredCatalog?.length === 0 && (
                    <p className="text-xs text-amber-600 p-3 text-center">No hay ítems activos en el catálogo</p>
                  )}
                  {filteredCatalog?.map(item => (
                    <button
                      key={item?.id}
                      onClick={() => setModalForm(f => ({ ...f, catalog_item_id: item?.id }))}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${modalForm?.catalog_item_id === item?.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'}`}
                    >
                      <span>{item?.name}</span>
                      <span className="font-medium">${item?.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Posición del destacado</label>
                <div className="space-y-2">
                  {POSITION_OPTIONS?.map(opt => (
                    <button
                      key={opt?.value}
                      onClick={() => setModalForm(f => ({ ...f, position_type: opt?.value }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${modalForm?.position_type === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
                    >
                      <Icon name={opt?.icon} size={16} className={modalForm?.position_type === opt?.value ? 'text-primary' : 'text-muted-foreground'} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                        <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vigencia */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm?.is_indefinite}
                    onChange={e => setModalForm(f => ({ ...f, is_indefinite: e?.target?.checked }))}
                    className="rounded"
                  />
                  Sin fecha de fin (vigencia indefinida)
                </label>
                {!modalForm?.is_indefinite && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Fecha inicio</label>
                      <input type="date" value={modalForm?.start_date} onChange={e => setModalForm(f => ({ ...f, start_date: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Fecha fin</label>
                      <input type="date" value={modalForm?.end_date} onChange={e => setModalForm(f => ({ ...f, end_date: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                )}
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Presupuesto máximo (MXN)</label>
                <input
                  type="number"
                  placeholder="Sin límite"
                  value={modalForm?.max_budget_mxn}
                  onChange={e => setModalForm(f => ({ ...f, max_budget_mxn: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">El destacado se pausará automáticamente al alcanzar este límite.</p>
              </div>

              {/* Live preview */}
              {selectedCatalogItem && (
                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Preview en app cliente</p>
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">⭐ Destacado</span>
                      <span className="text-xs text-muted-foreground">{selectedPositionOption?.label}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedCatalogItem?.name}</p>
                    <p className="text-sm text-primary font-bold mt-0.5">${selectedCatalogItem?.price}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setCatalogSearch(''); }} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted/50 transition-colors">Cancelar</button>
              <button
                onClick={handleSaveFeatured}
                disabled={saving || !modalForm?.catalog_item_id}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : 'Crear destacado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New rule modal */}
      {showRuleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">Nueva regla de upsell</h3>
              <button onClick={() => setShowRuleForm(false)} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Condición</label>
                <select
                  value={ruleForm?.rule_type}
                  onChange={e => setRuleForm(f => ({ ...f, rule_type: e?.target?.value, condition_value: '' }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {RULE_TYPES?.map(rt => <option key={rt?.value} value={rt?.value}>{rt?.label}</option>)}
                </select>
              </div>
              {ruleForm?.rule_type !== 'always' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {ruleForm?.rule_type === 'total_less_than' ? 'Monto límite (MXN)' : 'Nombre de categoría'}
                  </label>
                  <input
                    type={ruleForm?.rule_type === 'total_less_than' ? 'number' : 'text'}
                    placeholder={ruleForm?.rule_type === 'total_less_than' ? '200' : 'Ej: Tacos, Bebidas...'}
                    value={ruleForm?.condition_value}
                    onChange={e => setRuleForm(f => ({ ...f, condition_value: e?.target?.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ítem a sugerir</label>
                <select
                  value={ruleForm?.suggest_item_id}
                  onChange={e => setRuleForm(f => ({ ...f, suggest_item_id: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Seleccionar ítem...</option>
                  {catalogItems?.map(item => <option key={item?.id} value={item?.id}>{item?.name} — ${item?.price}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowRuleForm(false)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted/50 transition-colors">Cancelar</button>
              <button
                onClick={handleSaveRule}
                disabled={!ruleForm?.suggest_item_id || (ruleForm?.rule_type !== 'always' && !ruleForm?.condition_value)}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Crear regla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
