import React, { useState, useRef, useEffect } from 'react';
import ReportDetail from './ReportDetail';
import ReportBuilder from './ReportBuilderNew';

// ─── Report Data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'visitas', label: 'Visitas', color: '#1A3FE0', count: 5 },
  { id: 'clientes', label: 'Clientes', color: '#7C3AED', count: 6 },
  { id: 'lealtad', label: 'Lealtad', color: '#F59E0B', count: 6 },
  { id: 'promociones', label: 'Promociones', color: '#EF4444', count: 5 },
  { id: 'financiero', label: 'Financiero', color: '#00A86B', count: 4 },
  { id: 'geolocalizacion', label: 'Geolocalización', color: '#0891B2', count: 2 },
];

const ALL_REPORTS = [
  // Visitas
  { id: 1, cat: 'visitas', icon: '📍', name: 'Visitas por período', plan: 'PRO', type: 'Estándar', desc: 'Análisis detallado de visitas verificadas por rango de fechas' },
  { id: 2, cat: 'visitas', icon: '⏰', name: 'Horas pico de la semana', plan: 'PRO', type: 'Estándar', desc: 'Distribución horaria de visitas para optimizar operaciones' },
  { id: 3, cat: 'visitas', icon: '✅', name: 'Check-ins por método', plan: 'PRO', type: 'Estándar', desc: 'Desglose por QR, NFC, geofence y validación manual' },
  { id: 4, cat: 'visitas', icon: '🚫', name: 'No-shows y cancelaciones', plan: 'PRO', type: 'Estándar', desc: 'Tasa de no presentación y patrones de cancelación' },
  { id: 5, cat: 'visitas', icon: '📊', name: 'Comparativa de sucursales', plan: 'PRO', type: 'Estándar', desc: 'Rendimiento comparado entre todas tus ubicaciones' },
  // Clientes
  { id: 6, cat: 'clientes', icon: '👤', name: 'Base de clientes', plan: 'PRO', type: 'Estándar', desc: 'Visión completa de tu base de clientes activos e inactivos' },
  { id: 7, cat: 'clientes', icon: '🆕', name: 'Nuevos clientes', plan: 'PRO', type: 'Estándar', desc: 'Adquisición de nuevos clientes por canal y período' },
  { id: 8, cat: 'clientes', icon: '⚠️', name: 'Clientes en riesgo', plan: 'PRO', type: 'Estándar', desc: 'Identifica clientes con señales de abandono temprano' },
  { id: 9, cat: 'clientes', icon: '📈', name: 'Retención por cohorte', plan: 'PREMIUM', type: 'Prémium', desc: 'Análisis de cohortes para medir retención a largo plazo' },
  { id: 10, cat: 'clientes', icon: '🤝', name: 'Referidos', plan: 'PRO', type: 'Estándar', desc: 'Rendimiento del programa de referidos y conversiones' },
  { id: 11, cat: 'clientes', icon: '💤', name: 'Clientes recuperados', plan: 'PRO', type: 'Estándar', desc: 'Clientes reactivados tras período de inactividad' },
  // Lealtad
  { id: 12, cat: 'lealtad', icon: '🪙', name: 'Programa de puntos', plan: 'PRO', type: 'Estándar', desc: 'Emisión, canje y vencimiento de puntos de lealtad' },
  { id: 13, cat: 'lealtad', icon: '🎴', name: 'Punch cards', plan: 'PRO', type: 'Estándar', desc: 'Progreso y completación de tarjetas de sellos' },
  { id: 14, cat: 'lealtad', icon: '👑', name: 'Niveles VIP', plan: 'PRO', type: 'Estándar', desc: 'Distribución y movimiento entre niveles VIP' },
  { id: 15, cat: 'lealtad', icon: '🏆', name: 'Logros', plan: 'PRO', type: 'Estándar', desc: 'Desbloqueo y progreso de logros por clientes' },
  { id: 16, cat: 'lealtad', icon: '🔥', name: 'Rachas de visitas', plan: 'PRO', type: 'Estándar', desc: 'Análisis de rachas activas y rotas por segmento' },
  { id: 17, cat: 'lealtad', icon: '🎪', name: 'Recompensas sorpresa', plan: 'PREMIUM', type: 'Prémium', desc: 'Efectividad y engagement de recompensas sorpresa' },
  // Promociones
  { id: 18, cat: 'promociones', icon: '⚡', name: 'Rendimiento de promociones', plan: 'PRO', type: 'Estándar', desc: 'ROI y métricas de todas las promociones activas' },
  { id: 19, cat: 'promociones', icon: '🎟️', name: 'Cupones', plan: 'PRO', type: 'Estándar', desc: 'Emisión, canje y expiración de cupones' },
  { id: 20, cat: 'promociones', icon: '📣', name: 'Campañas', plan: 'PRO', type: 'Estándar', desc: 'Alcance, apertura y conversión de campañas' },
  { id: 21, cat: 'promociones', icon: '⚙️', name: 'Automation flows', plan: 'PREMIUM', type: 'Prémium', desc: 'Ejecución y efectividad de flujos automatizados' },
  { id: 22, cat: 'promociones', icon: '📱', name: 'Push notifications', plan: 'PRO', type: 'Estándar', desc: 'Entrega, apertura y conversión de notificaciones push' },
  // Financiero
  { id: 23, cat: 'financiero', icon: '💵', name: 'Revenue por período', plan: 'PRO', type: 'Estándar', desc: 'Ingresos estimados atribuibles a PromoClub' },
  { id: 24, cat: 'financiero', icon: '📉', name: 'Liability de puntos', plan: 'PRO', type: 'Estándar', desc: 'Evolución del pasivo de puntos emitidos' },
  { id: 25, cat: 'financiero', icon: '💸', name: 'Costo del programa', plan: 'PREMIUM', type: 'Prémium', desc: 'Análisis detallado del costo total del programa de lealtad' },
  { id: 26, cat: 'financiero', icon: '📋', name: 'Breakage y vencimientos', plan: 'PRO', type: 'Estándar', desc: 'Puntos y cupones vencidos sin canjear' },
  // Geolocalización
  { id: 27, cat: 'geolocalizacion', icon: '📍', name: 'Rendimiento de geofences', plan: 'PREMIUM', type: 'Prémium', desc: 'Entradas, salidas y conversiones por zona geográfica' },
  { id: 28, cat: 'geolocalizacion', icon: '🗺️', name: 'Zonas de procedencia', plan: 'PREMIUM', type: 'Prémium', desc: 'Mapa de calor de origen geográfico de tus clientes' },
];

