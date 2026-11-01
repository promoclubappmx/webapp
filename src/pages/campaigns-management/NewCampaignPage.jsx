import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────
const OBJETIVOS = [
  {
    id: 'adquisicion',
    nombre: 'Adquisición',
    descripcion: 'Atraer clientes que nunca han visitado el negocio',
    metricaNorte: 'Nuevos clientes atribuidos',
    audienciaSugerida: 'Usuarios cercanos que nunca han visitado',
    accionesTipicas: ['Promo de primera visita', 'Flash deal con push', 'Cupón de bienvenida', 'Story patrocinada'],
    icono: 'UserPlus',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    badgeBg: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'reactivacion',
    nombre: 'Reactivación',
    descripcion: 'Recuperar clientes que dejaron de venir',
    metricaNorte: 'Clientes dormidos recuperados',
    audienciaSugerida: 'Clientes sin visita en 30+ días',
    accionesTipicas: ['Cupón de recuperación escalado', 'Push personalizado', 'Email con novedades', 'WhatsApp con oferta final'],
    icono: 'RefreshCw',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    badgeBg: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'upsell',
    nombre: 'Upsell',
    descripcion: 'Aumentar el ticket promedio de clientes actuales',
    metricaNorte: 'Incremento en ticket promedio',
    audienciaSugerida: 'Clientes recurrentes con ticket menor al promedio',
    accionesTipicas: ['Promo de combo o bundle', 'Puntos dobles en productos premium', 'Sugerencia de upgrade', 'Cross-sell'],
    icono: 'TrendingUp',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-500',
    badgeBg: 'bg-green-100 text-green-700',
  },
  {
    id: 'retencion',
    nombre: 'Retención',
    descripcion: 'Mantener a los mejores clientes activos y contentos',
    metricaNorte: 'Churn rate del segmento',
    audienciaSugerida: 'Clientes con 5+ visitas en los últimos 60 días',
    accionesTipicas: ['Acceso anticipado VIP', 'Experiencia exclusiva', 'Puntos bonus por racha', 'Reconocimiento social'],
    icono: 'Heart',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-500',
    badgeBg: 'bg-rose-100 text-rose-700',
  },
];

const FILTROS_RELACION = [
  { id: 'todos', label: 'Todos los que conocen el negocio', alcance: '~1,240', icono: 'Users' },
  { id: 'primera_visita', label: 'Primera visita en últimos 30 días', alcance: '~180', icono: 'UserPlus' },
  { id: 'recurrentes', label: 'Clientes recurrentes (3+ visitas)', alcance: '~420', icono: 'Repeat' },
  { id: 'dormidos', label: 'Dormidos (sin visita en 30+ días)', alcance: '~310', icono: 'Moon' },
  { id: 'perdidos', label: 'Perdidos (sin visita en 60+ días)', alcance: '~190', icono: 'UserX' },
  { id: 'nunca_visitaron', label: 'Nunca han visitado pero están cerca', alcance: '~850', icono: 'MapPin' },
];

const FILTROS_VIP = [
  { id: 'bronce', label: 'Bronce', icono: 'Award', color: 'text-amber-700' },
  { id: 'plata', label: 'Plata', icono: 'Award', color: 'text-slate-500' },
  { id: 'oro', label: 'Oro', icono: 'Award', color: 'text-yellow-500' },
  { id: 'sin_nivel', label: 'Sin nivel VIP', icono: 'User', color: 'text-muted-foreground' },
];

const FILTROS_COMPORTAMIENTO = [
  { id: 'canjeo_cupon', label: 'Canjearon cupón en últimos 30 días', icono: 'Tag' },
  { id: 'dejo_resena', label: 'Han dejado reseña', icono: 'Star' },
  { id: 'puntos_sin_canjear', label: 'Tienen puntos sin canjear', icono: 'Coins' },
  { id: 'punch_card', label: 'Punch card activo sin completar', icono: 'CreditCard' },
  { id: 'vio_ficha', label: 'Vieron la ficha sin visitar', icono: 'Eye' },
  { id: 'suscrito_notif', label: 'Suscritos a notificaciones', icono: 'Bell' },
];

const FILTROS_CANAL = [
  { id: 'push', label: 'Push habilitado', icono: 'Bell' },
  { id: 'email', label: 'Email registrado', icono: 'Mail' },
  { id: 'whatsapp', label: 'WhatsApp vinculado', icono: 'MessageCircle' },
];

const ACCIONES_SECUENCIA = [
  { id: 'push', nombre: 'Push notification', icono: 'Bell', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'cupon', nombre: 'Cupón al wallet', icono: 'Tag', color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'email', nombre: 'Email', icono: 'Mail', color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'story', nombre: 'Story en feed', icono: 'Image', color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'promo', nombre: 'Activar promoción', icono: 'Zap', color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'whatsapp', nombre: 'WhatsApp', icono: 'MessageCircle', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'puntos', nombre: 'Acreditar puntos bonus', icono: 'Star', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 'badge', nombre: 'Asignar badge/misión', icono: 'Award', color: 'text-rose-500', bg: 'bg-rose-50' },
];

const TIMING_TIPOS = [
  { id: 'inmediato', label: 'Inmediato' },
  { id: 'horas', label: 'Esperar X horas' },
  { id: 'dias', label: 'Esperar X días' },
  { id: 'accion', label: 'Esperar acción del usuario' },
  { id: 'fecha', label: 'Esperar hasta fecha específica' },
];

