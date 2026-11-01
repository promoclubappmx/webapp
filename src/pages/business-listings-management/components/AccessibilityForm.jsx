import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BASIC_FEATURES = [
  { key: 'ramp', label: 'Acceso sin escalones / rampa de acceso', icon: 'ArrowUpDown', desc: 'El acceso principal no tiene escalones o cuenta con rampa' },
  { key: 'adaptedBathroom', label: 'Baño adaptado para silla de ruedas', icon: 'Accessibility', desc: 'Baño con espacio y barras de apoyo adecuadas' },
  { key: 'brailleMenu', label: 'Menú en braille disponible', icon: 'BookOpen', desc: 'Menú disponible en sistema braille para personas con discapacidad visual' },
  { key: 'accessibleParking', label: 'Estacionamiento accesible', icon: 'ParkingSquare', desc: 'Lugares de estacionamiento reservados y accesibles' },
  { key: 'accessibleTables', label: 'Mesas accesibles', icon: 'Table', desc: 'Altura adecuada para silla de ruedas' },
  { key: 'brailleSignage', label: 'Señalización en alto relieve o braille', icon: 'Navigation', desc: 'Señalización táctil en el local' },
  { key: 'signLanguage', label: 'Personal capacitado en LSM', icon: 'Hand', desc: 'Lengua de Señas Mexicana' },
  { key: 'goodLighting', label: 'Iluminación adecuada', icon: 'Sun', desc: 'Sin destellos, iluminación uniforme' },
  { key: 'quietZone', label: 'Música a volumen moderado / zona silenciosa', icon: 'Volume1', desc: 'Ambiente con nivel de ruido controlado' },
  { key: 'nonSlipFloor', label: 'Piso antideslizante', icon: 'Footprints', desc: 'Superficies seguras para movilidad reducida' },
];

const ASSESSMENT_CATEGORIES = [
  {
    id: 'exterior', label: 'Acceso exterior', icon: 'DoorOpen',
    criteria: [
      { key: 'ext_access_type', label: 'Tipo de acceso (sin escalones, rampa, elevador)', options: ['Sí','Parcial','No'] },
      { key: 'ext_door_width', label: 'Ancho de puerta ≥90cm', options: ['Sí','Parcial','No'] },
      { key: 'ext_levels', label: 'Sin desniveles en la entrada', options: ['Sí','Parcial','No'] },
      { key: 'ext_signage', label: 'Señalización exterior visible', options: ['Sí','Parcial','No'] },
      { key: 'ext_lighting', label: 'Iluminación exterior adecuada', options: ['Sí','Parcial','No'] },
    ]
  },
  {
    id: 'interior', label: 'Interior', icon: 'Home',
    criteria: [
      { key: 'int_corridors', label: 'Pasillos ≥90cm de ancho', options: ['Sí','Parcial','No'] },
      { key: 'int_furniture', label: 'Altura de mobiliario adecuada', options: ['Sí','Parcial','No'] },
      { key: 'int_floor', label: 'Tipo de piso (antideslizante)', options: ['Sí','Parcial','No'] },
      { key: 'int_layout', label: 'Distribución accesible', options: ['Sí','Parcial','No'] },
      { key: 'int_levels', label: 'Sin niveles internos o con elevador', options: ['Sí','Parcial','No'] },
      { key: 'int_elevator', label: 'Elevador si hay más de un piso', options: ['Sí','N/A','No'] },
      { key: 'int_emergency', label: 'Salidas de emergencia accesibles', options: ['Sí','Parcial','No'] },
      { key: 'int_seating', label: 'Asientos con espacio para silla de ruedas', options: ['Sí','Parcial','No'] },
    ]
  },
  {
    id: 'bathrooms', label: 'Baños', icon: 'Accessibility',
    criteria: [
      { key: 'bath_adapted', label: 'Baño adaptado disponible', options: ['Sí','No'] },
      { key: 'bath_bars', label: 'Barras de apoyo', options: ['Sí','Parcial','No'] },
      { key: 'bath_space', label: 'Espacio de maniobra ≥90cm', options: ['Sí','Parcial','No'] },
      { key: 'bath_height', label: 'Altura de sanitarios adecuada', options: ['Sí','Parcial','No'] },
      { key: 'bath_signage', label: 'Señalización accesible', options: ['Sí','Parcial','No'] },
      { key: 'bath_sink', label: 'Lavabo accesible', options: ['Sí','Parcial','No'] },
    ]
  },
  {
    id: 'communication', label: 'Comunicación', icon: 'MessageSquare',
    criteria: [
      { key: 'comm_menu', label: 'Menú accesible (braille, letra grande, digital)', options: ['Sí','Parcial','No'] },
      { key: 'comm_lsm', label: 'Personal con LSM', options: ['Sí','Parcial','No'] },
      { key: 'comm_visual', label: 'Señalización visual/táctil', options: ['Sí','Parcial','No'] },
      { key: 'comm_turns', label: 'Sistema de turnos accesible', options: ['Sí','N/A','No'] },
      { key: 'comm_staff', label: 'Personal capacitado en atención inclusiva', options: ['Sí','Parcial','No'] },
    ]
  },
  {
    id: 'sensory', label: 'Sensorial', icon: 'Eye',
    criteria: [
      { key: 'sens_lighting', label: 'Iluminación sin destellos', options: ['Sí','Parcial','No'] },
      { key: 'sens_noise', label: 'Nivel de ruido moderado', options: ['Sí','Parcial','No'] },
      { key: 'sens_contrast', label: 'Contraste visual adecuado', options: ['Sí','Parcial','No'] },
      { key: 'sens_allergens', label: 'Espacio libre de alérgenos ambientales', options: ['Sí','Parcial','No'] },
    ]
  },
  {
    id: 'policies', label: 'Políticas', icon: 'FileCheck',
    criteria: [
      { key: 'pol_guide_dogs', label: 'Perros guía permitidos', options: ['Sí','No'] },
      { key: 'pol_discount', label: 'Descuento para personas con discapacidad', options: ['Sí','No'] },
      { key: 'pol_emergency', label: 'Protocolo de emergencia accesible', options: ['Sí','Parcial','No'] },
      { key: 'pol_training', label: 'Personal capacitado en accesibilidad', options: ['Sí','Parcial','No'] },
    ]
  },
];

