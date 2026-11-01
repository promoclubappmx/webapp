import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'resumen', label: 'Resumen', icon: 'LayoutDashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
];

// ─── STATIC MOCK DATA ─────────────────────────────────────────────────────────
const DEFAULT_LEVELS = [
  { name: 'Bronce', icon: '🥉', color: '#CD7F32', clients: 180, threshold: 0, benefits: ['Acceso al programa'] },
  { name: 'Plata', icon: '🥈', color: '#C0C0C0', clients: 95, threshold: 10, benefits: ['1.5× puntos', '5% descuento'] },
  { name: 'Oro', icon: '🥇', color: '#FFD700', clients: 52, threshold: 25, benefits: ['2× puntos', '10% descuento', 'Acceso anticipado'] },
  { name: 'Diamante', icon: '💎', color: '#00BCD4', clients: 12, threshold: 60, benefits: ['3× puntos', '15% descuento', 'Servicio exclusivo'] },
  { name: 'Corona', icon: '👑', color: '#9C27B0', clients: 3, threshold: 120, benefits: ['5× puntos', '20% descuento', 'Eventos VIP'] },
];

// ─── RESUMEN TAB ──────────────────────────────────────────────────────────────
const ResumenTab = ({ onEdit, vipConfig, configLoading }) => {
  const levels = vipConfig?.levels || DEFAULT_LEVELS;
  const totalClients = levels?.reduce((s, l) => s + (l?.clients || 0), 0);
  const criterion = vipConfig?.criterion || 'visits';

  const criterionLabels = {
    visits: 'Visitas acumuladas',
    points_historical: 'Puntos históricos',
    spend: 'Gasto acumulado (MXN)',
    combo: 'Combinación visitas + puntos',
    punch_cards: 'Punch cards completadas',
    period_active: 'Frecuencia en ventana de tiempo',
    engagement_score: 'Score de engagement',
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span className="text-sm">Cargando configuración VIP...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Config summary + Levels overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config summary */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Settings2" size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Configuración activa</h3>
            </div>
            <button
              onClick={onEdit}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <Icon name="Edit3" size={12} /> Editar
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Icon name="Target" size={14} className="text-amber-600" />
                </div>
                <span className="text-sm text-foreground">Criterio de ascenso</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {criterionLabels?.[criterion] || criterion}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Icon name="Layers" size={14} className="text-purple-600" />
                </div>
                <span className="text-sm text-foreground">Niveles configurados</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{levels?.length} niveles</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon name="RefreshCw" size={14} className="text-blue-600" />
                </div>
                <span className="text-sm text-foreground">Recálculo automático</span>
              </div>
              <span className="text-sm font-semibold text-success">Activo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Icon name="Bell" size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm text-foreground">Notificaciones de ascenso</span>
              </div>
              <span className="text-sm font-semibold text-success">Activas</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center">
                  <Icon name="ShieldAlert" size={14} className="text-rose-600" />
                </div>
                <span className="text-sm text-foreground">Protección de nivel</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">30 días</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-xs text-primary">
              El programa VIP tiene <strong>{totalClients} clientes activos</strong> distribuidos en{' '}
              <strong>{levels?.length} niveles</strong>. El nivel más alto es{' '}
              <strong>{levels?.[levels?.length - 1]?.name}</strong> con{' '}
              <strong>{levels?.[levels?.length - 1]?.clients || 0} clientes</strong>.
            </p>
          </div>
        </div>

        {/* Levels overview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Crown" size={18} className="text-warning" />
              <h3 className="font-semibold text-foreground">Distribución actual de clientes</h3>
            </div>
            <span className="text-xs text-muted-foreground">{totalClients} total</span>
          </div>
          <div className="space-y-3">
            {levels?.map((level, idx) => {
              const pct = totalClients > 0 ? Math.max(((level?.clients || 0) / totalClients) * 100, 3) : 3;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-24 flex-shrink-0">
                    <span className="text-lg">{level?.icon}</span>
                    <span className="text-xs font-medium text-foreground truncate">{level?.name}</span>
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${pct}%`, background: level?.color }}
                    >
                      <span className="text-white text-xs font-bold">{level?.clients || 0}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right flex-shrink-0">
                    {totalClients > 0 ? (((level?.clients || 0) / totalClients) * 100)?.toFixed(0) : 0}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Levels thresholds */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="Milestone" size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Umbrales de ascenso configurados</h3>
          </div>
          <button
            onClick={onEdit}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <Icon name="Edit3" size={12} /> Modificar
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {levels?.map((level, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl px-4 py-3 flex-1 min-w-[140px]">
              <span className="text-2xl">{level?.icon}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{level?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {idx === 0 ? 'Nivel base' : `Desde ${level?.threshold} ${criterion === 'spend' ? 'MXN' : criterion === 'visits' ? 'visitas' : 'pts'}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits summary per level */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="Gift" size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Beneficios por nivel</h3>
          </div>
          <button
            onClick={onEdit}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <Icon name="Edit3" size={12} /> Configurar
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {levels?.map((level, idx) => (
            <div key={idx} className="rounded-xl overflow-hidden border border-border">
              <div
                className="px-3 py-2 flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, ${level?.color}, ${level?.color}99)` }}
              >
                <span className="text-xl">{level?.icon}</span>
                <span className="text-sm font-bold text-white">{level?.name}</span>
              </div>
              <div className="p-3 space-y-1.5 bg-card">
                {(level?.benefits || [])?.map((b, bi) => (
                  <div key={bi} className="flex items-start gap-1.5">
                    <Icon name="Check" size={12} className="text-success mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{typeof b === 'string' ? b : b?.value || ''}</span>
                  </div>
                ))}
                {(level?.benefits || [])?.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Sin beneficios</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Editar / Configurar Niveles',
            icon: 'Settings2',
            desc: 'Modificar niveles, umbrales y beneficios',
            action: onEdit,
            primary: true,
          },
          {
            label: 'Ver clientes VIP en CRM',
            icon: 'Users',
            desc: 'Filtrar clientes por nivel en el CRM',
            action: () => {},
          },
          {
            label: 'Automatizaciones VIP',
            icon: 'Zap',
            desc: 'Configurar triggers de ascenso y descenso',
            action: onEdit,
          },
        ]?.map(item => (
          <button
            key={item?.label}
            onClick={item?.action}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all text-left border ${
              item?.primary
                ? 'bg-primary text-white border-primary hover:bg-primary/90' :'bg-card border-border hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              item?.primary ? 'bg-white/20' : 'bg-primary/10'
            }`}>
              <Icon name={item?.icon} size={18} className={item?.primary ? 'text-white' : 'text-primary'} />
            </div>
            <div>
              <p className={`text-sm font-medium ${item?.primary ? 'text-white' : 'text-foreground'}`}>{item?.label}</p>
              <p className={`text-xs ${item?.primary ? 'text-white/70' : 'text-muted-foreground'}`}>{item?.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────────
const AnalyticsTab = () => {
  const [period, setPeriod] = useState('30d');

  const distributionData = [
    { name: 'Bronce', value: 180, color: '#CD7F32' },
    { name: 'Plata', value: 95, color: '#C0C0C0' },
    { name: 'Oro', value: 52, color: '#FFD700' },
    { name: 'Diamante', value: 12, color: '#00BCD4' },
    { name: 'Corona', value: 3, color: '#9C27B0' },
  ];

  const upgradesTrendData = [
    { semana: 'S1', upgrades: 8, downgrades: 2 },
    { semana: 'S2', upgrades: 12, downgrades: 1 },
    { semana: 'S3', upgrades: 7, downgrades: 3 },
    { semana: 'S4', upgrades: 14, downgrades: 2 },
    { semana: 'S5', upgrades: 6, downgrades: 4 },
    { semana: 'S6', upgrades: 18, downgrades: 1 },
    { semana: 'S7', upgrades: 11, downgrades: 2 },
    { semana: 'S8', upgrades: 15, downgrades: 3 },
  ];

  const retentionData = [
    { nivel: 'Bronce', retencion: 62 },
    { nivel: 'Plata', retencion: 74 },
    { nivel: 'Oro', retencion: 83 },
    { nivel: 'Diamante', retencion: 91 },
    { nivel: 'Corona', retencion: 97 },
  ];

  const growthData = [
    { mes: 'Feb', total: 290 },
    { mes: 'Mar', total: 305 },
    { mes: 'Abr', total: 318 },
    { mes: 'May', total: 324 },
    { mes: 'Jun', total: 336 },
    { mes: 'Jul', total: 342 },
  ];

  const topClients = [
    { id: 1, nombre: 'María García', nivel: 'Corona', puntos: 2840, upgrades: 4, gasto: '$12,400', ultimaVisita: 'Hoy' },
    { id: 2, nombre: 'Carlos López', nivel: 'Diamante', puntos: 1520, upgrades: 3, gasto: '$8,200', ultimaVisita: 'Ayer' },
    { id: 3, nombre: 'Ana Martínez', nivel: 'Oro', puntos: 890, upgrades: 2, gasto: '$5,600', ultimaVisita: 'Hace 2 días' },
    { id: 4, nombre: 'Luis Hernández', nivel: 'Oro', puntos: 720, upgrades: 2, gasto: '$4,900', ultimaVisita: 'Hace 3 días' },
    { id: 5, nombre: 'Sofia Torres', nivel: 'Plata', puntos: 340, upgrades: 1, gasto: '$2,100', ultimaVisita: 'Hace 1 semana' },
    { id: 6, nombre: 'Diego Ramírez', nivel: 'Plata', puntos: 210, upgrades: 1, gasto: '$1,800', ultimaVisita: 'Hace 5 días' },
  ];

  const nivelColors = {
    'Bronce': 'bg-amber-100 text-amber-700',
    'Plata': 'bg-gray-100 text-gray-600',
    'Oro': 'bg-yellow-100 text-yellow-700',
    'Diamante': 'bg-cyan-100 text-cyan-700',
    'Corona': 'bg-purple-100 text-purple-700',
  };

  const kpis = [
    { label: 'Tasa de upgrade', value: '13.7%', change: '+2.1%', positive: true, icon: 'TrendingUp', color: 'text-success', bg: 'bg-success/10', sub: 'vs. mes anterior' },
    { label: 'Tasa de downgrade', value: '2.3%', change: '-0.8%', positive: true, icon: 'TrendingDown', color: 'text-destructive', bg: 'bg-destructive/10', sub: 'vs. mes anterior' },
    { label: 'Retención promedio', value: '81.4%', change: '+3.2%', positive: true, icon: 'ShieldCheck', color: 'text-primary', bg: 'bg-primary/10', sub: 'todos los niveles' },
    { label: 'Crecimiento mensual', value: '+18', change: '+6 vs S-1', positive: true, icon: 'Users', color: 'text-warning', bg: 'bg-warning/10', sub: 'nuevos clientes VIP' },
  ];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Métricas de rendimiento del programa VIP</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Datos de actividad, movimientos y retención por nivel</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {['7d', '30d', '90d']?.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === '7d' ? '7 días' : p === '30d' ? '30 días' : '90 días'}
            </button>
          ))}
        </div>
      </div>
      {/* Performance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis?.map((kpi) => (
          <div key={kpi?.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi?.bg} flex items-center justify-center`}>
                <Icon name={kpi?.icon} size={20} className={kpi?.color} />
              </div>
              <span className={`text-xs font-medium ${kpi?.positive ? 'text-success' : 'text-destructive'}`}>
                {kpi?.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs font-medium text-foreground mt-0.5">{kpi?.label}</p>
            <p className="text-xs text-muted-foreground">{kpi?.sub}</p>
          </div>
        ))}
      </div>
      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upgrades vs Downgrades trend */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground text-sm">Upgrades vs Downgrades</h3>
              <p className="text-xs text-muted-foreground">Movimientos semanales de nivel</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={upgradesTrendData} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="semana" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="upgrades" name="Upgrades" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="downgrades" name="Downgrades" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution pie */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground text-sm">Distribución de clientes por nivel</h3>
            <p className="text-xs text-muted-foreground">342 clientes VIP activos</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {distributionData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} clientes`, 'Total']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention by level */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground text-sm">Tasa de retención por nivel</h3>
            <p className="text-xs text-muted-foreground">% de clientes que mantienen o suben de nivel</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={retentionData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="nivel" type="category" tick={{ fontSize: 11 }} width={65} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value}%`, 'Retención']} />
              <Bar dataKey="retencion" name="Retención" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                {retentionData?.map((entry, index) => (
                  <Cell key={index} fill={distributionData?.[index]?.color || '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth trend */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground text-sm">Crecimiento total de clientes VIP</h3>
            <p className="text-xs text-muted-foreground">Evolución mensual del programa</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="vipGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip formatter={(value) => [`${value} clientes`, 'Total VIP']} />
              <Area type="monotone" dataKey="total" name="Total VIP" stroke="#3B82F6" strokeWidth={2} fill="url(#vipGrowth)" dot={{ r: 4, fill: '#3B82F6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Top clients table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Top clientes VIP</h3>
            <p className="text-xs text-muted-foreground">Clientes con mayor actividad y gasto en el programa</p>
          </div>
          <button className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            <Icon name="ExternalLink" size={12} /> Ver todos en CRM
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Cliente</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Nivel</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Puntos</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Upgrades</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Gasto total</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Última visita</th>
              </tr>
            </thead>
            <tbody>
              {topClients?.map((client) => (
                <tr key={client?.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-foreground">{client?.nombre}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${nivelColors?.[client?.nivel] || 'bg-muted text-muted-foreground'}`}>
                      {client?.nivel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-foreground font-medium">{client?.puntos?.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className="flex items-center gap-1 text-success font-medium">
                      <Icon name="ArrowUp" size={12} />
                      {client?.upgrades}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-foreground font-medium">{client?.gasto}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{client?.ultimaVisita}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const VIPLevelsManagement = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [vipConfig, setVipConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  const user = {
    name: authUser?.user_metadata?.full_name || authUser?.email || 'Usuario',
    email: authUser?.email || '',
    role: authUser?.user_metadata?.role || 'owner',
  };

  useEffect(() => {
    const loadVIPConfig = async () => {
      if (!authUser?.id) { setConfigLoading(false); return; }
      try {
        // Load VIP config + levels from correct tables
        const [configRes, levelsRes] = await Promise.all([
          supabase?.from('vip_levels_config')?.select('*')?.eq('business_id', authUser?.id)?.maybeSingle(),
          supabase?.from('vip_levels')?.select('*, vip_level_benefits(*)')?.eq('business_id', authUser?.id)?.order('sort_order', { ascending: true }),
        ]);

        const configData = configRes?.data;
        const levelsData = levelsRes?.data || [];

        if (configData || levelsData?.length > 0) {
          setVipConfig({
            criterion: configData?.criterion || 'visits',
            evaluationType: configData?.evaluation_type || 'lifetime',
            levels: levelsData?.map(l => ({
              name: l?.name,
              icon: l?.icon || '🥉',
              color: l?.color || '#CD7F32',
              threshold: l?.threshold || 0,
              clients: l?.clients_count || 0,
              benefits: (l?.vip_level_benefits || [])?.map(b => b?.benefit_value),
            })),
          });
        }
      } catch (err) {
        console.error('Error loading VIP config:', err);
      } finally {
        setConfigLoading(false);
      }
    };
    loadVIPConfig();
  }, [authUser?.id]);

  const handleEdit = () => navigate('/vip-levels-management/wizard');

  const renderContent = () => {
    switch (activeTab) {
      case 'resumen': return <ResumenTab onEdit={handleEdit} vipConfig={vipConfig} configLoading={configLoading} />;
      case 'analytics': return <AnalyticsTab />;
      default: return null;
    }
  };

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
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Niveles VIP</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Resumen del programa VIP, distribución de clientes y analytics.
              </p>
            </div>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors self-start"
            >
              <Icon name="Settings2" size={16} />
              Editar / Configurar Niveles
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-1 overflow-x-auto">
              {TABS?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div className="pb-12">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VIPLevelsManagement;
