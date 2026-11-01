import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const STATUS_CYCLE = [
  { id: 'draft', label: 'Borrador', color: 'bg-muted text-muted-foreground', icon: 'FileText' },
  { id: 'scheduled', label: 'Programada', color: 'bg-blue-100 text-blue-700', icon: 'Clock' },
  { id: 'active', label: 'Activa', color: 'bg-green-100 text-green-700', icon: 'Play' },
  { id: 'paused', label: 'Pausada', color: 'bg-yellow-100 text-yellow-700', icon: 'Pause' },
  { id: 'completed', label: 'Finalizada', color: 'bg-purple-100 text-purple-700', icon: 'CheckCircle' },
  { id: 'archived', label: 'Archivada', color: 'bg-gray-100 text-gray-500', icon: 'Archive' },
];

const CampaignBasicForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Información de la campaña</h3>
        <p className="text-sm text-muted-foreground mb-5">Define los datos básicos de tu campaña.</p>
      </div>
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nombre de la campaña <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            value={data?.name || ''}
            onChange={e => handleChange('name', e?.target?.value?.slice(0, 60))}
            placeholder="Ej: Campaña Reactivación Verano 2026"
            maxLength={60}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {(data?.name || '')?.length}/60
          </span>
        </div>
      </div>
      {/* Descripción interna */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Descripción interna
          <span className="ml-2 text-xs text-muted-foreground font-normal">(solo visible para el negocio)</span>
        </label>
        <textarea
          value={data?.description || ''}
          onChange={e => handleChange('description', e?.target?.value)}
          placeholder="Notas internas sobre el objetivo y estrategia de esta campaña..."
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>
      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fecha de inicio <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            value={data?.startDate || ''}
            onChange={e => handleChange('startDate', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fecha de fin <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            value={data?.endDate || ''}
            min={data?.startDate || ''}
            onChange={e => handleChange('endDate', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      {/* Presupuesto y Tag */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Presupuesto (MXN)
            <span className="ml-2 text-xs text-muted-foreground font-normal">opcional</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              value={data?.budget || ''}
              onChange={e => handleChange('budget', parseFloat(e?.target?.value) || 0)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Etiqueta de categoría
            <span className="ml-2 text-xs text-muted-foreground font-normal">opcional</span>
          </label>
          <input
            type="text"
            value={data?.categoryTag || ''}
            onChange={e => handleChange('categoryTag', e?.target?.value)}
            placeholder="Ej: Q1 2026, Verano, Aniversario"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Estado inicial</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_CYCLE?.map(s => (
            <button
              key={s?.id}
              type="button"
              onClick={() => handleChange('status', s?.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                data?.status === s?.id
                  ? `${s?.color} border-current`
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <Icon name={s?.icon} size={12} />
              {s?.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {STATUS_CYCLE?.map((s, i) => (
            <React.Fragment key={s?.id}>
              <span className={`text-xs px-1.5 py-0.5 rounded ${data?.status === s?.id ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`}>{s?.label}</span>
              {i < STATUS_CYCLE?.length - 1 && <Icon name="ChevronRight" size={10} className="text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignBasicForm;
