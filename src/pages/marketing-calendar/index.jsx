import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

import CalendarHeader from './components/CalendarHeader';
import MonthlyView from './components/MonthlyView';
import WeeklyView from './components/WeeklyView';
import DayView from './components/DayView';
import ListView from './components/ListView';
import SuggestionPanel from './components/SuggestionPanel';
import DayContextMenu from './components/DayContextMenu';
import TemplateModal from './components/TemplateModal';
import { getMexicanKeyDates, getMockCalendarItems, SUGGESTION_TEMPLATES } from './components/calendarData';

// ─── Sync Status Badge ────────────────────────────────────────────────────────
const SyncStatusBadge = ({ lastSyncTime, connectionStatus }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const update = () => {
      if (!lastSyncTime) { setTimeAgo('—'); return; }
      const diff = Math.floor((Date.now() - lastSyncTime) / 1000);
      if (diff < 5) setTimeAgo('ahora mismo');
      else if (diff < 60) setTimeAgo(`hace ${diff}s`);
      else if (diff < 3600) setTimeAgo(`hace ${Math.floor(diff / 60)}min`);
      else setTimeAgo(`hace ${Math.floor(diff / 3600)}h`);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  const statusConfig = {
    connected:    { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'En vivo', pulse: true },
    reconnecting: { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500',   label: 'Reconectando', pulse: true },
    disconnected: { color: 'text-red-600',      bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-500',     label: 'Sin conexión', pulse: false },
    idle:         { color: 'text-gray-500',     bg: 'bg-gray-50',    border: 'border-gray-200',    dot: 'bg-gray-400',    label: 'Inactivo', pulse: false },
  };

  const cfg = statusConfig?.[connectionStatus] || statusConfig?.idle;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg?.bg} ${cfg?.border} select-none`} title={`Conexión Supabase: ${cfg?.label} · Última sincronización: ${timeAgo}`}>
      {/* Pulse dot */}
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        {cfg?.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${cfg?.dot}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg?.dot}`} />
      </span>
      <div className="flex flex-col leading-none">
        <span className={`text-xs font-semibold ${cfg?.color}`}>{cfg?.label}</span>
        {lastSyncTime && (
          <span className="text-[10px] text-gray-400 mt-0.5">Sync {timeAgo}</span>
        )}
      </div>
    </div>
  );
};

const ESTABLISHMENTS = [
  { id: 'all', name: 'Todos los establecimientos', icon: 'Building2', address: '' },
  { id: '1',   name: 'Restaurante El Jardín',      icon: 'UtensilsCrossed', address: 'Centro Histórico' },
  { id: '2',   name: 'Café Premium',               icon: 'Coffee',          address: 'Zona Norte' },
  { id: '3',   name: 'Boutique Fashion',            icon: 'ShoppingBag',     address: 'Plaza Comercial' },
  { id: '4',   name: 'Gimnasio Fitness Pro',        icon: 'Dumbbell',        address: 'Colonia del Valle' },
  { id: '5',   name: 'Spa Relajante',               icon: 'Flower',          address: 'Zona Rosa' },
];

const ALL_CATEGORIES = ['promotion', 'campaign', 'coupon', 'flow', 'punch_card', 'push', 'email', 'whatsapp', 'social_post', 'streak_risk'];

const CREATE_TYPES = [
  { key: 'promotion', label: 'Promoción',   icon: '🏷️', color: '#ef4444' },
  { key: 'campaign',  label: 'Campaña',     icon: '📣', color: '#1d4ed8' },
  { key: 'coupon',    label: 'Cupón',       icon: '🎟️', color: '#22c55e' },
  { key: 'push',      label: 'Push',        icon: '🔔', color: '#6366f1' },
  { key: 'email',     label: 'Email',       icon: '📧', color: '#14b8a6' },
  { key: 'whatsapp',  label: 'WhatsApp',    icon: '💬', color: '#25D366' },
  { key: 'flow',      label: 'Flow',        icon: '⚙️', color: '#9ca3af' },
  { key: 'reminder',  label: '+ Recordatorio', icon: '📌', color: '#facc15' },
];

