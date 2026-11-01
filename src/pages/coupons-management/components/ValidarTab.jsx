import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const mockValidations = [
  { time: '14:32', client: 'María García', coupon: '20% en tu próxima visita', benefit: '20% OFF', method: 'QR', code: 'VISIT20' },
  { time: '13:15', client: 'Carlos López', coupon: '$50 de descuento', benefit: '$50 OFF', method: 'Código', code: 'SAVE50' },
  { time: '12:48', client: 'Ana Martínez', coupon: 'Café americano gratis', benefit: 'Producto Gratis', method: 'NFC', code: 'CAFEFREE' },
  { time: '11:20', client: 'Roberto Silva', coupon: '2×1 en smoothies', benefit: '2×1', method: 'QR', code: 'SMOOTH2X1' },
];

const mockCoupons = {
  VISIT20: { title: '20% en tu próxima visita', benefit: '20% OFF', client: 'María García', minPurchase: 150, valid: true },
  SAVE50: { title: '$50 de descuento', benefit: '$50 OFF', client: 'Carlos López', minPurchase: 200, valid: true },
  CAFEFREE: { title: 'Café americano gratis', benefit: 'Producto Gratis', client: 'Ana Martínez', minPurchase: 0, valid: true },
  EXPIRED: { valid: false, error: 'Cupón vencido el 28/02/2026' },
  USED: { valid: false, error: 'Cupón ya canjeado por este usuario' },
  LIMIT: { valid: false, error: 'Límite de canjes alcanzado (200/200)' },
};

const methodIcons = { QR: 'QrCode', Código: 'Keyboard', NFC: 'Wifi' };

