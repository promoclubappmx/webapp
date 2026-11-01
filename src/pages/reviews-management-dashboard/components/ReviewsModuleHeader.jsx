import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const branches = [
  { id: 'all', label: 'Ver todas' },
  { id: 'centro', label: 'Sucursal Centro' },
  { id: 'norte', label: 'Sucursal Norte' },
];

const ReviewsModuleHeader = ({ selectedBranch, onBranchChange }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const currentBranch = branches?.find(b => b?.id === selectedBranch) || branches?.[0];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Reseñas
        </h1>
        {/* Score badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl">
          <span className="text-xl">⭐</span>
          <span className="text-xl font-bold text-amber-700" style={{ fontFamily: 'Outfit, sans-serif' }}>4.7</span>
          <span className="text-sm text-amber-600 font-medium">· 234 reseñas</span>
        </div>
      </div>
      {/* Branch selector */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors min-w-[180px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={15} className="text-muted-foreground" />
            <span>{currentBranch?.label}</span>
          </div>
          <Icon name="ChevronDown" size={15} className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-20 min-w-[200px] overflow-hidden">
            {branches?.map(branch => (
              <button
                key={branch?.id}
                onClick={() => { onBranchChange(branch?.id); setDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                  selectedBranch === branch?.id ? 'text-primary font-medium bg-primary/5' : 'text-foreground'
                }`}
              >
                {selectedBranch === branch?.id && <Icon name="Check" size={14} className="text-primary" />}
                {selectedBranch !== branch?.id && <span className="w-3.5" />}
                {branch?.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsModuleHeader;
