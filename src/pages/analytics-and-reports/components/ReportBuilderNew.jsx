import React, { useState, useMemo } from 'react';

const DIMENSIONS = [
  'Fecha (día)', 'Fecha (semana)', 'Fecha (mes)', 'Cliente · segmento',
  'Cliente · nivel VIP', 'Cliente · estado', 'Tipo de promo', 'Tipo de cupón',
  'Canal de comunicación', 'Método de check-in', 'Sucursal', 'Producto del catálogo',
];

const METRICS = [
  'Visitas totales', 'Clientes únicos', 'Nuevos clientes', 'Canjes totales',
  'Revenue estimado (MXN)', 'Revenue neto (MXN)', 'Ticket promedio (MXN)',
  'Puntos emitidos', 'Puntos canjeados', 'Tasa de retención (%)',
  'ROI de campaña', 'Tasa de apertura (%)', 'Liability de puntos (MXN)',
  'Breakage (MXN)', 'No-shows',
];

const FILTERS_LIST = [
  'Período de fechas', 'Sucursal', 'Nivel VIP', 'Estado del cliente',
  'Canal de adquisición', 'Tipo de promo', 'Segmento CRM', 'Método de check-in',
];

const SORT_OPTIONS = ['Visitas totales', 'Revenue estimado (MXN)', 'Clientes únicos', 'Canjes totales'];
const GROUP_OPTIONS = ['Fecha (semana)', 'Sucursal', 'Nivel VIP', 'Segmento CRM'];

// ─── Mock data generator ──────────────────────────────────────────────────────
const generateMockValue = (col) => {
  if (col?.includes('Fecha')) {
    const d = new Date(2026, 5, Math.floor(Math.random() * 28) + 1);
    return d?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }
  if (col?.includes('Semana') || col === 'Fecha (semana)') return `Sem ${Math.floor(Math.random() * 4) + 1}`;
  if (col?.includes('Sucursal')) return ['Centro', 'Cerritos', 'Zona Dorada']?.[Math.floor(Math.random() * 3)];
  if (col?.includes('nivel VIP') || col?.includes('Nivel VIP')) return ['Sin nivel', 'Bronce', 'Plata', 'Oro']?.[Math.floor(Math.random() * 4)];
  if (col?.includes('segmento') || col?.includes('Segmento')) return ['Activo', 'Frecuente', 'En riesgo']?.[Math.floor(Math.random() * 3)];
  if (col?.includes('estado') || col?.includes('Estado')) return ['Activo', 'Dormido', 'Perdido']?.[Math.floor(Math.random() * 3)];
  if (col?.includes('Canal') || col?.includes('canal')) return ['Orgánico', 'Referido', 'QR']?.[Math.floor(Math.random() * 3)];
  if (col?.includes('Método') || col?.includes('método')) return ['QR', 'NFC', 'Geofence']?.[Math.floor(Math.random() * 3)];
  if (col?.includes('Tipo de promo')) return ['Descuento', '2x1', 'Flash deal']?.[Math.floor(Math.random() * 3)];
  if (col?.includes('Tipo de cupón')) return ['Bienvenida', 'Cumpleaños', 'Recuperación']?.[Math.floor(Math.random() * 3)];
  if (col?.includes('Producto')) return ['Café', 'Postre', 'Combo']?.[Math.floor(Math.random() * 3)];
  if (col?.includes('MXN') || col?.includes('Revenue') || col?.includes('Liability') || col?.includes('Breakage') || col?.includes('Ticket')) {
    return `$${(Math.floor(Math.random() * 5000) + 500)?.toLocaleString()}`;
  }
  if (col?.includes('%') || col?.includes('Tasa') || col?.includes('ROI')) return `${(Math.random() * 60 + 10)?.toFixed(1)}%`;
  if (col?.includes('Puntos')) return (Math.floor(Math.random() * 2000) + 100)?.toLocaleString();
  return (Math.floor(Math.random() * 100) + 5)?.toString();
};