const ValidarTab = () => {
  const [inputMode, setInputMode] = useState('code'); // 'qr' | 'code' | 'client'
  const [code, setCode] = useState('');
  const [validationResult, setValidationResult] = useState(null); // null | { valid, data, error }
  const [confirmed, setConfirmed] = useState(false);
  const [history, setHistory] = useState(mockValidations);
  const [scanning, setScanning] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const handleValidate = (inputCode) => {
    const c = (inputCode || code)?.toUpperCase()?.trim();
    if (!c) return;
    const result = mockCoupons?.[c];
    if (result) {
      setValidationResult(result);
    } else {
      setValidationResult({ valid: false, error: 'Cupón no encontrado o código incorrecto' });
    }
    setConfirmed(false);
  };

  const handleConfirm = () => {
    if (!validationResult?.valid) return;
    const newEntry = {
      time: new Date()?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      client: validationResult?.data?.client || validationResult?.client || 'Cliente',
      coupon: validationResult?.title,
      benefit: validationResult?.benefit,
      method: inputMode === 'qr' ? 'QR' : inputMode === 'code' ? 'Código' : 'NFC',
      code: code?.toUpperCase(),
    };
    setHistory(prev => [newEntry, ...prev]);
    setConfirmed(true);
    setTimeout(() => {
      setCode('');
      setValidationResult(null);
      setConfirmed(false);
    }, 3000);
  };

  const simulateQR = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setCode('VISIT20');
      handleValidate('VISIT20');
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* LEFT: Validation panel */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Validar cupón</h3>

          {/* Mode toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 mb-5">
            {[{ key: 'qr', label: 'Escanear QR', icon: 'QrCode' },
              { key: 'code', label: 'Ingresar código', icon: 'Keyboard' },
              { key: 'client', label: 'Por cliente', icon: 'User' }]?.map(m => (
              <button
                key={m?.key}
                onClick={() => { setInputMode(m?.key); setValidationResult(null); setCode(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-md font-medium transition-all ${
                  inputMode === m?.key ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={m?.icon} size={14} />
                <span className="hidden sm:inline">{m?.label}</span>
              </button>
            ))}
          </div>

          {/* QR mode */}
          {inputMode === 'qr' && (
            <div className="space-y-4">
              <div
                onClick={simulateQR}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  scanning ? 'border-primary bg-primary/5 animate-pulse' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                {scanning ? (
                  <>
                    <Icon name="Loader" size={40} className="text-primary mx-auto mb-3 animate-spin" />
                    <p className="text-primary font-medium">Escaneando...</p>
                  </>
                ) : (
                  <>
                    <Icon name="QrCode" size={40} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium mb-1">Apunta la cámara al QR</p>
                    <p className="text-sm text-muted-foreground">Haz clic para simular escaneo</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Code mode */}
          {inputMode === 'code' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e?.target?.value?.toUpperCase()); setValidationResult(null); }}
                  onKeyDown={e => e?.key === 'Enter' && handleValidate()}
                  placeholder="Ingresa el código del cupón"
                  autoFocus
                  className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
                />
                <Button onClick={() => handleValidate()} disabled={!code?.trim()} className="px-6">
                  Validar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Presiona Enter o haz clic en Validar. El cajero puede dictar el código al cliente.</p>
              {/* Quick test codes */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Probar:</span>
                {['VISIT20', 'SAVE50', 'CAFEFREE', 'EXPIRED', 'USED']?.map(c => (
                  <button key={c} onClick={() => { setCode(c); handleValidate(c); }}
                    className="text-xs px-2 py-1 bg-muted rounded font-mono hover:bg-muted-foreground/20 transition-colors">{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* Client mode */}
          {inputMode === 'client' && (
            <div className="space-y-3">
              <input
                type="text"
                value={clientSearch}
                onChange={e => setClientSearch(e?.target?.value)}
                placeholder="Buscar cliente por nombre o teléfono..."
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {clientSearch?.length > 1 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  {[{ name: 'María García', phone: '555-1234', coupons: 2 }, { name: 'Carlos López', phone: '555-5678', coupons: 1 }]?.filter(c => c?.name?.toLowerCase()?.includes(clientSearch?.toLowerCase()))?.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/30 cursor-pointer border-b border-border last:border-0">
                        <div>
                          <div className="font-medium text-foreground text-sm">{c?.name}</div>
                          <div className="text-xs text-muted-foreground">{c?.phone}</div>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c?.coupons} cupones activos</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Validation result */}
          {validationResult && !confirmed && (
            <div className={`mt-4 rounded-xl p-5 border-2 ${
              validationResult?.valid ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              {validationResult?.valid ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon name="CheckCircle" size={22} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-green-800 text-lg">Cupón válido</div>
                      <div className="text-green-700 text-sm">{validationResult?.title}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Beneficio</div>
                      <div className="font-bold text-foreground text-lg">{validationResult?.benefit}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Cliente</div>
                      <div className="font-semibold text-foreground">{validationResult?.client}</div>
                    </div>
                  </div>
                  {validationResult?.minPurchase > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800 mb-3">
                      <Icon name="AlertCircle" size={14} className="inline mr-1" />
                      Mínimo de compra: ${validationResult?.minPurchase} MXN
                    </div>
                  )}
                  <Button onClick={handleConfirm} className="w-full bg-green-600 hover:bg-green-700">
                    <Icon name="Check" size={16} className="mr-2" />
                    Confirmar canje
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Icon name="XCircle" size={22} className="text-red-600" />
                  </div>
                  <div>
                    <div className="font-bold text-red-800">Cupón no válido</div>
                    <div className="text-red-700 text-sm">{validationResult?.error}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirmed success */}
          {confirmed && (
            <div className="mt-4 bg-green-500 rounded-xl p-6 text-center text-white">
              <Icon name="CheckCircle" size={48} className="mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">¡Cupón canjeado!</div>
              <div className="text-green-100">{validationResult?.benefit} aplicado correctamente</div>
            </div>
          )}
        </div>
      </div>
      {/* RIGHT: Today's history */}
      <div className="lg:col-span-2">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Canjes de hoy</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{history?.length} canjes</span>
          </div>
          <div className="space-y-2">
            {history?.map((h, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={methodIcons?.[h?.method] || 'Ticket'} size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate">{h?.client}</span>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{h?.time}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{h?.coupon}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-primary">{h?.benefit}</span>
                    <span className="text-xs text-muted-foreground">· {h?.method}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidarTab;