const AccessibilityForm = ({ formData, onChange }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedCat, setExpandedCat] = useState('exterior');

  const features = formData?.accessibilityFeatures || {};
  const guideDogs = formData?.acceptsGuideDogs || false;
  const assessment = formData?.accessibilityAssessment || {};

  const toggleFeature = (key) => {
    onChange('accessibilityFeatures', { ...features, [key]: !features?.[key] });
  };

  const setAssessment = (key, val) => {
    onChange('accessibilityAssessment', { ...assessment, [key]: val });
  };

  // Calculate score
  const allCriteria = ASSESSMENT_CATEGORIES?.flatMap(c => c?.criteria);
  const answered = allCriteria?.filter(c => assessment?.[c?.key]);
  const yesCount = answered?.filter(c => assessment?.[c?.key] === 'Sí')?.length;
  const partialCount = answered?.filter(c => assessment?.[c?.key] === 'Parcial')?.length;
  const totalPossible = allCriteria?.length;
  const score = totalPossible > 0 ? Math.round(((yesCount + partialCount * 0.5) / totalPossible) * 100) : 0;
  const scoreLabel = score >= 80 ? 'Accesibilidad Excelente' : score >= 60 ? 'Accesibilidad Buena' : score >= 40 ? 'Accesibilidad Básica' : 'En progreso';
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-amber-600' : 'text-muted-foreground';

  const tabs = [
    { id: 'basic', label: 'Características básicas', icon: 'Accessibility', color: 'text-rose-700', bg: 'bg-rose-100', activeBg: 'bg-rose-600', hoverBg: 'hover:bg-rose-50' },
    { id: 'guide_dogs', label: 'Perros guía', icon: 'Heart', color: 'text-amber-700', bg: 'bg-amber-100', activeBg: 'bg-amber-600', hoverBg: 'hover:bg-amber-50' },
    { id: 'assessment', label: 'Assessment detallado', icon: 'ClipboardCheck', color: 'text-indigo-700', bg: 'bg-indigo-100', activeBg: 'bg-indigo-600', hoverBg: 'hover:bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-border bg-muted/5 overflow-x-auto">
        <div className="flex items-center gap-2 px-1 py-3 min-w-max">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Sección:</span>
          {tabs?.map(tab => {
            const isActive = activeTab === tab?.id;
            return (
              <button key={tab?.id} onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? `${tab?.activeBg} text-white shadow-md ring-2 ring-offset-1 ring-current`
                    : `${tab?.bg} ${tab?.color} ${tab?.hoverBg} hover:shadow-sm`
                }`}>
                <Icon name={tab?.icon} size={13} className={isActive ? 'text-white' : tab?.color} />
                {tab?.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Basic features */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Marca las características de accesibilidad que ofrece tu local. Se mostrarán en tu ficha y permitirán a los usuarios filtrar negocios accesibles.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BASIC_FEATURES?.map(feat => (
              <button
                key={feat?.key}
                onClick={() => toggleFeature(feat?.key)}
                className={`flex items-start gap-3 p-3 border rounded-xl text-left transition-all ${
                  features?.[feat?.key] ? 'border-rose-500 bg-rose-50' : 'border-border hover:bg-muted/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  features?.[feat?.key] ? 'bg-rose-600 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon name={feat?.icon} size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{feat?.label}</p>
                  <p className="text-xs text-muted-foreground">{feat?.desc}</p>
                </div>
                {features?.[feat?.key] && <Icon name="Check" size={16} className="text-rose-600 flex-shrink-0 mt-1" />}
              </button>
            ))}
          </div>
          {Object.values(features)?.filter(Boolean)?.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
              <p className="text-xs text-foreground">
                <Icon name="CheckCircle" size={14} className="inline mr-1 text-rose-600" />
                Tu negocio tiene <strong>{Object.values(features)?.filter(Boolean)?.length}</strong> característica(s) de accesibilidad declaradas.
              </p>
            </div>
          )}
        </div>
      )}
      {/* Guide dogs */}
      {activeTab === 'guide_dogs' && (
        <div className="space-y-6">
          <div className="border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🐕</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Aceptamos perros guía y animales de asistencia</h3>
                  <p className="text-sm text-muted-foreground">Al activar esto, se muestra un badge "✓" prominente en tu ficha.</p>
                </div>
              </div>
              <button
                onClick={() => onChange('acceptsGuideDogs', !guideDogs)}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  guideDogs ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  guideDogs ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            {guideDogs && (
              <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700 font-medium">✓ Perros guía bienvenidos</p>
              </div>
            )}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Obligación legal en México</p>
              <p className="text-xs text-blue-600">En México, los establecimientos están obligados a permitir el acceso de perros guía (Ley General de Personas con Discapacidad). Declararlo aquí genera confianza en tus clientes.</p>
            </div>
          </div>
        </div>
      )}
      {/* Assessment */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          {/* Score */}
          <div className="border border-border rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                    strokeDasharray={`${score} ${100 - score}`}
                    strokeLinecap="round"
                    className={scoreColor}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${scoreColor}`}>{score}%</span>
                </div>
              </div>
              <div>
                <p className={`text-lg font-bold ${scoreColor}`}>{scoreLabel}</p>
                <p className="text-sm text-muted-foreground">{answered?.length} de {totalPossible} criterios respondidos</p>
                <p className="text-xs text-muted-foreground mt-1">{yesCount} Sí · {partialCount} Parcial · {answered?.length - yesCount - partialCount} No</p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            {ASSESSMENT_CATEGORIES?.map(cat => {
              const catAnswered = cat?.criteria?.filter(c => assessment?.[c?.key]);
              const catYes = catAnswered?.filter(c => assessment?.[c?.key] === 'Sí')?.length;
              const catScore = cat?.criteria?.length > 0 ? Math.round((catYes / cat?.criteria?.length) * 100) : 0;
              return (
                <div key={cat?.id} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedCat(expandedCat === cat?.id ? null : cat?.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon name={cat?.icon} size={18} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{cat?.label}</span>
                      <span className="text-xs text-muted-foreground">({catAnswered?.length}/{cat?.criteria?.length})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${catScore}%` }} />
                      </div>
                      <Icon name={expandedCat === cat?.id ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
                    </div>
                  </button>
                  {expandedCat === cat?.id && (
                    <div className="border-t border-border divide-y divide-border">
                      {cat?.criteria?.map(criterion => (
                        <div key={criterion?.key} className="px-4 py-3 flex items-center justify-between gap-4">
                          <p className="text-sm text-foreground flex-1">{criterion?.label}</p>
                          <div className="flex gap-2">
                            {criterion?.options?.map(opt => (
                              <button
                                key={opt}
                                onClick={() => setAssessment(criterion?.key, opt)}
                                className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                                  assessment?.[criterion?.key] === opt
                                    ? opt === 'Sí' ? 'bg-green-100 border-green-300 text-green-700'
                                    : opt === 'Parcial'? 'bg-amber-100 border-amber-300 text-amber-700' :'bg-red-100 border-red-300 text-red-700' :'border-border text-muted-foreground hover:bg-muted'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityForm;
