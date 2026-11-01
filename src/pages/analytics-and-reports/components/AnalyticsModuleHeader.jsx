import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AnalyticsModuleHeader = ({ selectedPeriod, onPeriodChange, selectedBranch, onBranchChange }) => {
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const periods = [
    { id: 'today', label: 'Hoy' },
    { id: '7d', label: '7 días' },
    { id: 'month', label: 'Este mes' },
    { id: 'prev_month', label: 'Mes anterior' },
    { id: '3m', label: '3 meses' },
    { id: 'custom', label: 'Personalizado' },
  ];

  const branches = [
    { id: 'all', label: 'Todas las sucursales' },
    { id: 'branch1', label: 'Sucursal Centro' },
    { id: 'branch2', label: 'Sucursal Norte' },
    { id: 'branch3', label: 'Sucursal Sur' },
  ];

  const handlePeriodClick = (id) => {
    onPeriodChange(id);
    if (id === 'custom') setShowDatepicker(true);
    else setShowDatepicker(false);
  };

  const handleExport = () => {
    alert('Generando reporte PDF con todas las métricas del período seleccionado...');
  };

  return (
    <div className="bg-card border-b border-border px-6 py-4 space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Analytics
        </h1>
        <div className="flex items-center gap-3">
          {/* Branch selector */}
          <select
            value={selectedBranch}
            onChange={(e) => onBranchChange(e?.target?.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {branches?.map(b => (
              <option key={b?.id} value={b?.id}>{b?.label}</option>
            ))}
          </select>
          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Download" size={16} />
            Exportar reporte
          </button>
        </div>
      </div>
      {/* Period chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {periods?.map(p => (
          <button
            key={p?.id}
            onClick={() => handlePeriodClick(p?.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedPeriod === p?.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {p?.label}
          </button>
        ))}
        {showDatepicker && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e?.target?.value)}
              className="text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-muted-foreground text-sm">→</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e?.target?.value)}
              className="text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
      </div>
      {/* Timestamp */}
      <p className="text-xs text-muted-foreground">
        Datos actualizados hoy a las 2:14 AM
      </p>
    </div>
  );
};

export default AnalyticsModuleHeader;
