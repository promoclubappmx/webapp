import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const METHODS = [
  { id: 'qr', label: 'QR en Mostrador', icon: 'QrCode', color: 'text-blue-600' },
  { id: 'geofence', label: 'Geofence Automático', icon: 'MapPin', color: 'text-emerald-600' },
  { id: 'manual', label: 'Código Manual', icon: 'Keyboard', color: 'text-violet-600' },
  { id: 'nfc', label: 'NFC / Tap', icon: 'Wifi', color: 'text-orange-600' },
  { id: 'beacon', label: 'BLE Beacon', icon: 'Radio', color: 'text-pink-600' },
];

const MethodRulesSection = ({ enabled, setEnabled }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">Reglas por método</h3>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Avanzado</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e?.stopPropagation(); setEnabled(!enabled); }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5">
          {!enabled ? (
            <p className="text-sm text-muted-foreground">Activa esta opción para configurar reglas de frecuencia diferentes por método de check-in.</p>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-3">Configura reglas individuales por método. Por default heredan la regla global.</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Método</th>
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Regla de frecuencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {METHODS?.map(m => (
                    <tr key={m?.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Icon name={m?.icon} size={15} className={m?.color} />
                          <span className="text-sm text-foreground">{m?.label}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <select className="border border-border rounded-lg px-2 py-1 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option>Hereda regla global</option>
                          <option>1 vez al día</option>
                          <option>Cada 4 horas</option>
                          <option>Hasta 2 veces al día</option>
                          <option>Sin límite</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MethodRulesSection;
