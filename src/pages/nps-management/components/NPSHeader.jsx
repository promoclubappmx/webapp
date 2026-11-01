import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const NPSHeader = ({ score, totalResponses, branch, setBranch }) => {
  const branches = ['Todas las sucursales', 'Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur'];

  const getScoreStyle = (s) => {
    if (s <= 6) return { color: '#EF4444', label: 'Detractores dominan', bg: 'bg-red-50 border-red-200' };
    if (s <= 8) return { color: '#F59E0B', label: 'Neutros dominan', bg: 'bg-amber-50 border-amber-200' };
    return { color: '#10B981', label: 'Promotores dominan', bg: 'bg-emerald-50 border-emerald-200' };
  };

  const style = getScoreStyle(score);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            NPS · Net Promoter Score
          </h1>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80"
            >
              <Icon name="HelpCircle" size={14} />
            </button>
            {showTooltip && (
              <div className="absolute left-6 top-0 z-10 w-64 p-3 bg-card border border-border rounded-xl shadow-lg text-xs text-muted-foreground">
                El NPS mide qué tan probable es que tus clientes te recomienden a alguien. Es el estándar mundial de lealtad de clientes.
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Monitorea y gestiona la lealtad de tus clientes en tiempo real.
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          % Promotores (9-10) − % Detractores (0-6) = NPS
        </p>
      </div>
      <div className="flex items-center gap-4">
        {/* Score badge */}
        <div className={`flex flex-col items-center px-6 py-4 rounded-2xl border-2 ${style?.bg}`}>
          <span
            className="font-bold leading-none"
            style={{ fontSize: 48, fontFamily: 'Outfit, sans-serif', color: style?.color }}
          >
            {score}
          </span>
          <span className="text-xs font-medium mt-1" style={{ color: style?.color }}>{style?.label}</span>
          <span className="text-xs text-muted-foreground mt-0.5">{totalResponses} respuestas</span>
        </div>

        {/* Branch selector */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Sucursal</label>
          <select
            value={branch}
            onChange={e => setBranch(e?.target?.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {branches?.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default NPSHeader;
