import React from 'react';
import Icon from '../../../components/AppIcon';

const SurpriseAudienciaTab = ({ form, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Restricción de audiencia</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Define a qué clientes aplica esta sorpresa</p>
      </div>

      {/* Audience restriction */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Icon name="Users" size={16} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Restricción de audiencia</h3>
            <p className="text-xs text-muted-foreground">¿A qué clientes aplica esta sorpresa?</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'Todos los clientes', desc: 'Sin restricción de nivel o segmento' },
            { value: 'vip_only', label: 'Solo clientes VIP', desc: 'Clientes con nivel Plata u Oro activo' },
            { value: 'new_only', label: 'Solo clientes nuevos', desc: 'Clientes con menos de 3 visitas' },
            { value: 'returning', label: 'Solo clientes recurrentes', desc: 'Clientes con 3 o más visitas' },
          ]?.map(opt => (
            <label
              key={opt?.value}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                (form?.audienceRestriction || 'all') === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <input
                type="radio"
                name="audienceRestriction"
                value={opt?.value}
                checked={(form?.audienceRestriction || 'all') === opt?.value}
                onChange={() => onChange({ ...form, audienceRestriction: opt?.value })}
                className="mt-0.5 flex-shrink-0 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                <p className="text-xs text-muted-foreground">{opt?.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurpriseAudienciaTab;
