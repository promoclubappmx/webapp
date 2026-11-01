import React from 'react';
import Icon from '../../../components/AppIcon';
import { TEMPLATES } from './GiftCardConfigForm';

const GiftCardWalletPreview = ({ config, formatPrice }) => {
  const template = TEMPLATES?.find(t => t?.id === config?.selectedTemplate) || TEMPLATES?.[0];
  const exampleAmount = config?.denominations?.[0] || 500;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Smartphone" size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Preview — Wallet del usuario</h3>
      </div>
      {/* Phone mockup */}
      <div className="mx-auto w-64 bg-slate-900 rounded-3xl p-3 shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <span className="text-white text-xs">9:41</span>
          <div className="flex items-center gap-1">
            <Icon name="Signal" size={10} className="text-white" />
            <Icon name="Wifi" size={10} className="text-white" />
            <Icon name="Battery" size={10} className="text-white" />
          </div>
        </div>
        {/* App header */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Gift" size={10} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Mis Gift Cards</span>
          </div>
          {/* Gift card */}
          <div className="p-3">
            <div className={`bg-gradient-to-br ${template?.color} rounded-xl p-4 relative overflow-hidden`}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-2 text-4xl">{template?.icon}</div>
              </div>
              {/* Logo placeholder */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                  <Icon name="Store" size={10} className="text-white" />
                </div>
                <span className="text-white text-xs font-medium opacity-90">Tu Negocio</span>
              </div>
              {/* Amount */}
              <div className="mb-2">
                <p className="text-white/70 text-xs">Saldo disponible</p>
                <p className="text-white text-2xl font-bold">
                  {formatPrice ? formatPrice(exampleAmount) : `$${exampleAmount} MXN`}
                </p>
              </div>
              {/* Code */}
              <p className="text-white/60 text-xs font-mono">XXXX-XXXX-XXXX</p>
              {/* Message */}
              {config?.businessMessage && (
                <p className="text-white/80 text-xs mt-2 italic">"{config?.businessMessage}"</p>
              )}
            </div>
            {/* Validity */}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Válida por {config?.useFixedExpiry ? `hasta ${config?.fixedExpiryDate || '—'}` : `${config?.validityDays} días`}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activa</span>
            </div>
          </div>
        </div>
      </div>
      {/* Config summary */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Resumen de configuración</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Denominaciones</span>
            <span className="font-medium text-foreground">
              {config?.denominations?.length > 0
                ? config?.denominations?.map(d => `$${d}`)?.join(', ')
                : 'Sin definir'}
            </span>
          </div>
          {config?.allowCustomAmount && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Monto libre</span>
              <span className="font-medium text-foreground">${config?.customAmountMin}–${config?.customAmountMax} MXN</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Vigencia</span>
            <span className="font-medium text-foreground">
              {config?.useFixedExpiry ? 'Fecha fija' : `${config?.validityDays} días`}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Uso parcial</span>
            <span className={`font-medium ${config?.allowPartialUse ? 'text-success' : 'text-muted-foreground'}`}>
              {config?.allowPartialUse ? 'Permitido' : 'No permitido'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Combinable</span>
            <span className={`font-medium ${config?.combinableWithPromos ? 'text-success' : 'text-muted-foreground'}`}>
              {config?.combinableWithPromos ? 'Sí' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Template</span>
            <span className="font-medium text-foreground">{template?.label}</span>
          </div>
        </div>
      </div>
      {/* Denominations preview */}
      {config?.denominations?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Denominaciones disponibles</h4>
          <div className="flex flex-wrap gap-2">
            {config?.denominations?.map((d, i) => (
              <div key={i} className={`bg-gradient-to-r ${template?.color} text-white text-sm font-bold px-3 py-1.5 rounded-lg`}>
                ${d} MXN
              </div>
            ))}
            {config?.allowCustomAmount && (
              <div className="bg-muted text-muted-foreground text-sm font-medium px-3 py-1.5 rounded-lg border border-border">
                ${config?.customAmountMin}–${config?.customAmountMax}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCardWalletPreview;
