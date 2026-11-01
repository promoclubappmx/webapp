import React from 'react';

const COOLDOWN_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' },
];

const CooldownSection = ({ cooldown, setCooldown }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <h3 className="font-semibold text-foreground mb-1">Cooldown entre check-ins</h3>
    <p className="text-xs text-muted-foreground mb-4">
      Tiempo mínimo entre dos check-ins del mismo usuario, independiente del límite diario. Previene dobles registros accidentales.
    </p>
    <div className="flex gap-2">
      {COOLDOWN_OPTIONS?.map(opt => (
        <button
          key={opt?.value}
          onClick={() => setCooldown(opt?.value)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
            cooldown === opt?.value
              ? 'border-primary bg-primary text-white' :'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
          }`}
        >
          {opt?.label}
        </button>
      ))}
    </div>
    <div className="mt-3 flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
      <p className="text-xs text-muted-foreground">
        El cooldown mínimo técnico es de <strong>1 minuto</strong> (hardcoded) para prevenir race conditions, independientemente de esta configuración.
      </p>
    </div>
  </div>
);

export default CooldownSection;
