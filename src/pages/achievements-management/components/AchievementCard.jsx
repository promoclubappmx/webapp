import React from 'react';
import Icon from '../../../components/AppIcon';

const RARITY_CONFIG = {
  comun: {
    label: 'Común',
    color: '#6B7280',
    glow: null,
    ring: false,
    particles: false,
    bg: 'rgba(107,114,128,0.1)',
    border: 'rgba(107,114,128,0.25)',
    textClass: 'text-gray-500',
    bgClass: 'bg-gray-100',
  },
  raro: {
    label: 'Raro',
    color: '#0891B2',
    glow: '0 0 12px rgba(8,145,178,0.3)',
    ring: false,
    particles: false,
    bg: 'rgba(8,145,178,0.1)',
    border: 'rgba(8,145,178,0.3)',
    textClass: 'text-cyan-600',
    bgClass: 'bg-cyan-50',
  },
  epico: {
    label: 'Épico',
    color: '#7C3AED',
    glow: '0 0 16px rgba(124,58,237,0.35)',
    ring: true,
    particles: false,
    bg: 'rgba(124,58,237,0.12)',
    border: 'rgba(124,58,237,0.35)',
    textClass: 'text-purple-600',
    bgClass: 'bg-purple-50',
  },
  legendario: {
    label: 'Legendario',
    color: '#D4A853',
    glow: '0 0 20px rgba(212,168,83,0.4)',
    ring: true,
    particles: true,
    bg: 'rgba(212,168,83,0.12)',
    border: 'rgba(212,168,83,0.4)',
    textClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
  },
  unico: {
    label: 'Único',
    color: '#BE185D',
    glow: '0 0 20px rgba(190,24,93,0.35)',
    ring: true,
    particles: false,
    bg: 'rgba(190,24,93,0.12)',
    border: 'rgba(190,24,93,0.35)',
    textClass: 'text-pink-700',
    bgClass: 'bg-pink-50',
  },
};

const Toggle = ({ value, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!value)}
    disabled={disabled}
    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-muted'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className="absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-all"
      style={{ left: value ? '20px' : '2px', top: '3px', transition: 'left 0.2s' }}
    />
  </button>
);

const AchievementBadge = ({ emoji, color, rarity, size = 54 }) => {
  const cfg = RARITY_CONFIG?.[rarity] || RARITY_CONFIG?.comun;
  const innerSize = size;
  const ringSize = size + 8;

  return (
    <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
      {/* Outer ring for Épico+ */}
      {cfg?.ring && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1.5px solid ${cfg?.color}`,
            opacity: 0.6,
            borderRadius: '50%',
          }}
        />
      )}
      {/* Particles for Legendario */}
      {cfg?.particles && (
        <>
          {[0, 60, 120, 180, 240, 300]?.map((deg) => (
            <div
              key={deg}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: cfg?.color,
                opacity: 0.7,
                top: '50%',
                left: '50%',
                transform: `rotate(${deg}deg) translateX(${ringSize / 2 + 2}px) translateY(-50%)`,
              }}
            />
          ))}
        </>
      )}
      {/* Main badge */}
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: innerSize,
          height: innerSize,
          top: (ringSize - innerSize) / 2,
          left: (ringSize - innerSize) / 2,
          background: `radial-gradient(circle, ${cfg?.color}59 0%, ${cfg?.color}26 60%, ${cfg?.color}14 100%)`,
          border: `1.5px solid ${cfg?.border}`,
          boxShadow: cfg?.glow || 'none',
        }}
      >
        <span style={{ fontSize: 26 }}>{emoji}</span>
      </div>
    </div>
  );
};

const RarityPill = ({ rarity }) => {
  const cfg = RARITY_CONFIG?.[rarity] || RARITY_CONFIG?.comun;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg?.bgClass} ${cfg?.textClass}`}
      style={{ border: `1px solid ${cfg?.border}` }}
    >
      {rarity === 'unico' ? 'ÚNICO' : cfg?.label}
    </span>
  );
};

const AchievementCard = ({ achievement, onToggle, onEdit }) => {
  const {
    id,
    name,
    emoji,
    color,
    rarity,
    description_locked,
    condition_type,
    condition_value,
    reward_points,
    is_active,
    is_deletable,
    is_closed,
    founder_quota,
    founder_granted,
    early_adopter_deadline,
    // mock stats
    clients_count = 0,
    clients_near = 0,
  } = achievement;

  const cfg = RARITY_CONFIG?.[rarity] || RARITY_CONFIG?.comun;
  const isClosed = is_closed || (founder_quota && founder_granted >= founder_quota) ||
    (early_adopter_deadline && new Date(early_adopter_deadline) < new Date());

  const cardStyle = is_active && !isClosed
    ? { border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
    : isClosed
    ? { border: '1px solid #FCA5A5', opacity: 0.55 }
    : { border: '1px dashed var(--border)', opacity: 0.55 };

  return (
    <div
      className="bg-card rounded-xl p-3 flex items-center gap-3 transition-all"
      style={cardStyle}
    >
      {/* Badge */}
      <AchievementBadge emoji={emoji} color={color} rarity={rarity} size={54} />
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-sm font-bold truncate ${cfg?.textClass}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
            {name}
          </span>
          {isClosed && (
            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full border border-red-200">
              Cerrado
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {description_locked}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <RarityPill rarity={rarity} />
          {condition_type && (
            <span className="text-xs text-muted-foreground">
              {condition_type === 'visitas' && `${condition_value} visitas`}
              {condition_type === 'gasto' && `$${condition_value?.toLocaleString()} MXN`}
              {condition_type === 'dias' && `${condition_value} días`}
              {condition_type === 'referidos' && `${condition_value} referidos`}
              {condition_type === 'resenas' && `${condition_value} reseñas`}
              {condition_type === 'punch_cards' && `${condition_value} punch cards`}
              {condition_type === 'especial' && 'Condición especial'}
              {condition_type === 'manual' && 'Manual'}
            </span>
          )}
          {reward_points > 0 && (
            <span className="text-xs font-semibold text-amber-600">+{reward_points} pts</span>
          )}
        </div>
        {/* Stats row */}
        <div className="flex items-center gap-3 mt-1.5">
          {clients_count > 0 && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Icon name="Users" size={11} />
              {clients_count} lo tienen
            </span>
          )}
          {clients_near > 0 && (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <Icon name="Target" size={11} />
              {clients_near} cerca
            </span>
          )}
          {rarity === 'unico' && founder_quota && (
            <span className="text-xs text-pink-600 font-medium">
              {founder_granted}/{founder_quota} otorgados
            </span>
          )}
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <Toggle
          value={is_active}
          onChange={(v) => onToggle(id, v)}
          disabled={!is_deletable}
        />
        <button
          onClick={() => onEdit(achievement)}
          className="px-2.5 py-1 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  );
};

export { AchievementBadge, RarityPill, RARITY_CONFIG, Toggle };
export default AchievementCard;
