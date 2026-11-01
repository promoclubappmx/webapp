import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const METHOD_LABELS = {
  qr_static: 'QR Estático',
  qr_dynamic: 'QR Dinámico',
  geofence: 'Geofence',
  manual: 'Manual',
  nfc: 'NFC',
  beacon: 'Beacon',
};

const METHOD_STYLES = {
  qr_static: { color: 'bg-blue-100 text-blue-700', icon: 'QrCode' },
  qr_dynamic: { color: 'bg-indigo-100 text-indigo-700', icon: 'QrCode' },
  geofence: { color: 'bg-emerald-100 text-emerald-700', icon: 'MapPin' },
  manual: { color: 'bg-violet-100 text-violet-700', icon: 'Keyboard' },
  nfc: { color: 'bg-orange-100 text-orange-700', icon: 'Wifi' },
  beacon: { color: 'bg-pink-100 text-pink-700', icon: 'Radio' },
};

const STATUS_CONFIG = {
  success: { color: 'bg-green-100 text-green-700', label: 'Exitoso' },
  rejected: { color: 'bg-red-100 text-red-700', label: 'Rechazado' },
  suspicious: { color: 'bg-amber-100 text-amber-700', label: 'Sospechoso' },
  pending: { color: 'bg-gray-100 text-gray-600', label: 'Pendiente' },
};

const CheckInHistoryTab = ({ businessId }) => {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const loadCheckins = useCallback(async () => {
    if (!businessId) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('checkins')
        ?.select('id, customer_name, customer_code, method, points_awarded, validated_by, checkin_status, created_at')
        ?.eq('business_id', businessId)
        ?.order('created_at', { ascending: false })
        ?.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (error) throw error;
      setCheckins(data || []);
    } catch (err) {
      console.error('Error loading check-in history:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId, page]);

  useEffect(() => {
    loadCheckins();
  }, [loadCheckins]);

  const filtered = checkins?.filter(h => {
    const matchSearch = !search || h?.customer_name?.toLowerCase()?.includes(search?.toLowerCase()) || h?.customer_code?.toLowerCase()?.includes(search?.toLowerCase());
    const matchMethod = methodFilter === 'all' || h?.method === methodFilter;
    const matchStatus = statusFilter === 'all' || h?.checkin_status === statusFilter;
    return matchSearch && matchMethod && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={28} className="text-primary animate-spin mr-3" />
        <span className="text-muted-foreground">Cargando historial...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por usuario o código..."
            value={search}
            onChange={e => setSearch(e?.target?.value)}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={methodFilter}
          onChange={e => setMethodFilter(e?.target?.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Todos los métodos</option>
          {Object.entries(METHOD_LABELS)?.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e?.target?.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Todos los estados</option>
          <option value="success">Exitoso</option>
          <option value="rejected">Rechazado</option>
          <option value="suspicious">Sospechoso</option>
          <option value="pending">Pendiente</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha/Hora</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Método</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Puntos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Validado por</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered?.map(item => {
                const mc = METHOD_STYLES?.[item?.method] || { color: 'bg-gray-100 text-gray-600', icon: 'Circle' };
                const sc = STATUS_CONFIG?.[item?.checkin_status] || STATUS_CONFIG?.pending;
                const displayName = item?.customer_name || item?.customer_code || 'Cliente';
                return (
                  <tr key={item?.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(item?.created_at)?.toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {displayName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">{displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${mc?.color}`}>
                        <Icon name={mc?.icon} size={11} />
                        {METHOD_LABELS?.[item?.method] || item?.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(item?.points_awarded || 0) > 0 ? (
                        <span className="text-sm font-semibold text-emerald-600">+{item?.points_awarded}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item?.validated_by || <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc?.color}`}>{sc?.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              {checkins?.length === 0 ? 'No hay check-ins registrados aún.' : 'No se encontraron check-ins con los filtros actuales.'}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground">{filtered?.length} registros encontrados</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs text-muted-foreground">Página {page + 1}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={checkins?.length < PAGE_SIZE}
            className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInHistoryTab;
