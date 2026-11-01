import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const POINT_VALUE_MXN = 0.15;

const TX_TYPES = [
  { id: 'all', label: 'Todos' },
  { id: 'accumulation', label: 'Acumulación', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'redemption', label: 'Canje', color: 'bg-purple-100 text-purple-700' },
  { id: 'bonus', label: 'Bonus', color: 'bg-amber-100 text-amber-700' },
  { id: 'adjustment', label: 'Ajuste', color: 'bg-slate-100 text-slate-700' },
  { id: 'expiry', label: 'Vencimiento', color: 'bg-red-100 text-red-700' },
];

const MOCK_TRANSACTIONS = [
  { id: 1, date: '2026-03-06T14:30:00', client: 'María García', type: 'accumulation', amount: 25, balance: 2450, detail: 'Check-in QR — Compra $125 MXN', method: 'QR' },
  { id: 2, date: '2026-03-06T11:15:00', client: 'Juan Rodríguez', type: 'redemption', amount: -100, balance: 1130, detail: 'Canje: Café americano gratis', method: 'Manual' },
  { id: 3, date: '2026-03-05T19:45:00', client: 'Ana Martínez', type: 'bonus', amount: 20, balance: 5670, detail: 'Bonus racha — Visita #5', method: 'Auto' },
  { id: 4, date: '2026-03-05T16:20:00', client: 'Pedro López', type: 'accumulation', amount: 10, balance: 890, detail: 'Check-in NFC', method: 'NFC' },
  { id: 5, date: '2026-03-05T10:00:00', client: 'Laura Sánchez', type: 'adjustment', amount: 50, balance: 320, detail: 'Ajuste manual — Compensación por espera', method: 'Manual' },
  { id: 6, date: '2026-03-04T20:30:00', client: 'Carlos Ruiz', type: 'accumulation', amount: 15, balance: 780, detail: 'Check-in Geofence — Compra $75 MXN', method: 'Geofence' },
  { id: 7, date: '2026-03-04T13:10:00', client: 'María García', type: 'redemption', amount: -300, balance: 2150, detail: 'Canje: Desayuno completo', method: 'QR' },
  { id: 8, date: '2026-03-03T09:00:00', client: 'Ana Martínez', type: 'bonus', amount: 20, balance: 5450, detail: 'Puntos de bienvenida', method: 'Auto' },
  { id: 9, date: '2026-03-02T17:00:00', client: 'Roberto Díaz', type: 'expiry', amount: -80, balance: 0, detail: 'Puntos vencidos — 12 meses sin actividad', method: 'Auto' },
  { id: 10, date: '2026-03-01T12:00:00', client: 'Juan Rodríguez', type: 'accumulation', amount: 30, balance: 1230, detail: 'Check-in QR — Compra $150 MXN', method: 'QR' },
];

const typeInfo = (type) => TX_TYPES?.find(t => t?.id === type) || TX_TYPES?.[0];

const HistorialTab = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientSearch, setClientSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = useMemo(() => {
    return MOCK_TRANSACTIONS?.filter(tx => {
        if (typeFilter !== 'all' && tx?.type !== typeFilter) return false;
        if (clientSearch && !tx?.client?.toLowerCase()?.includes(clientSearch?.toLowerCase())) return false;
        if (dateFrom && tx?.date < dateFrom) return false;
        if (dateTo && tx?.date > dateTo + 'T23:59:59') return false;
        return true;
      })?.sort((a, b) => {
        const av = a?.[sortField], bv = b?.[sortField];
        const dir = sortDir === 'asc' ? 1 : -1;
        return typeof av === 'string' ? av?.localeCompare(bv) * dir : (av - bv) * dir;
      });
  }, [typeFilter, clientSearch, dateFrom, dateTo, sortField, sortDir]);

  const totalPages = Math.ceil(filtered?.length / PER_PAGE);
  const paginated = filtered?.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  // Summary stats
  const thisMonth = MOCK_TRANSACTIONS?.filter(tx => tx?.date?.startsWith('2026-03'));
  const emitted = thisMonth?.filter(tx => tx?.amount > 0)?.reduce((s, tx) => s + tx?.amount, 0);
  const redeemed = Math.abs(thisMonth?.filter(tx => tx?.type === 'redemption')?.reduce((s, tx) => s + tx?.amount, 0));
  const circulation = MOCK_TRANSACTIONS?.reduce((s, tx) => s + tx?.amount, 0);
  const breakage = Math.round(circulation * 0.08);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Puntos emitidos (mes)', value: emitted?.toLocaleString(), icon: 'TrendingUp', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Puntos canjeados (mes)', value: redeemed?.toLocaleString(), icon: 'Gift', color: 'text-purple-600 bg-purple-50' },
          { label: 'Saldo en circulación', value: circulation?.toLocaleString(), icon: 'Wallet', color: 'text-blue-600 bg-blue-50' },
          { label: 'Breakage estimado (mes)', value: breakage?.toLocaleString(), icon: 'AlertTriangle', color: 'text-amber-600 bg-amber-50' },
        ]?.map(card => (
          <div key={card?.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card?.color}`}>
              <Icon name={card?.icon} size={18} />
            </div>
            <p className="text-2xl font-bold text-foreground">{card?.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card?.label}</p>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <input
            value={clientSearch} onChange={e => { setClientSearch(e?.target?.value); setPage(1); }}
            placeholder="Buscar cliente..."
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-48"
          />
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e?.target?.value); setPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e?.target?.value); setPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
          <div className="flex gap-2 flex-wrap">
            {TX_TYPES?.map(t => (
              <button key={t?.id} onClick={() => { setTypeFilter(t?.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  typeFilter === t?.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}>
                {t?.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" iconName="Download" className="ml-auto">
            Exportar Excel
          </Button>
        </div>
      </div>
      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {[
                  { key: 'date', label: 'Fecha y hora' },
                  { key: 'client', label: 'Cliente' },
                  { key: 'type', label: 'Tipo' },
                  { key: 'amount', label: 'Cantidad' },
                  { key: 'balance', label: 'Saldo resultante' },
                  { key: 'detail', label: 'Detalle' },
                  { key: 'method', label: 'Método' },
                ]?.map(col => (
                  <th key={col?.key} className="text-left p-4 font-medium text-muted-foreground">
                    <button onClick={() => handleSort(col?.key)} className="flex items-center gap-1 hover:text-foreground">
                      {col?.label}
                      <Icon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated?.map(tx => {
                const info = typeInfo(tx?.type);
                return (
                  <tr key={tx?.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {new Date(tx.date)?.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">{tx?.client?.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-foreground">{tx?.client}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${info?.color || 'bg-muted text-muted-foreground'}`}>
                        {info?.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${tx?.amount > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                        {tx?.amount > 0 ? '+' : ''}{tx?.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-foreground font-medium">{tx?.balance?.toLocaleString()}</td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">{tx?.detail}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">{tx?.method}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="FileSearch" size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron transacciones con los filtros aplicados.</p>
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">{filtered?.length} transacciones · Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted/50">
                Anterior
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted/50">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialTab;
