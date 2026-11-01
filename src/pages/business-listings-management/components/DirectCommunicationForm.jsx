import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CTA_OPTIONS = [
  { value: 'reserve', label: 'Reservar', icon: 'CalendarCheck', desc: 'Abre el módulo de reservaciones' },
  { value: 'call', label: 'Llamar', icon: 'Phone', desc: 'Llama directamente al negocio' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle', desc: 'Abre chat de WhatsApp' },
  { value: 'quote', label: 'Cotizar', icon: 'Calculator', desc: 'Abre formulario de cotización' },
  { value: 'menu', label: 'Ver menú/catálogo', icon: 'UtensilsCrossed', desc: 'Muestra el menú o catálogo' },
  { value: 'appointment', label: 'Agendar cita', icon: 'Calendar', desc: 'Abre el agendador de citas' },
  { value: 'order', label: 'Ordenar en línea', icon: 'ShoppingCart', desc: 'Abre el módulo de pedidos' },
  { value: 'directions', label: 'Cómo llegar', icon: 'Navigation', desc: 'Abre mapa con indicaciones' },
];

const QUICK_REPLY_TEMPLATES = [
  { key: 'hours', label: 'Horarios', icon: 'Clock', defaultText: 'Nuestros horarios son: Lunes a Viernes de 9am a 9pm, Sábados de 10am a 8pm, Domingos de 11am a 6pm. ¡Te esperamos!' },
  { key: 'location', label: 'Ubicación', icon: 'MapPin', defaultText: 'Estamos ubicados en [dirección]. Puedes encontrarnos fácilmente en Google Maps buscando [nombre del negocio]. ¡Te esperamos!' },
  { key: 'prices', label: 'Precios', icon: 'DollarSign', defaultText: 'Nuestros precios van desde $[X] hasta $[Y] MXN. Para una cotización personalizada, escríbenos o llámanos. ¡Con gusto te atendemos!' },
  { key: 'availability', label: 'Disponibilidad', icon: 'CalendarCheck', defaultText: 'Para verificar disponibilidad, por favor indícanos la fecha y hora que prefieres. Tenemos citas disponibles esta semana. ¡Agendemos!' },
  { key: 'services', label: 'Servicios', icon: 'Briefcase', defaultText: 'Ofrecemos los siguientes servicios: [lista de servicios]. Para más información sobre alguno en particular, con gusto te asesoramos.' },
  { key: 'promotions', label: 'Promociones', icon: 'Tag', defaultText: 'Actualmente tenemos las siguientes promociones activas: [descripción]. Descarga PromoClub para ver todas nuestras ofertas y acumular puntos.' },
];

const DirectCommunicationForm = ({ formData, onChange }) => {
  const [activeSection, setActiveSection] = useState('welcome');
  const [editingTemplate, setEditingTemplate] = useState(null);

  const welcomeEnabled = formData?.welcomeMessageEnabled || false;
  const welcomeMessage = formData?.welcomeMessage || '¡Bienvenido a [nombre del negocio]! 👋 Conoce nuestros servicios, promociones y acumula puntos con cada visita. ¿En qué podemos ayudarte?';
  const primaryCTA = formData?.primaryCTA || 'whatsapp';
  const quickReplies = formData?.quickReplies || {};

  const sections = [
    { id: 'welcome', label: 'Bienvenida', icon: 'MessageSquare' },
    { id: 'cta', label: 'Botón principal', icon: 'MousePointer' },
    { id: 'quickreplies', label: 'Respuestas rápidas', icon: 'Zap' },
  ];

  const selectedCTA = CTA_OPTIONS?.find(c => c?.value === primaryCTA);

  return (
    <div className="space-y-0">
      {/* Sub-nav */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-xl overflow-x-auto">
        {sections?.map(s => (
          <button key={s?.id} onClick={() => setActiveSection(s?.id)}
            className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
              activeSection === s?.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Icon name={s?.icon} size={14} />
            <span className="hidden sm:inline">{s?.label}</span>
          </button>
        ))}
      </div>

      {/* Mensaje de bienvenida */}
      {activeSection === 'welcome' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="text-base font-semibold text-foreground">Mensaje de bienvenida automático</h3>
              </div>
              <button
                onClick={() => onChange('welcomeMessageEnabled', !welcomeEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                  welcomeEnabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  welcomeEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Mensaje pre-configurado que recibe el usuario al abrir tu ficha por primera vez.</p>

            {welcomeEnabled && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-foreground">Mensaje de bienvenida</label>
                    <span className="text-xs text-muted-foreground">{welcomeMessage?.length}/300</span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={300}
                    value={welcomeMessage}
                    onChange={e => onChange('welcomeMessage', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Variables disponibles: [nombre del negocio], [nombre del cliente]</p>
                </div>

                {/* Preview */}
                <div className="border border-border rounded-xl p-4 bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Vista previa en la app:</p>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Building2" size={16} className="text-primary-foreground" />
                    </div>
                    <div className="flex-1 bg-white border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                      <p className="text-xs text-foreground">{welcomeMessage || 'Tu mensaje aparecerá aquí...'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Ahora mismo</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón de acción principal */}
      {activeSection === 'cta' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Botón de acción principal (CTA)</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">El negocio elige cuál es el CTA principal de su ficha. Es el botón más prominente que ven los usuarios.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CTA_OPTIONS?.map(cta => (
                <button
                  key={cta?.value}
                  onClick={() => onChange('primaryCTA', cta?.value)}
                  className={`flex items-center gap-3 p-4 border rounded-xl text-left transition-all ${
                    primaryCTA === cta?.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    primaryCTA === cta?.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon name={cta?.icon} size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{cta?.label}</p>
                    <p className="text-xs text-muted-foreground">{cta?.desc}</p>
                  </div>
                  {primaryCTA === cta?.value && <Icon name="CheckCircle" size={18} className="text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>

            {selectedCTA && (
              <div className="mt-4 border border-border rounded-xl p-4 bg-muted/20">
                <p className="text-xs font-medium text-muted-foreground mb-3">Vista previa del botón en tu ficha:</p>
                <div className="flex items-center justify-center">
                  <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-md">
                    <Icon name={selectedCTA?.icon} size={18} />
                    {selectedCTA?.label}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Respuestas rápidas */}
      {activeSection === 'quickreplies' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Respuestas rápidas pre-configuradas</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Templates de respuesta para chat y WhatsApp. El staff responde con un tap. Personaliza cada mensaje.</p>
            <div className="space-y-4">
              {QUICK_REPLY_TEMPLATES?.map(template => {
                const customText = quickReplies?.[template?.key] || template?.defaultText;
                const isEditing = editingTemplate === template?.key;
                return (
                  <div key={template?.key} className="border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name={template?.icon} size={14} className="text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{template?.label}</span>
                      </div>
                      <button
                        onClick={() => setEditingTemplate(isEditing ? null : template?.key)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        <Icon name={isEditing ? 'Check' : 'Edit2'} size={14} />
                        {isEditing ? 'Listo' : 'Editar'}
                      </button>
                    </div>
                    <div className="px-4 py-3">
                      {isEditing ? (
                        <textarea
                          rows={3}
                          value={customText}
                          onChange={e => onChange('quickReplies', { ...quickReplies, [template?.key]: e?.target?.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{customText}</p>
                      )}
                    </div>
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-xs text-green-600">💬 WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                          <span className="text-xs text-blue-600">📱 Chat in-app</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectCommunicationForm;
