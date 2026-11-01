import React from 'react';
import Icon from '../../../components/AppIcon';

const ACCION_CONFIG = {
  push: { icono: 'Bell', color: 'text-blue-500', bg: 'bg-blue-50', label: 'Push' },
  cupon: { icono: 'Tag', color: 'text-green-500', bg: 'bg-green-50', label: 'Cupón' },
  email: { icono: 'Mail', color: 'text-purple-500', bg: 'bg-purple-50', label: 'Email' },
  story: { icono: 'Image', color: 'text-pink-500', bg: 'bg-pink-50', label: 'Story' },
  promo: { icono: 'Zap', color: 'text-amber-500', bg: 'bg-amber-50', label: 'Promo' },
  whatsapp: { icono: 'MessageCircle', color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'WhatsApp' },
  puntos: { icono: 'Star', color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Puntos' },
  badge: { icono: 'Award', color: 'text-rose-500', bg: 'bg-rose-50', label: 'Badge' },
};

const MOCK_STEPS = [
  { id: 1, accion: 'push', mensaje: 'Te extrañamos, vuelve y obtén 15% OFF', estado: 'completado', enviados: 420, abiertos: 189, convertidos: 42, dia: 0 },
  { id: 2, accion: 'cupon', mensaje: 'Cupón 15% al wallet', estado: 'en_progreso', enviados: 231, abiertos: 231, convertidos: 18, dia: 3 },
  { id: 3, accion: 'email', mensaje: 'Resumen de novedades + 20% OFF', estado: 'pendiente', enviados: 0, abiertos: 0, convertidos: 0, dia: 7 },
  { id: 4, accion: 'whatsapp', mensaje: 'Oferta final 25% — vence en 48h', estado: 'pendiente', enviados: 0, abiertos: 0, convertidos: 0, dia: 14 },
];

const SequenceTimeline = ({ campaign, steps }) => {
  const pasos = steps?.length > 0 ? steps : MOCK_STEPS;

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'completado': return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icono: 'CheckCircle2', label: 'Completado' };
      case 'en_progreso': return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', icono: 'Loader2', label: 'En progreso', pulse: true };
      default: return { color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', icono: 'Clock', label: 'Pendiente' };
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="GitBranch" size={18} className="text-primary" />
        Secuencia de la campaña
      </h3>
      <div className="space-y-1">
        {pasos?.map((paso, idx) => {
          const accionCfg = ACCION_CONFIG?.[paso?.accion] || ACCION_CONFIG?.push;
          const estadoCfg = getEstadoConfig(paso?.estado);
          const tasaApertura = paso?.enviados > 0 ? Math.round((paso?.abiertos / paso?.enviados) * 100) : 0;
          const tasaConversion = paso?.enviados > 0 ? Math.round((paso?.convertidos / paso?.enviados) * 100) : 0;

          return (
            <div key={paso?.id} className="relative">
              <div className="flex gap-3">
                {/* Nodo */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl ${accionCfg?.bg} flex items-center justify-center flex-shrink-0 border-2 ${
                    paso?.estado === 'completado' ? 'border-success/40' :
                    paso?.estado === 'en_progreso'? 'border-primary/40' : 'border-border'
                  }`}>
                    <Icon name={accionCfg?.icono} size={18} className={accionCfg?.color} />
                  </div>
                  {idx < pasos?.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-1 min-h-[20px] ${
                      paso?.estado === 'completado' ? 'bg-success/40' : 'bg-border'
                    }`} />
                  )}
                </div>

                {/* Contenido */}
                <div className={`flex-1 border rounded-xl p-3 mb-2 ${estadoCfg?.border} ${estadoCfg?.bg}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">Día {paso?.dia} — {accionCfg?.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoCfg?.color} ${estadoCfg?.bg} border ${estadoCfg?.border} ${
                          estadoCfg?.pulse ? 'animate-pulse' : ''
                        }`}>
                          {estadoCfg?.label}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-0.5">{paso?.mensaje}</p>
                    </div>
                  </div>

                  {paso?.enviados > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/50">
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{paso?.enviados?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Enviados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{tasaApertura}%</p>
                        <p className="text-xs text-muted-foreground">Apertura</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-success">{tasaConversion}%</p>
                        <p className="text-xs text-muted-foreground">Conversión</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SequenceTimeline;
