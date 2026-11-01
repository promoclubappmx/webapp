import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import SlotConfigurator from './SlotConfigurator';
import ExceptionsCalendar from './ExceptionsCalendar';

const OrderAheadConfiguration = ({ hasCatalogItems = true }) => {
  const [isActive, setIsActive] = useState(true);
  const [minAdvance, setMinAdvance] = useState('30');
  const [maxHorizon, setMaxHorizon] = useState('7');
  const [acceptFutureDays, setAcceptFutureDays] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState('daily');
  const [notifWhatsapp, setNotifWhatsapp] = useState('');
  const [exceptions, setExceptions] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseDuration, setPauseDuration] = useState(30);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mini-dashboard mock data
  const stats = {
    slotsAvailable: 12,
    slotsOccupied: 8,
    pendingOrders: 3,
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePause = () => {
    setIsPaused(true);
    setShowPauseModal(false);
  };

  if (!hasCatalogItems) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
          <Icon name="ShoppingBag" size={36} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Catálogo vacío</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Para activar Order Ahead necesitas al menos un producto o servicio publicado en tu catálogo.
        </p>
        <a href="/catalog-management" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Icon name="Layers" size={18} />
          Ir a mi catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mini-dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Icon name="CalendarCheck" size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Slots disponibles hoy</p>
            <p className="text-xl font-bold text-foreground">{stats?.slotsAvailable} <span className="text-sm font-normal text-muted-foreground">/ {stats?.slotsAvailable + stats?.slotsOccupied}</span></p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Slots ocupados hoy</p>
            <p className="text-xl font-bold text-foreground">{stats?.slotsOccupied}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="ShoppingBag" size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pedidos pendientes</p>
            <p className="text-xl font-bold text-foreground">{stats?.pendingOrders}</p>
          </div>
        </div>
      </div>
      {/* Emergency pause banner */}
      {isPaused && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Icon name="PauseCircle" size={20} className="text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800">Order Ahead pausado</p>
              <p className="text-xs text-red-600">Los clientes ven un mensaje automático de pausa</p>
            </div>
          </div>
          <button onClick={() => setIsPaused(false)} className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Reanudar
          </button>
        </div>
      )}
      {/* Master toggle + delivery type */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Order Ahead</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isActive ? 'Los clientes pueden realizar pedidos anticipados' : 'Los clientes no pueden realizar pedidos anticipados'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {isActive ? '● ACTIVO' : '○ INACTIVO'}
            </span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isActive ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {!isActive && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <Icon name="Info" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">Los clientes verán: "Este negocio no acepta pedidos anticipados por el momento"</p>
          </div>
        )}

        {/* Delivery type */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tipo de entrega</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 border-2 border-primary bg-primary/5 rounded-xl cursor-pointer">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Store" size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Retiro en negocio</p>
                <p className="text-xs text-primary">Activo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border border-border/50 bg-muted/20 rounded-xl opacity-60 cursor-not-allowed">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Icon name="Truck" size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entrega a domicilio</p>
                <span className="text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Próximamente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency pause */}
        {isActive && !isPaused && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Pausa de emergencia</p>
                <p className="text-xs text-muted-foreground">Pausa temporalmente Order Ahead con mensaje automático al cliente</p>
              </div>
              <button onClick={() => setShowPauseModal(true)} className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">
                <Icon name="PauseCircle" size={16} />
                Pausar
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Anticipation rules */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Reglas de anticipación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Tiempo mínimo de anticipación</label>
            <select value={minAdvance} onChange={e => setMinAdvance(e?.target?.value)}
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground">
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="120">2 horas</option>
              <option value="1440">1 día</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Horizonte máximo de reserva</label>
            <select value={maxHorizon} onChange={e => setMaxHorizon(e?.target?.value)}
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground">
              <option value="0">Solo hoy</option>
              <option value="3">Hasta 3 días</option>
              <option value="7">Hasta 7 días</option>
              <option value="30">Hasta 30 días</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <div>
            <p className="text-sm font-medium text-foreground">Aceptar pedidos para días futuros</p>
            <p className="text-xs text-muted-foreground">Si está desactivado, solo acepta pedidos para hoy</p>
          </div>
          <button onClick={() => setAcceptFutureDays(!acceptFutureDays)}
            className={`relative w-10 h-5 rounded-full transition-colors ${acceptFutureDays ? 'bg-primary' : 'bg-slate-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${acceptFutureDays ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
      {/* Slot configurator */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <SlotConfigurator onSave={handleSave} />
      </div>
      {/* Exceptions calendar */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Excepciones y días especiales</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Marca días cerrados o con horario reducido</p>
        </div>
        <ExceptionsCalendar
          exceptions={exceptions}
          onAdd={exc => setExceptions(prev => [...prev, exc])}
          onRemove={date => setExceptions(prev => prev?.filter(e => e?.date !== date))}
        />
      </div>
      {/* Notifications */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Notificaciones al negocio</h3>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <div>
            <p className="text-sm font-medium text-foreground">Push al dueño/staff por pedido nuevo</p>
          </div>
          <button onClick={() => setNotifPush(!notifPush)}
            className={`relative w-10 h-5 rounded-full transition-colors ${notifPush ? 'bg-primary' : 'bg-slate-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${notifPush ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Resumen por email</label>
            <select value={notifEmail} onChange={e => setNotifEmail(e?.target?.value)}
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground">
              <option value="daily">Diario</option>
              <option value="per_order">Por pedido</option>
              <option value="never">Nunca</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">WhatsApp para notificaciones</label>
            <input type="tel" value={notifWhatsapp} onChange={e => setNotifWhatsapp(e?.target?.value)}
              placeholder="+52 55 0000 0000"
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground" />
          </div>
        </div>
      </div>
      {/* Save button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-70 transition-colors">
          {saving ? <Icon name="Loader2" size={18} className="animate-spin" /> : saved ? <Icon name="CheckCircle" size={18} /> : <Icon name="Save" size={18} />}
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </div>
      {/* Pause modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Icon name="PauseCircle" size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pausar Order Ahead</h3>
                <p className="text-xs text-muted-foreground">Los clientes recibirán mensaje automático</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">¿Por cuánto tiempo deseas pausar?</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[30, 60, 120]?.map(min => (
                <button key={min} onClick={() => setPauseDuration(min)}
                  className={`py-2 rounded-xl text-sm font-medium border transition-colors ${pauseDuration === min ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-muted/50'}`}>
                  {min < 60 ? `${min} min` : `${min / 60}h`}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handlePause} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                Pausar {pauseDuration < 60 ? `${pauseDuration} min` : `${pauseDuration / 60}h`}
              </button>
              <button onClick={() => setShowPauseModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderAheadConfiguration;
