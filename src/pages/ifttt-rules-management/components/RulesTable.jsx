import React from 'react';
import Icon from '../../../components/AppIcon';

const TRIGGER_BADGE = {
  weather: { label: 'Clima', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'Cloud' },
  inactivity: { label: 'Inactividad', color: 'bg-red-100 text-red-700 border-red-200', icon: 'Clock' },
  checkins: { label: 'Check-ins', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'MapPin' },
  drip: { label: 'Drip', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'Droplets' },
};

const STATUS_BADGE = {
  active: { label: 'Activo', cls: 'bg-success/10 text-success border-success/20' },
  paused: { label: 'Pausado', cls: 'bg-warning/10 text-warning border-warning/20' },
  draft: { label: 'Borrador', cls: 'bg-muted text-muted-foreground border-border' },
};

const relativeTime = (iso) => {
  if (!iso) return 'Nunca';
  const diff = Date.now() - new Date(iso)?.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
};

const SortIcon = ({ field, sortField, sortDir }) => {
  if (sortField !== field) return <Icon name="ChevronsUpDown" size={14} className="text-muted-foreground/50" />;
  return <Icon name={sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-primary" />;
};

const RulesTable = ({ rules, sortField, sortDir, onSort, selectedRules, onSelectRule, onSelectAll, onEdit, onToggle, onDuplicate, onDelete }) => {
  const allSelected = rules?.length > 0 && rules?.every(r => selectedRules?.includes(r?.id));

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={e => onSelectAll(e?.target?.checked)}
                  className="rounded border-border" />
              </th>
              {[
                { key: 'name', label: 'Nombre de Regla' },
                { key: 'triggerType', label: 'Tipo de Trigger' },
                { key: 'action', label: 'Acción Configurada' },
                { key: 'status', label: 'Estado' },
                { key: 'lastFired', label: 'Último Disparo' },
                { key: 'totalFired', label: 'Total Disparos' },
              ]?.map(col => (
                <th key={col?.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none"
                  onClick={() => onSort(col?.key)}>
                  <div className="flex items-center gap-1.5">
                    {col?.label}
                    <SortIcon field={col?.key} sortField={sortField} sortDir={sortDir} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rules?.map(rule => {
              const trigger = TRIGGER_BADGE?.[rule?.triggerType] || TRIGGER_BADGE?.checkins;
              const status = STATUS_BADGE?.[rule?.status] || STATUS_BADGE?.draft;
              const isSelected = selectedRules?.includes(rule?.id);
              return (
                <tr key={rule?.id} className={`hover:bg-muted/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={isSelected} onChange={() => onSelectRule(rule?.id)}
                      className="rounded border-border" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{rule?.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule?.triggerDetail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${trigger?.color}`}>
                      <Icon name={trigger?.icon} size={12} />
                      {trigger?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground max-w-[200px] truncate">{rule?.action}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggle(rule?.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:opacity-80 ${status?.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rule?.status === 'active' ? 'bg-success animate-pulse' : rule?.status === 'paused' ? 'bg-warning' : 'bg-muted-foreground'}`} />
                      {status?.label}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{relativeTime(rule?.lastFired)}</p>
                    {rule?.lastFired && (
                      <p className="text-xs text-muted-foreground">{new Date(rule.lastFired)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">{rule?.totalFired?.toLocaleString()}</span>
                      {rule?.trend === 'up' && <Icon name="TrendingUp" size={14} className="text-success" />}
                      {rule?.trend === 'down' && <Icon name="TrendingDown" size={14} className="text-destructive" />}
                      {rule?.trend === 'neutral' && <Icon name="Minus" size={14} className="text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(rule)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Editar">
                        <Icon name="Pencil" size={15} />
                      </button>
                      <button onClick={() => onToggle(rule?.id)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title={rule?.status === 'active' ? 'Pausar' : 'Activar'}>
                        <Icon name={rule?.status === 'active' ? 'Pause' : 'Play'} size={15} />
                      </button>
                      <button onClick={() => onDuplicate(rule)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Duplicar">
                        <Icon name="Copy" size={15} />
                      </button>
                      <button onClick={() => onDelete(rule)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Eliminar">
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RulesTable;
