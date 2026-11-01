import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { AchievementBadge, RarityPill, RARITY_CONFIG, Toggle } from './AchievementCard';

const EMOJI_GALLERY = {
  'Celebración': ['🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '🎗️', '🎉', '🎊', '🎁', '🎀', '🎂', '🎈', '🥳', '🎯', '🎪'],
  'Naturaleza': ['🌱', '🌿', '🍀', '🌸', '🌺', '🌻', '🌙', '⭐', '🌟', '💫', '✨', '🔥', '💎', '🔮', '🌈', '🌊'],
  'Personas': ['👑', '🦋', '🤝', '👥', '🙌', '💪', '🫶', '❤️', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '🧡'],
  'Objetos': ['📱', '💳', '🔋', '📅', '🗂️', '🗺️', '🧭', '🎴', '🪙', '💸', '💵', '💰', '🏰', '🏛️', '🚀', '⚡'],
  'Comida': ['🍽️', '☕', '🍕', '🍔', '🌮', '🍣', '🍰', '🧁', '🍩', '🍪', '🍫', '🍬', '🍭', '🥂', '🍷', '🍺'],
  'Símbolos': ['✅', '💬', '📡', '🎙️', '🌐', '🔄', '💯', '🎨', '🧬', '🔑', '🗝️', '🛡️', '⚔️', '🎭', '🎬', '📸'],
};

const RARITY_OPTIONS = [
  { value: 'comun', label: 'Común', color: '#6B7280' },
  { value: 'raro', label: 'Raro', color: '#0891B2' },
  { value: 'epico', label: 'Épico', color: '#7C3AED' },
  { value: 'legendario', label: 'Legendario', color: '#D4A853' },
  { value: 'unico', label: 'Único', color: '#BE185D' },
];

const COLOR_SWATCHES = [
  '#10B981', '#CD7F32', '#9E9E9E', '#FFB300', '#FF6B35', '#D4A853',
  '#059669', '#0891B2', '#7C3AED', '#6366F1', '#F59E0B', '#EF4444',
  '#EC4899', '#BE185D', '#D97706', '#1A3FE0',
];

const VARIABLES = ['{nombre_cliente}', '{negocio}', '{nombre_logro}', '{visitas}', '{fecha}', '{monto_acumulado}'];

const POINT_VALUE_MXN = 0.15;

// ─── CONDITION TYPE DEFINITIONS ───────────────────────────────────────────────
const CONDITION_TYPES = [
  { value: 'visitas', label: 'Visitas acumuladas', icon: '📍' },
  { value: 'gasto', label: 'Gasto acumulado', icon: '💰' },
  { value: 'dias', label: 'Antigüedad (días como cliente)', icon: '📅' },
  { value: 'fundador', label: 'Primeros N clientes (Fundador)', icon: '🏛️' },
  { value: 'early_adopter', label: 'Antes de fecha (Early adopter)', icon: '🚀' },
  { value: 'cumpleanos', label: 'Cumpleaños', icon: '🎂' },
  { value: 'hora_visita', label: 'Hora de visita (Madrugador/Noctámbulo)', icon: '🌅' },
  { value: 'dia_semana', label: 'Día de la semana', icon: '📆' },
  { value: 'referidos', label: 'Referidos activos', icon: '👥' },
  { value: 'resenas', label: 'Reseñas verificadas', icon: '⭐' },
  { value: 'punch_cards', label: 'Punch cards completadas', icon: '🎴' },
  { value: 'reservaciones', label: 'Reservaciones cumplidas', icon: '✅' },
  { value: 'prepago', label: 'Pagos con prepago', icon: '💳' },
  { value: 'metodos_checkin', label: 'Métodos de check-in', icon: '📱' },
  { value: 'ticket_alto', label: 'Gasto en una sola compra (ticket alto)', icon: '🎯' },
  { value: 'manual', label: 'Manual (logro custom)', icon: '✏️' },
];

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Mock impact data (in real app would come from Supabase)
const MOCK_IMPACT = {
  visitas: { meets: 47, near: 12 },
  gasto: { meets: 23, near: 0 },
  dias: { meets: 89, near: 14 },
  fundador: { granted: 47, total: 50 },
  early_adopter: { days_left: 18 },
  referidos: { meets: 28 },
  resenas: { meets: 45 },
  punch_cards: { meets: 31 },
  reservaciones: { meets: 19 },
  prepago: { meets: 8 },
  metodos_checkin: { active_methods: ['QR', 'NFC', 'Geofence', 'Código manual'], max: 4 },
  ticket_alto: { meets: 15 },
};

// ─── CONDITION SECTION COMPONENT ──────────────────────────────────────────────
const ConditionSection = ({ form, set }) => {
  const condType = form?.condition_type || 'visitas';
  const isCustom = form?.is_custom || false;

  // Determine if type is editable (custom achievements can change type)
  const typeEditable = isCustom;

  const renderTypeLabel = () => {
    const found = CONDITION_TYPES?.find(c => c?.value === condType);
    if (!found) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
        <span className="text-base">{found?.icon}</span>
        <div>
          <p className="text-xs font-semibold text-blue-800">Tipo: {found?.label}</p>
          {!typeEditable && (
            <p className="text-xs text-blue-600 mt-0.5">El tipo no es editable para logros del catálogo estándar.</p>
          )}
        </div>
      </div>
    );
  };

  const renderTypeDropdown = () => (
    <div>
      <label className="text-xs font-semibold text-foreground block mb-1.5">Tipo de condición</label>
      <select
        value={condType}
        onChange={e => set('condition_type', e?.target?.value)}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      >
        {CONDITION_TYPES?.map(ct => (
          <option key={ct?.value} value={ct?.value}>{ct?.icon} {ct?.label}</option>
        ))}
      </select>
    </div>
  );

  // ── VISITAS ACUMULADAS ──
  const renderVisitas = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">Umbral de visitas</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Al alcanzar</span>
          <input
            type="number" min="1"
            value={form?.condition_value || 10}
            onChange={e => set('condition_value', parseInt(e?.target?.value) || 1)}
            className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold"
          />
          <span className="text-sm text-muted-foreground">visitas acumuladas totales.</span>
        </div>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
        <p className="text-xs text-emerald-700">
          📊 Actualmente <strong>{MOCK_IMPACT?.visitas?.meets} clientes</strong> cumplen esta condición.
          {MOCK_IMPACT?.visitas?.near > 0 && (
            <> <strong>{MOCK_IMPACT?.visitas?.near} clientes</strong> están a menos de 5 visitas de cumplirla.</>
          )}
        </p>
      </div>
      <div className="p-2.5 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">ℹ️ Este contador incluye todas las visitas desde la primera, sin importar el tiempo transcurrido. No se reinicia nunca.</p>
      </div>
    </div>
  );

  // ── GASTO ACUMULADO ──
  const renderGasto = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">Umbral de gasto</label>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Al acumular</span>
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            <span className="px-2 py-2 bg-muted text-sm font-medium text-muted-foreground">$</span>
            <input
              type="number" min="1"
              value={form?.condition_value || 500}
              onChange={e => set('condition_value', parseFloat(e?.target?.value) || 0)}
              className="w-28 px-2 py-2 text-sm bg-background text-foreground font-semibold border-0 outline-none"
            />
            <span className="px-2 py-2 bg-muted text-sm font-medium text-muted-foreground">MXN</span>
          </div>
          <span className="text-sm text-muted-foreground">en compras totales históricas.</span>
        </div>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-xs text-emerald-700">📊 Actualmente <strong>{MOCK_IMPACT?.gasto?.meets} clientes</strong> cumplen esta condición.</p>
      </div>
      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs text-amber-700">⚠️ Requiere registro de monto activo en el Programa de Puntos. Si no tienes registro de monto, este logro no puede evaluarse.</p>
        <button className="text-xs text-amber-800 font-semibold underline mt-1">Activar registro de monto →</button>
      </div>
    </div>
  );

  // ── ANTIGÜEDAD ──
  const renderDias = () => {
    const dias = form?.condition_value || 30;
    const meses = (dias / 30)?.toFixed(1);
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Días como cliente</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Al cumplir</span>
            <input
              type="number" min="1"
              value={dias}
              onChange={e => set('condition_value', parseInt(e?.target?.value) || 1)}
              className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold"
            />
            <span className="text-sm text-muted-foreground">días desde la primera visita.</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 pl-1">
            📐 {dias} días = <strong>{meses} meses</strong> aproximadamente.
          </p>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs text-emerald-700">📊 Actualmente <strong>{MOCK_IMPACT?.dias?.meets} clientes</strong> cumplen esta condición. <strong>{MOCK_IMPACT?.dias?.near} clientes</strong> están próximos.</p>
        </div>
        <div className="p-3 border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-foreground">¿Requiere actividad mínima reciente?</p>
            <Toggle value={form?.requires_recent_activity || false} onChange={v => set('requires_recent_activity', v)} disabled={false} />
          </div>
          {form?.requires_recent_activity && (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="text-xs text-muted-foreground">El cliente debe haber visitado al menos</span>
              <input
                type="number" min="1"
                value={form?.min_recent_visits || 1}
                onChange={e => set('min_recent_visits', parseInt(e?.target?.value) || 1)}
                className="w-16 border border-border rounded-lg px-2 py-1 text-xs bg-background text-foreground text-center"
              />
              <span className="text-xs text-muted-foreground">veces en los últimos</span>
              <input
                type="number" min="1"
                value={form?.recent_days_window || 90}
                onChange={e => set('recent_days_window', parseInt(e?.target?.value) || 90)}
                className="w-16 border border-border rounded-lg px-2 py-1 text-xs bg-background text-foreground text-center"
              />
              <span className="text-xs text-muted-foreground">días para considerarse activo.</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">Evita que clientes con pocas visitas obtengan el logro solo por antigüedad.</p>
        </div>
      </div>
    );
  };

  // ── FUNDADOR ──
  const renderFundador = () => {
    const quota = form?.founder_quota || 50;
    const granted = MOCK_IMPACT?.fundador?.granted || 0;
    const available = quota - granted;
    const isFull = available <= 0;
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Cupo de fundadores</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Disponible para los primeros</span>
            <input
              type="number" min="1"
              value={quota}
              onChange={e => set('founder_quota', parseInt(e?.target?.value) || 50)}
              className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold"
              disabled={isFull}
            />
            <span className="text-sm text-muted-foreground">clientes en registrarse.</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${isFull ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
          {isFull ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">Cupo agotado</span>
              <p className="text-xs text-red-700">Logro cerrado — No se pueden otorgar más.</p>
            </div>
          ) : (
            <p className="text-xs text-emerald-700">
              📊 <strong>{granted} de {quota}</strong> cupos otorgados — <strong>{available} disponibles.</strong>
            </p>
          )}
        </div>
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700">⚠️ Una vez que el cupo se agote, este logro se cerrará permanentemente y ningún cliente más podrá obtenerlo.</p>
        </div>
      </div>
    );
  };

  // ── EARLY ADOPTER ──
  const renderEarlyAdopter = () => {
    const daysLeft = MOCK_IMPACT?.early_adopter?.days_left || 0;
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Fecha límite</label>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Disponible para clientes que visiten antes del</span>
            <input
              type="date"
              value={form?.early_adopter_deadline ? form?.early_adopter_deadline?.slice(0, 10) : ''}
              onChange={e => set('early_adopter_deadline', e?.target?.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            />
          </div>
        </div>
        {form?.early_adopter_deadline && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700">
              ⏳ Quedan <strong>{daysLeft} días</strong> para que este logro se cierre automáticamente.
            </p>
          </div>
        )}
        <div className="p-2.5 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">ℹ️ Después de esa fecha el logro se cierra automáticamente. No se puede reabrir.</p>
        </div>
      </div>
    );
  };

  // ── CUMPLEAÑOS ──
  const renderCumpleanos = () => (
    <div className="space-y-3">
      <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl">
        <p className="text-xs text-pink-700 font-semibold mb-1">Condición: Visitar el negocio el día del cumpleaños del cliente.</p>
        <p className="text-xs text-pink-600">No hay umbral numérico — la condición es la fecha de nacimiento del cliente.</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">Ventana de tiempo</label>
        <div className="space-y-2">
          {[
            { value: 'exact', label: 'Solo el día exacto del cumpleaños' },
            { value: '3days', label: '3 días alrededor del cumpleaños (día antes, el día, día después)' },
          ]?.map(opt => (
            <label key={opt?.value} className="flex items-center gap-2.5 cursor-pointer p-2.5 border border-border rounded-lg hover:bg-muted/30 transition-colors">
              <input
                type="radio"
                name="birthday_window"
                value={opt?.value}
                checked={(form?.birthday_window || '3days') === opt?.value}
                onChange={() => set('birthday_window', opt?.value)}
                className="accent-primary"
              />
              <span className="text-sm text-foreground">{opt?.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="p-2.5 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">ℹ️ Requiere que el cliente tenga fecha de nacimiento registrada en la app. Los clientes sin fecha de nacimiento no pueden desbloquear este logro.</p>
      </div>
    </div>
  );

  // ── HORA DE VISITA ──
  const renderHoraVisita = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Hora umbral</label>
          <input
            type="time"
            value={form?.visit_hour_threshold || '08:00'}
            onChange={e => set('visit_hour_threshold', e?.target?.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Número de ocasiones</label>
          <input
            type="number" min="1"
            value={form?.condition_value || 5}
            onChange={e => set('condition_value', parseInt(e?.target?.value) || 1)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center"
          />
        </div>
      </div>
      <div className="p-2.5 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">
          Ejemplo: "Visitar antes de las <strong>{form?.visit_hour_threshold || '08:00'}</strong> en <strong>{form?.condition_value || 5}</strong> ocasiones diferentes."
        </p>
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">¿Las ocasiones deben ser en días diferentes?</label>
        <div className="flex items-center gap-3">
          <Toggle value={form?.different_days !== false} onChange={v => set('different_days', v)} disabled={false} />
          <span className="text-sm text-muted-foreground">{form?.different_days !== false ? 'Sí, días diferentes' : 'No, pueden ser el mismo día'}</span>
        </div>
      </div>
    </div>
  );

  // ── DÍA DE LA SEMANA ──
  const renderDiaSemana = () => {
    const selectedDay = form?.day_of_week || 'Lunes';
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Día de la semana</label>
            <select
              value={selectedDay}
              onChange={e => {
                set('day_of_week', e?.target?.value);
                // Suggest renaming
                set('suggested_name', `Rey del ${e?.target?.value?.toLowerCase()}`);
              }}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            >
              {DAYS_OF_WEEK?.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Número de veces</label>
            <input
              type="number" min="1"
              value={form?.condition_value || 10}
              onChange={e => set('condition_value', parseInt(e?.target?.value) || 1)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center"
            />
          </div>
        </div>
        <div className="p-2.5 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Ejemplo: "Visitar el <strong>{selectedDay}</strong> en <strong>{form?.condition_value || 10}</strong> ocasiones diferentes."
          </p>
        </div>
        {form?.suggested_name && (
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <p className="text-xs text-blue-700">💡 Sugerencia de nombre: <strong>"{form?.suggested_name}"</strong></p>
            <button
              onClick={() => set('name', form?.suggested_name)}
              className="text-xs text-blue-700 font-semibold underline ml-2 whitespace-nowrap"
            >
              Aplicar →
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── REFERIDOS ──
  const renderReferidos = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">Número de referidos</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Al referir</span>
          <input
            type="number" min="1"
            value={form?.condition_value || 1}
            onChange={e => set('condition_value', parseInt(e?.target?.value) || 1)}
            className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold"
          />
          <span className="text-sm text-muted-foreground">amigos que hayan hecho al menos 1 visita.</span>
        </div>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-xs text-emerald-700">📊 Actualmente <strong>{MOCK_IMPACT?.referidos?.meets} clientes</strong> cumplen esta condición.</p>
      </div>
      <div className="p-2.5 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">ℹ️ Solo cuentan referidos que hayan completado su primera visita — no solo registrados.</p>
      </div>
    </div>
  );

  // ── RESEÑAS ──
  const renderResenas = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">Número de reseñas</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Al publicar</span>
          <input
            type="number" min="1"
            value={form?.condition_value || 3}
            onChange={e => set('condition_value', parseInt(e?.target?.value) || 1)}
            className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold"
          />
          <span className="text-sm text-muted-foreground">reseñas verificadas.</span>
        </div>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-xs text-emerald-700">📊 Actualmente <strong>{MOCK_IMPACT?.resenas?.meets} clientes</strong> cumplen esta condición.</p>
      </div>
      <div className="p-3 border border-border rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-foreground">¿Requiere rating mínimo?</p>
          <Toggle value={form?.requires_min_rating || false} onChange={v => set('requires_min_rating', v)} disabled={false} />
        </div>
        {form?.requires_min_rating && (
          <>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Rating mínimo:</span>
              <select
                value={form?.min_rating || 4}
                onChange={e => set('min_rating', parseInt(e?.target?.value))}
                className="border border-border rounded-lg px-2 py-1 text-xs bg-background text-foreground"
              >
                {[1,2,3,4,5]?.map(r => <option key={r} value={r}>{r} ⭐</option>)}
              </select>
            </div>
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">⚠️ Condicionar el rating de las reseñas puede considerarse manipulación. Recomendamos no activar este filtro.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── PUNCH CARDS ──
  const renderPunchCards = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">Punch cards completadas</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Al completar</span>
          <input
            type="number" min="1"
            value={form?.condition_value || 1}
            onChange={e => set('condition_value', parseInt(e?.target?.value) || 1)}
            className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold"
          />
          <span className="text-sm text-muted-foreground">punch cards del negocio.</span>
        </div>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-xs text-emerald-700">📊 Actualmente <strong>{MOCK_IMPACT?.punch_cards?.meets} clientes</strong> cumplen esta condición.</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">¿Aplica a qué punch cards?</label>
        <select
          value={form?.punch_card_scope || 'all'}
          onChange={e => set('punch_card_scope', e?.target?.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        >
          <option value="all">Todas las punch cards del negocio</option>
          <option value="specific">Solo una punch card específica</option>
        </select>
      </div>
      {form?.punch_card_scope === 'specific' && (
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Punch card específica</label>
          <select
            value={form?.specific_punch_card || ''}
            onChange={e => set('specific_punch_card', e?.target?.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
          >
            <option value="">Seleccionar punch card activa...</option>
            <option value="pc1">Tarjeta de Café (10 sellos)</option>
            <option value="pc2">Tarjeta de Almuerzo (8 sellos)</option>
            <option value="pc3">Tarjeta Premium (15 sellos)</option>
          </select>
        </div>
      )}
    </div>
  );

  // ── RESERVACIONES ──
  const renderReservaciones = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">Reservaciones cumplidas</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Al completar</span>
          <input
            type="number" min="1"
            value={form?.condition_value || 5}
            onChange={e => set('condition_value', parseInt(e?.target?.value) || 1)}
            className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold"
          />
          <span className="text-sm text-muted-foreground">reservaciones sin no-show.</span>
        </div>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-xs text-emerald-700">📊 Actualmente <strong>{MOCK_IMPACT?.reservaciones?.meets} clientes</strong> cumplen esta condición.</p>
      </div>
      <div className="p-2.5 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">ℹ️ Cuenta reservaciones completadas con check-in verificado. Las canceladas no cuentan.</p>
      </div>
      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700">🔗 Requiere módulo de Reservaciones (L1) activo.</p>
      </div>
    </div>
  );

  // ── PREPAGO ──
  const renderPrepago = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">Pagos con prepago</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Al realizar</span>
          <input
            type="number" min="1"
            value={form?.condition_value || 5}
            onChange={e => set('condition_value', parseInt(e?.target?.value) || 1)}
            className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold"
          />
          <span className="text-sm text-muted-foreground">pagos con tarjeta prepago del negocio.</span>
        </div>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-xs text-emerald-700">📊 Actualmente <strong>{MOCK_IMPACT?.prepago?.meets} clientes</strong> cumplen esta condición.</p>
      </div>
      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700">🔗 Requiere módulo de Tarjeta Prepago (D2) activo.</p>
      </div>
    </div>
  );

  // ── MÉTODOS DE CHECK-IN ──
  const renderMetodosCheckin = () => {
    const activeMethods = MOCK_IMPACT?.metodos_checkin?.active_methods || [];
    const maxMethods = activeMethods?.length;
    const currentVal = Math.min(form?.condition_value || 3, maxMethods);
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Métodos de check-in diferentes</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Al usar</span>
            <input
              type="number" min="1" max={maxMethods}
              value={currentVal}
              onChange={e => set('condition_value', Math.min(parseInt(e?.target?.value) || 1, maxMethods))}
              className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold"
            />
            <span className="text-sm text-muted-foreground">métodos de check-in diferentes.</span>
          </div>
          {currentVal > maxMethods && (
            <p className="text-xs text-red-500 mt-1">El umbral no puede ser mayor que los métodos activos ({maxMethods}).</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700 font-semibold mb-1.5">Tu negocio tiene activos:</p>
          <div className="flex flex-wrap gap-1.5">
            {activeMethods?.map(m => (
              <span key={m} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{m} ✓</span>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-1.5">Máximo posible: <strong>{maxMethods} métodos.</strong></p>
        </div>
      </div>
    );
  };

  // ── TICKET ALTO ──
  const renderTicketAlto = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">Monto mínimo por compra</label>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Al realizar una compra de</span>
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            <span className="px-2 py-2 bg-muted text-sm font-medium text-muted-foreground">$</span>
            <input
              type="number" min="1"
              value={form?.condition_value || 500}
              onChange={e => set('condition_value', parseFloat(e?.target?.value) || 0)}
              className="w-28 px-2 py-2 text-sm bg-background text-foreground font-semibold border-0 outline-none"
            />
            <span className="px-2 py-2 bg-muted text-sm font-medium text-muted-foreground">MXN</span>
          </div>
          <span className="text-sm text-muted-foreground">o más en una sola visita.</span>
        </div>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-xs text-emerald-700">📊 Actualmente <strong>{MOCK_IMPACT?.ticket_alto?.meets} clientes</strong> han realizado al menos una compra de este monto.</p>
      </div>
      <div className="p-2.5 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">ℹ️ Es diferente al gasto acumulado — premia el ticket alto individual en una sola visita.</p>
      </div>
    </div>
  );

  // ── MANUAL ──
  const renderManual = () => (
    <div className="space-y-3">
      <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl">
        <p className="text-xs text-violet-700 font-semibold mb-1">Logro manual — El staff lo otorga desde el CRM.</p>
        <p className="text-xs text-violet-600">El sistema no evalúa automáticamente este logro.</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">
          Descripción interna de la condición
          <span className="text-muted-foreground font-normal ml-1">(solo visible para el staff)</span>
        </label>
        <textarea
          value={form?.manual_condition_description || ''}
          rows={3}
          onChange={e => set('manual_condition_description', e?.target?.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
          placeholder="Ej: Otorgar al cliente que haya dado una sugerencia que implementamos."
        />
      </div>
      <div className="p-2.5 bg-muted/30 rounded-lg flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Ir al CRM para otorgar logros manualmente.</p>
        <button className="text-xs text-primary font-semibold underline whitespace-nowrap ml-2">Ir a CRM →</button>
      </div>
    </div>
  );

  const renderConditionFields = () => {
    switch (condType) {
      case 'visitas': return renderVisitas();
      case 'gasto': return renderGasto();
      case 'dias': return renderDias();
      case 'fundador': return renderFundador();
      case 'early_adopter': return renderEarlyAdopter();
      case 'cumpleanos': return renderCumpleanos();
      case 'hora_visita': return renderHoraVisita();
      case 'dia_semana': return renderDiaSemana();
      case 'referidos': return renderReferidos();
      case 'resenas': return renderResenas();
      case 'punch_cards': return renderPunchCards();
      case 'reservaciones': return renderReservaciones();
      case 'prepago': return renderPrepago();
      case 'metodos_checkin': return renderMetodosCheckin();
      case 'ticket_alto': return renderTicketAlto();
      case 'manual': return renderManual();
      default: return renderVisitas();
    }
  };

  // ── RETROACTIVE EVAL ──
  const renderRetroactiveToggle = () => {
    const isManual = condType === 'manual';
    if (isManual) return null;

    // Mock impact numbers
    const totalClients = 342;
    const estimatedRecipients = Math.floor(totalClients * 0.14);

    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-start gap-3 p-3">
          <Toggle value={form?.retroactive_eval || false} onChange={v => set('retroactive_eval', v)} disabled={false} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Evaluación retroactiva</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Al guardar, evalúa a todos los clientes existentes y entrega el logro a quienes ya cumplan la condición.
            </p>
          </div>
        </div>
        {form?.retroactive_eval && (
          <div className="mx-3 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">⚠️</span>
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">Impacto estimado al guardar:</p>
                <ul className="text-xs text-amber-700 space-y-0.5">
                  <li>• Se evaluarán <strong>{totalClients} clientes</strong>.</li>
                  <li>• Aproximadamente <strong>{estimatedRecipients} clientes</strong> podrían recibir este logro inmediatamente.</li>
                  <li>• Los puntos bonus se acreditarán a todos ellos.</li>
                  <li>• <strong>Esta acción no se puede deshacer.</strong></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Type label or dropdown */}
      {typeEditable ? renderTypeDropdown() : renderTypeLabel()}

      {/* Condition-specific fields */}
      <div className="pt-1">
        {renderConditionFields()}
      </div>

      {/* Retroactive evaluation toggle */}
      {renderRetroactiveToggle()}
    </div>
  );
};

// ─── MAIN DRAWER ──────────────────────────────────────────────────────────────
const AchievementEditDrawer = ({ achievement, onClose, onSave }) => {
  const [form, setForm] = useState(null);
  const [activeSection, setActiveSection] = useState('identidad');
  const [showEmojiGallery, setShowEmojiGallery] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [msgCursorPos, setMsgCursorPos] = useState(0);

  useEffect(() => {
    if (achievement) {
      setForm({ ...achievement });
    }
  }, [achievement]);

  if (!achievement || !form) return null;

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const insertVariable = (variable) => {
    const msg = form?.celebration_message || '';
    const newMsg = msg?.slice(0, msgCursorPos) + variable + msg?.slice(msgCursorPos);
    set('celebration_message', newMsg?.slice(0, 160));
    setMsgCursorPos(msgCursorPos + variable?.length);
  };

  const cfg = RARITY_CONFIG?.[form?.rarity] || RARITY_CONFIG?.comun;
  const pointsMXN = ((form?.reward_points || 0) * POINT_VALUE_MXN)?.toFixed(2);

  const sections = [
    { id: 'identidad', label: 'Identidad', icon: 'Palette' },
    { id: 'condicion', label: 'Condición', icon: 'Target' },
    { id: 'recompensa', label: 'Recompensa', icon: 'Gift' },
    { id: 'mensaje', label: 'Mensaje', icon: 'MessageCircle' },
    { id: 'visibilidad', label: 'Visibilidad', icon: 'Eye' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="relative w-full max-w-[440px] h-full bg-background shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card flex-shrink-0">
          <AchievementBadge emoji={form?.emoji} color={form?.color} rarity={form?.rarity} size={44} />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {form?.name}
            </h2>
            <RarityPill rarity={form?.rarity} />
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <Icon name="X" size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Section nav */}
        <div className="flex border-b border-border bg-card flex-shrink-0 overflow-x-auto">
          {sections?.map(s => (
            <button
              key={s?.id}
              onClick={() => setActiveSection(s?.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === s?.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={s?.icon} size={13} />
              {s?.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ── IDENTIDAD ── */}
          {activeSection === 'identidad' && (
            <>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Nombre del logro <span className="text-muted-foreground font-normal">(máx. 30 chars)</span></label>
                <input
                  value={form?.name || ''}
                  maxLength={30}
                  onChange={e => set('name', e?.target?.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground text-right mt-0.5">{(form?.name || '')?.length}/30</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Descripción — Bloqueado <span className="text-muted-foreground font-normal">(máx. 100 chars)</span></label>
                <textarea
                  value={form?.description_locked || ''}
                  maxLength={100}
                  rows={2}
                  onChange={e => set('description_locked', e?.target?.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
                  placeholder="Visítanos X veces para ganar este logro"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Descripción — Desbloqueado <span className="text-muted-foreground font-normal">(máx. 100 chars)</span></label>
                <textarea
                  value={form?.description_unlocked || ''}
                  maxLength={100}
                  rows={2}
                  onChange={e => set('description_unlocked', e?.target?.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
                  placeholder="¡Lo lograste! Llevas X visitas con nosotros"
                />
              </div>

              {/* Emoji selector */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Emoji del badge</label>
                <button
                  onClick={() => setShowEmojiGallery(!showEmojiGallery)}
                  className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-2xl">{form?.emoji}</span>
                  <span className="text-sm text-muted-foreground">Cambiar emoji</span>
                  <Icon name={showEmojiGallery ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground ml-auto" />
                </button>
                {showEmojiGallery && (
                  <div className="mt-2 border border-border rounded-xl p-3 bg-card space-y-3">
                    {Object.entries(EMOJI_GALLERY)?.map(([cat, emojis]) => (
                      <div key={cat}>
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">{cat}</p>
                        <div className="flex flex-wrap gap-1">
                          {emojis?.map(e => (
                            <button
                              key={e}
                              onClick={() => { set('emoji', e); setShowEmojiGallery(false); }}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-lg ${form?.emoji === e ? 'bg-primary/10 ring-1 ring-primary' : ''}`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Color selector */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Color del badge</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES?.map(c => (
                    <button
                      key={c}
                      onClick={() => set('color', c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${form?.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="flex items-center gap-2 mt-1 w-full">
                    <label className="text-xs text-muted-foreground">Color personalizado:</label>
                    <input
                      type="color"
                      value={form?.color || '#6B7280'}
                      onChange={e => set('color', e?.target?.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-border"
                    />
                    <span className="text-xs text-muted-foreground font-mono">{form?.color}</span>
                  </div>
                </div>
              </div>

              {/* Rarity selector */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Rareza</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {RARITY_OPTIONS?.map(r => (
                    <button
                      key={r?.value}
                      onClick={() => set('rarity', r?.value)}
                      className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center ${
                        form?.rarity === r?.value ? 'border-2' : 'border-border hover:bg-muted/50'
                      }`}
                      style={form?.rarity === r?.value ? { borderColor: r?.color, color: r?.color, backgroundColor: `${r?.color}15` } : {}}
                    >
                      {r?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Preview del badge</p>
                <div className="flex items-center justify-center">
                  <AchievementBadge emoji={form?.emoji} color={form?.color} rarity={form?.rarity} size={72} />
                </div>
              </div>
            </>
          )}

          {/* ── CONDICIÓN (SECCIÓN 2) ── */}
          {activeSection === 'condicion' && (
            <ConditionSection form={form} set={set} />
          )}

          {/* ── RECOMPENSA ── */}
          {activeSection === 'recompensa' && (
            <>
              <div className="flex items-start gap-3 p-3 border border-border rounded-xl">
                <Toggle
                  value={(form?.reward_points || 0) > 0}
                  onChange={v => set('reward_points', v ? 50 : 0)}
                  disabled={false}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Este logro tiene recompensa de puntos</p>
                </div>
              </div>

              {(form?.reward_points || 0) > 0 && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Puntos bonus</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        value={form?.reward_points || 0}
                        onChange={e => set('reward_points', parseInt(e?.target?.value) || 0)}
                        className="w-28 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                      />
                      <span className="text-sm text-muted-foreground">= <strong className="text-foreground">${pointsMXN} MXN</strong> de descuento futuro</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 p-2 bg-muted/30 rounded-lg">
                      💡 Si 50 clientes desbloquean este logro este mes, el costo total estimado es <strong>${((form?.reward_points || 0) * POINT_VALUE_MXN * 50)?.toFixed(0)} MXN</strong>.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Acción secundaria al desbloquear</label>
                <select
                  value={form?.secondary_action || 'ninguna'}
                  onChange={e => set('secondary_action', e?.target?.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                >
                  <option value="ninguna">Ninguna</option>
                  <option value="cupon_automatico">Generar cupón automático</option>
                  <option value="activar_punch_card">Activar punch card específica</option>
                  <option value="whatsapp_owner">Enviar WhatsApp al Owner</option>
                  <option value="subir_nivel_vip">Subir de nivel VIP si corresponde</option>
                </select>
              </div>
            </>
          )}

          {/* ── MENSAJE ── */}
          {activeSection === 'mensaje' && (
            <>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Mensaje de celebración <span className="text-muted-foreground font-normal">(máx. 160 chars)</span>
                </label>
                <textarea
                  value={form?.celebration_message || ''}
                  maxLength={160}
                  rows={4}
                  onChange={e => set('celebration_message', e?.target?.value)}
                  onSelect={e => setMsgCursorPos(e?.target?.selectionStart)}
                  onClick={e => setMsgCursorPos(e?.target?.selectionStart)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
                  placeholder="¡Felicidades {nombre_cliente}! Has desbloqueado {nombre_logro} 🏆"
                />
                <p className="text-xs text-muted-foreground text-right mt-0.5">{(form?.celebration_message || '')?.length}/160</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Variables disponibles</p>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLES?.map(v => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg hover:bg-primary/20 transition-colors font-mono"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Push notification preview */}
              <div className="p-3 bg-gray-900 rounded-xl">
                <p className="text-xs text-gray-400 mb-2">Preview notificación push</p>
                <div className="flex items-start gap-2">
                  <span className="text-xl">{form?.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">Tu negocio</p>
                    <p className="text-xs text-gray-300 mt-0.5 line-clamp-2">
                      {form?.celebration_message || 'Mensaje de celebración...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp toggle for Épico/Legendario */}
              {['epico', 'legendario']?.includes(form?.rarity) && (
                <div className="flex items-start gap-3 p-3 border border-border rounded-xl">
                  <Toggle value={form?.whatsapp_notify || false} onChange={v => set('whatsapp_notify', v)} disabled={false} />
                  <div>
                    <p className="text-sm font-medium text-foreground">Enviar también por WhatsApp</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Requiere integración WhatsApp Business activa.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── VISIBILIDAD ── */}
          {activeSection === 'visibilidad' && (
            <>
              <div className="flex items-start gap-3 p-3 border border-border rounded-xl">
                <Toggle value={form?.is_visible_locked !== false} onChange={v => set('is_visible_locked', v)} disabled={false} />
                <div>
                  <p className="text-sm font-medium text-foreground">Visible antes de desbloquearlo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    El cliente ve el logro bloqueado en gris con la condición y progreso. Si desactivas, el logro es una sorpresa completa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border border-border rounded-xl">
                <Toggle value={form?.allow_share !== false} onChange={v => set('allow_share', v)} disabled={false} />
                <div>
                  <p className="text-sm font-medium text-foreground">Permitir compartir al desbloquear</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    La pantalla de celebración incluye botón "Compartir 🎉" para Instagram/WhatsApp.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl">
                <p className="text-xs text-violet-700">
                  <strong>Irreversibilidad:</strong> Una vez desbloqueado por un cliente, este logro nunca se quita aunque el cliente cambie su comportamiento o el negocio modifique la condición.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-card flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementEditDrawer;
