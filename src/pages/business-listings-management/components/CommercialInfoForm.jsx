import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import SustainabilityForm from './SustainabilityForm';
import CatalogMenuForm from './CatalogMenuForm';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Efectivo', icon: '💵', color: 'text-green-600' },
  { key: 'creditCard', label: 'Tarjeta de crédito', icon: '💳', color: 'text-blue-600' },
  { key: 'debitCard', label: 'Tarjeta de débito', iconSvg: 'debit', color: 'text-indigo-600' },
  { key: 'nfc', label: 'Pago con NFC', icon: '📲', color: 'text-violet-600' },
  { key: 'applePay', label: 'Apple Pay', iconSvg: 'apple', color: 'text-gray-800' },
  { key: 'googlePay', label: 'Google Pay', iconSvg: 'google', color: 'text-blue-500' },
  { key: 'spei', label: 'SPEI', icon: '🏦', color: 'text-purple-600' },
  { key: 'codi', label: 'CoDi', icon: '📱', color: 'text-indigo-600' },
  { key: 'vouchers', label: 'Vales', icon: '🎟️', color: 'text-orange-600' },
  { key: 'crypto', label: 'Criptomonedas', icon: '₿', color: 'text-amber-600' },
];

// SVG icons for payment methods
const PaymentIcon = ({ method }) => {
  if (method?.iconSvg === 'debit') {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="#4F46E5" strokeWidth="1.5" fill="none"/>
        <rect x="2" y="9" width="20" height="3" fill="#4F46E5"/>
        <rect x="5" y="15" width="5" height="1.5" rx="0.75" fill="#4F46E5"/>
        <rect x="12" y="15" width="3" height="1.5" rx="0.75" fill="#4F46E5"/>
      </svg>
    );
  }
  if (method?.iconSvg === 'apple') {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    );
  }
  if (method?.iconSvg === 'google') {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    );
  }
  return <span className="text-2xl">{method?.icon}</span>;
};