const LS_KEY = 'marketing_calendar_state';

// ─── Quick Action Modal ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    id: 'push_now',
    icon: '🔔',
    label: 'Enviar push ahora',
    description: 'Push rápido a un segmento sin crear campaña',
    color: 'indigo',
  },
  {
    id: 'whatsapp_now',
    icon: '💬',
    label: 'Enviar WhatsApp ahora',
    description: 'Mensaje WhatsApp Business inmediato',
    color: 'green',
  },
  {
    id: 'flash_deal',
    icon: '⚡',
    label: 'Flash Deal ahora',
    description: 'Inicia un flash deal inmediato en 3 clicks',
    color: 'orange',
  },
  {
    id: 'remind_points',
    icon: '⭐',
    label: 'Recordar puntos por vencer',
    description: 'Push masivo a clientes con puntos que vencen esta semana',
    color: 'amber',
  },
  {
    id: 'grant_achievement',
    icon: '🏆',
    label: 'Otorgar logro manual',
    description: 'Busca un cliente en CRM y otorga un logro personalizado',
    color: 'purple',
  },
  {
    id: 'mark_full',
    icon: '🚫',
    label: 'Marcar como lleno ahora',
    description: 'Activa indicador de alta afluencia en tu ficha pública',
    color: 'red',
  },
  {
    id: 'pause_all',
    icon: '⏸️',
    label: 'Pausar todas las promos activas',
    description: 'Pausa de emergencia — requiere confirmación',
    color: 'gray',
    dangerous: true,
  },
];

const colorMap = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  btn: 'bg-green-600 hover:bg-green-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  btn: 'bg-amber-500 hover:bg-amber-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    btn: 'bg-red-600 hover:bg-red-700' },
  gray:   { bg: 'bg-gray-50',   border: 'border-gray-200',   text: 'text-gray-700',   btn: 'bg-gray-600 hover:bg-gray-700' },
};