const ACCIONES_ESPERA = [
  { id: 'abrio_push', label: 'Abrió el push' },
  { id: 'canjeo_cupon', label: 'Canjeó el cupón' },
  { id: 'visito', label: 'Visitó el negocio' },
  { id: 'dejo_resena', label: 'Dejó reseña' },
];

const TEMPLATES = [
  {
    id: 'conquista-zona',
    nombre: 'Conquista tu zona',
    objetivo: 'adquisicion',
    descripcion: 'Flash deal + push + story + cupón primera visita',
    resultado: '+24% nuevos clientes',
    icono: 'MapPin',
    secuencia: [
      { id: 1, accion: 'push', mensaje: '¡Oferta especial cerca de ti! Visítanos hoy.', timingTipo: 'inmediato', timingValor: 0 },
      { id: 2, accion: 'story', mensaje: 'Foto del producto estrella con oferta del día.', timingTipo: 'dias', timingValor: 1 },
      { id: 3, accion: 'cupon', mensaje: 'Cupón de primera visita — 15% OFF.', timingTipo: 'dias', timingValor: 3 },
    ],
  },
  {
    id: 'apertura-relanzamiento',
    nombre: 'Apertura / Relanzamiento',
    objetivo: 'adquisicion',
    descripcion: 'Secuencia de 7 días con reveal progresivo',
    resultado: '+31% visitas',
    icono: 'Rocket',
    secuencia: [
      { id: 1, accion: 'push', mensaje: 'Algo nuevo está llegando... ¡Mantente atento!', timingTipo: 'inmediato', timingValor: 0 },
      { id: 2, accion: 'story', mensaje: 'Reveal del nuevo espacio/menú/producto.', timingTipo: 'dias', timingValor: 3 },
      { id: 3, accion: 'cupon', mensaje: 'Celebra con nosotros — cupón de inauguración.', timingTipo: 'dias', timingValor: 7 },
    ],
  },
  {
    id: 'te-extranamos',
    nombre: 'Te extrañamos',
    objetivo: 'reactivacion',
    descripcion: 'Secuencia escalada de 3 pasos para recuperar dormidos',
    resultado: '+18% clientes recuperados',
    icono: 'Heart',
    secuencia: [
      { id: 1, accion: 'push', mensaje: '¡Te extrañamos! Vuelve y obtén 15% OFF.', timingTipo: 'inmediato', timingValor: 0 },
      { id: 2, accion: 'cupon', mensaje: 'Cupón 15% de descuento en tu próxima visita.', timingTipo: 'dias', timingValor: 3 },
      { id: 3, accion: 'email', mensaje: 'Novedades del negocio + oferta escalada a 20%.', timingTipo: 'dias', timingValor: 7 },
    ],
  },
  {
    id: 'reconquista-vips',
    nombre: 'Reconquista VIPs dormidos',
    objetivo: 'reactivacion',
    descripcion: 'Oferta exclusiva + reconocimiento para VIPs inactivos',
    resultado: '+22% VIPs recuperados',
    icono: 'Crown',
    secuencia: [
      { id: 1, accion: 'push', mensaje: 'Como cliente VIP, tienes una oferta exclusiva esperándote.', timingTipo: 'inmediato', timingValor: 0 },
      { id: 2, accion: 'cupon', mensaje: 'Cupón VIP exclusivo — 25% OFF solo para ti.', timingTipo: 'dias', timingValor: 2 },
      { id: 3, accion: 'whatsapp', mensaje: 'Mensaje personal: oferta final de 30% que vence en 48h.', timingTipo: 'dias', timingValor: 7 },
    ],
  },
  {
    id: 'sube-ticket',
    nombre: 'Sube tu ticket',
    objetivo: 'upsell',
    descripcion: 'Combo + puntos dobles para aumentar ticket promedio',
    resultado: '+15% ticket promedio',
    icono: 'TrendingUp',
    secuencia: [
      { id: 1, accion: 'push', mensaje: 'Descubre nuestros combos premium con descuento especial.', timingTipo: 'inmediato', timingValor: 0 },
      { id: 2, accion: 'puntos', mensaje: 'Puntos dobles en productos seleccionados esta semana.', timingTipo: 'dias', timingValor: 2 },
    ],
  },
  {
    id: 'premia-mejores',
    nombre: 'Premia a tus mejores',
    objetivo: 'retencion',
    descripcion: 'Experiencia exclusiva VIP para clientes top',
    resultado: '-12% churn rate',
    icono: 'Trophy',
    secuencia: [
      { id: 1, accion: 'push', mensaje: 'Eres uno de nuestros mejores clientes — tienes acceso VIP anticipado.', timingTipo: 'inmediato', timingValor: 0 },
      { id: 2, accion: 'badge', mensaje: 'Badge exclusivo "Cliente del Mes" asignado a tu perfil.', timingTipo: 'dias', timingValor: 1 },
      { id: 3, accion: 'cupon', mensaje: 'Regalo de reconocimiento — experiencia exclusiva.', timingTipo: 'dias', timingValor: 3 },
    ],
  },
  {
    id: 'racha-visitas',
    nombre: 'Racha de visitas',
    objetivo: 'retencion',
    descripcion: 'Puntos multiplicados por visitas consecutivas',
    resultado: '+28% frecuencia de visita',
    icono: 'Flame',
    secuencia: [
      { id: 1, accion: 'push', mensaje: '¡Mantén tu racha! Visítanos esta semana y gana puntos x3.', timingTipo: 'inmediato', timingValor: 0 },
      { id: 2, accion: 'puntos', mensaje: 'Puntos triplicados por visitas consecutivas.', timingTipo: 'inmediato', timingValor: 0 },
    ],
  },
  {
    id: 'aniversario-cliente',
    nombre: 'Aniversario del cliente',
    objetivo: 'retencion',
    descripcion: 'Regalo por antigüedad como cliente',
    resultado: '+35% satisfacción',
    icono: 'Gift',
    secuencia: [
      { id: 1, accion: 'push', mensaje: '¡Celebramos tu aniversario con nosotros! Tienes un regalo.', timingTipo: 'inmediato', timingValor: 0 },
      { id: 2, accion: 'cupon', mensaje: 'Cupón de aniversario — regalo especial por tu lealtad.', timingTipo: 'inmediato', timingValor: 0 },
    ],
  },
];