// ─── Checkbox item ────────────────────────────────────────────────────────────
const CheckItem = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 py-1 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded cursor-pointer"
      style={{ accentColor: '#1A3FE0' }}
    />
    <span
      style={{
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: 13,
        fontWeight: checked ? 700 : 400,
        color: checked ? '#0F1117' : '#5A6175',
      }}
    >
      {label}
    </span>
  </label>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ReportBuilderNew = ({ onBack, folders }) => {
  const [selectedDims, setSelectedDims] = useState(['Fecha (semana)', 'Sucursal']);
  const [selectedMetrics, setSelectedMetrics] = useState(['Visitas totales', 'Revenue estimado (MXN)']);
  const [selectedFilters, setSelectedFilters] = useState(['Período de fechas']);
  const [sortBy, setSortBy] = useState('Visitas totales');
  const [groupBy, setGroupBy] = useState('Fecha (semana)');
  const [reportName, setReportName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');

  const toggleDim = (d) => setSelectedDims(prev => prev?.includes(d) ? prev?.filter(x => x !== d) : [...prev, d]);
  const toggleMetric = (m) => setSelectedMetrics(prev => prev?.includes(m) ? prev?.filter(x => x !== m) : [...prev, m]);
  const toggleFilter = (f) => setSelectedFilters(prev => prev?.includes(f) ? prev?.filter(x => x !== f) : [...prev, f]);

  const allCols = [...selectedDims, ...selectedMetrics];
  const showPreview = selectedDims?.length > 0 && selectedMetrics?.length > 0;

  const previewRows = useMemo(() => {
    if (!showPreview) return [];
    return Array.from({ length: 5 }, () =>
      allCols?.reduce((row, col) => ({ ...row, [col]: generateMockValue(col) }), {})
    );
  }, [allCols?.join(','), showPreview]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="text-lg text-[#5A6175] hover:text-[#0F1117] transition-colors mt-1">←</button>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 20, color: '#0F1117' }}>
            Constructor de informe personalizado
          </h2>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#9BA3B8' }} className="mt-0.5">
            Elige dimensiones, métricas y filtros para construir tu informe exacto.
          </p>
        </div>
      </div>
      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dimensiones */}
        <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#0F1117' }}>Dimensiones</h3>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }} className="mt-0.5 mb-3">
            Definen las filas del informe
          </p>
          <div className="space-y-0.5">
            {DIMENSIONS?.map(d => (
              <CheckItem key={d} label={d} checked={selectedDims?.includes(d)} onChange={() => toggleDim(d)} />
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#0F1117' }}>Métricas</h3>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }} className="mt-0.5 mb-3">
            Definen las columnas del informe
          </p>
          <div className="space-y-0.5">
            {METRICS?.map(m => (
              <CheckItem key={m} label={m} checked={selectedMetrics?.includes(m)} onChange={() => toggleMetric(m)} />
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#0F1117' }}>Filtros</h3>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }} className="mt-0.5 mb-3">
            Delimitan el alcance del informe
          </p>
          <div className="space-y-0.5 mb-4">
            {FILTERS_LIST?.map(f => (
              <CheckItem key={f} label={f} checked={selectedFilters?.includes(f)} onChange={() => toggleFilter(f)} />
            ))}
          </div>
          <div className="border-t border-[#E4E6F0] pt-4 space-y-3">
            <div>
              <label style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#5A6175' }} className="block mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e?.target?.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E4E6F0] bg-white focus:outline-none focus:border-[#1A3FE0] text-sm"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#0F1117' }}
              >
                {SORT_OPTIONS?.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#5A6175' }} className="block mb-1">
                Agrupar por
              </label>
              <select
                value={groupBy}
                onChange={e => setGroupBy(e?.target?.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E4E6F0] bg-white focus:outline-none focus:border-[#1A3FE0] text-sm"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#0F1117' }}
              >
                {GROUP_OPTIONS?.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Preview */}
      {showPreview && (
        <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#0F1117' }}>
              Vista previa — primeros 5 registros
            </h3>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9BA3B8' }}>
              {selectedDims?.length} dimensiones · {selectedMetrics?.length} métricas
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F7F8FC' }}>
                  {allCols?.map(col => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left whitespace-nowrap"
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 11, color: '#9BA3B8' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows?.map((row, i) => (
                  <tr key={i} className="border-t border-[#E4E6F0] transition-colors hover:bg-[#F7F8FC]">
                    {allCols?.map((col, ci) => (
                      <td
                        key={col}
                        className="px-3 py-2 whitespace-nowrap"
                        style={{
                          fontFamily: ci < selectedDims?.length ? 'Plus Jakarta Sans, sans-serif' : 'JetBrains Mono, monospace',
                          fontWeight: ci < selectedDims?.length ? 600 : 400,
                          fontSize: 12,
                          color: ci < selectedDims?.length ? '#0F1117' : '#5A6175',
                        }}
                      >
                        {row?.[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Footer actions */}
      <div className="bg-white rounded-2xl border border-[#E4E6F0] p-4 flex items-center gap-3 flex-wrap" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <input
          value={reportName}
          onChange={e => setReportName(e?.target?.value)}
          placeholder="Nombre del informe personalizado..."
          className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-[#E4E6F0] focus:outline-none focus:border-[#1A3FE0] transition-colors"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#0F1117' }}
        />
        <select
          value={selectedFolder}
          onChange={e => setSelectedFolder(e?.target?.value)}
          className="px-3 py-2 rounded-lg border border-[#E4E6F0] bg-white focus:outline-none focus:border-[#1A3FE0] text-sm"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#5A6175' }}
        >
          <option value="">📁 Sin carpeta</option>
          {folders?.map((f, i) => <option key={i} value={f}>{f}</option>)}
        </select>
        <button
          className="px-4 py-2 rounded-[9px] border border-[#E4E6F0] text-sm transition-colors hover:bg-[#F7F8FC]"
          style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 12, color: '#5A6175' }}
        >
          Guardar plantilla
        </button>
        <button
          className="px-4 py-2 rounded-[9px] text-white text-sm transition-all hover:opacity-90"
          style={{ background: '#1A3FE0', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 12 }}
        >
          Ejecutar y exportar ↓
        </button>
      </div>
    </div>
  );
};

export default ReportBuilderNew;
