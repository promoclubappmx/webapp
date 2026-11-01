import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const POSITION_LABELS = {
  top_catalog: 'Top del catálogo',
  checkout_suggestion: 'Sugerido en checkout',
  banner: 'Banner en ficha',
};

const POSITION_ICONS = { top_catalog: 'ArrowUp', checkout_suggestion: 'ShoppingCart', banner: 'Image' };

const FeaturedItemsAndUpsellManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [upsellRules, setUpsellRules] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({ catalog_item_id: '', position_type: 'top_catalog', start_date: '', end_date: '', is_indefinite: true, max_budget_mxn: '' });
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({ rule_type: 'total_less_than', condition_value: '', suggest_item_id: '' });
  const [saving, setSaving] = useState(false);
  const [simulatorX, setSimulatorX] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const feePerConversion = 5;

  const user = { name: 'Carlos Mendoza', email: 'carlos@promospot.com', role: 'owner' };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user: authUser } } = await supabase?.auth?.getUser();
      if (!authUser) { setLoading(false); return; }
      const [fiResult, urResult, ciResult] = await Promise.all([
        supabase?.from('featured_items')?.select('*')?.eq('business_id', authUser?.id)?.order('created_at', { ascending: false }),
        supabase?.from('upsell_rules')?.select('*')?.eq('business_id', authUser?.id)?.order('sort_order'),
        supabase?.from('catalog_items')?.select('id, name, price, is_active')?.eq('is_active', true)?.limit(50),
      ]);
      setFeaturedItems(fiResult?.data || []);
      setUpsellRules(urResult?.data || []);
      setCatalogItems(ciResult?.data || []);
    } catch (err) { console.log(err?.message); }
    finally { setLoading(false); }
  };

  const handleSaveFeatured = async () => {
    if (!modalForm?.catalog_item_id) return;
    setSaving(true);
    try {
      const { data: { user: authUser } } = await supabase?.auth?.getUser();
      if (!authUser) return;
      const selectedItem = catalogItems?.find(c => c?.id === modalForm?.catalog_item_id);
      const { data, error } = await supabase?.from('featured_items')?.insert({
        business_id: authUser?.id,
        catalog_item_id: modalForm?.catalog_item_id,
        item_name: selectedItem?.name || '',
        position_type: modalForm?.position_type,
        start_date: modalForm?.is_indefinite ? null : modalForm?.start_date || null,
        end_date: modalForm?.is_indefinite ? null : modalForm?.end_date || null,
        is_indefinite: modalForm?.is_indefinite,
        max_budget_mxn: modalForm?.max_budget_mxn ? Number(modalForm?.max_budget_mxn) : null,
        item_status: 'active',
      })?.select()?.single();
      if (!error && data) {
        setFeaturedItems(prev => [data, ...prev]);
        setShowModal(false);
        setModalForm({ catalog_item_id: '', position_type: 'top_catalog', start_date: '', end_date: '', is_indefinite: true, max_budget_mxn: '' });
      }
    } catch (err) { console.log(err?.message); }
    finally { setSaving(false); }
  };

  const toggleFeaturedStatus = async (item) => {
    const newStatus = item?.item_status === 'active' ? 'paused' : 'active';
    await supabase?.from('featured_items')?.update({ item_status: newStatus })?.eq('id', item?.id);
    setFeaturedItems(prev => prev?.map(f => f?.id === item?.id ? { ...f, item_status: newStatus } : f));
  };

  const handleSaveRule = async () => {
    if (!ruleForm?.condition_value || !ruleForm?.suggest_item_id) return;
    try {
      const { data: { user: authUser } } = await supabase?.auth?.getUser();
      if (!authUser) return;
      const selectedItem = catalogItems?.find(c => c?.id === ruleForm?.suggest_item_id);
      const { data, error } = await supabase?.from('upsell_rules')?.insert({
        business_id: authUser?.id,
        rule_type: ruleForm?.rule_type,
        condition_value: ruleForm?.condition_value,
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

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sortedItems = [...featuredItems]?.sort((a, b) => {
    const va = a?.[sortField] ?? 0;
    const vb = b?.[sortField] ?? 0;
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const chartData = featuredItems?.slice(0, 6)?.map(f => ({
    name: f?.item_name?.length > 12 ? f?.item_name?.slice(0, 12) + '…' : f?.item_name,
    conversiones: f?.attributed_orders || 0,
  }));

  const totalImpressions = featuredItems?.reduce((s, f) => s + (f?.impressions || 0), 0);
  const totalOrders = featuredItems?.reduce((s, f) => s + (f?.attributed_orders || 0), 0);
  const totalFee = featuredItems?.reduce((s, f) => s + (f?.accumulated_fee || 0), 0);
  const roi = totalFee > 0 ? ((totalOrders * 250 - totalFee) / totalFee * 100)?.toFixed(0) : 0;

  const SortIcon = ({ field }) => (
    <Icon name={sortField === field ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={12} className="ml-1 inline" />
  );

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`} style={{ transitionProperty: 'margin-left', transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <div className="p-6">

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Icon name="Crown" size={20} className="text-violet-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Destacados & Upsell</h1>
                <span className="px-2.5 py-1 bg-violet-600 text-white text-xs font-bold rounded-full">PREMIUM</span>
              </div>
              <p className="text-sm text-muted-foreground">Gestiona ítems destacados, reglas de upsell y analiza el rendimiento de tus promociones.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Impresiones totales', value: totalImpressions?.toLocaleString(), icon: 'Eye', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Pedidos atribuidos', value: totalOrders, icon: 'ShoppingBag', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Fee total período', value: `$${totalFee?.toFixed(2)}`, icon: 'DollarSign', color: 'text-amber-600', bg: 'bg-amber-50' },
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
                  <h3 className="font-semibold text-foreground">Ítems destacados</h3>
                  <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Icon name="Plus" size={14} />
                    Nuevo destacado
                  </button>
                </div>
                {sortedItems?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
                      <Icon name="Star" size={28} className="text-violet-400" />
                    </div>
                    <p className="font-medium text-foreground mb-1">Sin ítems destacados</p>
                    <p className="text-sm text-muted-foreground">Crea tu primer ítem destacado para aumentar la visibilidad.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30">
                        <tr>
                          {[
                            { key: 'item_name', label: 'Ítem' },
                            { key: 'position_type', label: 'Tipo de destacado' },
                            { key: 'start_date', label: 'Vigencia' },
                            { key: 'impressions', label: 'Impresiones' },
                            { key: 'attributed_orders', label: 'Pedidos atribuidos' },
                            { key: 'accumulated_fee', label: 'Fee acumulado' },
                            { key: 'item_status', label: 'Estado' },
                            { key: null, label: 'Acciones' },
                          ]?.map(col => (
                            <th key={col?.label} className={`text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${col?.key ? 'cursor-pointer hover:text-foreground' : ''}`} onClick={() => col?.key && handleSort(col?.key)}>
                              {col?.label}{col?.key && <SortIcon field={col?.key} />}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {sortedItems?.map(item => (
                          <tr key={item?.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{item?.item_name}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Icon name={POSITION_ICONS?.[item?.position_type] || 'Star'} size={12} className="text-violet-600" />
                                <span className="text-xs text-muted-foreground">{POSITION_LABELS?.[item?.position_type]}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{item?.is_indefinite ? 'Indefinido' : `${item?.start_date || '—'} → ${item?.end_date || '—'}`}</td>
                            <td className="px-4 py-3 text-foreground">{(item?.impressions || 0)?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-foreground">{item?.attributed_orders || 0}</td>
                            <td className="px-4 py-3 font-medium text-foreground">${(item?.accumulated_fee || 0)?.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${item?.item_status === 'active' ? 'bg-emerald-100 text-emerald-700' : item?.item_status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item?.item_status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                {item?.item_status === 'active' ? 'Activo' : item?.item_status === 'paused' ? 'Pausado' : 'Expirado'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => toggleFeaturedStatus(item)} className={`text-xs px-3 py-1 rounded-lg border transition-colors ${item?.item_status === 'active' ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
                                {item?.item_status === 'active' ? 'Pausar' : 'Reactivar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Upsell rules */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Reglas de upsell condicionales</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Máximo 3 reglas activas simultáneas · {upsellRules?.filter(r => r?.is_active)?.length}/3 activas</p>
                  </div>
                  {upsellRules?.length < 3 && (
                    <button onClick={() => setShowRuleForm(true)} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-sm text-foreground hover:bg-muted/50">
                      <Icon name="Plus" size={14} />
                      Nueva regla
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {upsellRules?.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay reglas configuradas</p>}
                  {upsellRules?.map(rule => (
                    <div key={rule?.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${rule?.is_active ? 'border-primary/20 bg-primary/2' : 'border-border opacity-60'}`}>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {rule?.rule_type === 'total_less_than' ? `Si el total es menor a $${rule?.condition_value} MXN` : `Si el pedido contiene "${rule?.condition_value}"`}
                          {' → '}
                          <span className="text-primary">sugerir {rule?.suggest_item_name}</span>
                        </p>
                      </div>
                      <button onClick={() => toggleRule(rule)} className={`relative w-10 h-5 rounded-full transition-colors ${rule?.is_active ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300" style={{ left: rule?.is_active ? '22px' : '2px' }} />
                      </button>
                      <button onClick={() => deleteRule(rule?.id)} className="text-red-500 hover:text-red-700"><Icon name="Trash2" size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart + simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Conversiones por ítem</h3>
                    <button className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <Icon name="Download" size={14} />
                      Exportar CSV
                    </button>
                  </div>
                  {chartData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="conversiones" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Conversiones" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Sin datos de conversiones aún</div>
                  )}
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">Modelo de cobro</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">Fee por conversión únicamente. No se cobra por impresión. Tarifa: <strong>${feePerConversion} MXN</strong> por pedido atribuido.</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-violet-900 mb-3">Simulador de costos</p>
                    <div className="flex items-center gap-3 mb-3">
                      <label className="text-sm text-violet-700 whitespace-nowrap">Si vendes</label>
                      <input type="number" min={1} max={1000} value={simulatorX} onChange={e => setSimulatorX(Number(e?.target?.value))} className="w-20 px-2 py-1.5 border border-violet-300 rounded-lg bg-white text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-400/30" />
                      <label className="text-sm text-violet-700">ítems/mes</label>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-violet-200">
                      <p className="text-xs text-violet-600 mb-1">Pagarás en fees:</p>
                      <p className="text-2xl font-bold text-violet-900">${(simulatorX * feePerConversion)?.toFixed(2)} MXN</p>
                      <p className="text-xs text-violet-600 mt-1">= {simulatorX} conversiones × ${feePerConversion} MXN</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* New featured modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">Nuevo ítem destacado</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted/50 rounded-lg"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ítem del catálogo (solo ítems activos)</label>
                <select value={modalForm?.catalog_item_id} onChange={e => setModalForm(f => ({ ...f, catalog_item_id: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Seleccionar ítem...</option>
                  {catalogItems?.map(item => <option key={item?.id} value={item?.id}>{item?.name} — ${item?.price}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo de posición</label>
                <div className="space-y-2">
                  {Object.entries(POSITION_LABELS)?.map(([key, label]) => (
                    <button key={key} onClick={() => setModalForm(f => ({ ...f, position_type: key }))} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${modalForm?.position_type === key ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <Icon name={POSITION_ICONS?.[key]} size={16} className={modalForm?.position_type === key ? 'text-primary' : 'text-muted-foreground'} />
                      <span className="text-sm font-medium text-foreground">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2 cursor-pointer">
                  <input type="checkbox" checked={modalForm?.is_indefinite} onChange={e => setModalForm(f => ({ ...f, is_indefinite: e?.target?.checked }))} className="rounded" />
                  Vigencia indefinida
                </label>
                {!modalForm?.is_indefinite && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Fecha inicio</label>
                      <input type="date" value={modalForm?.start_date} onChange={e => setModalForm(f => ({ ...f, start_date: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Fecha fin</label>
                      <input type="date" value={modalForm?.end_date} onChange={e => setModalForm(f => ({ ...f, end_date: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Presupuesto máximo (MXN)</label>
                <input type="number" placeholder="Sin límite" value={modalForm?.max_budget_mxn} onChange={e => setModalForm(f => ({ ...f, max_budget_mxn: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              {modalForm?.catalog_item_id && (
                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Preview en app</p>
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">⭐ Destacado</span>
                      <span className="text-xs text-muted-foreground">{POSITION_LABELS?.[modalForm?.position_type]}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{catalogItems?.find(c => c?.id === modalForm?.catalog_item_id)?.name}</p>
                    <p className="text-sm text-primary font-bold">${catalogItems?.find(c => c?.id === modalForm?.catalog_item_id)?.price}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted/50">Cancelar</button>
              <button onClick={handleSaveFeatured} disabled={saving || !modalForm?.catalog_item_id} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
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
              <button onClick={() => setShowRuleForm(false)} className="p-2 hover:bg-muted/50 rounded-lg"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo de condición</label>
                <select value={ruleForm?.rule_type} onChange={e => setRuleForm(f => ({ ...f, rule_type: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="total_less_than">Si el total es menor a $X</option>
                  <option value="category_contains">Si el pedido contiene categoría X</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{ruleForm?.rule_type === 'total_less_than' ? 'Monto límite (MXN)' : 'Categoría o producto'}</label>
                <input type={ruleForm?.rule_type === 'total_less_than' ? 'number' : 'text'} placeholder={ruleForm?.rule_type === 'total_less_than' ? '200' : 'Ej: Tacos, Bebidas...'} value={ruleForm?.condition_value} onChange={e => setRuleForm(f => ({ ...f, condition_value: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ítem a sugerir</label>
                <select value={ruleForm?.suggest_item_id} onChange={e => setRuleForm(f => ({ ...f, suggest_item_id: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Seleccionar ítem...</option>
                  {catalogItems?.map(item => <option key={item?.id} value={item?.id}>{item?.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowRuleForm(false)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted/50">Cancelar</button>
              <button onClick={handleSaveRule} disabled={!ruleForm?.condition_value || !ruleForm?.suggest_item_id} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50">Crear regla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedItemsAndUpsellManagement;
