import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

// ─── Status Pills ─────────────────────────────────────────────────────────────
const STATUS_PILLS = [
  { key: 'all', label: 'Todas', color: 'bg-muted text-muted-foreground', activeColor: 'bg-primary text-white' },
  { key: 'active', label: 'Activas', color: 'bg-muted text-muted-foreground', activeColor: 'bg-primary text-white' },
  { key: 'inactive', label: 'Inactivas', color: 'bg-muted text-muted-foreground', activeColor: 'bg-primary text-white' },
  { key: 'expired', label: 'Vencidas', color: 'bg-muted text-muted-foreground', activeColor: 'bg-primary text-white' },
];

const MECHANIC_ICONS = {
  'ruleta': '🎡',
  'raspa': '🎟️',
  'cofre': '📦',
  'sobre': '✉️',
  'caja': '🎁',
  'dados': '🎲',
  'globo': '🎈',
  'loteria': '🃏',
  'pesca': '🎣',
  'gacha': '🎰',
  'arbol': '🌳',
  'maquina': '🏧',
};

const MECHANIC_COLORS = {
  'ruleta': 'bg-blue-100 text-blue-700',
  'raspa': 'bg-purple-100 text-purple-700',
  'cofre': 'bg-amber-100 text-amber-700',
  'sobre': 'bg-green-100 text-green-700',
  'caja': 'bg-rose-100 text-rose-700',
  'dados': 'bg-indigo-100 text-indigo-700',
  'globo': 'bg-pink-100 text-pink-700',
  'loteria': 'bg-orange-100 text-orange-700',
  'pesca': 'bg-cyan-100 text-cyan-700',
  'gacha': 'bg-violet-100 text-violet-700',
  'arbol': 'bg-emerald-100 text-emerald-700',
  'maquina': 'bg-slate-100 text-slate-700',
};

const getMechanicKey = (mechanic) => {
  if (!mechanic) return 'caja';
  const m = mechanic?.toLowerCase();
  if (m?.includes('ruleta')) return 'ruleta';
  if (m?.includes('raspa')) return 'raspa';
  if (m?.includes('cofre')) return 'cofre';
  if (m?.includes('sobre')) return 'sobre';
  if (m?.includes('caja') || m?.includes('blind')) return 'caja';
  if (m?.includes('dado')) return 'dados';
  if (m?.includes('globo')) return 'globo';
  if (m?.includes('loter')) return 'loteria';
  if (m?.includes('pesca')) return 'pesca';
  if (m?.includes('gacha') || m?.includes('capsula')) return 'gacha';
  if (m?.includes('arbol') || m?.includes('árbol')) return 'arbol';
  if (m?.includes('maquina') || m?.includes('máquina')) return 'maquina';
  return 'caja';
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl mx-4">
        <h3 className="font-semibold text-foreground text-base mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-5">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Surprise Card ────────────────────────────────────────────────────────────
const SurpriseCard = ({ surprise, onEdit, onDelete, onToggleStatus }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusConfig = {
    active: { label: 'Activa', cls: 'bg-green-100 text-green-700 border border-green-200' },
    inactive: { label: 'Inactiva', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
    expired: { label: 'Vencida', cls: 'bg-red-100 text-red-700 border border-red-200' },
  };
  const st = statusConfig?.[surprise?.status] || statusConfig?.active;
  const mechanicKey = getMechanicKey(surprise?.mechanic);
  const mechanicLabel = surprise?.mechanic || 'Sorpresa';

  const activations = surprise?.activations ?? 0;
  const conversions = surprise?.conversions ?? 0;
  const convRate = activations > 0 ? `${Math.round((conversions / activations) * 100)}%` : '—';

  const triggerLabel = (() => {
    const triggers = surprise?.active_triggers;
    if (!triggers) return 'Sin trigger';
    const keys = Object.keys(triggers)?.filter(k => triggers?.[k]);
    if (keys?.length === 0) return 'Sin trigger';
    const labels = {
      first_visit: 'Primera visita',
      checkin: 'Al hacer check-in',
      birthday: 'Cumpleaños',
      vip_upgrade: 'Al subir de nivel VIP',
      punch_card: 'Al completar punch card',
      reactivation: 'Al reactivarse',
      anniversary: 'Aniversario',
    };
    return labels?.[keys?.[0]] || keys?.[0];
  })();

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all group relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-xl">
            {MECHANIC_ICONS?.[mechanicKey] || '🎁'}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm leading-tight">{surprise?.name}</h3>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${MECHANIC_COLORS?.[mechanicKey] || 'bg-muted text-muted-foreground'}`}>
              {mechanicLabel}
            </span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st?.cls}`}>
          {st?.label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{surprise?.description || 'Sin descripción'}</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{activations}</p>
          <p className="text-xs text-muted-foreground">Activaciones</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-lg font-bold text-foreground">{conversions}</p>
          <p className="text-xs text-muted-foreground">Canjeadas</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-primary">{convRate}</p>
          <p className="text-xs text-muted-foreground">Conversión</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="Zap" size={12} />
          <span>{triggerLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(surprise?.id)}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Editar"
          >
            <Icon name="Pencil" size={14} className="text-muted-foreground" />
          </button>
          {/* Actions menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Más acciones"
            >
              <Icon name="MoreHorizontal" size={14} className="text-muted-foreground" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 bottom-8 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
                  {surprise?.status !== 'expired' && (
                    <button
                      onClick={() => { setMenuOpen(false); onToggleStatus(surprise); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon name={surprise?.status === 'active' ? 'PauseCircle' : 'PlayCircle'} size={14} className="text-amber-500" />
                      {surprise?.status === 'active' ? 'Inactivar' : 'Activar'}
                    </button>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(surprise); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Icon name="Trash2" size={14} className="text-red-500" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Analytics Tab ────────────────────────────────────────────────────────────
const SurprisesAnalyticsTab = () => {
  const kpis = [
    { label: 'Total Enviadas', value: '1,248', change: '+12%', icon: 'Gift', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Tasa de Apertura', value: '78.4%', change: '+5.2%', icon: 'Eye', color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Tasa de Conversión', value: '34.1%', change: '+2.8%', icon: 'TrendingUp', color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Valor Promedio', value: '$45 MXN', change: '+8%', icon: 'DollarSign', color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const distributionData = [
    { name: 'Ruleta', value: 42, color: '#3B82F6' },
    { name: 'Raspa y Gana', value: 28, color: '#7C3AED' },
    { name: 'Cofre Misterioso', value: 18, color: '#059669' },
    { name: 'Sobre Sorpresa', value: 12, color: '#D97706' },
  ];

  const weeklyData = [
    { day: 'Lun', enviadas: 45, abiertas: 38, convertidas: 15 },
    { day: 'Mar', enviadas: 62, abiertas: 50, convertidas: 22 },
    { day: 'Mié', enviadas: 38, abiertas: 30, convertidas: 12 },
    { day: 'Jue', enviadas: 71, abiertas: 58, convertidas: 25 },
    { day: 'Vie', enviadas: 89, abiertas: 72, convertidas: 31 },
    { day: 'Sáb', enviadas: 95, abiertas: 80, convertidas: 35 },
    { day: 'Dom', enviadas: 55, abiertas: 44, convertidas: 18 },
  ];

  const trendData = [
    { mes: 'Ene', activaciones: 320 }, { mes: 'Feb', activaciones: 410 },
    { mes: 'Mar', activaciones: 380 }, { mes: 'Abr', activaciones: 520 },
    { mes: 'May', activaciones: 610 }, { mes: 'Jun', activaciones: 748 },
  ];

  const recentEvents = [
    { id: 1, cliente: 'María García', tipo: 'Ruleta', premio: '10 puntos extra', fecha: 'Hace 5 min', estado: 'Canjeado' },
    { id: 2, cliente: 'Carlos López', tipo: 'Raspa y Gana', premio: '15% descuento', fecha: 'Hace 12 min', estado: 'Abierto' },
    { id: 3, cliente: 'Ana Martínez', tipo: 'Cofre Misterioso', premio: 'Café gratis', fecha: 'Hace 28 min', estado: 'Canjeado' },
    { id: 4, cliente: 'Luis Hernández', tipo: 'Sobre Sorpresa', premio: '5 puntos extra', fecha: 'Hace 45 min', estado: 'Pendiente' },
    { id: 5, cliente: 'Sofia Torres', tipo: 'Ruleta', premio: '30% descuento', fecha: 'Hace 1 hora', estado: 'Canjeado' },
    { id: 6, cliente: 'Diego Ramírez', tipo: 'Raspa y Gana', premio: 'Galleta gratis', fecha: 'Hace 2 horas', estado: 'Expirado' },
  ];

  const estadoColor = {
    'Canjeado': 'bg-green-100 text-green-700',
    'Abierto': 'bg-primary/10 text-primary',
    'Pendiente': 'bg-amber-100 text-amber-700',
    'Expirado': 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis?.map((kpi) => (
          <div key={kpi?.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi?.bg} flex items-center justify-center`}>
                <Icon name={kpi?.icon} size={20} className={kpi?.color} />
              </div>
              <span className="text-xs font-medium text-green-600">{kpi?.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi?.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Actividad Semanal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="enviadas" name="Enviadas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="abiertas" name="Abiertas" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="convertidas" name="Convertidas" fill="#D97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Distribución por Tipo</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {distributionData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Uso']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Tendencia de Activaciones (6 meses)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="activaciones" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Eventos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tipo</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Premio</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Fecha</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents?.map((event) => (
                <tr key={event?.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-foreground">{event?.cliente}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{event?.tipo}</td>
                  <td className="py-2.5 px-3 text-foreground">{event?.premio}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{event?.fecha}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor?.[event?.estado]}`}>
                      {event?.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── History Tab ──────────────────────────────────────────────────────────────
const SurprisesHistoryTab = () => {
  const [filterTrigger, setFilterTrigger] = useState('');
  const [filterRedeemed, setFilterRedeemed] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const HISTORY = [
    { id: 1, date: '2026-06-02 14:32', client: 'Ana García', trigger: 'Al hacer check-in', mechanic: 'Ruleta', prize: '10 puntos extra', redeemed: true },
    { id: 2, date: '2026-06-02 11:15', client: 'Carlos López', trigger: 'Al subir de nivel VIP', mechanic: 'Cofre Misterioso', prize: 'Café gratis', redeemed: false },
    { id: 3, date: '2026-06-01 18:45', client: 'María Torres', trigger: 'Aniversario como cliente', mechanic: 'Sobre Sorpresa', prize: '30% de descuento', redeemed: true },
    { id: 4, date: '2026-06-01 10:20', client: 'Luis Martínez', trigger: 'Al hacer check-in', mechanic: 'Ruleta', prize: '5 puntos extra', redeemed: true },
    { id: 5, date: '2026-05-31 16:00', client: 'Sofía Ramírez', trigger: 'Al completar punch card', mechanic: 'Raspa y Gana', prize: 'Galleta gratis', redeemed: false },
    { id: 6, date: '2026-05-30 09:15', client: 'Diego Morales', trigger: 'Primera visita', mechanic: 'Caja Ciega', prize: '20% descuento', redeemed: true },
    { id: 7, date: '2026-05-29 17:40', client: 'Valentina Cruz', trigger: 'Cumpleaños', mechanic: 'Raspa y Gana', prize: 'Postre gratis', redeemed: true },
  ];

  const filtered = HISTORY?.filter(row => {
    if (filterTrigger && !row?.trigger?.toLowerCase()?.includes(filterTrigger?.toLowerCase())) return false;
    if (filterRedeemed === 'yes' && !row?.redeemed) return false;
    if (filterRedeemed === 'no' && row?.redeemed) return false;
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center">
            <Icon name="History" size={18} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Historial de activaciones</h3>
            <p className="text-xs text-muted-foreground">Todos los juegos ejecutados en el módulo</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs text-muted-foreground transition-colors">
          <Icon name="Download" size={12} />
          Exportar Excel
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input
          type="text" placeholder="Filtrar por trigger…"
          value={filterTrigger} onChange={e => setFilterTrigger(e?.target?.value)}
          className="px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
        />
        <select
          value={filterRedeemed} onChange={e => setFilterRedeemed(e?.target?.value)}
          className="px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="yes">Canjeados</option>
          <option value="no">Sin canjear</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e?.target?.value)} className="px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e?.target?.value)} className="px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Fecha/Hora</th>
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Cliente</th>
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Trigger</th>
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Mecánica</th>
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Premio</th>
              <th className="text-center py-2 font-medium text-muted-foreground">Canjeado</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map(row => (
              <tr key={row?.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{row?.date}</td>
                <td className="py-2 pr-3 font-medium text-foreground">{row?.client}</td>
                <td className="py-2 pr-3 text-muted-foreground">{row?.trigger}</td>
                <td className="py-2 pr-3 text-muted-foreground">{row?.mechanic}</td>
                <td className="py-2 pr-3 text-foreground">{row?.prize}</td>
                <td className="py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${row?.redeemed ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {row?.redeemed ? '✓ Sí' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">No hay activaciones que coincidan con los filtros.</div>
        )}
      </div>
    </div>
  );
};

// ─── Main Surprises List Tab ──────────────────────────────────────────────────
const SorpresasListTab = ({ surprises, loading, establishments, selectedEstablishment, setSelectedEstablishment, onEdit, onDelete, onToggleStatus }) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = surprises?.filter(s => {
    if (statusFilter !== 'all' && s?.status !== statusFilter) return false;
    if (searchQuery && !s?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())) return false;
    if (selectedEstablishment !== 'all') {
      if (!s?.apply_to_all) {
        const ids = s?.establishment_ids || [];
        if (!ids?.includes(selectedEstablishment)) return false;
      }
    }
    return true;
  });

  const counts = {
    all: surprises?.length,
    active: surprises?.filter(s => s?.status === 'active')?.length,
    inactive: surprises?.filter(s => s?.status === 'inactive')?.length,
    expired: surprises?.filter(s => s?.status === 'expired')?.length,
  };

  return (
    <div className="space-y-5">
      {/* Establishment Filter */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Building2" size={15} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Establecimiento</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedEstablishment('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedEstablishment === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            Todos los establecimientos
          </button>
          {establishments?.map(est => (
            <button
              key={est?.id}
              onClick={() => setSelectedEstablishment(est?.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedEstablishment === est?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {est?.location_name}
            </button>
          ))}
        </div>
      </div>

      {/* Status Pills + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_PILLS?.map(pill => (
            <button
              key={pill?.key}
              onClick={() => setStatusFilter(pill?.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter === pill?.key ? pill?.activeColor : pill?.color + ' hover:bg-muted/80'}`}
            >
              {pill?.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === pill?.key ? 'bg-white/20' : 'bg-muted-foreground/20'}`}>
                {counts?.[pill?.key]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar sorpresa…"
            value={searchQuery}
            onChange={e => setSearchQuery(e?.target?.value)}
            className="pl-8 pr-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-52"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Grid */}
      {!loading && filtered?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered?.map(s => (
            <SurpriseCard
              key={s?.id}
              surprise={s}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}

      {!loading && filtered?.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Gift" size={28} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No hay sorpresas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {statusFilter !== 'all'
              ? `No hay sorpresas con estado "${STATUS_PILLS?.find(p => p?.key === statusFilter)?.label}"`
              : 'Crea tu primera sorpresa para comenzar'}
          </p>
          <button
            onClick={() => navigate('/surprises-management/new')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + Nueva Sorpresa
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const SurprisesManagement = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('sorpresas');
  const [establishments, setEstablishments] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');

  // Supabase real-time surprises
  const [surprises, setSurprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, surprise: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const user = {
    name: authUser?.user_metadata?.full_name || authUser?.email || 'Usuario',
    email: authUser?.email || '',
    role: authUser?.user_metadata?.role || 'owner',
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch business ID
  useEffect(() => {
    const fetchBusinessId = async () => {
      if (!authUser?.id) return;
      try {
        const { data: profile } = await supabase
          ?.from('user_profiles')
          ?.select('user_id')
          ?.eq('id', authUser?.id)
          ?.single();
        const bId = profile?.user_id || authUser?.id;
        setBusinessId(bId);
      } catch (err) {
        console.error('Error fetching business id:', err);
        setBusinessId(authUser?.id);
      }
    };
    fetchBusinessId();
  }, [authUser?.id]);

  // Fetch establishments
  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!businessId) return;
      try {
        const { data } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code, is_active')
          ?.eq('business_id', businessId)
          ?.eq('is_active', true)
          ?.order('location_name');
        setEstablishments(data || []);
      } catch (err) {
        console.error('Error loading establishments:', err);
      }
    };
    fetchEstablishments();
  }, [businessId]);

  // Fetch surprises + real-time subscription
  const fetchSurprises = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        ?.from('surprise_configs')
        ?.select('*')
        ?.eq('business_id', businessId)
        ?.order('created_at', { ascending: false });
      if (error) throw error;
      setSurprises(data || []);
    } catch (err) {
      console.error('Error fetching surprises:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    fetchSurprises();

    // Real-time subscription
    const channel = supabase
      ?.channel('surprise_configs_changes')
      ?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'surprise_configs', filter: `business_id=eq.${businessId}` },
        () => { fetchSurprises(); }
      )
      ?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [businessId, fetchSurprises]);

  // Delete action
  const handleDelete = async () => {
    const surprise = confirmDialog?.surprise;
    if (!surprise) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        ?.from('surprise_configs')
        ?.delete()
        ?.eq('id', surprise?.id);
      if (error) throw error;
      showToast(`"${surprise?.name}" eliminada correctamente`);
    } catch (err) {
      console.error('Error deleting surprise:', err);
      showToast('Error al eliminar la sorpresa', 'error');
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: null, surprise: null });
    }
  };

  // Toggle status (active ↔ inactive)
  const handleToggleStatus = async () => {
    const surprise = confirmDialog?.surprise;
    if (!surprise) return;
    const newStatus = surprise?.status === 'active' ? 'inactive' : 'active';
    setActionLoading(true);
    try {
      const { error } = await supabase
        ?.from('surprise_configs')
        ?.update({ status: newStatus, updated_at: new Date()?.toISOString() })
        ?.eq('id', surprise?.id);
      if (error) throw error;
      showToast(`"${surprise?.name}" ${newStatus === 'active' ? 'activada' : 'inactivada'} correctamente`);
    } catch (err) {
      console.error('Error updating surprise status:', err);
      showToast('Error al actualizar el estado', 'error');
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: null, surprise: null });
    }
  };

  const openDeleteDialog = (surprise) => {
    setConfirmDialog({ open: true, type: 'delete', surprise });
  };

  const openToggleDialog = (surprise) => {
    setConfirmDialog({ open: true, type: 'toggle', surprise });
  };

  const TABS = [
    { id: 'sorpresas', label: 'Mis Sorpresas', icon: 'Gift' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'historial', label: 'Historial', icon: 'History' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} onCollapse={setIsSidebarCollapsed} />
      <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6 max-w-[1920px] mx-auto space-y-6">

          {/* Page Header — same style as coupons-management (no icon) */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sorpresas</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configura mecánicas de sorpresa y analiza su impacto
              </p>
            </div>
            <button
              onClick={() => navigate('/surprises-management/new')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Icon name="Plus" size={16} />
              Nueva Sorpresa
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border">
            <nav className="flex gap-0 -mb-px">
              {TABS?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'sorpresas' && (
            <SorpresasListTab
              surprises={surprises}
              loading={loading}
              establishments={establishments}
              selectedEstablishment={selectedEstablishment}
              setSelectedEstablishment={setSelectedEstablishment}
              onEdit={(id) => navigate(`/surprises-management/edit/${id}`)}
              onDelete={openDeleteDialog}
              onToggleStatus={openToggleDialog}
            />
          )}
          {activeTab === 'analytics' && <SurprisesAnalyticsTab />}
          {activeTab === 'historial' && <SurprisesHistoryTab />}
        </div>
      </main>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog?.open}
        title={
          confirmDialog?.type === 'delete'
            ? 'Eliminar sorpresa'
            : confirmDialog?.surprise?.status === 'active' ?'Inactivar sorpresa' :'Activar sorpresa'
        }
        message={
          confirmDialog?.type === 'delete'
            ? `¿Estás seguro de que deseas eliminar "${confirmDialog?.surprise?.name}"? Esta acción no se puede deshacer.`
            : confirmDialog?.surprise?.status === 'active'
            ? `¿Deseas inactivar "${confirmDialog?.surprise?.name}"? Los clientes no podrán activarla mientras esté inactiva.`
            : `¿Deseas activar "${confirmDialog?.surprise?.name}"?`
        }
        confirmLabel={
          actionLoading
            ? 'Procesando…'
            : confirmDialog?.type === 'delete' ?'Eliminar'
            : confirmDialog?.surprise?.status === 'active' ?'Inactivar' :'Activar'
        }
        confirmClass={
          confirmDialog?.type === 'delete'
            ? 'bg-red-600 hover:bg-red-700 text-white' :'bg-amber-500 hover:bg-amber-600 text-white'
        }
        onConfirm={confirmDialog?.type === 'delete' ? handleDelete : handleToggleStatus}
        onCancel={() => setConfirmDialog({ open: false, type: null, surprise: null })}
      />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast?.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          <Icon name={toast?.type === 'error' ? 'AlertCircle' : 'CheckCircle'} size={16} />
          {toast?.message}
        </div>
      )}
    </div>
  );
};

export default SurprisesManagement;
