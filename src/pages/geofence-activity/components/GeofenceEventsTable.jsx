import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const mockEvents = [
  { id: 1, time: '14:32', event: 'entrada', client: 'Carlos M.', action: 'Notificación enviada', result: 'Abierta' },
  { id: 2, time: '14:18', event: 'salida', client: 'Ana R.', action: 'Notificación enviada', result: 'Convertida' },
  { id: 3, time: '13:55', event: 'checkin', client: 'Miguel T.', action: 'Check-in acreditado', result: 'Convertida' },
  { id: 4, time: '13:41', event: 'entrada', client: 'Anónimo', action: 'No enviada (límite diario)', result: 'Pendiente' },
  { id: 5, time: '13:28', event: 'entrada', client: 'Laura G.', action: 'Notificación enviada', result: 'No abierta' },
  { id: 6, time: '13:10', event: 'salida', client: 'Roberto S.', action: 'No enviada (fuera de horario)', result: 'Pendiente' },
  { id: 7, time: '12:58', event: 'checkin', client: 'Diana F.', action: 'Check-in acreditado', result: 'Convertida' },
  { id: 8, time: '12:44', event: 'entrada', client: 'Pedro L.', action: 'Notificación enviada', result: 'Abierta' },
  { id: 9, time: '12:30', event: 'salida', client: 'Sofía M.', action: 'Notificación enviada', result: 'Convertida' },
  { id: 10, time: '12:15', event: 'entrada', client: 'Anónimo', action: 'Notificación enviada', result: 'No abierta' },
  { id: 11, time: '11:52', event: 'checkin', client: 'Jorge H.', action: 'Check-in acreditado', result: 'Convertida' },
  { id: 12, time: '11:38', event: 'entrada', client: 'Valeria C.', action: 'No enviada (límite diario)', result: 'Pendiente' },
];

const EventBadge = ({ type }) => {
  const config = {
    entrada: { label: 'Entrada', color: 'bg-green-100 text-green-700' },
    salida: { label: 'Salida', color: 'bg-red-100 text-red-700' },
    checkin: { label: 'Check-in auto', color: 'bg-blue-100 text-blue-700' },
  };
  const c = config?.[type] || config?.entrada;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c?.color}`}>
      {c?.label}
    </span>
  );
};

const ResultBadge = ({ result }) => {
  const config = {
    'Abierta': 'bg-blue-100 text-blue-700',
    'No abierta': 'bg-gray-100 text-gray-600',
    'Convertida': 'bg-green-100 text-green-700',
    'Pendiente': 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config?.[result] || 'bg-gray-100 text-gray-600'}`}>
      {result === 'Convertida' ? `${result} ✓` : result}
    </span>
  );
};

const GeofenceEventsTable = () => {
  const [eventFilter, setEventFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = mockEvents?.filter(e => {
    const matchEvent = eventFilter === 'all' || e?.event === eventFilter;
    const matchResult = resultFilter === 'all' || e?.result === resultFilter;
    return matchEvent && matchResult;
  });

  const paginated = filtered?.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered?.length / perPage);

  const handleExportCSV = () => {
    const headers = ['Hora', 'Evento', 'Cliente', 'Acción disparada', 'Resultado'];
    const rows = filtered?.map(e => [e?.time, e?.event, e?.client, e?.action, e?.result]);
    const csv = [headers, ...rows]?.map(r => r?.join(','))?.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geofence-eventos.csv';
    a?.click();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-foreground">Eventos recientes</h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
        >
          <Icon name="Download" size={12} />
          Exportar CSV
        </button>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Evento:</label>
          <select
            value={eventFilter}
            onChange={(e) => { setEventFilter(e?.target?.value); setPage(1); }}
            className="text-xs px-2 py-1.5 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="checkin">Check-in auto</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Resultado:</label>
          <select
            value={resultFilter}
            onChange={(e) => { setResultFilter(e?.target?.value); setPage(1); }}
            className="text-xs px-2 py-1.5 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">Todos</option>
            <option value="Abierta">Abierta</option>
            <option value="No abierta">No abierta</option>
            <option value="Convertida">Convertida</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Hora</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Evento</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Cliente</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Acción disparada</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {paginated?.map((event) => (
              <tr key={event?.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-3 text-xs font-mono text-muted-foreground">{event?.time}</td>
                <td className="py-2.5 px-3"><EventBadge type={event?.event} /></td>
                <td className="py-2.5 px-3 text-xs text-foreground font-medium">{event?.client}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground hidden md:table-cell">{event?.action}</td>
                <td className="py-2.5 px-3"><ResultBadge result={event?.result} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered?.length)} de {filtered?.length} eventos
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofenceEventsTable;
