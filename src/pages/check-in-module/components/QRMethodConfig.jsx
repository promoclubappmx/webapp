import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const QRMethodConfig = ({ method, onBack }) => {
  const [qrType, setQrType] = useState('static');
  const [rotationInterval, setRotationInterval] = useState(5);
  const [location, setLocation] = useState('mostrador');
  const [tableCount, setTableCount] = useState(10);
  const [requireStaff, setRequireStaff] = useState(false);

  const locationOptions = [
    { value: 'mostrador', label: 'Mostrador / Caja' },
    { value: 'mesas', label: 'Cada mesa (QR único por mesa)' },
    { value: 'entrada', label: 'Entrada del local' },
    { value: 'vitrina', label: 'Display / Poster en vitrina' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Config */}
      <div className="lg:col-span-7 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">QR en Mostrador</h2>
          <p className="text-sm text-muted-foreground">Configura el código QR que tus clientes escanearán para registrar su visita.</p>
        </div>

        {/* QR Type */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Tipo de QR</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setQrType('static')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                qrType === 'static' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <Icon name="Printer" size={22} className={qrType === 'static' ? 'text-primary' : 'text-muted-foreground'} />
              <p className="font-semibold text-sm mt-2 text-foreground">QR Estático</p>
              <p className="text-xs text-muted-foreground mt-1">Imprime una vez, funciona siempre. Ideal para negocios sin pantalla digital.</p>
            </button>
            <button
              onClick={() => setQrType('dynamic')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                qrType === 'dynamic' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <Icon name="Monitor" size={22} className={qrType === 'dynamic' ? 'text-primary' : 'text-muted-foreground'} />
              <p className="font-semibold text-sm mt-2 text-foreground">QR Dinámico</p>
              <p className="text-xs text-muted-foreground mt-1">Cambia cada X minutos. Más seguro, requiere tablet o pantalla.</p>
            </button>
          </div>
          {qrType === 'dynamic' && (
            <div className="mt-4 p-4 bg-muted/40 rounded-lg">
              <label className="text-sm font-medium text-foreground block mb-2">Intervalo de rotación</label>
              <div className="flex gap-2">
                {[1, 5, 15, 30]?.map(min => (
                  <button
                    key={min}
                    onClick={() => setRotationInterval(min)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      rotationInterval === min ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Intervalos cortos son más seguros pero pueden ser incómodos si hay fila. <strong>Recomendado: 5 minutos.</strong>
              </p>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Ubicación del QR</h3>
          <select
            value={location}
            onChange={e => setLocation(e?.target?.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {locationOptions?.map(opt => (
              <option key={opt?.value} value={opt?.value}>{opt?.label}</option>
            ))}
          </select>
          {location === 'mesas' && (
            <div className="mt-3">
              <label className="text-sm font-medium text-foreground block mb-1.5">¿Cuántas mesas tienes?</label>
              <input
                type="number"
                min={1}
                max={100}
                value={tableCount}
                onChange={e => setTableCount(Number(e?.target?.value))}
                className="w-32 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Generaremos <strong>{tableCount} QR únicos</strong>, uno por mesa. Esto te permitirá ver qué mesas generan más check-ins.
              </p>
            </div>
          )}
        </div>

        {/* Staff Validation */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Validación del staff</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Si está activo, un miembro del equipo debe aprobar cada check-in. Más control pero más fricción.</p>
            </div>
            <button
              onClick={() => setRequireStaff(!requireStaff)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                requireStaff ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                requireStaff ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Download Materials */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Materiales descargables</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: 'Poster A4 (PDF)', icon: 'FileText' },
              { label: 'Tent card mesas (PDF)', icon: 'Layout' },
              { label: 'Instrucciones usuario (PDF)', icon: 'BookOpen' },
            ]?.map(item => (
              <button
                key={item?.label}
                className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                <Icon name={item?.icon} size={15} className="text-primary" />
                {item?.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Right: QR Preview */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center">
          <h3 className="font-semibold text-foreground mb-4 self-start">Vista previa del QR</h3>
          <div className="w-48 h-48 bg-white border-2 border-border rounded-xl flex items-center justify-center relative shadow-sm">
            <div className="grid grid-cols-7 gap-0.5 p-3">
              {Array.from({ length: 49 })?.map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${
                    [0,1,2,3,4,5,6,7,14,21,28,35,42,43,44,45,46,47,48,8,15,22,29,36,10,11,12,17,18,19,24,25,26,31,32,33,38,39,40]?.includes(i)
                      ? 'bg-gray-900' : 'bg-white'
                  }`}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-border">
                <Icon name="Store" size={18} className="text-primary" />
              </div>
            </div>
          </div>
          {qrType === 'dynamic' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Icon name="RefreshCw" size={13} />
              Este QR se actualizará cada <strong>{rotationInterval} minutos</strong>
            </div>
          )}
          {qrType === 'static' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <Icon name="CheckCircle" size={13} />
              QR permanente — imprime una vez
            </div>
          )}
        </div>

        {/* Staff notification mockup */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 text-sm">Vista del staff (notificación)</h3>
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="ScanLine" size={12} className="text-white" />
                </div>
                <span className="text-white text-xs font-semibold">PromoSpot Admin</span>
              </div>
              <p className="text-white/90 text-xs">María García quiere hacer check-in. ¿Confirmar?</p>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-1.5 bg-green-500 rounded text-white text-xs font-medium">✓ Confirmar</button>
                <button className="flex-1 py-1.5 bg-red-500 rounded text-white text-xs font-medium">✗ Rechazar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRMethodConfig;
