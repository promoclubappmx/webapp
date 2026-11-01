import React, { useState, useEffect } from 'react';
import { fetchReportData } from '../../../services/analyticsService';

const COLUMNS = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'sucursal', label: 'Sucursal / Detalle' },
  { key: 'visitas', label: 'Visitas' },
  { key: 'clientes', label: 'Clientes únicos' },
  { key: 'canjes', label: 'Canjes' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'tasa', label: 'Tasa / Estado' },
];

const ReportDetail = ({ report, catColor, onBack, businessId }) => {
  const [sortCol, setSortCol] = useState('fecha');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    fetchReportData(businessId, report?.cat, period)?.then(result => {
      setRows(result?.rows || []);
      setLoading(false);
    });
  }, [businessId, report?.cat, period]);

  const handleSort = (key) => {
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(key); setSortDir('asc'); }
  };

  const sortedRows = [...rows]?.sort((a, b) => {
    const av = a?.[sortCol];
    const bv = b?.[sortCol];
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalRows = rows?.length;
  const totalPages = Math.max(Math.ceil(totalRows / 8), 1);
  const pagedRows = sortedRows?.slice((page - 1) * 8, page * 8);

  const periodLabel = period === 'today' ? 'Hoy' : period === '7d' ? '7 días' : period === 'month' ? 'Este mes' : period === 'prev_month' ? 'Mes anterior' : '3 meses';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-1 text-lg text-[#5A6175] hover:text-[#0F1117] transition-colors"
          >
            ←
          </button>
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${catColor}1F` }}
          >
            {report?.icon}
          </div>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: '#0F1117' }}>
              {report?.name}
            </h2>
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }} className="mt-0.5">
              {report?.desc}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded text-xs font-bold"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: report?.plan === 'PREMIUM' ? 'rgba(245,158,11,0.12)' : 'rgba(26,63,224,0.1)',
              color: report?.plan === 'PREMIUM' ? '#92400E' : '#1A3FE0',
            }}
          >
            {report?.plan}
          </span>
          <button
            className="px-3 py-2 rounded-[9px] border border-[#E4E6F0] text-sm transition-colors hover:bg-[#F7F8FC]"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 12, color: '#5A6175' }}
          >
            Guardar ☆
          </button>
          <button
            className="px-4 py-2 rounded-[9px] text-white text-sm transition-all hover:opacity-90"
            style={{ background: '#1A3FE0', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 12 }}
          >
            ↓ Exportar
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={period}
          onChange={e => { setPeriod(e?.target?.value); setPage(1); }}
          className="px-3 py-2 rounded-[9px] border border-[#E4E6F0] bg-white focus:outline-none focus:border-[#1A3FE0] text-sm"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#5A6175' }}
        >
          <option value="today">Hoy</option>
          <option value="7d">7 días</option>
          <option value="month">Este mes</option>
          <option value="prev_month">Mes anterior</option>
          <option value="3m">3 meses</option>
        </select>
      </div>
      {/* Results table */}
      <div className="bg-white rounded-[14px] border border-[#E4E6F0]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E6F0]">
          <div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: '#0F1117' }}>
              Resultados — {periodLabel}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9BA3B8' }} className="ml-2">
              {totalRows} registros
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-[#E4E6F0] text-xs transition-colors hover:bg-[#F7F8FC]"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#5A6175' }}
            >
              ↓ Excel
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border border-[#E4E6F0] text-xs transition-colors hover:bg-[#F7F8FC]"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#5A6175' }}
            >
              ↓ CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#1A3FE0] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pagedRows?.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <span className="text-3xl mb-2">📊</span>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: '#0F1117' }}>Sin datos</p>
              <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }} className="mt-1">
                No hay registros para el período seleccionado.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F7F8FC' }}>
                  {COLUMNS?.map(col => (
                    <th
                      key={col?.key}
                      className="px-4 py-3 text-left cursor-pointer select-none transition-colors hover:bg-[#EEF1FD]"
                      onClick={() => handleSort(col?.key)}
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 11, color: '#9BA3B8', whiteSpace: 'nowrap' }}
                    >
                      {col?.label} {sortCol === col?.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows?.map((row, i) => (
                  <tr key={i} className="border-t border-[#E4E6F0] transition-colors hover:bg-[#F7F8FC]">
                    {COLUMNS?.map((col, ci) => (
                      <td
                        key={col?.key}
                        className="px-4 py-3"
                        style={{
                          fontFamily: ci === 0 ? 'Plus Jakarta Sans, sans-serif' : 'JetBrains Mono, monospace',
                          fontWeight: ci === 0 ? 600 : 400,
                          fontSize: ci === 0 ? 13 : 12,
                          color: ci === 0 ? '#0F1117' : '#5A6175',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row?.[col?.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        {totalRows > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E4E6F0]">
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }}>
              Mostrando {(page - 1) * 8 + 1}-{Math.min(page * 8, totalRows)} de {totalRows} registros
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-[#E4E6F0] flex items-center justify-center text-sm transition-colors hover:bg-[#F7F8FC] disabled:opacity-40"
              >
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1)?.map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: page === p ? '#1A3FE0' : 'transparent',
                    color: page === p ? '#fff' : '#5A6175',
                    border: page === p ? 'none' : '1px solid #E4E6F0',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-[#E4E6F0] flex items-center justify-center text-sm transition-colors hover:bg-[#F7F8FC] disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetail;
