import React from 'react';
import Icon from '../../../components/AppIcon';

export default function LoyaltyTab() {
  const vipProgress = 72;
  const punchCards = [
    { name: 'Café del mes', current: 8, total: 10, reward: 'Café gratis' },
    { name: 'Visitas frecuentes', current: 3, total: 5, reward: '15% descuento' },
  ];
  const recentRewards = [
    { name: 'Café gratis', date: 'Hace 2 semanas', points: 200 },
    { name: 'Postre de temporada', date: 'Hace 1 mes', points: 350 },
    { name: 'Bebida especial', date: 'Hace 2 meses', points: 150 },
  ];

  return (
    <div className="space-y-6">
      {/* VIP Progress */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="Crown" size={20} className="text-yellow-600" />
            <h4 className="text-sm font-semibold text-yellow-800">Nivel VIP: Oro</h4>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded-full font-medium">Nivel máximo</span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-yellow-700 mb-1.5">
            <span>Progreso hacia Oro ✓</span>
            <span>1,240 / 1,000 pts</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
        <p className="text-xs text-yellow-700">¡Eres cliente Oro! Disfruta todos tus beneficios exclusivos.</p>
      </div>
      {/* Points Summary */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Resumen de Puntos</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">3,840</div>
            <div className="text-xs text-muted-foreground mt-1">Acumulados</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">2,600</div>
            <div className="text-xs text-muted-foreground mt-1">Canjeados</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">1,240</div>
            <div className="text-xs text-muted-foreground mt-1">Saldo actual</div>
          </div>
        </div>
      </div>
      {/* Punch Cards */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Punch Cards Activos</h4>
        <div className="space-y-3">
          {punchCards?.map((card, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">{card?.name}</div>
                  <div className="text-xs text-muted-foreground">Recompensa: {card?.reward}</div>
                </div>
                <span className="text-sm font-bold text-primary">{card?.current}/{card?.total}</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: card?.total })?.map((_, j) => (
                  <div
                    key={j}
                    className={`flex-1 h-6 rounded-md flex items-center justify-center ${
                      j < card?.current ? 'bg-primary' : 'bg-muted border border-border'
                    }`}
                  >
                    {j < card?.current && <Icon name="Check" size={12} className="text-primary-foreground" />}
                  </div>
                ))}
              </div>
              {card?.current === card?.total && (
                <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                  <Icon name="CheckCircle" size={12} /> ¡Completado! Recompensa disponible
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Recent Rewards */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Recompensas Canjeadas</h4>
        <div className="space-y-2">
          {recentRewards?.map((reward, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Gift" size={16} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">{reward?.name}</div>
                  <div className="text-xs text-muted-foreground">{reward?.date}</div>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">-{reward?.points} pts</span>
            </div>
          ))}
        </div>
      </div>
      {/* Prepaid Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="CreditCard" size={18} className="text-blue-600" />
          <h4 className="text-sm font-semibold text-blue-800">Tarjeta Prepago</h4>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-700">$350.00</div>
            <div className="text-xs text-blue-600">Saldo disponible</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-600">Última recarga</div>
            <div className="text-sm font-medium text-blue-700">Hace 5 días — $200</div>
          </div>
        </div>
      </div>
    </div>
  );
}
