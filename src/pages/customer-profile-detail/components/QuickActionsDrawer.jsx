import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const QuickActionsDrawer = ({ client, onClose }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [bonusPoints, setBonusPoints] = useState('');
  const [couponType, setCouponType] = useState('percent');
  const [confirmed, setConfirmed] = useState(null);

  const handleConfirm = (action) => {
    setConfirmed(action);
    setTimeout(() => { setConfirmed(null); setActiveAction(null); }, 2000);
  };

  const actions = [
    { id: 'coupon', icon: 'Ticket', label: 'Enviar cupón', color: 'text-blue-600 bg-blue-50', desc: 'Envía un cupón personalizado directamente' },
    { id: 'points', icon: 'Coins', label: 'Dar puntos bonus', color: 'text-amber-600 bg-amber-50', desc: 'Agrega puntos extra a su saldo' },
    { id: 'campaign', icon: 'Megaphone', label: 'Agregar a campaña', color: 'text-purple-600 bg-purple-50', desc: 'Incluye al cliente en una campaña activa' },
    { id: 'survey', icon: 'ClipboardList', label: 'Enviar encuesta', color: 'text-green-600 bg-green-50', desc: 'Envía una micro-encuesta de satisfacción' },
    { id: 'vip', icon: 'Crown', label: 'Marcar como VIP manual', color: 'text-yellow-600 bg-yellow-50', desc: 'Asigna nivel VIP manualmente' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-card w-full max-w-sm h-full shadow-2xl border-l border-border flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-semibold">Acciones rápidas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{client?.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {actions?.map(action => (
            <div key={action?.id}>
              <button
                onClick={() => setActiveAction(activeAction === action?.id ? null : action?.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  activeAction === action?.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action?.color}`}>
                  <Icon name={action?.icon} size={18} />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">{action?.label}</div>
                  <div className="text-xs text-muted-foreground">{action?.desc}</div>
                </div>
                <Icon name={activeAction === action?.id ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
              </button>

              {activeAction === action?.id && (
                <div className="mt-1 p-3 bg-muted/30 rounded-xl border border-border space-y-3">
                  {action?.id === 'coupon' && (
                    <>
                      <div className="flex gap-2">
                        {[['percent', '% Descuento'], ['gift', 'Producto gratis'], ['2x1', '2×1']]?.map(([val, label]) => (
                          <button key={val} onClick={() => setCouponType(val)}
                            className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                              couponType === val ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                            }`}>{label}</button>
                        ))}
                      </div>
                      {couponType === 'percent' && (
                        <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" placeholder="Ej. 20% de descuento" />
                      )}
                    </>
                  )}
                  {action?.id === 'points' && (
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" max="500" className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background" placeholder="Cantidad de puntos" value={bonusPoints} onChange={e => setBonusPoints(e?.target?.value)} />
                      <span className="text-xs text-muted-foreground">puntos</span>
                    </div>
                  )}
                  {action?.id === 'campaign' && (
                    <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                      <option>Reactivación Marzo</option>
                      <option>VIPs Exclusivo</option>
                      <option>Cumpleañeros del mes</option>
                    </select>
                  )}
                  {action?.id === 'survey' && (
                    <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                      <option>¿Cómo fue tu experiencia hoy?</option>
                      <option>NPS estándar (0-10)</option>
                      <option>Encuesta de producto</option>
                    </select>
                  )}
                  {action?.id === 'vip' && (
                    <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                      <option>Bronce</option>
                      <option>Plata</option>
                      <option>Oro</option>
                    </select>
                  )}
                  {confirmed === action?.id ? (
                    <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                      <Icon name="CheckCircle" size={14} />¡Acción ejecutada con éxito!
                    </div>
                  ) : (
                    <button onClick={() => handleConfirm(action?.id)}
                      className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
                      Confirmar acción
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsDrawer;
