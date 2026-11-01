import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const mockValidHistory = [
  { time: '14:32', name: 'María García', method: 'Manual', status: 'exitoso', points: 5 },
  { time: '14:18', name: 'Carlos Mendoza', method: 'Manual', status: 'exitoso', points: 5 },
  { time: '13:55', name: 'Roberto Jiménez', method: 'Manual', status: 'exitoso', points: 5 },
  { time: '13:40', name: 'Valentina Torres', method: 'Manual', status: 'rechazado', points: 0 },
  { time: '13:22', name: 'Diego Ramírez', method: 'Manual', status: 'limite', points: 0 },
  { time: '12:58', name: 'Isabella Vargas', method: 'Manual', status: 'exitoso', points: 5 },
  { time: '12:45', name: 'Fernanda López', method: 'Manual', status: 'exitoso', points: 5 },
  { time: '12:30', name: 'Miguel Sánchez', method: 'Manual', status: 'exitoso', points: 5 },
  { time: '12:15', name: 'Camila Ortiz', method: 'Manual', status: 'exitoso', points: 5 },
  { time: '11:58', name: 'Andrés Gutiérrez', method: 'Manual', status: 'exitoso', points: 5 },
];

const VALID_CODES = {
  'ABC-123': { name: 'María García', points: 5, vip: 'Oro', coupons: 1, couponName: '20% OFF en tu próxima visita' },
  'XYZ-789': { name: 'Carlos Mendoza', points: 5, vip: 'Plata', coupons: 0 },
  'DEF-456': { name: 'Roberto Jiménez', points: 5, vip: 'Oro', coupons: 2, couponName: 'Café gratis' },
};

const LIMIT_CODES = { 'LIM-001': true };

const CheckInValidateTab = () => {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'success' | 'invalid' | 'limit'
  const [feedbackData, setFeedbackData] = useState(null);
  const [history, setHistory] = useState(mockValidHistory);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef?.current?.focus();
  }, [feedback]);

  const handleValidate = () => {
    const trimmed = code?.trim()?.toUpperCase();
    if (!trimmed) return;

    if (LIMIT_CODES?.[trimmed]) {
      setFeedback('limit');
      setFeedbackData(null);
    } else if (VALID_CODES?.[trimmed]) {
      const data = VALID_CODES?.[trimmed];
      setFeedback('success');
      setFeedbackData(data);
      setHistory(prev => [{ time: new Date()?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), name: data?.name, method: 'Manual', status: 'exitoso', points: data?.points }, ...prev?.slice(0, 9)]);
    } else {
      setFeedback('invalid');
      setFeedbackData(null);
    }

    setTimeout(() => {
      setFeedback(null);
      setFeedbackData(null);
      setCode('');
      inputRef?.current?.focus();
    }, 2500);
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter') handleValidate();
  };

  const statusConfig = {
    exitoso: { color: 'text-green-600', icon: 'CheckCircle' },
    rechazado: { color: 'text-red-500', icon: 'XCircle' },
    limite: { color: 'text-amber-500', icon: 'Clock' },
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feedback overlay */}
      {feedback === 'success' && feedbackData && (
        <div className="fixed inset-0 bg-green-500 z-50 flex flex-col items-center justify-center text-white animate-fadeIn">
          <Icon name="CheckCircle" size={80} className="mb-4" />
          <h2 className="text-3xl font-bold mb-1">¡Check-in registrado!</h2>
          <p className="text-xl mb-2">{feedbackData?.name}</p>
          <p className="text-4xl font-bold mb-1">+{feedbackData?.points} puntos</p>
          <span className="text-lg opacity-80 mb-4">Nivel VIP: {feedbackData?.vip}</span>
          {feedbackData?.coupons > 0 && (
            <div className="bg-white/20 rounded-xl px-6 py-3 text-center">
              <p className="text-sm opacity-90">🎟️ {feedbackData?.name} tiene {feedbackData?.coupons} cupón activo</p>
              {feedbackData?.couponName && <p className="font-semibold">{feedbackData?.couponName}</p>}
            </div>
          )}
        </div>
      )}
      {feedback === 'invalid' && (
        <div className="fixed inset-0 bg-red-500 z-50 flex flex-col items-center justify-center text-white animate-fadeIn">
          <Icon name="XCircle" size={80} className="mb-4" />
          <h2 className="text-2xl font-bold mb-2">Código no encontrado</h2>
          <p className="text-lg opacity-80">Verifica el código e intenta de nuevo.</p>
        </div>
      )}
      {feedback === 'limit' && (
        <div className="fixed inset-0 bg-amber-500 z-50 flex flex-col items-center justify-center text-white animate-fadeIn">
          <Icon name="Clock" size={80} className="mb-4" />
          <h2 className="text-2xl font-bold mb-2">Límite alcanzado</h2>
          <p className="text-lg opacity-80 text-center px-8">Este cliente ya registró su visita hoy. El próximo check-in estará disponible mañana.</p>
        </div>
      )}
      {/* Input Area */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-5">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="ScanLine" size={28} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Validar Check-in</h2>
          <p className="text-sm text-muted-foreground mt-1">Ingresa el código del cliente o usa el escáner de código de barras</p>
        </div>

        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={e => setCode(e?.target?.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ingresa el código del cliente (ej: ABC-123)"
            className="flex-1 border-2 border-border rounded-xl px-4 py-3.5 text-lg font-mono bg-background text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
            autoFocus
          />
          <button
            onClick={handleValidate}
            className="px-6 py-3.5 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Icon name="CheckCircle" size={20} />
            Registrar
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {['ABC-123', 'XYZ-789', 'DEF-456', 'LIM-001']?.map(demo => (
            <button
              key={demo}
              onClick={() => setCode(demo)}
              className="text-xs px-3 py-1.5 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              Demo: {demo}
            </button>
          ))}
        </div>
      </div>
      {/* Daily History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground text-sm">Historial del día ({history?.length} validaciones)</h3>
        </div>
        <div className="divide-y divide-border">
          {history?.slice(0, 10)?.map((item, i) => {
            const sc = statusConfig?.[item?.status] || statusConfig?.exitoso;
            return (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs text-muted-foreground w-12 flex-shrink-0">{item?.time}</span>
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {item?.name?.charAt(0)}
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{item?.name}</span>
                <span className="text-xs text-muted-foreground">{item?.method}</span>
                <Icon name={sc?.icon} size={16} className={sc?.color} />
                {item?.points > 0 && (
                  <span className="text-xs font-semibold text-emerald-600">+{item?.points}pts</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CheckInValidateTab;