const PASOS = [
  { id: 1, nombre: 'Objetivo', icono: 'Target' },
  { id: 2, nombre: 'Detalles', icono: 'FileText' },
  { id: 3, nombre: 'Audiencia', icono: 'Users' },
  { id: 4, nombre: 'Secuencia', icono: 'GitBranch' },
  { id: 5, nombre: 'A/B & Control', icono: 'FlaskConical' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcularAlcanceEstimado = (filtros) => {
  let base = 0;
  const relacion = filtros?.relacion || [];
  const vip = filtros?.vip || [];
  const comportamiento = filtros?.comportamiento || [];
  const canal = filtros?.canal || [];

  if (relacion?.includes('todos')) base = 1240;
  else {
    if (relacion?.includes('primera_visita')) base += 180;
    if (relacion?.includes('recurrentes')) base += 420;
    if (relacion?.includes('dormidos')) base += 310;
    if (relacion?.includes('perdidos')) base += 190;
    if (relacion?.includes('nunca_visitaron')) base += 850;
  }

  if (vip?.length > 0 && !relacion?.includes('todos')) base = Math.floor(base * 0.6);
  if (comportamiento?.length > 0) base = Math.floor(base * 0.7);
  if (canal?.length > 0) base = Math.floor(base * 0.8);

  return Math.max(base, 0);
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const ToggleSwitch = ({ value, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-foreground text-sm">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        value ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

const FilterChip = ({ active, onClick, label, icono, color }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
      active
        ? 'border-primary bg-primary/10 text-primary font-medium' :'border-border bg-card text-foreground hover:border-primary/40'
    }`}
  >
    {icono && <Icon name={icono} size={14} className={active ? 'text-primary' : (color || 'text-muted-foreground')} />}
    {label}
    {active && <Icon name="X" size={12} className="text-primary ml-auto" />}
  </button>
);

const SecuenciaNodo = ({ paso, index, total, onUpdate, onDelete }) => {
  const accionInfo = ACCIONES_SECUENCIA?.find(a => a?.id === paso?.accion) || ACCIONES_SECUENCIA?.[0];

  return (
    <div className="relative">
      <div className="flex gap-3">
        {/* Línea conectora */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-xl ${accionInfo?.bg} flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm`}>
            <Icon name={accionInfo?.icono} size={18} className={accionInfo?.color} />
          </div>
          {index < total - 1 && (
            <div className="w-0.5 flex-1 bg-border mt-1 min-h-[24px]" />
          )}
        </div>

        {/* Contenido del paso */}
        <div className="flex-1 bg-card border border-border rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paso {index + 1}</span>
            {total > 1 && (
              <button
                type="button"
                onClick={() => onDelete(paso?.id)}
                className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
              >
                <Icon name="Trash2" size={14} />
              </button>
            )}
          </div>

          {/* Selector de acción */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Acción</label>
            <div className="grid grid-cols-4 gap-1.5">
              {ACCIONES_SECUENCIA?.map(a => (
                <button
                  key={a?.id}
                  type="button"
                  onClick={() => onUpdate(paso?.id, 'accion', a?.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                    paso?.accion === a?.id
                      ? `border-primary bg-primary/10 text-primary`
                      : 'border-border hover:border-primary/30 text-muted-foreground'
                  }`}
                >
                  <Icon name={a?.icono} size={14} className={paso?.accion === a?.id ? 'text-primary' : a?.color} />
                  <span className="leading-tight text-center" style={{ fontSize: '10px' }}>{a?.nombre?.split(' ')?.[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mensaje */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mensaje / Contenido</label>
            <textarea
              value={paso?.mensaje || ''}
              onChange={e => onUpdate(paso?.id, 'mensaje', e?.target?.value)}
              placeholder={`Escribe el contenido para ${accionInfo?.nombre}...`}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Timing */}
          {index > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Timing</label>
                <select
                  value={paso?.timingTipo || 'dias'}
                  onChange={e => onUpdate(paso?.id, 'timingTipo', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {TIMING_TIPOS?.map(t => (
                    <option key={t?.id} value={t?.id}>{t?.label}</option>
                  ))}
                </select>
              </div>
              {(paso?.timingTipo === 'horas' || paso?.timingTipo === 'dias' || !paso?.timingTipo) && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {paso?.timingTipo === 'horas' ? 'Horas' : 'Días'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={paso?.timingValor || 1}
                    onChange={e => onUpdate(paso?.id, 'timingValor', parseInt(e?.target?.value) || 1)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
              {paso?.timingTipo === 'accion' && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Acción esperada</label>
                  <select
                    value={paso?.accionEspera || 'visito'}
                    onChange={e => onUpdate(paso?.id, 'accionEspera', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {ACCIONES_ESPERA?.map(a => (
                      <option key={a?.id} value={a?.id}>{a?.label}</option>
                    ))}
                  </select>
                </div>
              )}
              {paso?.timingTipo === 'fecha' && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Fecha específica</label>
                  <input
                    type="date"
                    value={paso?.fechaEspecifica || ''}
                    onChange={e => onUpdate(paso?.id, 'fechaEspecifica', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          )}

          {/* Bifurcaciones */}
          {paso?.tieneBifurcacion && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Bifurcación condicional</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-medium text-green-700 mb-1">✓ Si canjeó</p>
                  <input
                    type="text"
                    placeholder="Ej: Enviar agradecimiento"
                    value={paso?.bifurcacionSi || ''}
                    onChange={e => onUpdate(paso?.id, 'bifurcacionSi', e?.target?.value)}
                    className="w-full px-2 py-1 border border-green-200 rounded text-xs bg-white text-foreground focus:outline-none"
                  />
                </div>
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-700 mb-1">✗ Si no canjeó</p>
                  <input
                    type="text"
                    placeholder="Ej: Escalar incentivo"
                    value={paso?.bifurcacionNo || ''}
                    onChange={e => onUpdate(paso?.id, 'bifurcacionNo', e?.target?.value)}
                    className="w-full px-2 py-1 border border-amber-200 rounded text-xs bg-white text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => onUpdate(paso?.id, 'tieneBifurcacion', !paso?.tieneBifurcacion)}
            className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <Icon name="GitBranch" size={12} />
            {paso?.tieneBifurcacion ? 'Quitar bifurcación' : 'Agregar bifurcación condicional'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const NewCampaignPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isDuplicate = searchParams?.get('duplicate') === 'true';
  const isEdit = !!id;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!isEdit);
  const [savedAudienceName, setSavedAudienceName] = useState('');
  const [showSaveAudience, setShowSaveAudience] = useState(false);

  // Paso 1 – Objetivo
  const [objetivo, setObjetivo] = useState(null);

  // Paso 2 – Detalles
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [tagCategoria, setTagCategoria] = useState('');

  // Paso 3 – Audiencia
  const [filtrosAudiencia, setFiltrosAudiencia] = useState({
    relacion: [],
    vip: [],
    comportamiento: [],
    demograficos: { rangoEdad: '', cumpleanosEsteMes: false },
    ubicacion: { radio: 3, zona: '' },
    segmentosCRM: [],
    canal: [],
  });

  // Paso 4 – Secuencia
  const [secuencia, setSecuencia] = useState([
    { id: Date.now(), accion: 'push', mensaje: '', timingTipo: 'inmediato', timingValor: 0 },
  ]);

  // Paso 5 – A/B + Control
  const [abActivo, setAbActivo] = useState(false);
  const [varianteA, setVarianteA] = useState({ titulo: '', descuento: '', imagen: '', incentivo: 'cupon', timing: 'manana', canal: 'push', cta: '' });
  const [varianteB, setVarianteB] = useState({ titulo: '', descuento: '', imagen: '', incentivo: 'cupon', timing: 'tarde', canal: 'email', cta: '' });
  const [varianteC, setVarianteC] = useState(null);
  const [division, setDivision] = useState('50-50');
  const [duracionAB, setDuracionAB] = useState(7);
  const [grupoControlActivo, setGrupoControlActivo] = useState(false);
  const [porcentajeControl, setPorcentajeControl] = useState(10);

  const user = { id: 1, name: 'Carlos Mendoza', email: 'carlos@mirestaurante.com', role: 'owner' };

  const alcanceEstimado = calcularAlcanceEstimado(filtrosAudiencia);

  const objetivoInfo = OBJETIVOS?.find(o => o?.id === objetivo);

  const toggleFiltro = (categoria, valor) => {
    setFiltrosAudiencia(prev => {
      const arr = prev?.[categoria] || [];
      return {
        ...prev,
        [categoria]: arr?.includes(valor) ? arr?.filter(v => v !== valor) : [...arr, valor],
      };
    });
  };

  const agregarPasoSecuencia = () => {
    setSecuencia(prev => [
      ...prev,
      { id: Date.now(), accion: 'push', mensaje: '', timingTipo: 'dias', timingValor: 1 },
    ]);
  };

  const eliminarPasoSecuencia = (id) => {
    setSecuencia(prev => prev?.filter(p => p?.id !== id));
  };

  const actualizarPasoSecuencia = (id, campo, valor) => {
    setSecuencia(prev => prev?.map(p => p?.id === id ? { ...p, [campo]: valor } : p));
  };

  const aplicarTemplate = (template) => {
    const obj = OBJETIVOS?.find(o => o?.id === template?.objetivo);
    if (obj) setObjetivo(obj?.id);
    setNombre(template?.nombre);
    setSecuencia(template?.secuencia?.map(s => ({ ...s, id: Date.now() + Math.random() })));
    setShowTemplates(false);
    setPasoActual(2);
  };

  const puedeAvanzar = () => {
    if (pasoActual === 1) return !!objetivo;
    if (pasoActual === 2) return nombre?.trim()?.length > 0 && fechaInicio && fechaFin;
    if (pasoActual === 3) return (filtrosAudiencia?.relacion?.length > 0 || filtrosAudiencia?.vip?.length > 0 || filtrosAudiencia?.comportamiento?.length > 0 || filtrosAudiencia?.canal?.length > 0);
    return true;
  };

  const handleGuardar = async (asBorrador = false) => {
    setIsSaving(true);
    try {
      const campaignData = {
        campaign_id: id || `camp_${Date.now()}`,
        objective: objetivo,
        audience_segments: filtrosAudiencia,
      };

      const sequenceData = secuencia?.map((paso, idx) => ({
        campaign_id: campaignData?.campaign_id,
        step_order: idx + 1,
        channel: paso?.accion,
        message: paso?.mensaje,
        delay_days: paso?.timingTipo === 'dias' ? (paso?.timingValor || 0) : 0,
      }));

      const abData = {
        campaign_id: campaignData?.campaign_id,
        is_active: abActivo,
        variant_a: varianteA,
        variant_b: varianteB,
        audience_split: division,
        control_group_active: grupoControlActivo,
        control_group_percentage: porcentajeControl,
      };

      await supabase?.from('campaign_objectives')?.upsert(campaignData, { onConflict: 'campaign_id' });
      if (id) await supabase?.from('campaign_sequences')?.delete()?.eq('campaign_id', campaignData?.campaign_id);
      await supabase?.from('campaign_sequences')?.insert(sequenceData);
      await supabase?.from('campaign_ab_tests')?.upsert(abData, { onConflict: 'campaign_id' });

      navigate('/campaigns-management');
    } catch (err) {
      console.error('Error saving campaign:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
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
        className={`pt-16 transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/campaigns-management')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="ArrowLeft" size={20} className="text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEdit ? 'Editar Campaña' : isDuplicate ? 'Duplicar Campaña' : 'Nueva Campaña'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit ? 'Modifica los parámetros de tu campaña' : 'Configura tu campaña paso a paso'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleGuardar(true)} disabled={isSaving}>
                Guardar borrador
              </Button>
            </div>
          </div>

          {/* Templates Section */}
          {showTemplates && !isEdit && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="LayoutTemplate" size={20} className="text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Plantillas por objetivo</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Basado en negocios similares</span>
                </div>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Empezar desde cero →
                </button>
              </div>

              {OBJETIVOS?.map(obj => {
                const templatesObj = TEMPLATES?.filter(t => t?.objetivo === obj?.id);
                if (templatesObj?.length === 0) return null;
                return (
                  <div key={obj?.id} className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-6 h-6 rounded-lg ${obj?.bg} flex items-center justify-center`}>
                        <Icon name={obj?.icono} size={14} className={obj?.color} />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{obj?.nombre}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {templatesObj?.map(t => (
                        <button
                          key={t?.id}
                          onClick={() => aplicarTemplate(t)}
                          className="flex flex-col items-start p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left group"
                        >
                          <div className={`w-9 h-9 rounded-xl ${obj?.bg} flex items-center justify-center mb-2`}>
                            <Icon name={t?.icono} size={16} className={obj?.color} />
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${obj?.badgeBg}`}>
                            {obj?.nombre}
                          </span>
                          <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{t?.nombre}</p>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{t?.descripcion}</p>
                          <div className="flex items-center gap-1 mt-auto">
                            <Icon name="TrendingUp" size={11} className="text-green-500" />
                            <span className="text-xs text-green-600 font-medium">{t?.resultado}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-border pt-4 mt-4">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="Plus" size={16} />
                  Crear campaña desde cero
                </button>
              </div>
            </div>
          )}

          {/* Stepper */}
          {!showTemplates && (
            <>
              <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                {PASOS?.map((paso, idx) => (
                  <React.Fragment key={paso?.id}>
                    <button
                      onClick={() => pasoActual > paso?.id && setPasoActual(paso?.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                        pasoActual === paso?.id
                          ? 'bg-primary text-primary-foreground'
                          : pasoActual > paso?.id
                          ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20' :'bg-border text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        pasoActual > paso?.id ? 'bg-primary text-primary-foreground' : ''
                      }`}>
                        {pasoActual > paso?.id ? <Icon name="Check" size={12} /> : paso?.id}
                      </div>
                      <span className="hidden sm:block">{paso?.nombre}</span>
                    </button>
                    {idx < PASOS?.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded min-w-[16px] ${
                        pasoActual > paso?.id ? 'bg-primary' : 'bg-border'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* ── PASO 1: Objetivo ── */}
              {pasoActual === 1 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-foreground mb-1">¿Cuál es el objetivo de tu campaña?</h2>
                    <p className="text-muted-foreground text-sm">El objetivo determina las métricas, la audiencia sugerida y los templates disponibles.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {OBJETIVOS?.map(obj => (
                      <button
                        key={obj?.id}
                        type="button"
                        onClick={() => setObjetivo(obj?.id)}
                        className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                          objetivo === obj?.id
                            ? `${obj?.border} ${obj?.bg}`
                            : 'border-border hover:border-primary/40 bg-card'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl ${obj?.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon name={obj?.icono} size={24} className={obj?.color} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-foreground text-base">{obj?.nombre}</p>
                            {objetivo === obj?.id && <Icon name="CheckCircle2" size={20} className="text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{obj?.descripcion}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground">Métrica norte: <span className="text-muted-foreground font-normal">{obj?.metricaNorte}</span></p>
                            <p className="text-xs font-medium text-foreground">Audiencia sugerida: <span className="text-muted-foreground font-normal">{obj?.audienciaSugerida}</span></p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {obj?.accionesTipicas?.map((a, i) => (
                              <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${obj?.badgeBg}`}>{a}</span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── PASO 2: Detalles ── */}
              {pasoActual === 2 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-foreground mb-1">Detalles de la campaña</h2>
                    <p className="text-muted-foreground text-sm">Define el nombre, fechas, presupuesto y categoría de tu campaña.</p>
                  </div>

                  {objetivoInfo && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${objetivoInfo?.bg} border ${objetivoInfo?.border} mb-6`}>
                      <Icon name={objetivoInfo?.icono} size={20} className={objetivoInfo?.color} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Objetivo: {objetivoInfo?.nombre}</p>
                        <p className="text-xs text-muted-foreground">Métrica norte: {objetivoInfo?.metricaNorte}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Nombre de la campaña * <span className="text-muted-foreground font-normal">({nombre?.length}/60)</span>
                      </label>
                      <Input
                        value={nombre}
                        onChange={e => setNombre(e?.target?.value?.slice(0, 60))}
                        placeholder="Ej: Campaña Reactivación Verano 2026"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Descripción interna <span className="text-muted-foreground font-normal">(solo visible para ti)</span></label>
                      <textarea
                        value={descripcion}
                        onChange={e => setDescripcion(e?.target?.value)}
                        placeholder="Notas internas sobre el objetivo y estrategia de esta campaña..."
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Fecha de inicio *</label>
                        <input
                          type="date"
                          value={fechaInicio}
                          onChange={e => setFechaInicio(e?.target?.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Fecha de fin *</label>
                        <input
                          type="date"
                          value={fechaFin}
                          onChange={e => setFechaFin(e?.target?.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Presupuesto (MXN) <span className="text-muted-foreground font-normal">opcional</span></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <input
                            type="number"
                            value={presupuesto}
                            onChange={e => setPresupuesto(e?.target?.value)}
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Tag de categoría <span className="text-muted-foreground font-normal">opcional</span></label>
                        <Input
                          value={tagCategoria}
                          onChange={e => setTagCategoria(e?.target?.value)}
                          placeholder="Ej: Q1 2026, Verano, Aniversario"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Estado inicial</label>
                      <div className="flex gap-2">
                        {['borrador', 'programada']?.map(estado => (
                          <span key={estado} className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground bg-muted">
                            {estado?.charAt(0)?.toUpperCase() + estado?.slice(1)}
                          </span>
                        ))}
                        <span className="text-xs text-muted-foreground self-center ml-2">Ciclo: borrador → programada → activa → pausada → finalizada → archivada</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PASO 3: Audiencia ── */}
              {pasoActual === 3 && (
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-1">Selecciona tu audiencia</h2>
                      <p className="text-muted-foreground text-sm">Combina filtros con lógica AND para definir exactamente a quién va dirigida la campaña.</p>
                    </div>
                    {/* Contador de alcance */}
                    <div className="flex-shrink-0 ml-4">
                      <div className={`px-4 py-3 rounded-xl border-2 text-center ${
                        alcanceEstimado < 10 ? 'border-destructive bg-destructive/5' :
                        alcanceEstimado > 500 ? 'border-warning bg-warning/5': 'border-primary bg-primary/5'
                      }`}>
                        <p className="text-2xl font-bold text-foreground">~{alcanceEstimado?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">usuarios estimados</p>
                      </div>
                      {alcanceEstimado < 10 && alcanceEstimado > 0 && (
                        <p className="text-xs text-destructive mt-1 text-center">⚠ Audiencia muy pequeña</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Relación con el negocio */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="Store" size={16} className="text-primary" />
                        Relación con el negocio
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {FILTROS_RELACION?.map(f => (
                          <FilterChip
                            key={f?.id}
                            active={filtrosAudiencia?.relacion?.includes(f?.id)}
                            onClick={() => toggleFiltro('relacion', f?.id)}
                            label={`${f?.label} (${f?.alcance})`}
                            icono={f?.icono}
                            color="text-muted-foreground"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Nivel VIP */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="Crown" size={16} className="text-primary" />
                        Nivel VIP
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {FILTROS_VIP?.map(f => (
                          <FilterChip
                            key={f?.id}
                            active={filtrosAudiencia?.vip?.includes(f?.id)}
                            onClick={() => toggleFiltro('vip', f?.id)}
                            label={f?.label}
                            icono={f?.icono}
                            color={f?.color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comportamiento */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="Activity" size={16} className="text-primary" />
                        Comportamiento
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {FILTROS_COMPORTAMIENTO?.map(f => (
                          <FilterChip
                            key={f?.id}
                            active={filtrosAudiencia?.comportamiento?.includes(f?.id)}
                            onClick={() => toggleFiltro('comportamiento', f?.id)}
                            label={f?.label}
                            icono={f?.icono}
                            color="text-muted-foreground"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Demografía */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="BarChart2" size={16} className="text-primary" />
                        Demografía
                      </h3>
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-muted-foreground">Rango de edad:</label>
                          <input
                            type="text"
                            placeholder="Ej: 25-45"
                            value={filtrosAudiencia?.demograficos?.rangoEdad || ''}
                            onChange={e => setFiltrosAudiencia(prev => ({ ...prev, demograficos: { ...prev?.demograficos, rangoEdad: e?.target?.value } }))}
                            className="w-24 px-2 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none"
                          />
                        </div>
                        <FilterChip
                          active={filtrosAudiencia?.demograficos?.cumpleanosEsteMes}
                          onClick={() => setFiltrosAudiencia(prev => ({ ...prev, demograficos: { ...prev?.demograficos, cumpleanosEsteMes: !prev?.demograficos?.cumpleanosEsteMes } }))}
                          label="Cumpleaños este mes"
                          icono="Cake"
                          color="text-muted-foreground"
                        />
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="MapPin" size={16} className="text-primary" />
                        Ubicación
                      </h3>
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-muted-foreground">Radio:</label>
                          <input
                            type="range"
                            min={0.5}
                            max={10}
                            step={0.5}
                            value={filtrosAudiencia?.ubicacion?.radio || 3}
                            onChange={e => setFiltrosAudiencia(prev => ({ ...prev, ubicacion: { ...prev?.ubicacion, radio: parseFloat(e?.target?.value) } }))}
                            className="w-32 accent-primary"
                          />
                          <span className="text-sm font-medium text-foreground">{filtrosAudiencia?.ubicacion?.radio || 3} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-muted-foreground">Zona/Colonia:</label>
                          <input
                            type="text"
                            placeholder="Ej: Centro, Roma Norte"
                            value={filtrosAudiencia?.ubicacion?.zona || ''}
                            onChange={e => setFiltrosAudiencia(prev => ({ ...prev, ubicacion: { ...prev?.ubicacion, zona: e?.target?.value } }))}
                            className="w-40 px-2 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Canal */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="Radio" size={16} className="text-primary" />
                        Canal de contacto
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {FILTROS_CANAL?.map(f => (
                          <FilterChip
                            key={f?.id}
                            active={filtrosAudiencia?.canal?.includes(f?.id)}
                            onClick={() => toggleFiltro('canal', f?.id)}
                            label={f?.label}
                            icono={f?.icono}
                            color="text-muted-foreground"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Guardar audiencia */}
                    <div className="pt-4 border-t border-border">
                      {!showSaveAudience ? (
                        <button
                          type="button"
                          onClick={() => setShowSaveAudience(true)}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Icon name="Bookmark" size={14} />
                          Guardar esta audiencia como template reutilizable
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nombre del template (ej: Mis VIPs dormidos)"
                            value={savedAudienceName}
                            onChange={e => setSavedAudienceName(e?.target?.value)}
                            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button size="sm" onClick={() => { setShowSaveAudience(false); setSavedAudienceName(''); }}>Guardar</Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowSaveAudience(false)}>Cancelar</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── PASO 4: Secuencia ── */}
              {pasoActual === 4 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-foreground mb-1">Constructor de secuencia multi-paso</h2>
                    <p className="text-muted-foreground text-sm">Define los pasos de tu campaña. Cada usuario sale de la secuencia cuando completa el objetivo.</p>
                  </div>

                  <div className="max-w-2xl">
                    {secuencia?.map((paso, idx) => (
                      <SecuenciaNodo
                        key={paso?.id}
                        paso={paso}
                        index={idx}
                        total={secuencia?.length}
                        onUpdate={actualizarPasoSecuencia}
                        onDelete={eliminarPasoSecuencia}
                      />
                    ))}

                    <button
                      type="button"
                      onClick={agregarPasoSecuencia}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Icon name="Plus" size={16} />
                      Agregar paso a la secuencia
                    </button>

                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" />
                        Los usuarios salen automáticamente de la secuencia cuando completan el objetivo (visitaron, canjearon, compraron). Esto evita enviar incentivos a quienes ya convirtieron.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PASO 5: A/B + Control ── */}
              {pasoActual === 5 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-foreground mb-1">A/B Testing y Grupo de Control</h2>
                    <p className="text-muted-foreground text-sm">Optimiza el rendimiento de tu campaña con pruebas comparativas y medición de impacto real.</p>
                  </div>

                  <div className="space-y-6">
                    {/* A/B Testing */}
                    <div className="border border-border rounded-xl p-5">
                      <div className="mb-4">
                        <ToggleSwitch
                          value={abActivo}
                          onChange={setAbActivo}
                          label="Activar prueba A/B"
                          description="Compara variantes y descubre cuál funciona mejor"
                        />
                      </div>

                      {abActivo && (
                        <div className="space-y-5">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700">
                              Enviaremos cada variante a una parte de tu audiencia y te mostraremos cuál funcionó mejor. Las métricas comparadas son: tasa de apertura, tasa de canje, tasa de visita, revenue generado y costo por conversión.
                            </p>
                          </div>

                          {/* Variantes */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[{ letra: 'A', data: varianteA, setData: setVarianteA, color: 'bg-blue-500' }, { letra: 'B', data: varianteB, setData: setVarianteB, color: 'bg-green-500' }]?.map(({ letra, data, setData, color }) => (
                              <div key={letra} className="border border-border rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className={`w-6 h-6 ${color} text-white rounded text-xs font-bold flex items-center justify-center`}>{letra}</span>
                                  <p className="font-semibold text-foreground">Variante {letra}</p>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-xs text-muted-foreground">Mensaje del push</label>
                                    <input type="text" placeholder="Texto del mensaje" value={data?.titulo || ''} onChange={e => setData(v => ({ ...v, titulo: e?.target?.value }))} className="w-full mt-1 px-2 py-1.5 border border-border rounded text-sm bg-background text-foreground focus:outline-none" />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Valor del descuento</label>
                                    <input type="text" placeholder="Ej: 15%, 20%, producto gratis" value={data?.descuento || ''} onChange={e => setData(v => ({ ...v, descuento: e?.target?.value }))} className="w-full mt-1 px-2 py-1.5 border border-border rounded text-sm bg-background text-foreground focus:outline-none" />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Tipo de incentivo</label>
                                    <select value={data?.incentivo || 'cupon'} onChange={e => setData(v => ({ ...v, incentivo: e?.target?.value }))} className="w-full mt-1 px-2 py-1.5 border border-border rounded text-sm bg-background text-foreground focus:outline-none">
                                      <option value="cupon">Cupón</option>
                                      <option value="puntos">Puntos bonus</option>
                                      <option value="producto">Producto gratis</option>
                                      <option value="descuento">Descuento directo</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Canal</label>
                                    <select value={data?.canal || 'push'} onChange={e => setData(v => ({ ...v, canal: e?.target?.value }))} className="w-full mt-1 px-2 py-1.5 border border-border rounded text-sm bg-background text-foreground focus:outline-none">
                                      <option value="push">Push notification</option>
                                      <option value="email">Email</option>
                                      <option value="whatsapp">WhatsApp</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Timing de envío</label>
                                    <select value={data?.timing || 'manana'} onChange={e => setData(v => ({ ...v, timing: e?.target?.value }))} className="w-full mt-1 px-2 py-1.5 border border-border rounded text-sm bg-background text-foreground focus:outline-none">
                                      <option value="manana">Mañana (9-12h)</option>
                                      <option value="tarde">Tarde (14-17h)</option>
                                      <option value="noche">Noche (19-21h)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">CTA</label>
                                    <input type="text" placeholder="Texto del botón" value={data?.cta || ''} onChange={e => setData(v => ({ ...v, cta: e?.target?.value }))} className="w-full mt-1 px-2 py-1.5 border border-border rounded text-sm bg-background text-foreground focus:outline-none" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* División de audiencia */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">División de audiencia</label>
                            <div className="flex gap-2">
                              {['50-50', '70-30', '80-20']?.map(d => (
                                <button key={d} type="button" onClick={() => setDivision(d)} className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${ division === d ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40' }`}>{d}</button>
                              ))}
                            </div>
                          </div>

                          {/* Duración */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Duración de la prueba antes de declarar ganador</label>
                            <div className="flex items-center gap-3">
                              <input type="range" min={3} max={30} step={1} value={duracionAB} onChange={e => setDuracionAB(parseInt(e?.target?.value))} className="flex-1 accent-primary" />
                              <span className="text-sm font-bold text-foreground w-16">{duracionAB} días</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Grupo de Control */}
                    <div className="border border-border rounded-xl p-5">
                      <div className="mb-4">
                        <ToggleSwitch
                          value={grupoControlActivo}
                          onChange={setGrupoControlActivo}
                          label="Grupo de control"
                          description="Mide el impacto real separando correlación de causalidad"
                        />
                      </div>

                      {grupoControlActivo && (
                        <div className="space-y-4">
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-xs text-purple-700">
                              Este grupo no recibirá ninguna acción de la campaña. Al finalizar, compararás la tasa de visita del grupo campaña vs el grupo control para calcular el impacto real incremental.
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-foreground">Porcentaje sin campaña</label>
                              <span className="text-lg font-bold text-primary">{porcentajeControl}%</span>
                            </div>
                            <input
                              type="range"
                              min={10}
                              max={20}
                              step={5}
                              value={porcentajeControl}
                              onChange={e => setPorcentajeControl(parseInt(e?.target?.value))}
                              className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>10%</span>
                              <span>15%</span>
                              <span>20%</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <Icon name="Shield" size={16} className="text-primary flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">Los usuarios del grupo de control no saben que están en él — simplemente no reciben comunicaciones de esta campaña específica.</p>
                          </div>
                        </div>
                      )}

                      {grupoControlActivo && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-xs font-medium text-primary">Badge "Con medición de impacto" se mostrará en esta campaña</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => pasoActual === 1 ? navigate('/campaigns-management') : setPasoActual(p => p - 1)}
                  iconName="ChevronLeft"
                  iconSize={16}
                >
                  {pasoActual === 1 ? 'Cancelar' : 'Anterior'}
                </Button>

                <div className="flex items-center gap-3">
                  {pasoActual < PASOS?.length ? (
                    <Button
                      onClick={() => setPasoActual(p => p + 1)}
                      disabled={!puedeAvanzar()}
                      iconName="ChevronRight"
                      iconSize={16}
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleGuardar(false)}
                      disabled={isSaving}
                      iconName={isSaving ? 'Loader2' : 'Check'}
                      iconSize={16}
                    >
                      {isSaving ? 'Guardando...' : isEdit ? 'Actualizar campaña' : 'Crear campaña'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default NewCampaignPage;
