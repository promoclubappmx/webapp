import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import BusinessSelector from '../../../components/BusinessSelector';

const TEMPLATES = [
  { id: 'birthday-1', label: 'Cumpleaños 1', occasion: 'Cumpleaños', color: 'from-pink-400 to-rose-500', icon: '🎂' },
  { id: 'birthday-2', label: 'Cumpleaños 2', occasion: 'Cumpleaños', color: 'from-purple-400 to-pink-500', icon: '🎉' },
  { id: 'birthday-3', label: 'Cumpleaños 3', occasion: 'Cumpleaños', color: 'from-yellow-400 to-orange-500', icon: '🎁' },
  { id: 'thanks-1', label: 'Agradecimiento 1', occasion: 'Agradecimiento', color: 'from-green-400 to-teal-500', icon: '🙏' },
  { id: 'thanks-2', label: 'Agradecimiento 2', occasion: 'Agradecimiento', color: 'from-teal-400 to-cyan-500', icon: '💚' },
  { id: 'love-1', label: 'Amor/Amistad 1', occasion: 'Amor/Amistad', color: 'from-red-400 to-pink-500', icon: '❤️' },
  { id: 'love-2', label: 'Amor/Amistad 2', occasion: 'Amor/Amistad', color: 'from-pink-300 to-red-400', icon: '💕' },
  { id: 'xmas-1', label: 'Navidad 1', occasion: 'Navidad', color: 'from-red-600 to-green-600', icon: '🎄' },
  { id: 'xmas-2', label: 'Navidad 2', occasion: 'Navidad', color: 'from-blue-800 to-indigo-900', icon: '⛄' },
  { id: 'mothers-1', label: 'Día de las Madres', occasion: 'Día de las Madres', color: 'from-rose-300 to-pink-400', icon: '🌸' },
  { id: 'graduation-1', label: 'Graduación', occasion: 'Graduación', color: 'from-blue-500 to-indigo-600', icon: '🎓' },
  { id: 'generic-1', label: 'Genérico', occasion: 'Genérico', color: 'from-slate-500 to-slate-700', icon: '🎴' },
];

const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon name={icon} size={18} className="text-primary" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
      </button>
      {open && <div className="px-5 py-4 bg-card border-t border-border">{children}</div>}
    </div>
  );
};

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  </div>
);