const QuickActionModal = ({ onClose }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [confirmPause, setConfirmPause] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [sent, setSent] = useState(false);

  const handleAction = (action) => {
    if (action?.dangerous) {
      setConfirmPause(true);
      return;
    }
    setActiveAction(action);
    setStep(1);
    setSent(false);
    setFormData({});
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setActiveAction(null);
      setSent(false);
    }, 1800);
  };

  const handleConfirmPause = () => {
    setConfirmPause(false);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="text-base font-bold text-gray-900">Acción rápida</h2>
              <p className="text-xs text-gray-500">Ejecuta acciones inmediatas sin salir del calendario</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Confirm pause overlay */}
        {confirmPause && (
          <div className="p-5">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-base font-bold text-red-800 mt-2">¿Pausar todas las promos activas?</h3>
              <p className="text-sm text-red-600 mt-1">Esta acción pausará inmediatamente todas las promociones activas en este establecimiento. Los clientes dejarán de ver las promos hasta que las reactives manualmente.</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setConfirmPause(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button onClick={handleConfirmPause} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Sí, pausar todo</button>
              </div>
            </div>
          </div>
        )}

        {/* Sent confirmation */}
        {sent && !confirmPause && (
          <div className="p-5 text-center">
            <span className="text-4xl">✅</span>
            <p className="text-base font-semibold text-gray-800 mt-2">¡Acción ejecutada!</p>
            <p className="text-sm text-gray-500 mt-1">La acción se procesó correctamente.</p>
          </div>
        )}

        {/* Action detail form */}
        {activeAction && !sent && !confirmPause && (
          <div className="p-5">
            <button onClick={() => setActiveAction(null)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors">
              <Icon name="ChevronLeft" size={14} /> Volver
            </button>
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${colorMap?.[activeAction?.color]?.bg} ${colorMap?.[activeAction?.color]?.border} mb-4`}>
              <span className="text-2xl">{activeAction?.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${colorMap?.[activeAction?.color]?.text}`}>{activeAction?.label}</p>
                <p className="text-xs text-gray-500">{activeAction?.description}</p>
              </div>
            </div>

            {/* Push now form */}
            {activeAction?.id === 'push_now' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Mensaje</label>
                  <textarea rows={3} placeholder="Escribe tu mensaje push..." className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" onChange={e => setFormData(p => ({...p, message: e?.target?.value}))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Audiencia</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" onChange={e => setFormData(p => ({...p, audience: e?.target?.value}))}>
                    <option value="all">Todos los clientes</option>
                    <option value="nearby">Clientes cercanos</option>
                    <option value="vip">VIPs</option>
                    <option value="segment">Segmento personalizado</option>
                  </select>
                </div>
              </div>
            )}

            {/* WhatsApp now form */}
            {activeAction?.id === 'whatsapp_now' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Mensaje WhatsApp</label>
                  <textarea rows={3} placeholder="Escribe tu mensaje..." className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none" onChange={e => setFormData(p => ({...p, message: e?.target?.value}))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Audiencia</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" onChange={e => setFormData(p => ({...p, audience: e?.target?.value}))}>
                    <option value="all">Todos los clientes</option>
                    <option value="vip">VIPs</option>
                    <option value="segment">Segmento personalizado</option>
                  </select>
                </div>
              </div>
            )}

            {/* Flash Deal form */}
            {activeAction?.id === 'flash_deal' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Duración</label>
                  <div className="flex gap-2">
                    {[15, 30, 45, 60]?.map(m => (
                      <button key={m} onClick={() => setFormData(p => ({...p, duration: m}))} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${formData?.duration === m ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{m} min</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Tipo de beneficio</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" onChange={e => setFormData(p => ({...p, benefit: e?.target?.value}))}>
                    <option value="2x1">2×1</option>
                    <option value="discount">Descuento %</option>
                    <option value="free_item">Producto gratis</option>
                    <option value="points_2x">Puntos 2×</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Límite de canjes</label>
                  <input type="number" placeholder="Ej: 50" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" onChange={e => setFormData(p => ({...p, limit: e?.target?.value}))} />
                </div>
              </div>
            )}

            {/* Remind points form */}
            {activeAction?.id === 'remind_points' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm text-amber-800 font-medium mb-1">Mensaje automático que se enviará:</p>
                <p className="text-xs text-amber-700 italic">"Tienes [X] puntos que vencen el [fecha]. ¡Úsalos en [negocio] antes de que expiren!"</p>
                <p className="text-xs text-gray-500 mt-2">Se enviará a todos los clientes con puntos que vencen en los próximos 7 días.</p>
              </div>
            )}

            {/* Grant achievement */}
            {activeAction?.id === 'grant_achievement' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Buscar cliente</label>
                  <input type="text" placeholder="Nombre o email del cliente..." className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" onChange={e => setFormData(p => ({...p, client: e?.target?.value}))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Logro a otorgar</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" onChange={e => setFormData(p => ({...p, achievement: e?.target?.value}))}>
                    <option value="">Selecciona un logro...</option>
                    <option value="vip">Cliente VIP</option>
                    <option value="loyal">Cliente Leal</option>
                    <option value="ambassador">Embajador</option>
                    <option value="custom">Logro personalizado</option>
                  </select>
                </div>
              </div>
            )}

            {/* Mark full */}
            {activeAction?.id === 'mark_full' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-800">Esto activará el indicador <strong>"Alta afluencia"</strong> en tu ficha pública. Los clientes verán que el establecimiento está lleno en este momento.</p>
                <p className="text-xs text-gray-500 mt-2">Se desactivará automáticamente en 2 horas o puedes desactivarlo manualmente.</p>
              </div>
            )}

            <button onClick={handleSend} className={`w-full mt-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${colorMap?.[activeAction?.color]?.btn}`}>
              Ejecutar acción
            </button>
          </div>
        )}

        {/* Action list */}
        {!activeAction && !sent && !confirmPause && (
          <div className="p-4 space-y-2">
            {QUICK_ACTIONS?.map(action => (
              <button
                key={action?.id}
                onClick={() => handleAction(action)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-sm ${colorMap?.[action?.color]?.bg} ${colorMap?.[action?.color]?.border} hover:opacity-90`}
              >
                <span className="text-2xl flex-shrink-0">{action?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${colorMap?.[action?.color]?.text}`}>{action?.label}</p>
                  <p className="text-xs text-gray-500 truncate">{action?.description}</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reminder Modal ───────────────────────────────────────────────────────────
const REMINDER_COLORS = [
  { value: '#6366f1', label: 'Índigo' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#64748b', label: 'Gris' },
];

const ReminderModal = ({ onClose, establishments }) => {
  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    establishment: 'all',
    color: '#6366f1',
    note: '',
    reminderEnabled: false,
    reminderDays: 1,
  });
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!form?.name?.trim() || !form?.date) return;
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">📌</span>
            <div>
              <h2 className="text-base font-bold text-gray-900">Nuevo recordatorio</h2>
              <p className="text-xs text-gray-500">Nota personal en tu calendario — no visible para clientes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {saved ? (
          <div className="p-8 text-center">
            <span className="text-4xl">✅</span>
            <p className="text-base font-semibold text-gray-800 mt-3">¡Recordatorio guardado!</p>
            <p className="text-sm text-gray-500 mt-1">Aparecerá en tu calendario.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Nombre del recordatorio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={40}
                placeholder="Ej: Aniversario del negocio, Llegada de nueva colección..."
                value={form?.name}
                onChange={e => set('name', e?.target?.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors"
              />
              <p className="text-[10px] text-gray-400 mt-0.5 text-right">{form?.name?.length}/40</p>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form?.date}
                  onChange={e => set('date', e?.target?.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Hora <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="time"
                  value={form?.time}
                  onChange={e => set('time', e?.target?.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors"
                />
              </div>
            </div>

            {/* Establishment */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Establecimiento</label>
              <select
                value={form?.establishment}
                onChange={e => set('establishment', e?.target?.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors"
              >
                {establishments?.map(est => (
                  <option key={est?.id} value={est?.id}>{est?.name}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Color en el calendario</label>
              <div className="flex items-center gap-2 flex-wrap">
                {REMINDER_COLORS?.map(c => (
                  <button
                    key={c?.value}
                    onClick={() => set('color', c?.value)}
                    title={c?.label}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      form?.color === c?.value ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c?.value }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: form?.color }} />
                <span className="text-xs text-gray-500">Vista previa del bloque en el calendario</span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Nota interna <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                rows={3}
                maxLength={200}
                placeholder="Detalles adicionales para tu equipo..."
                value={form?.note}
                onChange={e => set('note', e?.target?.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-colors"
              />
              <p className="text-[10px] text-gray-400 mt-0.5 text-right">{form?.note?.length}/200</p>
            </div>

            {/* Reminder toggle */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Bell" size={15} className="text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">Recordarme antes</span>
                </div>
                <button
                  onClick={() => set('reminderEnabled', !form?.reminderEnabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    form?.reminderEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      form?.reminderEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              {form?.reminderEnabled && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-indigo-700">Notificarme</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={form?.reminderDays}
                    onChange={e => set('reminderDays', Math.max(1, Math.min(30, Number(e?.target?.value))))}
                    className="w-14 text-sm text-center border border-indigo-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <span className="text-xs text-indigo-700">día(s) antes</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form?.name?.trim() || !form?.date}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                Guardar recordatorio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

// Load persisted state from localStorage
const loadPersistedState = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const MarketingCalendar = () => {
  const persisted = loadPersistedState();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState(persisted?.currentView || 'month');
  const [currentDate, setCurrentDate] = useState(
    persisted?.currentDate ? new Date(persisted.currentDate) : new Date()
  );
  const [activeCategories, setActiveCategories] = useState(persisted?.activeCategories || ALL_CATEGORIES);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dismissedSuggestions, setDismissedSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [activeSuggestionDate, setActiveSuggestionDate] = useState(null);
  const [dayContextMenu, setDayContextMenu] = useState(null);
  const [calendarItems, setCalendarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstablishment, setSelectedEstablishment] = useState(persisted?.selectedEstablishment || 'all');
  const [calendarMode, setCalendarMode] = useState('planning');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showPrevYear, setShowPrevYear] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showSuggestionsTooltip, setShowSuggestionsTooltip] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const createMenuRef = useRef(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');

  const user = { id: 1, name: 'Carlos Mendoza', email: 'carlos@mirestaurante.com', role: 'owner' };

  const year = currentDate?.getFullYear();
  const month = currentDate?.getMonth();

  // ── Persist state to localStorage whenever key values change ──
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        currentView,
        currentDate: currentDate?.toISOString(),
        activeCategories,
        selectedEstablishment,
      }));
    } catch {}
  }, [currentView, currentDate, activeCategories, selectedEstablishment]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createMenuRef?.current && !createMenuRef?.current?.contains(e?.target)) {
        setShowCreateMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Monitor Supabase realtime connection health
    let channel;
    try {
      setConnectionStatus('reconnecting');
      channel = supabase?.channel('marketing_calendar_sync')?.on('system', {}, (payload) => {
          if (payload?.extension === 'postgres_changes') {
            setLastSyncTime(Date.now());
            setConnectionStatus('connected');
          }
        })?.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
            setLastSyncTime(Date.now());
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setConnectionStatus('disconnected');
          } else if (status === 'CLOSED') {
            setConnectionStatus('idle');
          }
        });
    } catch {
      setConnectionStatus('disconnected');
    }

    // Periodic health ping every 30s
    const ping = setInterval(() => {
      if (channel) {
        setLastSyncTime(Date.now());
      }
    }, 30000);

    return () => {
      clearInterval(ping);
      if (channel) supabase?.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        let query = supabase?.from('marketing_calendar_events')?.select('*')?.gte('start_date', `${year}-01-01`)?.lte('start_date', `${year}-12-31`);
        if (selectedEstablishment !== 'all') {
          query = query?.eq('business_id', selectedEstablishment);
        }
        const { data, error } = await query?.order('start_date', { ascending: true });
        if (error || !data || data?.length === 0) {
          setCalendarItems(getMockCalendarItems(year));
        } else {
          const mapped = data?.map(row => ({
            id: row?.id,
            title: row?.title,
            type: row?.type,
            category: row?.category,
            startDate: row?.start_date,
            endDate: row?.end_date,
            startHour: row?.start_hour,
            endHour: row?.end_hour,
            status: row?.status,
            description: row?.description,
            origin: row?.origin || '/promotions-management',
            metrics: row?.metrics,
            isSystemGenerated: row?.is_system_generated,
          }));
          setCalendarItems(mapped);
        }
      } catch (err) {
        setCalendarItems(getMockCalendarItems(year));
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [year, selectedEstablishment]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const { data } = await supabase?.from('marketing_calendar_templates')?.select('*')?.order('created_at', { ascending: false });
        if (data) setSavedTemplates(data);
      } catch {}
    };
    loadTemplates();
  }, []);

  const keyDates = getMexicanKeyDates(year);

  const generateSuggestions = useCallback(() => {
    const today = new Date();
    const in30Days = new Date(today);
    in30Days?.setDate(today?.getDate() + 30);
    return SUGGESTION_TEMPLATES?.filter(template => {
      if (dismissedSuggestions?.includes(template?.keyDateId)) return false;
      const kd = keyDates?.find(k => k?.id === template?.keyDateId);
      if (!kd) return false;
      const kdDate = new Date(kd?.startDate);
      if (kdDate < today || kdDate > in30Days) return false;
      const hasActivity = calendarItems?.some(item =>
        item?.startDate <= kd?.startDate && item?.endDate >= kd?.startDate
      );
      return !hasActivity;
    })?.map(template => {
      const kd = keyDates?.find(k => k?.id === template?.keyDateId);
      return { ...template, date: kd?.startDate };
    });
  }, [keyDates, calendarItems, dismissedSuggestions]);

  const suggestions = generateSuggestions();

  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') newDate?.setMonth(newDate?.getMonth() + direction);
    else if (currentView === 'week') newDate?.setDate(newDate?.getDate() + direction * 7);
    else if (currentView === 'day') newDate?.setDate(newDate?.getDate() + direction);
    else if (currentView === 'list') newDate?.setFullYear(newDate?.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleToggleCategory = (cat) => {
    if (cat === 'all') {
      setActiveCategories(ALL_CATEGORIES);
      return;
    }
    setActiveCategories(prev => {
      const isAll = prev?.length === ALL_CATEGORIES?.length;
      if (isAll) return [cat];
      if (prev?.includes(cat)) {
        const next = prev?.filter(c => c !== cat);
        return next?.length === 0 ? ALL_CATEGORIES : next;
      }
      return [...prev, cat];
    });
  };

  const handleSuggestionAction = (suggestion, date) => {
    setActiveSuggestion(suggestion);
    setActiveSuggestionDate(date);
  };

  const handleDismissSuggestion = (keyDateId) => {
    setDismissedSuggestions(prev => [...prev, keyDateId]);
  };

  const handleDayClick = (day) => {
    const dateStr = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    setDayContextMenu({ date: dateStr, position: { x: 200, y: 300 } });
  };

  const handleItemDrop = async (itemId, newStart, newEnd) => {
    setCalendarItems(prev => prev?.map(item =>
      item?.id === itemId ? { ...item, startDate: newStart, endDate: newEnd } : item
    ));
    try {
      await supabase?.from('marketing_calendar_events')?.update({ start_date: newStart, end_date: newEnd, updated_at: new Date()?.toISOString() })?.eq('id', itemId);
    } catch {}
  };

  const getWeekStart = () => {
    const d = new Date(currentDate);
    const day = d?.getDay();
    const diff = d?.getDate() - day + (day === 0 ? -6 : 1);
    d?.setDate(diff);
    return d;
  };

  const handleExport = (type) => {
    if (type === 'ical') {
      const icalUrl = `${window.location?.origin}/api/calendar.ics`;
      navigator?.clipboard?.writeText(icalUrl);
      alert(`Link iCal copiado: ${icalUrl}\n\nAgrégalo a Google Calendar o Outlook para sincronizar tus eventos.`);
    } else if (type === 'csv') {
      const headers = ['Fecha inicio', 'Fecha fin', 'Tipo', 'Nombre', 'Estado', 'Canjes', 'Revenue'];
      const rows = calendarItems?.map(item => [
        item?.startDate, item?.endDate, item?.type, item?.title, item?.status,
        item?.metrics?.canjes || 0, item?.metrics?.revenue || 0
      ]);
      const csv = [headers, ...rows]?.map(r => r?.join(','))?.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `calendario-actividades-${year}.csv`; a?.click();
    } else {
      alert(`Exportación ${type?.toUpperCase()} — funcionalidad disponible en plan Pro`);
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      const { data } = await supabase?.from('marketing_calendar_templates')?.insert({
        name: templateData?.name,
        description: templateData?.description,
        events: calendarItems?.slice(0, 20)
      })?.select()?.single();
      if (data) setSavedTemplates(prev => [data, ...prev]);
    } catch {}
  };

  const handleApplyTemplate = (template) => {
    if (template?.events?.length > 0) {
      const offset = new Date() - new Date(template?.events?.[0]?.startDate || new Date());
      const shifted = template?.events?.map(ev => ({
        ...ev,
        id: `tmpl-${Date.now()}-${Math.random()}`,
        startDate: new Date(new Date(ev?.startDate)?.getTime() + offset)?.toISOString()?.split('T')?.[0],
        endDate: new Date(new Date(ev?.endDate)?.getTime() + offset)?.toISOString()?.split('T')?.[0],
      }));
      setCalendarItems(prev => [...prev, ...shifted]);
    }
  };

  const activeCount = calendarItems?.filter(i => i?.status === 'active')?.length;
  const scheduledCount = calendarItems?.filter(i => i?.status === 'scheduled')?.length;
  const hasSystemItems = calendarItems?.some(i => i?.isSystemGenerated);
  const selectedEstName = ESTABLISHMENTS?.find(e => e?.id === selectedEstablishment)?.name || 'Todos los establecimientos';
  const todayStr = new Date()?.toISOString()?.split('T')?.[0];
  const couponsExpiringToday = calendarItems?.filter(i => i?.type === 'coupon' && i?.endDate === todayStr)?.length;
  const punchCardsCompletingToday = calendarItems?.filter(i => i?.type === 'punch_card')?.length;

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCollapse={setIsSidebarCollapsed}
        user={user}
      />
      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6 space-y-4">

          {/* Page header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calendario de Actividades</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Visualiza y coordina todas tus acciones de marketing en una línea de tiempo
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Header counters — only in Planning mode */}
              {calendarMode === 'planning' && (
                <>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <div className="text-base font-bold text-gray-900 leading-none">{activeCount}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Activas</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <div className="text-base font-bold text-gray-900 leading-none">{scheduledCount}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Programadas</div>
                    </div>
                  </div>
                  <div
                    className="relative flex items-center gap-1.5 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100 cursor-default"
                    onMouseEnter={() => suggestions?.length === 0 && setShowSuggestionsTooltip(true)}
                    onMouseLeave={() => setShowSuggestionsTooltip(false)}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div>
                      <div className="text-base font-bold text-amber-600 leading-none">{suggestions?.length}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Sugerencias</div>
                    </div>
                    {showSuggestionsTooltip && suggestions?.length === 0 && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-50 shadow-xl pointer-events-none">
                        <p className="font-semibold mb-1">¿Qué son las sugerencias?</p>
                        <p className="text-gray-300 leading-relaxed">PromoClub analiza tu calendario y sugiere acciones para fechas clave próximas (Buen Fin, Hot Sale, etc.) donde aún no tienes actividad programada.</p>
                        <div className="absolute -top-1.5 right-6 w-3 h-3 bg-gray-900 rotate-45" />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Sync Status Badge */}
              <SyncStatusBadge lastSyncTime={lastSyncTime} connectionStatus={connectionStatus} />
            </div>
          </div>

          {/* Establishment selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Building2" size={14} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-600">Establecimiento</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {ESTABLISHMENTS?.map(est => (
                <button
                  key={est?.id}
                  onClick={() => setSelectedEstablishment(est?.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedEstablishment === est?.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {est?.name}
                </button>
              ))}
            </div>
          </div>

          {/* Operation mode banner — no duplicate date, shows establishment, expanded metrics */}
          {calendarMode === 'operation' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚡</span>
                <h3 className="text-sm font-semibold text-orange-800">
                  Modo Operación — {selectedEstName} — Hoy
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Activo ahora',                    value: activeCount,                icon: '🟢', color: 'text-green-700' },
                  { label: 'Próximas 2h',                     value: 2,                          icon: '⏰', color: 'text-orange-700' },
                  { label: 'Rachas en riesgo',                value: calendarItems?.filter(i => i?.type === 'streak_risk')?.length, icon: '🔥', color: 'text-red-700' },
                  { label: 'Punch cards por completarse hoy', value: punchCardsCompletingToday,  icon: '🎴', color: 'text-orange-700' },
                  { label: 'Cupones que vencen hoy',          value: couponsExpiringToday,       icon: '🎟️', color: 'text-yellow-700' },
                  { label: 'Cumpleaños hoy',                  value: 3,                          icon: '🎂', color: 'text-pink-700' },
                  { label: 'Reservaciones del día',           value: 8,                          icon: '📅', color: 'text-blue-700' },
                  { label: 'Puntos por vencer esta semana',   value: 47,                         icon: '⭐', color: 'text-amber-700' },
                ]?.map(stat => (
                  <div key={stat?.label} className="bg-white rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center gap-1.5">
                      <span>{stat?.icon}</span>
                      <span className={`text-xl font-bold ${stat?.color}`}>{stat?.value}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat?.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar header — 5 logical layers */}
          <CalendarHeader
            currentView={currentView}
            onViewChange={setCurrentView}
            currentDate={currentDate}
            onNavigate={handleNavigate}
            onToday={handleToday}
            activeCategories={activeCategories}
            onToggleCategory={handleToggleCategory}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            calendarMode={calendarMode}
            onCalendarModeChange={setCalendarMode}
            onExport={handleExport}
            onQuickAction={() => setShowQuickAction(true)}
            showPrevYear={showPrevYear}
            onTogglePrevYear={() => setShowPrevYear(prev => !prev)}
            hasSystemItems={hasSystemItems}
            allCategories={ALL_CATEGORIES}
            onSaveTemplate={() => setShowTemplateModal(true)}
          />

          {/* Calendar content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Cargando calendario...</p>
              </div>
            </div>
          ) : (
            <div className="min-h-[600px]">
              {currentView === 'month' && (
                <MonthlyView
                  year={year}
                  month={month}
                  items={calendarItems}
                  keyDates={keyDates}
                  suggestions={suggestions}
                  dismissedSuggestions={dismissedSuggestions}
                  activeCategories={activeCategories}
                  statusFilter={statusFilter}
                  onSuggestionAction={handleSuggestionAction}
                  onDismissSuggestion={handleDismissSuggestion}
                  onDayClick={handleDayClick}
                  onItemDrop={handleItemDrop}
                />
              )}
              {currentView === 'week' && (
                <WeeklyView
                  weekStart={getWeekStart()}
                  items={calendarItems}
                  keyDates={keyDates}
                  activeCategories={activeCategories}
                  statusFilter={statusFilter}
                />
              )}
              {currentView === 'day' && (
                <DayView
                  currentDate={currentDate}
                  items={calendarItems}
                  keyDates={keyDates}
                  activeCategories={activeCategories}
                  statusFilter={statusFilter}
                />
              )}
              {currentView === 'list' && (
                <ListView
                  items={calendarItems}
                  keyDates={keyDates}
                  activeCategories={activeCategories}
                  statusFilter={statusFilter}
                  currentDate={currentDate}
                />
              )}
            </div>
          )}
        </div>
      </main>
      {activeSuggestion && (
        <SuggestionPanel
          suggestion={activeSuggestion}
          date={activeSuggestionDate}
          onClose={() => { setActiveSuggestion(null); setActiveSuggestionDate(null); }}
        />
      )}
      {dayContextMenu && (
        <DayContextMenu
          date={dayContextMenu?.date}
          position={dayContextMenu?.position}
          onClose={() => setDayContextMenu(null)}
        />
      )}
      {showTemplateModal && (
        <TemplateModal
          onClose={() => setShowTemplateModal(false)}
          onSave={handleSaveTemplate}
          onApply={handleApplyTemplate}
          savedTemplates={savedTemplates}
        />
      )}
      {showQuickAction && (
        <QuickActionModal onClose={() => setShowQuickAction(false)} />
      )}
      {showReminderModal && (
        <ReminderModal
          onClose={() => setShowReminderModal(false)}
          establishments={ESTABLISHMENTS}
        />
      )}
    </div>
  );
};

export default MarketingCalendar;
