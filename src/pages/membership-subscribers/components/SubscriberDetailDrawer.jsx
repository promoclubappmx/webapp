import React from 'react';
import Icon from '../../../components/AppIcon';

const SubscriberDetailDrawer = ({ subscriber, onClose }) => {
  if (!subscriber) return null;

  const PAYMENT_HISTORY = [
    { date: '2025-03-10', amount: 299, status: 'success' },
    { date: '2025-02-10', amount: 299, status: 'success' },
    { date: '2025-01-10', amount: 299, status: 'success' },
  ];

  const VALIDATION_HISTORY = [
    { date: '2025-03-11 09:23', benefit: 'Café Americano', staff: 'Carlos M.' },
    { date: '2025-03-10 08:45', benefit: 'Café Americano', staff: 'Ana R.' },
    { date: '2025-03-09 10:12', benefit: 'Descuento 20%', staff: 'Carlos M.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{subscriber?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{subscriber?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                subscriber?.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                subscriber?.status === 'payment_failed'? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {subscriber?.status === 'active' ? 'Activa' : subscriber?.status === 'payment_failed' ? 'Fallo de pago' : 'Cancelada'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Subscription Data */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Datos de suscripción</h3>
            <div className="bg-muted/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-foreground capitalize">{subscriber?.plan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-mono font-medium text-foreground">${subscriber?.price?.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Suscrito desde</span>
                <span className="text-foreground">{subscriber?.since}</span>
              </div>
              {subscriber?.nextRenewal && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Próxima renovación</span>
                  <span className="text-foreground">{subscriber?.nextRenewal}</span>
                </div>
              )}
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Método de pago</span>
                <span className="flex items-center gap-1.5 text-foreground">
                  •••• 4242
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Requiere Stripe</span>
                </span>
              </div>
            </div>
          </div>

          {/* Benefit Consumption */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Consumo de beneficios</h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-foreground">Café Americano (diario)</span>
                  <span className="text-xs font-mono font-medium text-foreground">1 de 1</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">1 de 1 usado hoy · Se reinicia a medianoche</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-foreground">Descuento 20%</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Activo ✓</span>
                </div>
                <p className="text-xs text-muted-foreground">Ilimitado · Activo mientras la membresía esté vigente</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-foreground">2x Puntos</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Activo ✓</span>
                </div>
                <p className="text-xs text-muted-foreground">Ilimitado · Se aplica automáticamente</p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              Historial de pagos
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Requiere Stripe</span>
            </h3>
            <div className="border border-border rounded-xl overflow-hidden">
              {PAYMENT_HISTORY?.map((p, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < PAYMENT_HISTORY?.length - 1 ? 'border-b border-border' : ''}`}>
                  <span className="text-sm text-muted-foreground">{p?.date}</span>
                  <span className="text-sm font-mono font-medium text-foreground">${p?.amount} MXN</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Exitoso</span>
                </div>
              ))}
            </div>
          </div>

          {/* Validation History */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Historial de validaciones</h3>
            <div className="border border-border rounded-xl overflow-hidden">
              {VALIDATION_HISTORY?.map((v, i) => (
                <div key={i} className={`px-4 py-3 ${i < VALIDATION_HISTORY?.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-foreground">{v?.benefit}</p>
                      <p className="text-xs text-muted-foreground">Staff: {v?.staff}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{v?.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <a href={`/customer-profile-detail`} className="flex items-center gap-2 text-sm text-primary hover:underline">
              <Icon name="ExternalLink" size={14} />
              Ver perfil completo en CRM
            </a>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nota interna</label>
              <textarea
                rows={2}
                placeholder="Agregar nota sobre este suscriptor..."
                className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <button className="mt-2 px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
                Guardar nota
              </button>
            </div>
            <button className="w-full py-2.5 border border-destructive text-destructive rounded-xl text-sm font-medium hover:bg-destructive/5 transition-colors">
              Cancelar membresía
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriberDetailDrawer;
