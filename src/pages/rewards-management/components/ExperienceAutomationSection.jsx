import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { POINTS_RULES, pointsToMXN } from '../../../services/rewardsService';

const Toggle = ({ value, onChange, label, description }) => (
  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        value ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
        value ? 'translate-x-5' : 'translate-x-0.5'
      }`} />
    </button>
  </div>
);

const ExperienceAutomationSection = ({ automation, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const set = (k, v) => onChange({ ...automation, [k]: v });

  const activeCount = [
    automation?.sendConfirmation,
    automation?.requestReview,
    automation?.bonusPoints,
    automation?.specialReferral,
  ]?.filter(Boolean)?.length;

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/5 to-transparent hover:from-purple-500/10 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <span className="text-base">⚡</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground text-sm">Después de reclamar...</p>
            <p className="text-xs text-muted-foreground">
              {activeCount > 0 ? `${activeCount} acción${activeCount > 1 ? 'es' : ''} configurada${activeCount > 1 ? 's' : ''}` : 'Configura acciones post-reclamación'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 text-xs font-medium rounded-full border border-purple-500/20">
              {activeCount} activa{activeCount > 1 ? 's' : ''}
            </span>
          )}
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-border bg-muted/10">
          {/* Send confirmation */}
          <div className="space-y-3">
            <Toggle
              value={automation?.sendConfirmation || false}
              onChange={v => set('sendConfirmation', v)}
              label="Enviar confirmación y detalles"
              description="Mensaje de confirmación inmediato al reclamar"
            />
            {automation?.sendConfirmation && (
              <div className="ml-4 p-3 bg-card border border-border rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Canal</label>
                  <select
                    value={automation?.confirmationChannel || 'push'}
                    onChange={e => set('confirmationChannel', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  >
                    <option value="push">Push notification</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Mensaje de confirmación
                    <span className="ml-2 text-muted-foreground font-normal">({'{nombre}'} {'{experiencia}'} {'{fecha}'})</span>
                  </label>
                  <textarea
                    value={automation?.confirmationMessage || ''}
                    onChange={e => set('confirmationMessage', e?.target?.value)}
                    placeholder="¡Hola {nombre}! Tu experiencia {experiencia} ha sido confirmada. Te esperamos el {fecha}."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Request review */}
          <div className="space-y-3">
            <Toggle
              value={automation?.requestReview || false}
              onChange={v => set('requestReview', v)}
              label="Solicitar reseña 24h después"
              description="Encuesta post-experiencia para medir satisfacción"
            />
            {automation?.requestReview && (
              <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                <label className="block text-xs font-medium text-foreground mb-1">Mensaje de encuesta</label>
                <textarea
                  value={automation?.reviewMessage || ''}
                  onChange={e => set('reviewMessage', e?.target?.value)}
                  placeholder="¿Cómo fue tu experiencia? Tu opinión nos ayuda a mejorar. (1-5 estrellas)"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">Se enviará automáticamente 24 horas después</p>
              </div>
            )}
          </div>

          {/* Bonus points */}
          <div className="space-y-3">
            <Toggle
              value={automation?.bonusPoints || false}
              onChange={v => set('bonusPoints', v)}
              label="Acreditar puntos bonus post-experiencia"
              description="Puntos adicionales por vivir la experiencia"
            />
            {automation?.bonusPoints && (
              <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                <label className="block text-xs font-medium text-foreground mb-1">Puntos bonus</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="1"
                    value={automation?.bonusPointsAmount || ''}
                    onChange={e => set('bonusPointsAmount', parseInt(e?.target?.value))}
                    placeholder="100"
                    className="w-28 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  />
                  <span className="text-xs text-muted-foreground">puntos</span>
                  {automation?.bonusPointsAmount > 0 && (
                    <span className="text-sm font-semibold text-success">= ${pointsToMXN(automation?.bonusPointsAmount)} MXN</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">1 pto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</p>
              </div>
            )}
          </div>

          {/* Special referral */}
          <Toggle
            value={automation?.specialReferral || false}
            onChange={v => set('specialReferral', v)}
            label="Activar referral especial"
            description="El cliente puede referir con beneficio mejorado después de vivir la experiencia"
          />
        </div>
      )}
    </div>
  );
};

export default ExperienceAutomationSection;
