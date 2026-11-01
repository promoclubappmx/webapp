import React from 'react';
import Icon from '../../../components/AppIcon';
import MechanicsSelector from './MechanicsSelector';

const SurpriseConfigGeneralTab = ({ form, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Info" size={16} className="text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Información básica</h3>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Nombre de la sorpresa <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Ruleta de Bienvenida, Cofre del Check-in…"
            value={form?.name || ''}
            onChange={e => onChange({ ...form, name: e?.target?.value })}
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Descripción interna</label>
          <textarea
            placeholder="Describe el propósito de esta sorpresa (solo visible para el administrador)…"
            value={form?.description || ''}
            onChange={e => onChange({ ...form, description: e?.target?.value })}
            rows={3}
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Fecha de inicio</label>
            <input
              type="date"
              value={form?.startDate || ''}
              onChange={e => onChange({ ...form, startDate: e?.target?.value })}
              className="w-full px-3 py-2.5 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Fecha de fin (opcional)</label>
            <input
              type="date"
              value={form?.endDate || ''}
              onChange={e => onChange({ ...form, endDate: e?.target?.value })}
              className="w-full px-3 py-2.5 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Mechanic Selector */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Icon name="Gamepad2" size={16} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Mecánica de juego <span className="text-destructive">*</span></h3>
            <p className="text-xs text-muted-foreground mt-0.5">Elige cómo el cliente interactuará con la sorpresa</p>
          </div>
        </div>
        <MechanicsSelector
          selectedMechanic={form?.mechanic || ''}
          mechanicConfig={form?.mechanicConfig || {}}
          onSelect={(mechanic) => onChange({ ...form, mechanic })}
          onConfigChange={(mechanicConfig) => onChange({ ...form, mechanicConfig })}
        />
      </div>
    </div>
  );
};

export default SurpriseConfigGeneralTab;
