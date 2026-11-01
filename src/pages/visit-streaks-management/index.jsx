import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const POINT_VALUE_MXN = 0.15;

const DEFAULT_STREAK_STEPS = [
  { visit: 2, bonus: 5 },
  { visit: 3, bonus: 10 },
  { visit: 5, bonus: 20 },
  { visit: 7, bonus: 30 },
  { visit: 10, bonus: 50 },
  { visit: 15, bonus: 100 },
];

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: 'LayoutDashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
];

const StatCard = ({ label, value, sub, icon, color, trend = undefined }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon name={icon} size={20} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium flex items-center gap-1 ${trend >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
          <Icon name={trend >= 0 ? 'TrendingUp' : 'TrendingDown'} size={12} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

// ─── RESUMEN TAB ──────────────────────────────────────────────────────────────
const ResumenTab = ({ onEdit, streakConfig, loading }) => {
  const steps = streakConfig?.streakSteps || DEFAULT_STREAK_STEPS;
  const maxBonus = steps?.[steps?.length - 1]?.bonus || 100;
  const maxBonusMXN = (maxBonus * POINT_VALUE_MXN)?.toFixed(2);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span className="text-sm">Cargando configuración de rachas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Config summary + Steps overview */}
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
                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                  <span className="text-sm">{streakConfig?.streakEmoji || '🔥'}</span>
                </div>
                <span className="text-sm text-foreground">Nombre de la racha</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{streakConfig?.streakName || 'Racha de Visitas'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={14} className="text-blue-600" />
                </div>
                <span className="text-sm text-foreground">Ventana de racha</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{streakConfig?.streakWindow || 7} días</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Icon name="Layers" size={14} className="text-amber-600" />
                </div>
                <span className="text-sm text-foreground">Escalones configurados</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{steps?.length} escalones</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                  <Icon name="RefreshCw" size={14} className="text-red-500" />
                </div>
                <span className="text-sm text-foreground">Al romper la racha</span>
              </div>
              <span className="text-sm font-semibold text-foreground capitalize">
                {streakConfig?.breakBehavior === 'step_down' ? 'Bajar un escalón' : 'Reiniciar a 0'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Icon name="Bell" size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm text-foreground">Notif. racha en riesgo</span>
              </div>
              <span className={`text-sm font-semibold ${streakConfig?.notifyRisk ? 'text-success' : 'text-muted-foreground'}`}>
                {streakConfig?.notifyRisk ? `${streakConfig?.riskNotifyDays || 1} día antes` : 'Desactivada'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={14} className="text-violet-600" />
                </div>
                <span className="text-sm text-foreground">Límite diario de bonus</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{streakConfig?.dailyBonusLimit || 1} vez/día</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                  <Icon name="RotateCcw" size={14} className="text-teal-600" />
                </div>
                <span className="text-sm text-foreground">Restauración de racha</span>
              </div>
              <span className={`text-sm font-semibold ${streakConfig?.restorationActive ? 'text-success' : 'text-muted-foreground'}`}>
                {streakConfig?.restorationActive ? 'Activada' : 'Desactivada'}
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-xs text-primary">
              El programa tiene <strong>{steps?.length} escalones</strong> con bonus máximo de{' '}
              <strong>{maxBonus} pts</strong> (${maxBonusMXN} MXN) en la visita #{steps?.[steps?.length - 1]?.visit}.
            </p>
          </div>
        </div>

        {/* Steps overview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Flame" size={18} className="text-orange-500" />
              <h3 className="font-semibold text-foreground">Escalones de bonus</h3>
            </div>
            <button
              onClick={onEdit}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <Icon name="Edit3" size={12} /> Configurar
            </button>
          </div>
          <div className="space-y-2">
            {steps?.map((step, idx) => {
              const pct = Math.max((step?.bonus / maxBonus) * 100, 8);
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-24 flex-shrink-0">
                    <span className="text-sm">{streakConfig?.streakEmoji || '🔥'}</span>
                    <span className="text-xs font-medium text-foreground">Visita #{step?.visit}</span>
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-6 rounded-full flex items-center justify-end pr-2 transition-all bg-gradient-to-r from-orange-400 to-orange-500"
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-white text-xs font-bold">+{step?.bonus}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-14 text-right flex-shrink-0">
                    ${(step?.bonus * POINT_VALUE_MXN)?.toFixed(2)} MXN
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg">
            <p className="text-xs text-orange-700">
              Bonus acumulado máximo: <strong>{steps?.reduce((s, st) => s + st?.bonus, 0)} pts</strong> si el cliente completa todos los escalones.
            </p>
          </div>
        </div>
      </div>

      {/* Reglas adicionales */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="ShieldCheck" size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">Reglas y comportamiento del programa</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/40 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Target" size={15} className="text-orange-500" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Criterio de racha</span>
            </div>
            <p className="text-sm text-foreground font-medium">Visitas consecutivas</p>
            <p className="text-xs text-muted-foreground mt-1">Cada visita dentro de la ventana de {streakConfig?.streakWindow || 7} días suma al contador</p>
          </div>
          <div className="p-4 bg-muted/40 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="RefreshCw" size={15} className="text-red-500" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Al romper racha</span>
            </div>
            <p className="text-sm text-foreground font-medium">{streakConfig?.breakBehavior === 'step_down' ? 'Bajar un escalón' : 'Reiniciar a 0'}</p>
            <p className="text-xs text-muted-foreground mt-1">El contador vuelve a cero si el cliente no visita en {streakConfig?.streakWindow || 7} días</p>
          </div>
          <div className="p-4 bg-muted/40 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Bell" size={15} className="text-emerald-500" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Notificaciones</span>
            </div>
            <p className="text-sm text-foreground font-medium">
              {streakConfig?.notifyRisk ? `Alerta ${streakConfig?.riskNotifyDays || 1} día antes` : 'Sin alertas'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Se notifica al cliente cuando su racha está próxima a romperse</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: 'Settings2', label: 'Configurar escalones', desc: 'Ajusta los bonus por visita consecutiva', color: 'text-primary bg-primary/10', action: onEdit },
          { icon: 'Bell', label: 'Gestionar notificaciones', desc: 'Configura alertas de racha en riesgo', color: 'text-purple-600 bg-purple-50', action: onEdit },
          { icon: 'BarChart3', label: 'Ver analytics', desc: 'Analiza el rendimiento del programa', color: 'text-blue-600 bg-blue-50', action: null },
        ]?.map((action, idx) => (
          <button
            key={idx}
            onClick={action?.action || undefined}
            className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${action?.color}`}>
              <Icon name={action?.icon} size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{action?.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{action?.desc}</p>
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

  const kpis = [
    { label: 'Clientes con racha activa', value: '284', change: '+12%', icon: 'Flame', color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Tasa de retención de racha', value: '68.4%', change: '+5.2%', icon: 'TrendingUp', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Rachas rotas este período', value: '142', change: '-8%', icon: 'XCircle', color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Bonus entregados', value: '1,840 pts', change: '+23%', icon: 'Gift', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const weeklyData = [
    { day: 'Lun', nuevas: 18, rotas: 5, activas: 240 },
    { day: 'Mar', nuevas: 22, rotas: 8, activas: 254 },
    { day: 'Mié', nuevas: 15, rotas: 12, activas: 257 },
    { day: 'Jue', nuevas: 28, rotas: 6, activas: 279 },
    { day: 'Vie', nuevas: 35, rotas: 9, activas: 305 },
    { day: 'Sáb', nuevas: 42, rotas: 4, activas: 343 },
    { day: 'Dom', nuevas: 20, rotas: 18, activas: 345 },
  ];

  const retentionData = [
    { semana: 'S1', retencion: 82 },
    { semana: 'S2', retencion: 78 },
    { semana: 'S3', retencion: 74 },
    { semana: 'S4', retencion: 71 },
    { semana: 'S5', retencion: 68 },
    { semana: 'S6', retencion: 70 },
    { semana: 'S7', retencion: 73 },
    { semana: 'S8', retencion: 68 },
  ];

  const bonusData = [
    { escalon: 'Visita #2', entregados: 320, pts: 1600 },
    { escalon: 'Visita #3', entregados: 210, pts: 2100 },
    { escalon: 'Visita #5', entregados: 145, pts: 2900 },
    { escalon: 'Visita #7', entregados: 88, pts: 2640 },
    { escalon: 'Visita #10', entregados: 52, pts: 2600 },
    { escalon: 'Visita #15', entregados: 18, pts: 1800 },
  ];

  const distributionData = [
    { name: '2-3 visitas', value: 120, color: '#f97316' },
    { name: '4-6 visitas', value: 85, color: '#fb923c' },
    { name: '7-10 visitas', value: 52, color: '#fdba74' },
    { name: '11-15 visitas', value: 18, color: '#fed7aa' },
    { name: '15+ visitas', value: 9, color: '#ffedd5' },
  ];

  const topClients = [
    { name: 'María García', streak: 23, bonus: 180, lastVisit: 'Hoy' },
    { name: 'Carlos López', streak: 18, bonus: 130, lastVisit: 'Ayer' },
    { name: 'Ana Martínez', streak: 15, bonus: 100, lastVisit: 'Hoy' },
    { name: 'Luis Hernández', streak: 12, bonus: 80, lastVisit: 'Hace 2 días' },
    { name: 'Sofia Torres', streak: 10, bonus: 50, lastVisit: 'Hoy' },
  ];

  const atRiskClients = [
    { name: 'Roberto Díaz', streak: 8, daysLeft: 1 },
    { name: 'Patricia Ruiz', streak: 12, daysLeft: 1 },
    { name: 'Miguel Sánchez', streak: 5, daysLeft: 2 },
    { name: 'Laura Jiménez', streak: 7, daysLeft: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Métricas de rendimiento del programa de rachas</p>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {[{ id: '7d', label: '7 días' }, { id: '30d', label: '30 días' }, { id: '90d', label: '90 días' }]?.map(p => (
            <button
              key={p?.id}
              onClick={() => setPeriod(p?.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p?.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {p?.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-10 h-10 ${kpi?.bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon name={kpi?.icon} size={20} className={kpi?.color} />
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi?.label}</p>
            {kpi?.change && (
              <p className={`text-xs font-medium mt-1 ${kpi?.change?.startsWith('-') ? 'text-red-500' : 'text-emerald-600'}`}>
                {kpi?.change} vs período anterior
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Evolución semanal */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Evolución semanal de rachas</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="nuevas" name="Nuevas rachas" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rotas" name="Rachas rotas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Retención + Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-1">Tasa de retención de racha</h3>
          <p className="text-xs text-muted-foreground mb-4">% de clientes que mantienen su racha semana a semana</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={retentionData}>
              <defs>
                <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 90]} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Retención']} />
              <Area type="monotone" dataKey="retencion" stroke="#3b82f6" strokeWidth={2} fill="url(#retGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Distribución de rachas activas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                {distributionData?.map((entry, i) => (
                  <Cell key={i} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} clientes`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bonus por escalón */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-1">Bonus entregados por escalón</h3>
        <p className="text-xs text-muted-foreground mb-4">Cantidad de bonus otorgados y puntos totales por cada escalón del programa</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={bonusData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="escalon" type="category" tick={{ fontSize: 11 }} width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="entregados" name="Bonus entregados" fill="#f97316" radius={[0, 4, 4, 0]} />
            <Bar dataKey="pts" name="Puntos totales" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* At risk + Top clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="AlertTriangle" size={16} className="text-amber-500" />
            Clientes con racha en riesgo
          </h3>
          <div className="space-y-3">
            {atRiskClients?.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{c?.name}</p>
                  <p className="text-xs text-muted-foreground">Racha de {c?.streak} visitas</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-amber-700">{c?.daysLeft === 1 ? '¡Hoy!' : `${c?.daysLeft} días`}</p>
                  <p className="text-xs text-muted-foreground">para perder racha</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Top clientes por racha activa</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">#</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Racha</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Bonus</th>
              </tr>
            </thead>
            <tbody>
              {topClients?.map((c, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/20">
                  <td className="p-3 font-bold text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-medium text-foreground">{c?.name}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1">
                      <span className="text-orange-500">🔥</span>
                      <span className="font-semibold">{c?.streak}</span>
                    </span>
                  </td>
                  <td className="p-3 text-primary font-medium">+{c?.bonus} pts</td>
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
const VisitStreaksManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [streakConfig, setStreakConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  const { user: authUser } = useAuth();
  const user = {
    name: authUser?.user_metadata?.full_name || authUser?.email || 'Usuario',
    email: authUser?.email || '',
    role: authUser?.user_metadata?.role || 'owner'
  };

  // Load streak config from Supabase (loyalty_programs.bonus_streak_config)
  useEffect(() => {
    const loadStreakConfig = async () => {
      if (!authUser?.id) { setConfigLoading(false); return; }
      try {
        const { data, error } = await supabase
          ?.from('loyalty_programs')
          ?.select('bonus_streak_enabled, bonus_streak_config, id')
          ?.eq('business_id', authUser?.id)
          ?.maybeSingle();

        if (!error && data) {
          const raw = data?.bonus_streak_config || {};
          setStreakConfig({
            active: data?.bonus_streak_enabled || false,
            streakName: raw?.streakName || 'Racha de Visitas',
            streakEmoji: raw?.streakEmoji || '🔥',
            streakWindow: raw?.windowDays || raw?.streakWindow || 7,
            breakBehavior: raw?.breakBehavior || 'reset',
            notifyRisk: raw?.notifyRisk || false,
            riskNotifyDays: raw?.riskNotifyDays || 1,
            restorationActive: raw?.restorationActive || false,
            dailyBonusLimit: raw?.dailyBonusLimit || 1,
            streakSteps: raw?.steps || raw?.streakSteps || DEFAULT_STREAK_STEPS,
            rewardsConfig: raw?.rewardsConfig || null,
          });
        }
      } catch (err) {
        console.error('Error loading streak config:', err);
      } finally {
        setConfigLoading(false);
      }
    };
    loadStreakConfig();
  }, [authUser?.id]);

  const handleEdit = () => navigate('/visit-streaks-management/wizard');

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rachas de Visitas</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitorea y configura el sistema de rachas de visitas consecutivas para premiar la constancia de tus clientes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleEdit} iconName="Settings2">
                Editar / Configurar Rachas
              </Button>
            </div>
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
                      ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="pb-12">
            {activeTab === 'resumen' && <ResumenTab onEdit={handleEdit} streakConfig={streakConfig} loading={configLoading} />}
            {activeTab === 'analytics' && <AnalyticsTab />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisitStreaksManagement;