const CUSTOM_REPORTS = [
  { id: 'c1', name: 'Resumen semanal ejecutivo', uses: 12, lastDate: '10 Jun 2026', lastResult: '+8% vs semana anterior' },
  { id: 'c2', name: 'Análisis de cupones por segmento', uses: 5, lastDate: '8 Jun 2026', lastResult: '23 canjes registrados' },
  { id: 'c3', name: 'Clientes VIP Oro — actividad mensual', uses: 3, lastDate: '1 Jun 2026', lastResult: '47 clientes activos' },
];

const FOLDERS = ['📁 Reportes semanales', '📁 Fin de mes', '📁 Para inversores'];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ activeMenu, setActiveMenu, favorites, folders, setFolders }) => {
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderInput, setFolderInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (addingFolder && inputRef?.current) inputRef?.current?.focus();
  }, [addingFolder]);

  const handleFolderKey = (e) => {
    if (e?.key === 'Enter' && folderInput?.trim()) {
      setFolders(prev => [...prev, `📁 ${folderInput?.trim()}`]);
      setFolderInput('');
      setAddingFolder(false);
    } else if (e?.key === 'Escape') {
      setFolderInput('');
      setAddingFolder(false);
    }
  };

  const menuItems = [
    { id: 'all', icon: '≡', label: 'Todos los informes', count: 28 },
    { id: 'favorites', icon: '☆', label: 'Favoritos', count: favorites?.length },
    { id: 'dashboards', icon: '▦', label: 'Paneles de control', count: 3 },
    { id: 'standard', icon: '□', label: 'Estándar', count: 21 },
    { id: 'premium', icon: '◈', label: 'Prémium', count: 7 },
    { id: 'custom', icon: '✎', label: 'Personalizado', count: 3 },
    { id: 'goals', icon: '◎', label: 'Objetivos', count: 0 },
  ];

  return (
    <div className="w-60 flex-shrink-0 bg-white border-r border-[#E4E6F0] flex flex-col" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="px-4 pt-5 pb-3">
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16, color: '#0F1117' }}>Informes</h2>
      </div>
      <nav className="flex-1 px-2">
        {menuItems?.map(item => (
          <button
            key={item?.id}
            onClick={() => setActiveMenu(item?.id)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg mb-0.5 transition-colors"
            style={{
              background: activeMenu === item?.id ? '#EEF1FD' : 'transparent',
              color: activeMenu === item?.id ? '#1A3FE0' : '#5A6175',
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 16 }}>{item?.icon}</span>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, fontWeight: activeMenu === item?.id ? 600 : 400 }}>
                {item?.label}
              </span>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: activeMenu === item?.id ? '#1A3FE0' : '#9BA3B8' }}>
              {item?.count}
            </span>
          </button>
        ))}

        <div className="my-4 border-t border-[#E4E6F0]" />

        <div className="px-2.5 mb-2">
          <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, fontWeight: 600, color: '#9BA3B8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Carpetas
          </span>
        </div>
        {folders?.map((f, i) => (
          <button
            key={i}
            className="w-full text-left px-2.5 py-2 rounded-lg mb-0.5 transition-colors hover:bg-[#F7F8FC]"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#5A6175' }}
          >
            {f}
          </button>
        ))}
        {addingFolder ? (
          <div className="px-2.5 py-1">
            <input
              ref={inputRef}
              value={folderInput}
              onChange={e => setFolderInput(e?.target?.value)}
              onKeyDown={handleFolderKey}
              placeholder="Nombre de carpeta..."
              className="w-full px-2 py-1.5 rounded-lg border border-[#1A3FE0] text-sm focus:outline-none"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12 }}
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingFolder(true)}
            className="w-full text-left px-2.5 py-2 rounded-lg transition-colors hover:bg-[#EEF1FD]"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#1A3FE0' }}
          >
            + Añadir carpeta
          </button>
        )}
      </nav>
      <div
        className="px-4 py-3 border-t border-[#E4E6F0] flex items-center gap-2 cursor-pointer hover:bg-[#F7F8FC] transition-colors"
      >
        <span className="text-green-500">↻</span>
        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#5A6175' }}>Sincronización de datos</span>
      </div>
    </div>
  );
};

