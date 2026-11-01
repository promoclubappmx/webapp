import React from 'react';
import Icon from '../../../components/AppIcon';

const TRIGGER_OPTIONS = [
  { value: 'all', label: 'Todos los triggers' },
  { value: 'weather', label: '🌤 Clima' },
  { value: 'inactivity', label: '⏰ Inactividad' },
  { value: 'checkins', label: '📍 Check-ins' },
  { value: 'drip', label: '💧 Drip' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'paused', label: 'Pausados' },
  { value: 'draft', label: 'Borradores' },
];

const RulesFilters = ({ searchQuery, onSearchChange, triggerFilter, onTriggerChange, statusFilter, onStatusChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar reglas..."
          value={searchQuery}
          onChange={e => onSearchChange(e?.target?.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <Icon name="X" size={14} />
          </button>
        )}
      </div>
      <select
        value={triggerFilter}
        onChange={e => onTriggerChange(e?.target?.value)}
        className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors">
        {TRIGGER_OPTIONS?.map(o => <option key={o?.value} value={o?.value}>{o?.label}</option>)}
      </select>
      <select
        value={statusFilter}
        onChange={e => onStatusChange(e?.target?.value)}
        className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors">
        {STATUS_OPTIONS?.map(o => <option key={o?.value} value={o?.value}>{o?.label}</option>)}
      </select>
      {(searchQuery || triggerFilter !== 'all' || statusFilter !== 'all') && (
        <button
          onClick={() => { onSearchChange(''); onTriggerChange('all'); onStatusChange('all'); }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors">
          <Icon name="X" size={14} />
          Limpiar filtros
        </button>
      )}
    </div>
  );
};

export default RulesFilters;
