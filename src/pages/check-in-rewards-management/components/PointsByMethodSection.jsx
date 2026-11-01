import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PointsByMethodSection = ({ differentiateByMethod, setDifferentiateByMethod, pointsByMethod, setPointsByMethod }) => {
  const methods = [
    { key: 'qr_static', label: 'QR Estático', confidence: 'high' },
    { key: 'qr_dynamic', label: 'QR Dinámico', confidence: 'high' },
    { key: 'nfc', label: 'NFC / Tap', confidence: 'high' },
    { key: 'beacon', label: 'BLE Beacon', confidence: 'high' },
    { key: 'geofence', label: 'Geofence', confidence: 'medium' },
    { key: 'manual', label: 'Código Manual', confidence: 'manual' },
  ];

  const confidenceBadge = (confidence) => {
    if (confidence === 'high') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Alta confianza</span>;
    if (confidence === 'medium') return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Media confianza</span>;
    return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Verificación humana</span>;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setDifferentiateByMethod(!differentiateByMethod)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">Puntos por método</h3>
          {differentiateByMethod && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">Diferenciado activo</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div
            onClick={e => e?.stopPropagation()}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Diferenciar por método</span>
            <button
              onClick={() => setDifferentiateByMethod(!differentiateByMethod)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                differentiateByMethod ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                differentiateByMethod ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          {differentiateByMethod ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </button>
      {differentiateByMethod && (
        <div className="px-5 pb-5 border-t border-border">
          <p className="text-xs text-muted-foreground mt-3 mb-4">
            Asigna más puntos a los métodos más confiables para incentivar su uso. Los métodos con alta confianza verifican mejor la presencia física.
          </p>
          <div className="space-y-2">
            {methods?.map(method => (
              <div key={method?.key} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{method?.label}</p>
                </div>
                <div className="flex-shrink-0">
                  {confidenceBadge(method?.confidence)}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPointsByMethod(p => ({ ...p, [method?.key]: Math.max(0, (p?.[method?.key] || 0) - 1) }))}
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors text-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={pointsByMethod?.[method?.key] || 0}
                    onChange={e => setPointsByMethod(p => ({ ...p, [method?.key]: parseInt(e?.target?.value) || 0 }))}
                    className="w-14 border border-border rounded-lg px-2 py-1.5 text-sm text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    min={0}
                  />
                  <button
                    onClick={() => setPointsByMethod(p => ({ ...p, [method?.key]: (p?.[method?.key] || 0) + 1 }))}
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 Sugerencia: NFC y QR Dinámico merecen más puntos porque verifican mejor la presencia física del cliente.
          </p>
        </div>
      )}
    </div>
  );
};

export default PointsByMethodSection;