// ─── Report Row ───────────────────────────────────────────────────────────────
const ReportRow = ({ report, catColor, isFav, onToggleFav, onClick }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 border-b border-[#E4E6F0] last:border-0 cursor-pointer transition-colors hover:bg-[#F7F8FC]"
    onClick={onClick}
  >
    <div
      className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 text-lg"
      style={{ background: `${catColor}1F` }}
    >
      {report?.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: '#0F1117' }}>
          {report?.name}
        </span>
        <span
          className="px-1.5 py-0.5 rounded text-xs font-bold"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            background: report?.plan === 'PREMIUM' ? 'rgba(245,158,11,0.12)' : 'rgba(26,63,224,0.1)',
            color: report?.plan === 'PREMIUM' ? '#92400E' : '#1A3FE0',
          }}
        >
          {report?.plan}
        </span>
      </div>
      <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }} className="mt-0.5 truncate">
        {report?.desc}
      </p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <span
        className="px-2 py-1 rounded-lg text-xs"
        style={{ background: '#F7F8FC', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#9BA3B8' }}
      >
        {report?.type}
      </span>
      <button
        onClick={e => { e?.stopPropagation(); onToggleFav(report?.id); }}
        className="text-lg transition-colors hover:scale-110"
        style={{ color: isFav ? '#F59E0B' : '#9BA3B8' }}
      >
        {isFav ? '★' : '☆'}
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ReportesSection = ({ businessId }) => {
  const [activeMenu, setActiveMenu] = useState('all');
  const [favorites, setFavorites] = useState([9, 18]);
  const [folders, setFolders] = useState(FOLDERS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const toggleFav = (id) => {
    setFavorites(prev => prev?.includes(id) ? prev?.filter(f => f !== id) : [...prev, id]);
  };

  const getFilteredReports = () => {
    let reports = ALL_REPORTS;
    if (activeMenu === 'favorites') reports = reports?.filter(r => favorites?.includes(r?.id));
    else if (activeMenu === 'standard') reports = reports?.filter(r => r?.type === 'Estándar');
    else if (activeMenu === 'premium') reports = reports?.filter(r => r?.type === 'Prémium');
    if (catFilter !== 'all') reports = reports?.filter(r => r?.cat === catFilter);
    if (search?.trim()) {
      const q = search?.toLowerCase();
      reports = reports?.filter(r => r?.name?.toLowerCase()?.includes(q) || r?.desc?.toLowerCase()?.includes(q));
    }
    return reports;
  };

  const filteredReports = getFilteredReports();

  const groupedReports = CATEGORIES?.reduce((acc, cat) => {
    const reps = filteredReports?.filter(r => r?.cat === cat?.id);
    if (reps?.length > 0) acc?.push({ cat, reports: reps });
    return acc;
  }, []);

  const catTabs = [
    { id: 'all', label: 'Todos los informes' },
    ...CATEGORIES?.map(c => ({ id: c?.id, label: c?.label })),
  ];

  if (showBuilder) {
    return (
      <div className="flex" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} favorites={favorites} folders={folders} setFolders={setFolders} />
        <div className="flex-1 p-6">
          <ReportBuilder onBack={() => setShowBuilder(false)} folders={folders} onGenerateReport={() => {}} isGenerating={false} />
        </div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div className="flex" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} favorites={favorites} folders={folders} setFolders={setFolders} />
        <div className="flex-1 p-6">
          <ReportDetail
            report={selectedReport}
            catColor={CATEGORIES?.find(c => c?.id === selectedReport?.cat)?.color || '#1A3FE0'}
            onBack={() => setSelectedReport(null)}
            businessId={businessId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} favorites={favorites} folders={folders} setFolders={setFolders} />
      {/* Main content */}
      <div className="flex-1 p-6 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 22, color: '#0F1117' }}>
                Informes y análisis de datos
              </h2>
              <span
                className="px-2 py-0.5 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(26,63,224,0.1)', color: '#1A3FE0', fontFamily: 'JetBrains Mono, monospace' }}
              >
                28
              </span>
            </div>
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#9BA3B8' }} className="mt-0.5">
              Accede a todos tus informes de PromoClub.{' '}
              <span className="text-[#1A3FE0] cursor-pointer hover:underline">Más información</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-[9px] border border-[#E4E6F0] text-sm transition-colors hover:bg-[#F7F8FC]"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 12, color: '#5A6175' }}
            >
              ↓ Exportar ▾
            </button>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-4 py-2 rounded-[9px] text-white text-sm transition-all hover:opacity-90"
              style={{ background: '#1A3FE0', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 12 }}
            >
              + Añadir
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA3B8]">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e?.target?.value)}
            placeholder="Buscar informes..."
            className="w-full pl-9 pr-4 py-2.5 rounded-[10px] border border-[#E4E6F0] focus:outline-none focus:border-[#1A3FE0] transition-colors"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#0F1117' }}
          />
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 mb-4">
          <button
            className="px-3 py-1.5 rounded-lg border border-[#E4E6F0] text-xs transition-colors hover:bg-[#F7F8FC]"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#5A6175' }}
          >
            Creado por ▾
          </button>
          <button
            className="px-3 py-1.5 rounded-lg border border-[#E4E6F0] text-xs transition-colors hover:bg-[#F7F8FC]"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#5A6175' }}
          >
            Categoría ≡
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {catTabs?.map(t => (
            <button
              key={t?.id}
              onClick={() => setCatFilter(t?.id)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: 12,
                background: catFilter === t?.id ? '#0F1117' : 'transparent',
                color: catFilter === t?.id ? '#fff' : '#5A6175',
                border: catFilter === t?.id ? 'none' : '1px solid #E4E6F0',
              }}
            >
              {t?.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filteredReports?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-4xl mb-3">🔍</span>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: '#0F1117' }}>Sin resultados</p>
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#9BA3B8' }} className="mt-1">
              No encontramos informes que coincidan con tu búsqueda.
            </p>
          </div>
        )}

        {/* Grouped reports */}
        {filteredReports?.length > 0 && groupedReports?.map(({ cat, reports }) => (
          <div key={cat?.id} className="mb-5">
            {/* Category header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat?.color }} />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13, color: '#0F1117' }}>
                {cat?.label}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9BA3B8' }}>
                {reports?.length}
              </span>
              <div className="flex-1 h-px bg-[#E4E6F0]" />
            </div>
            {/* Reports card */}
            <div className="bg-white rounded-xl border border-[#E4E6F0]">
              {reports?.map(r => (
                <ReportRow
                  key={r?.id}
                  report={r}
                  catColor={cat?.color}
                  isFav={favorites?.includes(r?.id)}
                  onToggleFav={toggleFav}
                  onClick={() => setSelectedReport(r)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Custom reports */}
        {(catFilter === 'all' && !search) && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13, color: '#0F1117' }}>
                Mis informes personalizados
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9BA3B8' }}>3</span>
              <div className="flex-1 h-px bg-[#E4E6F0]" />
            </div>
            <div className="bg-white rounded-xl border border-[#E4E6F0]">
              {CUSTOM_REPORTS?.map(r => (
                <div key={r?.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#E4E6F0] last:border-0">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(124,58,237,0.12)' }}>
                    ✎
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: '#0F1117' }}>{r?.name}</p>
                    <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }}>
                      Usado {r?.uses}× · Último: {r?.lastDate} ·{' '}
                      <span className="text-green-600 font-semibold">{r?.lastResult}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button className="px-2.5 py-1 rounded-lg border border-[#E4E6F0] text-xs transition-colors hover:bg-[#F7F8FC]"
                      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#5A6175' }}>✎ Editar</button>
                    <button className="px-2.5 py-1 rounded-lg border border-[#E4E6F0] text-xs transition-colors hover:bg-[#F7F8FC]"
                      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#5A6175' }}>⊕ Duplicar</button>
                    <button className="px-2.5 py-1 rounded-lg text-xs text-white transition-all hover:opacity-90"
                      style={{ background: '#1A3FE0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>▶ Ejecutar</button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowBuilder(true)}
                className="w-full px-4 py-3 text-sm transition-colors hover:bg-[#F7F8FC] rounded-b-xl"
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: '#1A3FE0',
                  border: '2px dashed #E4E6F0',
                  borderTop: 'none',
                }}
              >
                + Crear nuevo informe personalizado
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ReportesSection;
