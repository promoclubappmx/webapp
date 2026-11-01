import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const mockRules = [
  { id: 1, name: 'Si llueve → Flash Deal Lluvia', triggerType: 'clima', triggerIcon: 'CloudRain', triggerLabel: 'Condición climática', action: 'Activar promo + Push 2km', status: 'active', lastFired: '2026-03-04T05:30:00', totalFired: 24, color: 'bg-sky-500' },
  { id: 2, name: 'Sin check-ins 2h → Flash Deal', triggerType: 'inactividad', triggerIcon: 'Clock', triggerLabel: 'Inactividad negocio', action: 'Flash deal + Push urgente', status: 'active', lastFired: '2026-03-03T18:45:00', totalFired: 18, color: 'bg-orange-500' },
  { id: 3, name: 'Cliente inactivo 30d → Cupón 20%', triggerType: 'inactividad_cliente', triggerIcon: 'UserX', triggerLabel: 'Cliente inactivo', action: 'Enviar cupón al wallet', status: 'paused', lastFired: '2026-03-01T12:00:00', totalFired: 87, color: 'bg-purple-500' },
  { id: 4, name: 'Cumpleaños próximo → Regalo auto', triggerType: 'fecha', triggerIcon: 'Gift', triggerLabel: 'Cumpleaños próximo', action: 'Cupón + Puntos bonus', status: 'active', lastFired: '2026-03-04T09:00:00', totalFired: 43, color: 'bg-pink-500' },
  { id: 5, name: 'Nuevo registro → Puntos bienvenida', triggerType: 'registro', triggerIcon: 'UserPlus', triggerLabel: 'Nuevo registro', action: 'Acreditar 50 puntos + Push', status: 'active', lastFired: '2026-03-04T06:10:00', totalFired: 156, color: 'bg-emerald-500' },
  { id: 6, name: 'Primer check-in → Cupón especial', triggerType: 'checkin', triggerIcon: 'MapPin', triggerLabel: 'Primer check-in', action: 'Enviar cupón 15% primera visita', status: 'draft', lastFired: null, totalFired: 0, color: 'bg-teal-500' },
  { id: 7, name: 'Calor extremo → Promo bebidas', triggerType: 'clima', triggerIcon: 'Sun', triggerLabel: 'Condición climática', action: 'Activar promo bebidas frías', status: 'paused', lastFired: '2026-02-28T14:00:00', totalFired: 9, color: 'bg-amber-500' },
  { id: 8, name: 'Sin clientes lunes → Activa promo', triggerType: 'inactividad', triggerIcon: 'TrendingDown', triggerLabel: 'Inactividad negocio', action: 'Activar promo lunes especial', status: 'active', lastFired: '2026-03-03T10:30:00', totalFired: 12, color: 'bg-red-500' },
  { id: 9, name: 'Drip semanal nuevos clientes', triggerType: 'drip', triggerIcon: 'Droplets', triggerLabel: 'Drip campaign', action: 'Secuencia 4 mensajes semanales', status: 'active', lastFired: '2026-03-04T08:00:00', totalFired: 67, color: 'bg-blue-500' },
  { id: 10, name: 'Frío → Promo bebidas calientes', triggerType: 'clima', triggerIcon: 'Snowflake', triggerLabel: 'Condición climática', action: 'Push + Activar promo café', status: 'draft', lastFired: null, totalFired: 0, color: 'bg-cyan-500' },
];

const triggerBadgeColors = {
  clima: 'bg-sky-100 text-sky-700 border-sky-200',
  inactividad: 'bg-orange-100 text-orange-700 border-orange-200',
  inactividad_cliente: 'bg-purple-100 text-purple-700 border-purple-200',
  fecha: 'bg-pink-100 text-pink-700 border-pink-200',
  registro: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  checkin: 'bg-teal-100 text-teal-700 border-teal-200',
  drip: 'bg-blue-100 text-blue-700 border-blue-200',
};