const CommercialInfoForm = ({ formData, onChange }) => {
  const [activeSection, setActiveSection] = useState('payments');
  const navigate = useNavigate();

  // Reservation tab state
  const [reservationsEnabled, setReservationsEnabled] = useState(formData?.reservationsEnabled || false);
  const [agendas, setAgendas] = useState([]);
  const [loadingAgendas, setLoadingAgendas] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const paymentMethods = formData?.paymentMethods || {};
  const priceRange = formData?.priceRange || 2;
  const avgTicket = formData?.avgTicket || '';
  const foundedYear = formData?.foundedYear || '';
  const capacity = formData?.capacity || '';
  const wifiEnabled = formData?.wifiEnabled || false;
  const wifiPassword = formData?.wifiPassword || '';

  const sections = [
    { id: 'payments', label: 'Pagos', icon: 'CreditCard', color: 'text-emerald-700', bg: 'bg-emerald-100', activeBg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-50' },
    { id: 'general', label: 'General', icon: 'Info', color: 'text-blue-700', bg: 'bg-blue-100', activeBg: 'bg-blue-600', hoverBg: 'hover:bg-blue-50' },
    { id: 'catalog', label: 'Catálogo/Menú', icon: 'LayoutList', color: 'text-amber-700', bg: 'bg-amber-100', activeBg: 'bg-amber-600', hoverBg: 'hover:bg-amber-50' },
    { id: 'reservation', label: 'Reservación', icon: 'CalendarCheck', color: 'text-teal-700', bg: 'bg-teal-100', activeBg: 'bg-teal-600', hoverBg: 'hover:bg-teal-50' },
    { id: 'sostenibilidad', label: 'Sostenibilidad', icon: 'Leaf', color: 'text-teal-700', bg: 'bg-teal-100', activeBg: 'bg-teal-600', hoverBg: 'hover:bg-teal-50' },
  ];

  const priceLabels = ['', '$', '$$', '$$$', '$$$$'];
  const priceDescs = ['', 'Económico (< $100)', 'Moderado ($100–$300)', 'Precio medio ($300–$600)', 'Premium (> $600)'];

  const currentYear = new Date()?.getFullYear();
  const yearsInBusiness = foundedYear ? currentYear - parseInt(foundedYear) : null;

  // Load agendas from Supabase when reservation tab is active and enabled
  useEffect(() => {
    if (activeSection === 'reservation' && reservationsEnabled) {
      loadAgendas();
    }
  }, [activeSection, reservationsEnabled]);

  const loadAgendas = async () => {
    setLoadingAgendas(true);
    try {
      const businessId = formData?.businessId || formData?.id;
      let query = supabase?.from('reservation_schedules')?.select('*')?.order('created_at', { ascending: false });
      if (businessId) {
        query = query?.eq('business_id', businessId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setAgendas(data || []);
    } catch (err) {
      console.error('Error loading agendas:', err?.message);
      setAgendas([]);
    } finally {
      setLoadingAgendas(false);
    }
  };

  const handleToggleReservations = (val) => {
    setReservationsEnabled(val);
    onChange('reservationsEnabled', val);
    if (val) loadAgendas();
  };

  const handleToggleAgenda = async (agenda) => {
    setTogglingId(agenda?.id);
    try {
      const newStatus = !agenda?.is_active;
      const { error } = await supabase
        ?.from('reservation_schedules')
        ?.update({ is_active: newStatus })
        ?.eq('id', agenda?.id);
      if (error) throw error;
      setAgendas(prev => prev?.map(a => a?.id === agenda?.id ? { ...a, is_active: newStatus } : a));
    } catch (err) {
      console.error('Error toggling agenda:', err?.message);
    } finally {
      setTogglingId(null);
    }
  };

  const formatDays = (days) => {
    if (!days || !Array.isArray(days) || days?.length === 0) return '—';
    const dayMap = { monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom' };
    return days?.map(d => dayMap?.[d] || d)?.join(', ');
  };

  return (
    <div className="space-y-0">
      {/* Sub-nav */}
      <div className="border-b border-border bg-muted/5 overflow-x-auto mb-6">
        <div className="flex items-center gap-2 px-1 py-3 min-w-max">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Sección:</span>
          {sections?.map(s => {
            const isActive = activeSection === s?.id;
            return (
              <button key={s?.id} onClick={() => setActiveSection(s?.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? `${s?.activeBg} text-white shadow-md ring-2 ring-offset-1 ring-current`
                    : `${s?.bg} ${s?.color} ${s?.hoverBg} hover:shadow-sm`
                }`}
              >
                <Icon name={s?.icon} size={13} className={isActive ? 'text-white' : s?.color} />
                {s?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catálogo/Menú */}
      {activeSection === 'catalog' && (
        <CatalogMenuForm formData={formData} onChange={onChange} />
      )}

      {/* Métodos de pago */}
      {activeSection === 'payments' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Métodos de pago aceptados</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Se mostrarán como íconos en tu ficha y permitirán filtrar en la app.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PAYMENT_METHODS?.map(method => (
                <button
                  key={method?.key}
                  onClick={() => onChange('paymentMethods', { ...paymentMethods, [method?.key]: !paymentMethods?.[method?.key] })}
                  className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all ${
                    paymentMethods?.[method?.key] ? 'border-emerald-500 bg-emerald-50' : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <PaymentIcon method={method} />
                  <span className="text-xs font-medium text-foreground">{method?.label}</span>
                  {paymentMethods?.[method?.key] && (
                    <span className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Icon name="Check" size={10} className="text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
            {Object.values(paymentMethods)?.filter(Boolean)?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Métodos activos:</span>
                {PAYMENT_METHODS?.filter(m => paymentMethods?.[m?.key])?.map(m => (
                  <span key={m?.key} className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{m?.label}</span>
                ))}
              </div>
            )}
          </div>

          {/* Rango de precios */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Rango de precios</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Indica el nivel de precios de tu negocio. Filtrable en la app.</p>
            <div className="flex gap-3 mb-3">
              {[1, 2, 3, 4]?.map(level => (
                <button
                  key={level}
                  onClick={() => onChange('priceRange', level)}
                  className={`flex-1 py-3 border rounded-xl text-center transition-all ${
                    priceRange === level ? 'border-emerald-500 bg-emerald-50' : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <p className={`text-lg font-bold ${ priceRange === level ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {'$'?.repeat(level)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{priceDescs?.[level]}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{priceDescs?.[priceRange]}</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-1">Ticket promedio <span className="text-muted-foreground text-xs">(opcional)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={avgTicket}
                  onChange={e => onChange('avgTicket', e?.target?.value)}
                  placeholder="Ej: 250"
                  className="w-full pl-7 pr-16 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300/30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">MXN</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Gasto promedio por persona o por visita.</p>
            </div>
          </div>
        </div>
      )}

      {/* General: año fundación, capacidad, WiFi — sin Estacionamiento */}
      {activeSection === 'general' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Año de fundación</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Genera confianza mostrando un badge "Desde [año]" en tu ficha.</p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1900"
                max={currentYear}
                value={foundedYear}
                onChange={e => onChange('foundedYear', e?.target?.value)}
                placeholder={`Ej: ${currentYear - 10}`}
                className="w-40 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300/30"
              />
              {foundedYear && yearsInBusiness !== null && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-amber-600 font-bold text-sm">🏆 Desde {foundedYear}</span>
                  <span className="text-xs text-amber-600">({yearsInBusiness} {yearsInBusiness === 1 ? 'año' : 'años'} de experiencia)</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Capacidad del local</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Aforo máximo. Aplica a restaurantes, salones, gimnasios, salones de eventos.</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={e => onChange('capacity', e?.target?.value)}
                placeholder="Ej: 80"
                className="w-32 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300/30"
              />
              <span className="text-sm text-muted-foreground">personas</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="text-base font-semibold text-foreground">WiFi para clientes</h3>
              </div>
              <button
                onClick={() => onChange('wifiEnabled', !wifiEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                  wifiEnabled ? 'bg-emerald-500' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  wifiEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            {wifiEnabled && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Contraseña WiFi</label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={e => onChange('wifiPassword', e?.target?.value)}
                    placeholder="Contraseña del WiFi"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300/30"
                  />
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-700">La contraseña solo es visible para usuarios que hacen check-in en tu negocio. Incentiva las visitas.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reservación — rediseñada */}
      {activeSection === 'reservation' && (
        <div className="space-y-6">
          {/* Toggle principal */}
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Icon name="CalendarCheck" size={18} className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Habilitar reservaciones</p>
                <p className="text-xs text-muted-foreground">Permite que los clientes agenden citas o reservas desde la app</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleReservations(!reservationsEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                reservationsEnabled ? 'bg-teal-500' : 'bg-muted'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                reservationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Contenido cuando está habilitado */}
          {reservationsEnabled && (
            <div className="space-y-5">
              {/* Banner informativo */}
              <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="Info" size={16} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-teal-800 mb-0.5">Configuración de agendas</p>
                  <p className="text-xs text-teal-700 leading-relaxed">
                    Las agendas y horarios de reservación se configuran en el módulo de Reservaciones. Desde aquí puedes ver y administrar las agendas activas.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/reservations-management')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <Icon name="ExternalLink" size={12} />
                  Ir a Reservaciones
                </button>
              </div>

              {/* Sección Agendas activas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-teal-500 rounded-full" />
                    <h3 className="text-base font-semibold text-foreground">Agendas activas</h3>
                  </div>
                  <button
                    onClick={loadAgendas}
                    disabled={loadingAgendas}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50"
                  >
                    <Icon name={loadingAgendas ? 'Loader' : 'RefreshCw'} size={12} className={loadingAgendas ? 'animate-spin' : ''} />
                    Actualizar
                  </button>
                </div>

                {loadingAgendas ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Icon name="Loader" size={20} className="animate-spin mr-2" />
                    <span className="text-sm">Cargando agendas...</span>
                  </div>
                ) : agendas?.length === 0 ? (
                  /* Estado vacío */
                  <div className="flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-border rounded-xl text-center">
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-3">
                      <Icon name="CalendarX" size={22} className="text-teal-400" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">No tienes agendas configuradas</p>
                    <p className="text-xs text-muted-foreground mb-4">Crea una en el módulo de Reservaciones para comenzar a recibir citas.</p>
                    <button
                      onClick={() => navigate('/reservations-management')}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Icon name="Plus" size={14} />
                      Crear agenda en Reservaciones
                    </button>
                  </div>
                ) : (
                  /* Lista de agendas */
                  <div className="space-y-3">
                    {agendas?.map(agenda => (
                      <div
                        key={agenda?.id}
                        className={`flex items-center gap-4 p-4 border rounded-xl transition-all ${
                          agenda?.is_active ? 'border-teal-200 bg-teal-50/40' : 'border-border bg-muted/10'
                        }`}
                      >
                        {/* Status indicator */}
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${agenda?.is_active ? 'bg-teal-500' : 'bg-muted-foreground/40'}`} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground truncate">{agenda?.name || 'Agenda sin nombre'}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              agenda?.is_active ? 'bg-teal-100 text-teal-700' : 'bg-muted text-muted-foreground'
                            }`}>
                              {agenda?.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {(agenda?.start_time || agenda?.end_time) && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Icon name="Clock" size={11} />
                                {agenda?.start_time || '—'} – {agenda?.end_time || '—'}
                              </span>
                            )}
                            {agenda?.days_of_week && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Icon name="Calendar" size={11} />
                                {formatDays(agenda?.days_of_week)}
                              </span>
                            )}
                            {agenda?.slot_duration && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Icon name="Timer" size={11} />
                                {agenda?.slot_duration} min/slot
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Edit button */}
                          <button
                            onClick={() => navigate('/reservations-management')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                          >
                            <Icon name="Pencil" size={12} />
                            Editar
                          </button>
                          {/* Toggle active/inactive */}
                          <button
                            onClick={() => handleToggleAgenda(agenda)}
                            disabled={togglingId === agenda?.id}
                            title={agenda?.is_active ? 'Desactivar agenda' : 'Activar agenda'}
                            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${
                              agenda?.is_active ? 'bg-teal-500' : 'bg-muted'
                            }`}
                          >
                            {togglingId === agenda?.id ? (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Icon name="Loader" size={10} className="animate-spin text-white" />
                              </span>
                            ) : (
                              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                agenda?.is_active ? 'translate-x-5' : 'translate-x-0.5'
                              }`} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sostenibilidad */}
      {activeSection === 'sostenibilidad' && (
        <SustainabilityForm formData={formData} onChange={onChange} />
      )}
    </div>
  );
};

export default CommercialInfoForm;
