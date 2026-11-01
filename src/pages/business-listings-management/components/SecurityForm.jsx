import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

// ─── SECURITY CATEGORIES ────────────────────────────────────────────────────

const SECURITY_ESTABLECIMIENTO = {
  id: 'establecimiento',
  label: 'Seguridad del Establecimiento',
  icon: 'Shield',
  color: 'text-blue-900',
  bg: 'bg-blue-50',
  border: 'border-blue-200',
  activeBg: 'bg-blue-900',
  activeText: 'text-blue-900',
  items: [
    { key: 'sec_cameras', label: 'Cámaras de seguridad', icon: 'Camera' },
    { key: 'sec_surveillance24', label: 'Vigilancia 24 horas', icon: 'Eye' },
    { key: 'sec_securityStaff', label: 'Personal de seguridad', icon: 'UserCheck' },
    { key: 'sec_accessControl', label: 'Control de acceso', icon: 'Lock' },
    { key: 'sec_reception', label: 'Recepción o check-in', icon: 'ClipboardCheck' },
    { key: 'sec_remoteMonitoring', label: 'Monitoreo remoto', icon: 'Monitor' },
    { key: 'sec_wellLitZone', label: 'Zona bien iluminada', icon: 'Sun' },
    { key: 'sec_exteriorLighting', label: 'Iluminación exterior', icon: 'Lightbulb' },
    { key: 'sec_emergencyButton', label: 'Botón de emergencia', icon: 'AlertCircle' },
    { key: 'sec_alarms', label: 'Alarmas de seguridad', icon: 'Bell' },
  ],
};

const SECURITY_EMERGENCIAS = {
  id: 'emergencias',
  label: 'Seguridad contra Emergencias',
  icon: 'Flame',
  color: 'text-red-700',
  bg: 'bg-red-50',
  border: 'border-red-200',
  activeBg: 'bg-red-700',
  activeText: 'text-red-700',
  items: [
    { key: 'sec_smokeDetectors', label: 'Detectores de humo', icon: 'Wind' },
    { key: 'sec_fireExtinguishers', label: 'Extintores', icon: 'Flame' },
    { key: 'sec_evacuationRoutes', label: 'Rutas de evacuación', icon: 'Navigation' },
    { key: 'sec_emergencySignage', label: 'Señalización de emergencia', icon: 'AlertTriangle' },
    { key: 'sec_trainedEmergencyStaff', label: 'Personal capacitado en emergencias', icon: 'UserCheck' },
    { key: 'sec_firstAidKit', label: 'Kit de primeros auxilios', icon: 'Heart' },
    { key: 'sec_fireSystem', label: 'Sistema contra incendios', icon: 'Droplets' },
  ],
};

const SECURITY_SANITARIA = {
  id: 'sanitaria',
  label: 'Seguridad Sanitaria',
  icon: 'Stethoscope',
  color: 'text-emerald-700',
  bg: 'bg-emerald-50',
  border: 'border-emerald-200',
  activeBg: 'bg-emerald-700',
  activeText: 'text-emerald-700',
  items: [
    { key: 'sec_hygieneProtocols', label: 'Protocolos de higiene', icon: 'ClipboardCheck' },
    { key: 'sec_frequentSanitization', label: 'Sanitización frecuente', icon: 'Sparkles' },
    { key: 'sec_sanitaryCertifications', label: 'Certificaciones sanitarias', icon: 'Award' },
    { key: 'sec_capacityControl', label: 'Control de aforo', icon: 'Users' },
    { key: 'sec_adequateVentilation', label: 'Ventilación adecuada', icon: 'Wind' },
    { key: 'sec_handwashingArea', label: 'Área de lavado de manos', icon: 'Droplets' },
  ],
};

const SECURITY_CLIENTE = {
  id: 'cliente',
  label: 'Seguridad del Cliente',
  icon: 'UserShield',
  color: 'text-violet-700',
  bg: 'bg-violet-50',
  border: 'border-violet-200',
  activeBg: 'bg-violet-700',
  activeText: 'text-violet-700',
  items: [
    { key: 'sec_kidsArea', label: 'Área segura para niños', icon: 'Baby' },
    { key: 'sec_trainedStaff', label: 'Personal capacitado', icon: 'GraduationCap' },
    { key: 'sec_incidentProtocols', label: 'Protocolos de atención a incidentes', icon: 'FileText' },
    { key: 'sec_monitoredSpace', label: 'Espacio monitoreado', icon: 'Eye' },
    { key: 'sec_nearbyMedical', label: 'Atención médica cercana', icon: 'Cross' },
  ],
};

const ALL_SECTIONS = [SECURITY_ESTABLECIMIENTO, SECURITY_EMERGENCIAS, SECURITY_SANITARIA, SECURITY_CLIENTE];

// ─── BADGE RULES ─────────────────────────────────────────────────────────────

