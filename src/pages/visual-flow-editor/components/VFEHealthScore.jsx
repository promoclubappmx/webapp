import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const VFEHealthScore = ({ score = 72 }) => {
  const [expanded, setExpanded] = useState(false);

  const color = score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  const ringColor = score >= 70 ? 'stroke-emerald-500' : score >= 40 ? 'stroke-amber-500' : 'stroke-red-500';
  const bgColor = score >= 70 ? 'bg-emerald-50 border-emerald-200' : score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference - (score / 100) * circumference;

  const suggestions = [
    { icon: 'TrendingUp', text: 'Tasa de conversión 12% vs benchmark 18%', action: 'Aumentar incentivo paso 1' },
    { icon: 'Bell', text: 'Apertura de push 60% — por encima del promedio', action: null },
    { icon: 'Clock', text: 'Velocidad de conversión: 4.2 días promedio', action: null },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${bgColor} hover:opacity-90`}
        title="Score de salud del flow"
      >
        <svg width="28" height="28" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="22" cy="22" r="18"
            fill="none"
            className={ringColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 22 22)"
          />
          <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="700" className={color} fill="currentColor">{score}</text>
        </svg>
        <span className={`text-xs font-semibold ${color}`}>Salud</span>
        <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={12} className={color} />
      </button>
      {expanded && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl p-4 z-50">
          <div className="flex items-center gap-2 mb-3">
            <svg width="40" height="40" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="22" cy="22" r="18" fill="none" className={ringColor} strokeWidth="4"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap="round" transform="rotate(-90 22 22)" />
              <text x="22" y="27" textAnchor="middle" fontSize="13" fontWeight="800" fill="currentColor" className={color}>{score}</text>
            </svg>
            <div>
              <p className="text-sm font-bold text-foreground">Score de Salud</p>
              <p className="text-xs text-muted-foreground">{score >= 70 ? 'Buen rendimiento' : score >= 40 ? 'Puede mejorar' : 'Necesita atención'}</p>
            </div>
          </div>
          <div className="space-y-2">
            {suggestions?.map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                <Icon name={s?.icon} size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-foreground">{s?.text}</p>
                  {s?.action && <p className="text-xs text-primary font-medium mt-0.5">→ {s?.action}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VFEHealthScore;
