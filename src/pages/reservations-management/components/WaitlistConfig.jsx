import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const WINDOW_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
];

const WaitlistConfig = ({ config, onChange }) => {
  const enabled = config?.waitlistEnabled ?? true;
  const maxSize = config?.maxWaitlistSize ?? 10;
  const windowMinutes = config?.confirmationWindowMinutes ?? 30;
  const orderMode = config?.orderMode ?? 'fifo';
  const showPosition = config?.showPosition ?? true;
  const vipPriority = config?.vipPriority ?? false;

  const set = (field, val) => onChange({ ...config, [field]: val });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl">
        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="ListOrdered" size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Lista de espera (Waitlist)</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Convierte la demanda rechazada en demanda capturada. Cuando no hay disponibilidad, el usuario se anota y recibe notificación automática si se libera un lugar.</p>
        </div>
      </div>
      {/* Master toggle */}
      <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${enabled ? 'border-teal-400 bg-teal-50' : 'border-border bg-card'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${enabled ? 'bg-teal-600' : 'bg-muted'} rounded-xl flex items-center justify-center transition-colors`}>
            <Icon name="Users" size={18} className={enabled ? 'text-white' : 'text-muted-foreground'} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">Lista de espera activa</h4>
            <p className="text-xs text-muted-foreground">Cuando está desactivada, el usuario solo ve "No hay horarios disponibles"</p>
          </div>
        </div>
        <button
          onClick={() => set('waitlistEnabled', !enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-teal-600' : 'bg-muted'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
      {enabled && (
        <>
          {/* Max waitlist size */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Icon name="Hash" size={15} className="text-teal-600" />
              Tamaño máximo de la lista de espera
            </h4>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={maxSize}
                onChange={e => set('maxWaitlistSize', +e?.target?.value)}
                className="flex-1 accent-teal-600"
              />
              <div className="w-16 text-center">
                <span className="text-2xl font-bold text-teal-600">{maxSize}</span>
                <p className="text-xs text-muted-foreground">personas</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-teal-50 border border-teal-200 rounded-xl p-3">
              <Icon name="Info" size={12} className="inline mr-1 text-teal-600" />
              Una waitlist muy larga genera falsas expectativas. Recomendamos limitar a 5–10 personas por slot.
            </p>
          </div>

          {/* Confirmation window */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Icon name="Timer" size={15} className="text-amber-600" />
              Ventana de confirmación
            </h4>
            <p className="text-sm text-muted-foreground">Cuando se libera un lugar, ¿cuánto tiempo tiene la persona notificada para confirmar?</p>
            <div className="flex flex-wrap gap-2">
              {WINDOW_OPTIONS?.map(opt => (
                <button
                  key={opt?.value}
                  onClick={() => set('confirmationWindowMinutes', opt?.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    windowMinutes === opt?.value
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-700'
                  }`}
                >
                  {opt?.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-3">
              <Icon name="Info" size={12} className="inline mr-1 text-amber-600" />
              30 minutos es suficiente para que el usuario vea la notificación y responda sin que el lugar quede vacío mucho tiempo.
            </p>
          </div>

          {/* Order mode */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Icon name="ArrowUpDown" size={15} className="text-violet-600" />
              Orden de la lista de espera
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  id: 'fifo',
                  label: 'Por orden de registro (FIFO)',
                  icon: 'Clock',
                  description: 'El primero en anotarse es el primero en ser notificado. Es lo más justo.',
                  color: 'text-violet-600',
                  bg: 'bg-violet-100',
                  activeBg: 'bg-violet-600',
                  border: 'border-violet-300',
                  activeBorder: 'border-violet-600',
                  ring: 'ring-violet-400',
                },
                {
                  id: 'vip',
                  label: 'Prioridad VIP',
                  icon: 'Crown',
                  description: 'Clientes con nivel VIP más alto se ponen al frente, independientemente de cuándo se anotaron.',
                  color: 'text-amber-600',
                  bg: 'bg-amber-100',
                  activeBg: 'bg-amber-600',
                  border: 'border-amber-300',
                  activeBorder: 'border-amber-600',
                  ring: 'ring-amber-400',
                },
              ]?.map(opt => {
                const isActive = orderMode === opt?.id;
                return (
                  <button
                    key={opt?.id}
                    onClick={() => set('orderMode', opt?.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      isActive
                        ? `${opt?.activeBorder} ${opt?.bg} shadow-md ring-2 ${opt?.ring} ring-offset-1`
                        : 'border-border bg-card hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 ${isActive ? opt?.activeBg : opt?.bg} rounded-lg flex items-center justify-center`}>
                        <Icon name={opt?.icon} size={14} className={isActive ? 'text-white' : opt?.color} />
                      </div>
                      {isActive && <div className={`w-5 h-5 ${opt?.activeBg} rounded-full flex items-center justify-center`}><Icon name="Check" size={11} className="text-white" /></div>}
                    </div>
                    <h5 className="font-semibold text-foreground text-sm mb-1">{opt?.label}</h5>
                    <p className="text-xs text-muted-foreground">{opt?.description}</p>
                  </button>
                );
              })}
            </div>
            {orderMode === 'vip' && (
              <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-3">
                <Icon name="AlertTriangle" size={12} className="inline mr-1 text-amber-600" />
                Esto premia la lealtad pero puede frustrar a clientes que llegaron antes. Úsalo con criterio.
              </p>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Icon name="Bell" size={15} className="text-blue-600" />
              Notificaciones y visibilidad
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showPosition}
                    onChange={e => set('showPosition', e?.target?.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${showPosition ? 'bg-blue-600' : 'bg-muted'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showPosition ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Informar al usuario su posición en la lista</p>
                  <p className="text-xs text-muted-foreground">El usuario ve: "Estás en posición #3. Te notificaremos si se abre un lugar."</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notification message preview */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-5 space-y-3">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Icon name="Smartphone" size={15} className="text-teal-600" />
              Vista previa de notificación
            </h4>
            <div className="bg-white border border-teal-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Bell" size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">PromoClub</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ¡Se liberó un lugar para [tipo] en [negocio] el [fecha] a las [hora]! Tienes <strong>{windowMinutes} minutos</strong> para confirmar.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded-lg">Confirmar</span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-lg">Pasar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WaitlistConfig;