const BADGE_RULES = [
  {
    id: 'safe_space',
    label: '🛡 Espacio seguro',
    description: 'Cámaras + Vigilancia + Iluminación',
    requiredKeys: ['sec_cameras', 'sec_surveillance24', 'sec_wellLitZone'],
  },
  {
    id: 'active_surveillance',
    label: '🛡 Vigilancia activa',
    description: 'Cámaras + Personal de seguridad + Monitoreo remoto',
    requiredKeys: ['sec_cameras', 'sec_securityStaff', 'sec_remoteMonitoring'],
  },
  {
    id: 'fire_safety',
    label: '🛡 Seguridad contra incendios',
    description: 'Extintores + Detectores de humo + Sistema contra incendios',
    requiredKeys: ['sec_fireExtinguishers', 'sec_smokeDetectors', 'sec_fireSystem'],
  },
  {
    id: 'certified_hygiene',
    label: '🛡 Higiene certificada',
    description: 'Certificaciones sanitarias + Protocolos de higiene + Sanitización frecuente',
    requiredKeys: ['sec_sanitaryCertifications', 'sec_hygieneProtocols', 'sec_frequentSanitization'],
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const SecurityForm = ({ formData, onChange }) => {
  const [activeSection, setActiveSection] = useState('establecimiento');

  const securityFeatures = formData?.securityFeatures || {};

  const handleToggle = (key) => {
    const updated = { ...securityFeatures, [key]: !securityFeatures?.[key] };
    onChange('securityFeatures', updated);
  };

  const getSectionCount = (section) =>
    section?.items?.filter((item) => securityFeatures?.[item?.key])?.length || 0;

  const getTotalCount = () =>
    ALL_SECTIONS?.reduce((acc, s) => acc + getSectionCount(s), 0);

  const getEarnedBadges = () =>
    BADGE_RULES?.filter((badge) =>
      badge?.requiredKeys?.every((k) => securityFeatures?.[k])
    );

  const earnedBadges = getEarnedBadges();
  const totalCount = getTotalCount();
  const activeData = ALL_SECTIONS?.find((s) => s?.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Icon name="ShieldCheck" size={20} className="text-blue-900" />
            Seguridad
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registra las características de seguridad de tu establecimiento para generar confianza en los usuarios.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
          <Icon name="Shield" size={14} className="text-blue-900" />
          <span className="text-sm font-semibold text-blue-900">{totalCount} seleccionadas</span>
        </div>
      </div>
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {ALL_SECTIONS?.map((section) => {
          const count = getSectionCount(section);
          const isActive = activeSection === section?.id;
          return (
            <button
              key={section?.id}
              onClick={() => setActiveSection(section?.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? `${section?.activeBg} text-white shadow-sm`
                  : `${section?.bg} ${section?.color} hover:opacity-80`
              }`}
            >
              <Icon name={section?.icon} size={13} className={isActive ? 'text-white' : section?.color} />
              {section?.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white text-current'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Active section content — amenities-style cards (no checkbox) */}
      {activeData && (
        <div className={`border ${activeData?.border} rounded-2xl overflow-hidden`}>
          {/* Section header */}
          <div className={`${activeData?.bg} px-5 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Icon name={activeData?.icon} size={16} className={activeData?.color} />
              <span className={`text-sm font-semibold ${activeData?.color}`}>{activeData?.label}</span>
            </div>
            <span className={`text-xs font-medium ${activeData?.color}`}>
              {getSectionCount(activeData)} / {activeData?.items?.length} seleccionadas
            </span>
          </div>

          {/* Items grid — card style like AmenitiesForm, no checkbox */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeData?.items?.map((item) => {
              const isSelected = !!securityFeatures?.[item?.key];
              return (
                <button
                  key={item?.key}
                  type="button"
                  onClick={() => handleToggle(item?.key)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none text-left w-full ${
                    isSelected
                      ? `${activeData?.bg} ${activeData?.border} shadow-sm`
                      : 'border-border bg-card hover:bg-muted/30 hover:border-muted-foreground/30'
                  }`}
                >
                  {/* Icon badge */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? `${activeData?.activeBg}` : 'bg-muted/50'
                  }`}>
                    <Icon name={item?.icon} size={16} className={isSelected ? 'text-white' : 'text-muted-foreground'} />
                  </div>
                  <span className={`text-sm font-medium leading-tight flex-1 ${isSelected ? activeData?.activeText : 'text-foreground'}`}>
                    {item?.label}
                  </span>
                  {isSelected && (
                    <div className={`w-5 h-5 rounded-full ${activeData?.activeBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon name="Check" size={11} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Badges panel */}
      <div className="border border-border rounded-2xl overflow-hidden">
        <div className="bg-muted/20 px-5 py-3 flex items-center gap-2 border-b border-border">
          <Icon name="Award" size={16} className="text-blue-900" />
          <span className="text-sm font-semibold text-foreground">Badges de seguridad</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {earnedBadges?.length} / {BADGE_RULES?.length} obtenidos
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BADGE_RULES?.map((badge) => {
            const earned = badge?.requiredKeys?.every((k) => securityFeatures?.[k]);
            return (
              <div
                key={badge?.id}
                className={`p-3.5 rounded-xl border-2 transition-all ${
                  earned
                    ? 'border-blue-300 bg-blue-50 shadow-sm'
                    : 'border-border bg-card opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{badge?.label}</span>
                  {earned && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                      <Icon name="CheckCircle" size={11} /> Obtenido
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{badge?.description}</p>
                {!earned && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {badge?.requiredKeys?.map(k => {
                      const hasIt = !!securityFeatures?.[k];
                      return (
                        <span key={k} className={`text-xs px-1.5 py-0.5 rounded-full ${hasIt ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                          {hasIt ? '✓' : '○'} {k?.replace('sec_', '')}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecurityForm;
