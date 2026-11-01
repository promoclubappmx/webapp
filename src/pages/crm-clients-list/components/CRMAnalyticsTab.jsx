import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

const getCohortColor = (val) => {
  if (val === null || val === undefined) return 'bg-muted text-muted-foreground';
  if (val >= 70) return 'bg-green-100 text-green-800';
  if (val >= 50) return 'bg-yellow-100 text-yellow-800';
  if (val >= 30) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const CRMAnalyticsTab = ({ ownerCustomers = [] }) => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState('overview');
  const [historySubTab, setHistorySubTab] = useState('table');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [stats, setStats] = useState(null);

  // Compute stats from ownerCustomers
  const computeStats = useCallback(() => {
    if (!ownerCustomers?.length) {
      setStats(null);
      return;
    }
    const now = new Date();
    const thisMonth = ownerCustomers?.filter(oc => {
      const linked = new Date(oc?.linked_at);
      return (now - linked) / (1000 * 60 * 60 * 24) <= 30;
    });
    const active = ownerCustomers?.filter(oc => oc?.customer_profiles?.account_status === 'activo' || !oc?.customer_profiles?.account_status);
    const dormant = ownerCustomers?.filter(oc => {
      const last = oc?.customer_profiles?.last_visit_at ? new Date(oc?.customer_profiles?.last_visit_at) : null;
      if (!last) return false;
      const days = (now - last) / (1000 * 60 * 60 * 24);
      return days >= 21 && days <= 60;
    });
    const lost = ownerCustomers?.filter(oc => {
      const last = oc?.customer_profiles?.last_visit_at ? new Date(oc?.customer_profiles?.last_visit_at) : null;
      if (!last) return false;
      const days = (now - last) / (1000 * 60 * 60 * 24);
      return days > 60;
    });
    const avgScore = ownerCustomers?.length > 0
      ? Math.round(ownerCustomers?.reduce((sum, oc) => sum + (oc?.customer_profiles?.engagement_score || 0), 0) / ownerCustomers?.length)
      : 0;
    const avgPoints = ownerCustomers?.length > 0
      ? Math.round(ownerCustomers?.reduce((sum, oc) => sum + (oc?.customer_profiles?.loyalty_points || 0), 0) / ownerCustomers?.length)
      : 0;

    // Segment distribution
    const segDist = [
      { name: 'Activos', value: active?.length, color: '#22c55e' },
      { name: 'Dormidos', value: dormant?.length, color: '#f97316' },
      { name: 'Perdidos', value: lost?.length, color: '#ef4444' },
      { name: 'Nuevos', value: thisMonth?.length, color: '#3b82f6' },
    ]?.filter(s => s?.value > 0);

    // VIP distribution
    const vipCounts = {};
    ownerCustomers?.forEach(oc => {
      const level = oc?.customer_profiles?.vip_level || 'Nuevo';
      vipCounts[level] = (vipCounts?.[level] || 0) + 1;
    });
    const vipDist = Object.entries(vipCounts)?.map(([name, value]) => ({ name, value }));

    setStats({
      total: ownerCustomers?.length,
      newThisMonth: thisMonth?.length,
      active: active?.length,
      dormant: dormant?.length,
      lost: lost?.length,
      avgScore,
      avgPoints,
      segDist,
      vipDist,
    });
  }, [ownerCustomers]);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const daysBack = parseInt(dateRange);
      const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)?.toISOString();
      const { data, error } = await supabase?.from('crm_communication_history')?.select('*')?.eq('owner_id', user?.id)?.gte('sent_at', since)?.order('sent_at', { ascending: false });
      if (error) throw error;
      setHistory(data || []);
    } catch (e) {
      console.error('Error fetching history:', e?.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id, dateRange]);

  useEffect(() => { computeStats(); }, [computeStats]);
  useEffect(() => { if (subTab === 'history') fetchHistory(); }, [subTab, fetchHistory]);

  const channelIcon = { push: 'Bell', whatsapp: 'MessageCircle', email: 'Mail', sms: 'Smartphone' };
  const channelColor = { push: 'text-blue-600 bg-blue-50', whatsapp: 'text-green-600 bg-green-50', email: 'text-purple-600 bg-purple-50', sms: 'text-orange-600 bg-orange-50' };

  const kpis = [
    { label: 'Total clientes', value: stats?.total || 0, icon: 'Users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Nuevos este mes', value: stats?.newThisMonth || 0, icon: 'UserPlus', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Activos', value: stats?.active || 0, icon: 'Activity', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Dormidos', value: stats?.dormant || 0, icon: 'Moon', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Perdidos', value: stats?.lost || 0, icon: 'UserMinus', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Puntos promedio', value: stats?.avgPoints || 0, icon: 'Star', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">Analytics del CRM</h2>
          <p className="text-sm text-muted-foreground">Métricas de relación con clientes</p>
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b border-border">
        {[['overview', 'BarChart2', 'Resumen'], ['segments', 'Layers', 'Segmentos'], ['history', 'Clock', 'Historia']]?.map(([id, icon, label]) => (
          <button key={id} onClick={() => setSubTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${subTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Icon name={icon} size={14} />{label}
          </button>
        ))}
      </div>

      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis?.map(kpi => (
              <div key={kpi?.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${kpi?.bg} flex items-center justify-center`}>
                    <Icon name={kpi?.icon} size={16} className={kpi?.color} />
                  </div>
                  <span className="text-xs text-muted-foreground">{kpi?.label}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{kpi?.value?.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {stats?.segDist?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">Distribución por Estado</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={stats?.segDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {stats?.segDist?.map((entry, i) => <Cell key={i} fill={entry?.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">Distribución por Nivel VIP</h3>
                {stats?.vipDist?.length > 0 ? (
                  <div className="space-y-3">
                    {stats?.vipDist?.map(v => (
                      <div key={v?.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{v?.name}</span>
                          <span className="text-muted-foreground">{v?.value} clientes ({stats?.total > 0 ? Math.round(v?.value / stats?.total * 100) : 0}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${stats?.total > 0 ? Math.round(v?.value / stats?.total * 100) : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">Sin datos de nivel VIP</div>
                )}
              </div>
            </div>
          )}

          {!stats && (
            <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
              <Icon name="BarChart2" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Agrega clientes para ver estadísticas</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'segments' && (
        <div className="space-y-4">
          {stats?.segDist?.length > 0 ? (
            <>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">Clientes por Estado</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats?.segDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Clientes">
                      {stats?.segDist?.map((entry, i) => <Cell key={i} fill={entry?.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {stats?.segDist?.map(seg => (
                  <div key={seg?.name} className="bg-card border border-border rounded-xl p-4">
                    <div className="text-2xl font-bold" style={{ color: seg?.color }}>{seg?.value}</div>
                    <div className="text-sm text-muted-foreground">{seg?.name}</div>
                    <div className="text-xs text-muted-foreground">{stats?.total > 0 ? Math.round(seg?.value / stats?.total * 100) : 0}% del total</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
              <Icon name="Layers" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Sin datos de segmentos disponibles</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'history' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Historial de comunicaciones</h3>
            <select value={dateRange} onChange={e => setDateRange(e?.target?.value)} className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background">
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
          </div>
          {loadingHistory ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Cargando historial...</div>
          ) : history?.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-border rounded-xl">
              <Icon name="Clock" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No hay comunicaciones en este período</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Fecha', 'Segmento', 'Canal', 'Mensaje', 'Enviados', 'Abiertos', 'Canjeados']?.map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history?.map(item => (
                    <tr key={item?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(item?.sent_at)?.toLocaleDateString('es-MX')}</td>
                      <td className="py-3 px-4"><span className="text-sm font-medium">{item?.segment_name || '—'}</span></td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${channelColor?.[item?.channel] || 'text-gray-600 bg-gray-50'}`}>
                          <Icon name={channelIcon?.[item?.channel] || 'MessageSquare'} size={12} />{item?.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">{item?.message || '—'}</td>
                      <td className="py-3 px-4 text-sm font-semibold">{item?.sent_count || 0}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{item?.opened_count || 0}</span>
                        {item?.sent_count > 0 && <span className="text-xs text-muted-foreground ml-1">({Math.round((item?.opened_count || 0) / item?.sent_count * 100)}%)</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-green-600 font-medium">{item?.redeemed_count || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CRMAnalyticsTab;