const GiftCardConfigForm = ({ config, onChange }) => {
  const update = (field, value) => onChange(prev => ({ ...prev, [field]: value }));

  const addDenomination = () => {
    if (config?.denominations?.length >= 6) return;
    update('denominations', [...config?.denominations, 100]);
  };

  const removeDenomination = (idx) => {
    update('denominations', config?.denominations?.filter((_, i) => i !== idx));
  };

  const updateDenomination = (idx, val) => {
    const updated = [...config?.denominations];
    updated[idx] = parseFloat(val) || 0;
    update('denominations', updated);
  };

  const msgLen = config?.businessMessage?.length || 0;

  return (
    <div className="space-y-2">
      {/* Business Selector */}
      <div className="mb-4">
        <BusinessSelector
          value={config?.businessId}
          onChange={(v) => update('businessId', v)}
          label="Negocio"
          error={!config?.businessId ? 'Selecciona un negocio' : ''}
          required
        />
      </div>
      {/* Montos */}
      <Section title="Montos" icon="DollarSign" defaultOpen={true}>
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Define las denominaciones disponibles (máx. 6)</p>
            <button
              onClick={addDenomination}
              disabled={config?.denominations?.length >= 6}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              <Icon name="Plus" size={14} /> Agregar
            </button>
          </div>
          {config?.denominations?.map((denom, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-4">$</span>
              <input
                type="number"
                min="50"
                max="5000"
                value={denom}
                onChange={(e) => updateDenomination(idx, e?.target?.value)}
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground">MXN</span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">0 vendidas</span>
              <button onClick={() => removeDenomination(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Icon name="X" size={14} />
              </button>
            </div>
          ))}
          {config?.denominations?.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Sin denominaciones. Agrega al menos una.</p>
          )}
          <div className="pt-3 border-t border-border">
            <Toggle
              checked={config?.allowCustomAmount}
              onChange={(v) => update('allowCustomAmount', v)}
              label="Permitir monto libre"
              description="El comprador elige cuánto cargar dentro de un rango"
            />
            {config?.allowCustomAmount && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Monto mínimo (MXN)</label>
                  <input
                    type="number" min="50" value={config?.customAmountMin}
                    onChange={(e) => update('customAmountMin', parseFloat(e?.target?.value) || 50)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Monto máximo (MXN)</label>
                  <input
                    type="number" min="50" max="5000" value={config?.customAmountMax}
                    onChange={(e) => update('customAmountMax', parseFloat(e?.target?.value) || 5000)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
      {/* Diseño */}
      <Section title="Diseño" icon="Palette" defaultOpen={true}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Selecciona un template para tu gift card</p>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATES?.map(t => (
              <button
                key={t?.id}
                onClick={() => update('selectedTemplate', t?.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  config?.selectedTemplate === t?.id
                    ? 'border-primary shadow-md scale-105'
                    : 'border-transparent hover:border-border'
                }`}
              >
                <div className={`bg-gradient-to-br ${t?.color} h-16 flex flex-col items-center justify-center`}>
                  <span className="text-2xl">{t?.icon}</span>
                </div>
                <div className="bg-card px-2 py-1">
                  <p className="text-xs text-center text-foreground truncate">{t?.label}</p>
                </div>
                {config?.selectedTemplate === t?.id && (
                  <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                    <Icon name="Check" size={10} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-foreground">Mensaje del negocio</label>
              <span className={`text-xs ${msgLen > 70 ? 'text-warning' : 'text-muted-foreground'}`}>{msgLen}/80</span>
            </div>
            <textarea
              maxLength={80}
              value={config?.businessMessage}
              onChange={(e) => update('businessMessage', e?.target?.value)}
              placeholder='Ej: "Gracias por elegirnos — Café Roma"'
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 border border-primary/30 rounded-lg px-4 py-2 w-full justify-center hover:bg-primary/5 transition-colors">
            <Icon name="Upload" size={16} />
            Subir diseño personalizado (JPG/PNG · 1200×630px)
          </button>
        </div>
      </Section>
      {/* Vigencia */}
      <Section title="Vigencia" icon="Calendar" defaultOpen={false}>
        <div className="space-y-4">
          <Toggle
            checked={config?.useFixedExpiry}
            onChange={(v) => update('useFixedExpiry', v)}
            label="Usar fecha fija de vencimiento"
            description="Todas las gift cards vencen en la misma fecha"
          />
          {config?.useFixedExpiry ? (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Fecha fija de vencimiento</label>
              <input
                type="date"
                value={config?.fixedExpiryDate}
                onChange={(e) => update('fixedExpiryDate', e?.target?.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Días de vigencia desde la compra</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="30" max="730"
                  value={config?.validityDays}
                  onChange={(e) => update('validityDays', parseInt(e?.target?.value) || 365)}
                  className="w-28 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">días (mín. 30, máx. 730)</span>
              </div>
            </div>
          )}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Las gift cards vencidas no son reembolsables. El usuario recibe recordatorios automáticos 30, 7 y 1 día antes de vencer.
              </p>
            </div>
          </div>
        </div>
      </Section>
      {/* Condiciones */}
      <Section title="Condiciones de Uso" icon="FileText" defaultOpen={false}>
        <div className="space-y-1 divide-y divide-border">
          <Toggle
            checked={config?.allowPartialUse}
            onChange={(v) => update('allowPartialUse', v)}
            label="Uso parcial permitido"
            description="El saldo restante se conserva para futuras compras"
          />
          <div className="pt-2">
            <Toggle
              checked={!!config?.minPurchaseAmount}
              onChange={(v) => update('minPurchaseAmount', v ? 50 : '')}
              label="Monto mínimo de compra"
              description="Requiere un monto mínimo para usar la gift card"
            />
            {!!config?.minPurchaseAmount && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <input
                  type="number" min="1"
                  value={config?.minPurchaseAmount}
                  onChange={(e) => update('minPurchaseAmount', parseFloat(e?.target?.value) || '')}
                  className="w-28 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">MXN</span>
              </div>
            )}
          </div>
          <div className="pt-2">
            <Toggle
              checked={config?.appliesToAllCatalog}
              onChange={(v) => update('appliesToAllCatalog', v)}
              label="Aplica a todo el catálogo"
              description={config?.appliesToAllCatalog ? 'Válida en todos los productos y servicios' : 'Solo aplica a categorías específicas'}
            />
          </div>
          <div className="pt-2">
            <Toggle
              checked={config?.combinableWithPromos}
              onChange={(v) => update('combinableWithPromos', v)}
              label="Combinable con promociones activas"
              description="Se puede usar junto con cupones y descuentos"
            />
          </div>
        </div>
      </Section>
    </div>
  );
};

export { TEMPLATES };
export default GiftCardConfigForm;
