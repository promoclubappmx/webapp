import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DateRangePicker = ({ onDateRangeChange, selectedRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const presetRanges = [
    { label: 'Últimos 7 días', value: '7d' },
    { label: 'Últimos 30 días', value: '30d' },
    { label: 'Últimos 3 meses', value: '3m' },
    { label: 'Último año', value: '1y' },
    { label: 'Personalizado', value: 'custom' }
  ];

  const handleRangeSelect = (range) => {
    if (range?.value === 'custom') {
      return;
    }
    onDateRangeChange(range);
    setIsOpen(false);
  };

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      onDateRangeChange({
        label: `${customStart} - ${customEnd}`,
        value: 'custom',
        start: customStart,
        end: customEnd
      });
      setIsOpen(false);
    }
  };

  const getCurrentLabel = () => {
    const current = presetRanges?.find(range => range?.value === selectedRange?.value);
    return current?.label || selectedRange?.label || 'Seleccionar período';
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        iconName="Calendar"
        iconPosition="left"
        className="min-w-48"
      >
        {getCurrentLabel()}
        <Icon name="ChevronDown" size={16} className="ml-2" />
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-20">
            <div className="p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Seleccionar período</h4>
              
              <div className="space-y-2 mb-4">
                {presetRanges?.map((range) => (
                  <button
                    key={range?.value}
                    onClick={() => handleRangeSelect(range)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange?.value === range?.value
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {range?.label}
                  </button>
                ))}
              </div>

              {selectedRange?.value === 'custom' && (
                <div className="border-t border-border pt-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Fecha inicio
                      </label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e?.target?.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Fecha fin
                      </label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e?.target?.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <Button
                      onClick={handleCustomRange}
                      disabled={!customStart || !customEnd}
                      className="w-full"
                      size="sm"
                    >
                      Aplicar rango personalizado
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangePicker;