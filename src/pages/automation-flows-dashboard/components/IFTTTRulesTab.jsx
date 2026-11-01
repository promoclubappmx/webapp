import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import RulesTable from '../../ifttt-rules-management/components/RulesTable';
import RulesFilters from '../../ifttt-rules-management/components/RulesFilters';
import RuleFormModal from '../../ifttt-rules-management/components/RuleFormModal';
import DeleteConfirmModal from '../../ifttt-rules-management/components/DeleteConfirmModal';
import BulkActionsBar from '../../ifttt-rules-management/components/BulkActionsBar';

const IFTTTRulesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedRules, setSelectedRules] = useState([]);
  const [editingRule, setEditingRule] = useState(null);
  const [deletingRule, setDeletingRule] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [rules, setRules] = useState([
    { id: '1', name: 'Si llueve → Flash Deal Lluvia', triggerType: 'weather', triggerLabel: 'Condición climática', triggerDetail: 'Lluvia detectada', action: 'Activar promo + Push 2km', status: 'active', lastFired: new Date(Date.now() - 2 * 3600000)?.toISOString(), totalFired: 34, trend: 'up' },
    { id: '2', name: 'Sin check-ins 2h → Flash Deal', triggerType: 'inactivity', triggerLabel: 'Inactividad negocio', triggerDetail: '2 horas sin check-ins', action: 'Flash deal + Push urgente', status: 'active', lastFired: new Date(Date.now() - 5 * 3600000)?.toISOString(), totalFired: 18, trend: 'up' },
    { id: '3', name: 'Cliente inactivo 30d → Cupón', triggerType: 'checkins', triggerLabel: 'Check-ins cliente', triggerDetail: '30 días sin visita', action: 'Enviar cupón 20% al wallet', status: 'paused', lastFired: new Date(Date.now() - 3 * 86400000)?.toISOString(), totalFired: 87, trend: 'down' },
    { id: '4', name: 'Cumpleaños próximo → Regalo', triggerType: 'drip', triggerLabel: 'Drip campaign', triggerDetail: '3 días antes del cumpleaños', action: 'Cupón regalo + Push teaser', status: 'active', lastFired: new Date(Date.now() - 86400000)?.toISOString(), totalFired: 23, trend: 'up' },
    { id: '5', name: 'Frío extremo → Promo caliente', triggerType: 'weather', triggerLabel: 'Condición climática', triggerDetail: 'Temperatura < 15°C', action: 'Activar promo bebidas calientes', status: 'active', lastFired: new Date(Date.now() - 7 * 86400000)?.toISOString(), totalFired: 12, trend: 'neutral' },
    { id: '6', name: 'Nuevo registro → Puntos bienvenida', triggerType: 'checkins', triggerLabel: 'Check-ins cliente', triggerDetail: 'Primer registro en negocio', action: 'Acreditar 50 puntos bonus', status: 'active', lastFired: new Date(Date.now() - 1800000)?.toISOString(), totalFired: 156, trend: 'up' },
    { id: '7', name: 'Sin clientes martes → Promo', triggerType: 'inactivity', triggerLabel: 'Inactividad negocio', triggerDetail: '3 horas sin check-ins (martes)', action: 'Activar happy hour especial', status: 'draft', lastFired: null, totalFired: 0, trend: 'neutral' },
    { id: '8', name: 'Drip semanal nuevos clientes', triggerType: 'drip', triggerLabel: 'Drip campaign', triggerDetail: 'Nuevos clientes últimos 30 días', action: 'Secuencia 4 semanas: push+email+cupón', status: 'active', lastFired: new Date(Date.now() - 12 * 3600000)?.toISOString(), totalFired: 67, trend: 'up' },
    { id: '9', name: 'Calor → Promo refrescante', triggerType: 'weather', triggerLabel: 'Condición climática', triggerDetail: 'Temperatura > 32°C', action: 'Activar promo bebidas frías', status: 'paused', lastFired: new Date(Date.now() - 14 * 86400000)?.toISOString(), totalFired: 9, trend: 'down' },
    { id: '10', name: 'Cliente VIP inactivo → Oferta exclusiva', triggerType: 'checkins', triggerLabel: 'Check-ins cliente', triggerDetail: 'VIP sin visita 14 días', action: 'Push personalizado + Cupón 30%', status: 'active', lastFired: new Date(Date.now() - 4 * 3600000)?.toISOString(), totalFired: 41, trend: 'up' },
  ]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleToggleStatus = (ruleId) => {
    setRules(prev => prev?.map(r => {
      if (r?.id !== ruleId) return r;
      const next = r?.status === 'active' ? 'paused' : 'active';
      return { ...r, status: next };
    }));
  };

  const handleDuplicate = (rule) => {
    const copy = { ...rule, id: Date.now()?.toString(), name: `${rule?.name} (copia)`, status: 'draft', lastFired: null, totalFired: 0 };
    setRules(prev => [...prev, copy]);
  };

  const handleDelete = (rule) => setDeletingRule(rule);

  const confirmDelete = () => {
    if (deletingRule) {
      setRules(prev => prev?.filter(r => r?.id !== deletingRule?.id));
      setSelectedRules(prev => prev?.filter(id => id !== deletingRule?.id));
      setDeletingRule(null);
    }
  };

  const handleSaveRule = (ruleData) => {
    if (editingRule) {
      setRules(prev => prev?.map(r => r?.id === editingRule?.id ? { ...r, ...ruleData } : r));
    } else {
      setRules(prev => [...prev, { ...ruleData, id: Date.now()?.toString(), lastFired: null, totalFired: 0, trend: 'neutral' }]);
    }
    setEditingRule(null);
    setShowCreateModal(false);
  };

  const handleBulkDelete = () => {
    setRules(prev => prev?.filter(r => !selectedRules?.includes(r?.id)));
    setSelectedRules([]);
  };

  const handleBulkToggle = (newStatus) => {
    setRules(prev => prev?.map(r => selectedRules?.includes(r?.id) ? { ...r, status: newStatus } : r));
    setSelectedRules([]);
  };

  const filteredRules = rules?.filter(r => {
    const matchSearch = r?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      r?.action?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchTrigger = triggerFilter === 'all' || r?.triggerType === triggerFilter;
    const matchStatus = statusFilter === 'all' || r?.status === statusFilter;
    return matchSearch && matchTrigger && matchStatus;
  })?.sort((a, b) => {
    let valA = a?.[sortField] ?? '';
    let valB = b?.[sortField] ?? '';
    if (sortField === 'lastFired') {
      valA = valA ? new Date(valA)?.getTime() : 0;
      valB = valB ? new Date(valB)?.getTime() : 0;
    }
    if (typeof valA === 'string') valA = valA?.toLowerCase();
    if (typeof valB === 'string') valB = valB?.toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const stats = {
    total: rules?.length,
    active: rules?.filter(r => r?.status === 'active')?.length,
    paused: rules?.filter(r => r?.status === 'paused')?.length,
    draft: rules?.filter(r => r?.status === 'draft')?.length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Reglas IFTTT</h2>
          <p className="text-sm text-muted-foreground">Si pasa X, haz Y. Respuestas automáticas en tiempo real.</p>
        </div>
        <Button variant="default" size="sm" onClick={() => { setEditingRule(null); setShowCreateModal(true); }} iconName="Plus" iconPosition="left">Nueva Regla</Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Reglas', value: stats?.total, icon: 'List', color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'Activas', value: stats?.active, icon: 'CheckCircle', color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pausadas', value: stats?.paused, icon: 'PauseCircle', color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Borradores', value: stats?.draft, icon: 'FileEdit', color: 'text-muted-foreground', bg: 'bg-muted/30' },
        ]?.map((s, i) => (
          <div key={i} className={`${s?.bg} rounded-lg p-4 flex items-center gap-3`}>
            <Icon name={s?.icon} size={20} className={s?.color} />
            <div>
              <p className={`text-xl font-bold ${s?.color}`}>{s?.value}</p>
              <p className="text-xs text-muted-foreground">{s?.label}</p>
            </div>
          </div>
        ))}
      </div>

      <RulesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        triggerFilter={triggerFilter}
        onTriggerChange={setTriggerFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {selectedRules?.length > 0 && (
        <BulkActionsBar
          count={selectedRules?.length}
          onActivate={() => handleBulkToggle('active')}
          onPause={() => handleBulkToggle('paused')}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedRules([])}
        />
      )}

      <RulesTable
        rules={filteredRules}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selectedRules={selectedRules}
        onSelectRule={(id) => setSelectedRules(prev => prev?.includes(id) ? prev?.filter(x => x !== id) : [...prev, id])}
        onSelectAll={(checked) => setSelectedRules(checked ? filteredRules?.map(r => r?.id) : [])}
        onEdit={(rule) => { setEditingRule(rule); setShowCreateModal(true); }}
        onToggle={handleToggleStatus}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

      {filteredRules?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="Zap" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No se encontraron reglas</p>
          <p className="text-sm mt-1">Ajusta los filtros o crea una nueva regla</p>
        </div>
      )}

      {showCreateModal && (
        <RuleFormModal
          rule={editingRule}
          onSave={handleSaveRule}
          onClose={() => { setShowCreateModal(false); setEditingRule(null); }}
        />
      )}
      {deletingRule && (
        <DeleteConfirmModal
          rule={deletingRule}
          onConfirm={confirmDelete}
          onClose={() => setDeletingRule(null)}
        />
      )}
    </div>
  );
};

export default IFTTTRulesTab;