const statusConfig = {
  active: { label: 'Activo', cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  paused: { label: 'Pausado', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  draft: { label: 'Borrador', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

const formatLastFired = (dateStr) => {
  if (!dateStr) return { date: '—', relative: 'Nunca' };
  const date = new Date(dateStr);
  const now = new Date('2026-03-04T06:25:23');
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  let relative;
  if (diffMins < 60) relative = `hace ${diffMins}m`;
  else if (diffHours < 24) relative = `hace ${diffHours}h`;
  else relative = `hace ${diffDays}d`;
  return {
    date: date?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    relative,
  };
};

const RulesTable = ({ onEdit, onNew }) => {
  const [rules, setRules] = useState(mockRules);
  const [filterTrigger, setFilterTrigger] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const triggerTypes = [
    { value: 'all', label: 'Todos los triggers' },
    { value: 'clima', label: 'Clima' },
    { value: 'inactividad', label: 'Inactividad negocio' },
    { value: 'inactividad_cliente', label: 'Cliente inactivo' },
    { value: 'fecha', label: 'Fecha/Cumpleaños' },
    { value: 'registro', label: 'Registro' },
    { value: 'checkin', label: 'Check-in' },
    { value: 'drip', label: 'Drip' },
  ];

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleToggle = (id) => {
    setRules(prev => prev?.map(r => r?.id === id
      ? { ...r, status: r?.status === 'active' ? 'paused' : 'active' }
      : r
    ));
  };

  const handleDuplicate = (rule) => {
    const newRule = { ...rule, id: Date.now(), name: `${rule?.name} (copia)`, status: 'draft', lastFired: null, totalFired: 0 };
    setRules(prev => [...prev, newRule]);
  };

  const handleDelete = (id) => {
    setRules(prev => prev?.filter(r => r?.id !== id));
    setDeleteConfirm(null);
  };

  const filtered = rules?.filter(r => filterTrigger === 'all' || r?.triggerType === filterTrigger)?.filter(r => filterStatus === 'all' || r?.status === filterStatus)?.sort((a, b) => {
      let va, vb;
      if (sortBy === 'name') { va = a?.name; vb = b?.name; }
      else if (sortBy === 'totalFired') { va = a?.totalFired; vb = b?.totalFired; }
      else if (sortBy === 'lastFired') { va = a?.lastFired || ''; vb = b?.lastFired || ''; }
      else if (sortBy === 'status') { va = a?.status; vb = b?.status; }
      else { va = a?.name; vb = b?.name; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }) => (
    <span className={`ml-1 inline-flex flex-col ${sortBy === col ? 'text-primary' : 'text-muted-foreground/40'}`}>
      <Icon name={sortBy === col && sortDir === 'desc' ? 'ChevronDown' : 'ChevronUp'} size={12} />
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterTrigger}
          onChange={e => setFilterTrigger(e?.target?.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {triggerTypes?.map(t => <option key={t?.value} value={t?.value}>{t?.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e?.target?.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="paused">Pausados</option>
          <option value="draft">Borradores</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered?.length} reglas</span>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                Regla <SortIcon col="name" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Trigger</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Acción</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>
                Estado <SortIcon col="status" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('lastFired')}>
                Último disparo <SortIcon col="lastFired" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('totalFired')}>
                Total <SortIcon col="totalFired" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map((rule, idx) => {
              const st = statusConfig?.[rule?.status];
              const { date, relative } = formatLastFired(rule?.lastFired);
              const triggerCls = triggerBadgeColors?.[rule?.triggerType] || 'bg-slate-100 text-slate-600 border-slate-200';
              return (
                <tr key={rule?.id} className={`border-b border-border transition-colors hover:bg-muted/20 ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${rule?.color}`} />
                      <span className="font-medium text-foreground">{rule?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${triggerCls}`}>
                      <Icon name={rule?.triggerIcon} size={12} />
                      {rule?.triggerLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[160px] truncate">{rule?.action}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st?.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st?.dot}`} />
                      {st?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {rule?.lastFired ? (
                      <div>
                        <p className="text-xs text-foreground">{date}</p>
                        <p className="text-xs text-muted-foreground">{relative}</p>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">{rule?.totalFired}</span>
                    <span className="text-xs text-muted-foreground ml-1">disparos</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit?.(rule)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Icon name="Pencil" size={14} />
                      </button>
                      <button
                        onClick={() => handleToggle(rule?.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          rule?.status === 'active' ?'hover:bg-amber-50 text-amber-500 hover:text-amber-600' :'hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600'
                        }`}
                        title={rule?.status === 'active' ? 'Pausar' : 'Activar'}
                      >
                        <Icon name={rule?.status === 'active' ? 'Pause' : 'Play'} size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(rule)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
                        title="Duplicar"
                      >
                        <Icon name="Copy" size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(rule?.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered?.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Icon name="Zap" size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay reglas con estos filtros</p>
          </div>
        )}
      </div>
      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <Icon name="Trash2" size={20} className="text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Eliminar regla</h3>
                <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              ¿Estás seguro de que quieres eliminar la regla <strong className="text-foreground">{rules?.find(r => r?.id === deleteConfirm)?.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesTable;
