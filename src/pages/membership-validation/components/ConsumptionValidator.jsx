import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const DEMO_STATES = {
  valid: {
    status: 'valid',
    customerName: 'María García',
    membershipName: 'Club Café Premium',
    accentColor: '#3B82F6',
    benefits: [
      { type: 'quantity_included', label: '1 café americano disponible hoy', model: 'daily_limit', remaining: 1 },
      { type: 'discount_percent', label: 'Descuento 20% en toda la compra' },
      { type: 'points_multiplier', label: '2x puntos en esta visita' },
    ],
  },
  limit_reached: {
    status: 'limit_reached',
    customerName: 'Carlos López',
    membershipName: 'Club Café Premium',
    accentColor: '#3B82F6',
    usedToday: '1 de 1 café americano usado',
    specialPrice: 35,
  },
  invalid: {
    status: 'invalid',
    customerName: 'Roberto Sánchez',
    reason: 'Membresía cancelada',
    reasonType: 'cancelled',
  },
};

const CheckmarkAnimation = () => (
  <div className="relative w-24 h-24 mx-auto mb-4">
    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
      <Icon name="Check" size={48} className="text-white" strokeWidth={3} />
    </div>
  </div>
);

const ValidationResultScreen = ({ result, onRegisterConsumption, onBack }) => {
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (registered) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onBack();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [registered]);

  const handleRegister = async () => {
    setRegistering(true);
    await new Promise(r => setTimeout(r, 800));
    setRegistering(false);
    setRegistered(true);
    onRegisterConsumption?.();
  };

  if (result?.status === 'valid') {
    return (
      <div className="min-h-[500px] rounded-2xl p-8 flex flex-col items-center text-center" style={{ backgroundColor: '#D1FAE5' }}>
        {registered ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
              <Icon name="CheckCircle" size={40} className="text-white" />
            </div>
            <p className="text-xl font-bold text-emerald-800 mb-2">✓ Consumo registrado</p>
            <p className="text-emerald-700 text-sm mb-4">Le quedan 0 usos hoy</p>
            <p className="text-emerald-600 text-sm">Regresando al escáner en <strong>{countdown}s</strong>...</p>
          </div>
        ) : (
          <>
            <CheckmarkAnimation />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-emerald-600">{result?.customerName?.charAt(0)}</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-emerald-900 text-lg">{result?.customerName}</p>
                <span
                  className="text-xs px-2.5 py-1 rounded-full text-white font-semibold"
                  style={{ backgroundColor: result?.accentColor }}
                >
                  {result?.membershipName}
                </span>
              </div>
            </div>

            <div className="w-full bg-white/60 rounded-xl p-4 mb-6 text-left space-y-2">
              {result?.benefits?.map((b, i) => (
                <p key={i} className="text-sm text-emerald-800 font-medium">✓ {b?.label}</p>
              ))}
            </div>

            {showItemSelector ? (
              <div className="w-full space-y-3">
                <p className="text-sm font-semibold text-emerald-800 mb-2">¿Qué ítem se está consumiendo?</p>
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70"
                >
                  {registering ? 'Registrando...' : '☕ Café Americano'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowItemSelector(true)}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg"
              >
                Registrar consumo
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  if (result?.status === 'limit_reached') {
    return (
      <div className="min-h-[400px] rounded-2xl p-8 flex flex-col items-center text-center" style={{ backgroundColor: '#FEF3C7' }}>
        <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mb-4">
          <Icon name="Clock" size={40} className="text-white" />
        </div>
        <p className="text-xl font-bold text-amber-900 mb-1">{result?.customerName}</p>
        <p className="text-lg font-semibold text-amber-800 mb-3">Ya usó su beneficio de hoy</p>
        <div className="bg-white/60 rounded-xl p-4 w-full mb-4">
          <p className="text-sm text-amber-800 font-medium">{result?.usedToday}</p>
          <p className="text-xs text-amber-700 mt-1">Se reinicia a medianoche</p>
        </div>
        {result?.specialPrice && (
          <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 w-full">
            <p className="text-sm font-semibold text-amber-900">
              💰 Puede comprar al precio de socio: <strong>${result?.specialPrice} MXN</strong>
            </p>
          </div>
        )}
        <button onClick={onBack} className="mt-6 px-6 py-2.5 border-2 border-amber-600 text-amber-800 rounded-xl font-medium hover:bg-amber-100 transition-colors">
          Volver al escáner
        </button>
      </div>
    );
  }

  if (result?.status === 'invalid') {
    return (
      <div className="min-h-[400px] rounded-2xl p-8 flex flex-col items-center text-center" style={{ backgroundColor: '#FEE2E2' }}>
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4">
          <Icon name="X" size={40} className="text-white" strokeWidth={3} />
        </div>
        {result?.customerName && (
          <p className="text-xl font-bold text-red-900 mb-2">{result?.customerName}</p>
        )}
        <p className="text-lg font-semibold text-red-800 mb-3">Membresía no válida</p>
        <span className="bg-red-200 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
          {result?.reason}
        </span>
        <button onClick={onBack} className="mt-6 px-6 py-2.5 border-2 border-red-500 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors">
          Volver al escáner
        </button>
      </div>
    );
  }

  return null;
};

const QRScannerTab = ({ onResult }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);

  const simulateScan = (state) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onResult(DEMO_STATES?.[state]);
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* Scanner Area */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden" style={{ height: 280 }}>
        {cameraActive ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Corner frames */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              {/* Scanning line */}
              <div
                className="absolute left-2 right-2 h-0.5 bg-primary opacity-80"
                style={{
                  animation: 'scan-line 2s ease-in-out infinite',
                  top: '50%',
                }}
              />
            </div>
            <p className="absolute bottom-4 text-white/70 text-sm">Apunta al QR del cliente</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Icon name="Camera" size={48} className="text-white/40" />
            <p className="text-white/60 text-sm">Cámara inactiva</p>
            <button
              onClick={() => setCameraActive(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Activar cámara
            </button>
          </div>
        )}
        {scanning && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Demo Buttons */}
      <div className="bg-muted/30 border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Demo — Simular escaneo</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => simulateScan('valid')}
            className="py-2.5 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-200 transition-colors border border-emerald-200"
          >
            ✓ Válido
          </button>
          <button
            onClick={() => simulateScan('limit_reached')}
            className="py-2.5 bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-200 transition-colors border border-amber-200"
          >
            ⏰ Límite
          </button>
          <button
            onClick={() => simulateScan('invalid')}
            className="py-2.5 bg-red-100 text-red-700 rounded-xl text-xs font-semibold hover:bg-red-200 transition-colors border border-red-200"
          >
            ✗ Inválido
          </button>
        </div>
      </div>
    </div>
  );
};

const ManualCodeTab = ({ onResult }) => {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);

  const handleKey = (key) => {
    if (key === 'del') {
      setCode(prev => prev?.slice(0, -1));
    } else if (code?.length < 6) {
      setCode(prev => prev + key);
    }
  };

  const handleValidate = async () => {
    if (code?.length !== 6) return;
    setValidating(true);
    await new Promise(r => setTimeout(r, 600));
    setValidating(false);
    // Demo: code 123456 = valid, 999999 = limit, anything else = invalid
    if (code === '123456') onResult(DEMO_STATES?.valid);
    else if (code === '999999') onResult(DEMO_STATES?.limit_reached);
    else onResult(DEMO_STATES?.invalid);
  };

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="space-y-6">
      {/* Code Display */}
      <div className="flex justify-center gap-3">
        {Array.from({ length: 6 })?.map((_, i) => (
          <div
            key={i}
            className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-2xl font-bold transition-colors ${
              i < code?.length ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground'
            }`}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32 }}
          >
            {code?.[i] || ''}
          </div>
        ))}
      </div>
      {/* Virtual Keypad */}
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {KEYS?.map((key, i) => (
          key === '' ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => handleKey(key)}
              className={`h-14 rounded-xl font-bold text-xl transition-all active:scale-95 ${
                key === 'del' ?'bg-muted text-muted-foreground hover:bg-muted/80 text-base' :'bg-card border border-border text-foreground hover:bg-primary/5 hover:border-primary shadow-sm'
              }`}
            >
              {key === 'del' ? <Icon name="Delete" size={20} className="mx-auto" /> : key}
            </button>
          )
        ))}
      </div>
      <button
        onClick={handleValidate}
        disabled={code?.length !== 6 || validating}
        className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {validating ? 'Validando...' : 'Validar'}
      </button>
      <div className="bg-muted/30 border border-border rounded-xl p-3 text-center">
        <p className="text-xs text-muted-foreground">Demo: <span className="font-mono font-bold">123456</span> = Válido · <span className="font-mono font-bold">999999</span> = Límite · Otro = Inválido</p>
      </div>
    </div>
  );
};

const ConsumptionValidator = () => {
  const [activeTab, setActiveTab] = useState('qr');
  const [result, setResult] = useState(null);

  const handleResult = (res) => setResult(res);
  const handleBack = () => setResult(null);

  return (
    <div className="w-full max-w-md mx-auto">
      {result ? (
        <ValidationResultScreen
          result={result}
          onBack={handleBack}
          onRegisterConsumption={() => {}}
        />
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <nav className="flex">
              {[
                { id: 'qr', label: 'Escanear QR', icon: 'QrCode' },
                { id: 'manual', label: 'Código manual', icon: 'Hash' },
              ]?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'qr' && <QRScannerTab onResult={handleResult} />}
          {activeTab === 'manual' && <ManualCodeTab onResult={handleResult} />}
        </>
      )}
    </div>
  );
};

export default ConsumptionValidator;
