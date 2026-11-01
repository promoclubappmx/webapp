import React from 'react';
import Icon from '../../../components/AppIcon';

const SUSTAINABLE_PRACTICES = [
  { key: 'biodegradable', label: 'Materiales biodegradables', icon: '🌿', desc: 'Uso de empaques y materiales biodegradables' },
  { key: 'recycling', label: 'Programa de reciclaje', icon: '♻️', desc: 'Separación y reciclaje de residuos' },
  { key: 'renewable', label: 'Energía renovable', icon: '☀️', desc: 'Uso de energía solar u otras fuentes renovables' },
  { key: 'localProduct', label: 'Producto local', icon: '🏘️', desc: 'Insumos y productos de proveedores locales' },
  { key: 'noPlastic', label: 'Sin plástico de un solo uso', icon: '🚫', desc: 'Eliminación de plásticos desechables' },
  { key: 'waterSaving', label: 'Ahorro de agua', icon: '💧', desc: 'Sistemas de ahorro y reutilización de agua' },
  { key: 'organic', label: 'Productos orgánicos', icon: '🌱', desc: 'Uso de ingredientes o productos orgánicos certificados' },
  { key: 'zeroWaste', label: 'Zero waste', icon: '🌍', desc: 'Política de cero desperdicio' },
];

const SOCIAL_INITIATIVES = [
  { key: 'donations', label: 'Programa de donaciones', icon: '❤️' },
  { key: 'inclusiveEmployment', label: 'Empleo inclusivo', icon: '🤝' },
  { key: 'causeSupport', label: 'Apoyo a causas sociales', icon: '🌟' },
  { key: 'communityPrograms', label: 'Programas comunitarios', icon: '🏘️' },
  { key: 'youthEmployment', label: 'Empleo juvenil', icon: '👥' },
];

const INCLUSION_BADGES = [
  { key: 'inclusive', label: 'Negocio inclusivo', badge: '🤝 Negocio inclusivo', desc: 'Espacio de respeto y bienvenida para todos' },
  { key: 'lgbtq', label: 'Espacio seguro LGBTQ+', badge: '🏳️‍🌈 Espacio seguro LGBTQ+', desc: 'Ambiente de respeto y bienvenida para la comunidad LGBTQ+' },
  { key: 'diverseEmployment', label: 'Empleo diverso', badge: '👥 Empleo diverso', desc: 'Equipo con diversidad de género, edad y capacidades' },
  { key: 'womanOwned', label: 'Negocio liderado por mujer', badge: '👩‍💼 Liderado por mujer', desc: 'Negocio fundado o dirigido por mujer' },
  { key: 'indigenous', label: 'Negocio indígena', badge: '🌺 Negocio indígena', desc: 'Negocio de comunidad o emprendimiento indígena' },
  { key: 'disability', label: 'Empleo con discapacidad', badge: '♿ Empleo inclusivo', desc: 'Equipo que incluye personas con discapacidad' },
];

const SustainabilityForm = ({ formData, onChange }) => {
  const sustainablePractices = formData?.sustainablePractices || {};
  const socialInitiatives = formData?.socialInitiatives || {};
  const socialDescription = formData?.socialDescription || '';
  const inclusionBadges = formData?.inclusionBadges || {};

  const activeSustainable = Object.values(sustainablePractices)?.filter(Boolean)?.length;
  const activeInclusion = Object.values(inclusionBadges)?.filter(Boolean)?.length;

  return (
    <div className="space-y-8">
      {/* Prácticas sustentables */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 bg-green-500 rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Prácticas sustentables</h3>
          {activeSustainable > 0 && (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{activeSustainable} activas</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">Filtrables en la app. Los usuarios pueden buscar negocios con prácticas ecológicas.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUSTAINABLE_PRACTICES?.map(practice => (
            <button
              key={practice?.key}
              onClick={() => onChange('sustainablePractices', { ...sustainablePractices, [practice?.key]: !sustainablePractices?.[practice?.key] })}
              className={`flex items-start gap-3 p-3 border rounded-xl text-left transition-all ${
                sustainablePractices?.[practice?.key] ? 'border-green-400 bg-green-50' : 'border-border hover:bg-muted/30'
              }`}
            >
              <span className="text-xl flex-shrink-0">{practice?.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{practice?.label}</p>
                <p className="text-xs text-muted-foreground">{practice?.desc}</p>
              </div>
              {sustainablePractices?.[practice?.key] && <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Responsabilidad social */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 bg-blue-500 rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Responsabilidad social</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Iniciativas: donaciones, empleo inclusivo, apoyo a causas.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {SOCIAL_INITIATIVES?.map(init => (
            <button
              key={init?.key}
              onClick={() => onChange('socialInitiatives', { ...socialInitiatives, [init?.key]: !socialInitiatives?.[init?.key] })}
              className={`flex items-center gap-3 p-3 border rounded-xl text-left transition-all ${
                socialInitiatives?.[init?.key] ? 'border-blue-400 bg-blue-50' : 'border-border hover:bg-muted/30'
              }`}
            >
              <span className="text-xl">{init?.icon}</span>
              <span className="text-sm font-medium text-foreground flex-1">{init?.label}</span>
              {socialInitiatives?.[init?.key] && <Icon name="Check" size={16} className="text-blue-600" />}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Descripción de iniciativas <span className="text-muted-foreground text-xs">(opcional)</span></label>
          <textarea
            rows={3}
            maxLength={300}
            value={socialDescription}
            onChange={e => onChange('socialDescription', e?.target?.value)}
            placeholder="Cuéntanos sobre tus iniciativas de responsabilidad social..."
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{socialDescription?.length}/300</p>
        </div>
      </div>

      {/* Inclusión y diversidad */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 bg-purple-500 rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Inclusión y diversidad</h3>
          {activeInclusion > 0 && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{activeInclusion} badges activos</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">Badges opcionales que se muestran en tu ficha. Completamente voluntarios.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INCLUSION_BADGES?.map(badge => (
            <button
              key={badge?.key}
              onClick={() => onChange('inclusionBadges', { ...inclusionBadges, [badge?.key]: !inclusionBadges?.[badge?.key] })}
              className={`flex items-start gap-3 p-3 border rounded-xl text-left transition-all ${
                inclusionBadges?.[badge?.key] ? 'border-purple-400 bg-purple-50' : 'border-border hover:bg-muted/30'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{badge?.badge}</p>
                <p className="text-xs text-muted-foreground">{badge?.desc}</p>
              </div>
              {inclusionBadges?.[badge?.key] && <Icon name="Check" size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
        {activeInclusion > 0 && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-xs text-purple-700">
              <Icon name="Info" size={14} className="inline mr-1" />
              Estos badges son declarativos. PromoClub puede solicitar verificación en el futuro para mayor credibilidad.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SustainabilityForm;
