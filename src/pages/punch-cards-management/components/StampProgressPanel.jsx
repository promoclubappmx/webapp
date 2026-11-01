import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const STAMP_ICONS = [
  { id: 'circle', icon: '⭕' }, { id: 'star', icon: '⭐' }, { id: 'heart', icon: '❤️' },
  { id: 'diamond', icon: '💎' }, { id: 'flame', icon: '🔥' }, { id: 'lightning', icon: '⚡' },
  { id: 'leaf', icon: '🍃' }, { id: 'crown', icon: '👑' }, { id: 'coffee', icon: '☕' },
  { id: 'pizza', icon: '🍕' }, { id: 'scissors', icon: '✂️' }, { id: 'dumbbell', icon: '🏋️' },
  { id: 'bag', icon: '🛍️' }, { id: 'footprint', icon: '👣' }, { id: 'gift', icon: '🎁' }, { id: 'gem', icon: '💍' },
];

const getStampIcon = (id) => STAMP_ICONS?.find(s => s?.id === id)?.icon || '⭐';

const getStatusBadge = (status) => {
  const map = {
    active: { label: 'Activa', cls: 'bg-success/10 text-success border-success/20' },
    draft: { label: 'Borrador', cls: 'bg-muted/50 text-muted-foreground border-border' },
    paused: { label: 'Pausada', cls: 'bg-warning/10 text-warning border-warning/20' },
    expired: { label: 'Vencida', cls: 'bg-destructive/10 text-destructive border-destructive/20' },
    seasonal: { label: 'Estacional', cls: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  };
  return map?.[status] || map?.draft;
};

const StampProgressPanel = ({ cards }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stampResult, setStampResult] = useState(null);

  const activeCards = cards?.filter(c => c?.status === 'active');

  const simulateStamp = () => {
    if (!selectedCard) return;
    const card = cards?.find(c => c?.id === selectedCard);
    if (!card) return;

    let eligible = false;
    let reason = '';

    if (card?.stamp_rule === 'visit') {
      eligible = true;
      reason = 'Check-in verificado';
    } else if (card?.stamp_rule === 'amount') {
      const amount = parseFloat(purchaseAmount) || 0;
      const min = parseFloat(card?.stamp_amount) || 0;
      eligible = amount >= min;
      reason = eligible ? `Compra de $${amount} MXN ≥ mínimo $${min} MXN` : `Compra de $${amount} MXN < mínimo $${min} MXN`;
    } else if (card?.stamp_rule === 'product') {
      eligible = selectedProduct?.trim()?.length > 0;
      reason = eligible ? `Producto "${selectedProduct}" confirmado` : 'Producto no confirmado';
    }

    setStampResult({ eligible, reason, card });
  };

  const card = cards?.find(c => c?.id === selectedCard);

  return (
    <div className="space-y-6">
      {/* Cashier Interface */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon name="ScanLine" size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Pantalla del Cajero</h3>
            <p className="text-xs text-muted-foreground">Simula el sellado en punto de venta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Customer + Card Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Buscar cliente</label>
              <div className="relative">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e?.target?.value)}
                  placeholder="Nombre, teléfono o email..."
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tarjetas de sello activas del negocio</label>
              {activeCards?.length === 0 ? (
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground">No hay tarjetas de sello activas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeCards?.map(c => {
                    const stampIcon = getStampIcon(c?.stamp_icon);
                    const bgStyle = { background: c?.card_color || '#7C3AED' };
                    return (
                      <button
                        key={c?.id}
                        type="button"
                        onClick={() => { setSelectedCard(c?.id); setStampResult(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          selectedCard === c?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0" style={bgStyle}>
                          {stampIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{c?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c?.stamp_rule === 'visit' ? 'Por visita' : c?.stamp_rule === 'amount' ? `Monto $${c?.stamp_amount}+` : `Producto: ${c?.stamp_product}`}
                            {' · '}{c?.stamp_count} sellos
                          </p>
                        </div>
                        {selectedCard === c?.id && <Icon name="CheckCircle" size={16} className="text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Conditional inputs based on stamp rule */}
            {card?.stamp_rule === 'amount' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Monto de la compra (MXN)</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <input
                    type="number" min="0"
                    value={purchaseAmount}
                    onChange={e => setPurchaseAmount(e?.target?.value)}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  />
                  <span className="text-xs text-muted-foreground">MXN</span>
                </div>
                {purchaseAmount && card?.stamp_amount && (
                  <p className={`text-xs mt-1 font-medium ${parseFloat(purchaseAmount) >= parseFloat(card?.stamp_amount) ? 'text-success' : 'text-destructive'}`}>
                    {parseFloat(purchaseAmount) >= parseFloat(card?.stamp_amount)
                      ? `✓ Alcanza el mínimo de $${card?.stamp_amount} MXN`
                      : `✗ Falta $${(parseFloat(card?.stamp_amount) - parseFloat(purchaseAmount))?.toFixed(2)} MXN para el mínimo`}
                  </p>
                )}
              </div>
            )}

            {card?.stamp_rule === 'product' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  ¿El cliente compró: <span className="text-primary">{card?.stamp_product}</span>?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(card?.stamp_product || 'yes')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      selectedProduct ? 'border-success bg-success/10 text-success' : 'border-border text-muted-foreground'
                    }`}
                  >
                    ✓ Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct('')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      selectedProduct === '' && selectedCard ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border text-muted-foreground'
                    }`}
                  >
                    ✗ No
                  </button>
                </div>
              </div>
            )}

            <Button
              onClick={simulateStamp}
              disabled={!selectedCard}
              className="w-full"
            >
              <Icon name="Stamp" size={16} className="mr-2" />
              Verificar y Sellar
            </Button>
          </div>

          {/* Right: Result */}
          <div>
            {stampResult ? (
              <div className={`rounded-2xl p-5 border-2 ${stampResult?.eligible ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${stampResult?.eligible ? 'bg-success/20' : 'bg-destructive/20'}`}>
                    {stampResult?.eligible ? '✅' : '❌'}
                  </div>
                  <div>
                    <p className={`font-bold text-base ${stampResult?.eligible ? 'text-success' : 'text-destructive'}`}>
                      {stampResult?.eligible ? '¡Sello otorgado!' : 'Sin sello esta vez'}
                    </p>
                    <p className="text-xs text-muted-foreground">{stampResult?.reason}</p>
                  </div>
                </div>
                {stampResult?.eligible && (
                  <div className="space-y-2">
                    <div className="p-3 bg-card rounded-xl border border-border">
                      <p className="text-xs font-medium text-foreground">{stampResult?.card?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                        </div>
                        <span className="text-xs text-muted-foreground">4 / {stampResult?.card?.stamp_count}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                      <p className="text-xs text-primary font-medium">📱 Push enviado al cliente</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        "⭐ ¡Sello 4 de {stampResult?.card?.stamp_count} en '{stampResult?.card?.name}'!"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-5xl mb-3">🎴</div>
                  <p className="text-sm text-muted-foreground">Selecciona una tarjeta de sello y verifica el check-in para ver el resultado del sellado</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Redemption Interface */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center">
            <Icon name="Gift" size={18} className="text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Canje de Recompensa</h3>
            <p className="text-xs text-muted-foreground">Cuando el cliente completa la tarjeta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              type: 'free_item',
              title: 'Producto Gratis',
              icon: '🎁',
              desc: 'El cliente muestra el QR de canje en su app. El cajero lo escanea y entrega el producto.',
              steps: ['Cliente abre app → "Reclamar recompensa"', 'Se genera QR de canje en el wallet', 'Cajero escanea QR en pantalla de validación', '✅ "Recompensa canjeada: [producto] para [cliente]"'],
              color: 'bg-success/5 border-success/20',
            },
            {
              type: 'discount',
              title: 'Descuento / Cupón',
              icon: '🏷️',
              desc: 'Se genera un cupón automático en el wallet del usuario al completar la tarjeta.',
              steps: ['Tarjeta completada → cupón generado automáticamente', 'Cliente ve cupón en su wallet', 'Canje funciona como cualquier cupón (módulo D1)', '✅ Descuento aplicado en la siguiente compra'],
              color: 'bg-primary/5 border-primary/20',
            },
            {
              type: 'points',
              title: 'Puntos Bonus',
              icon: '⭐',
              desc: 'Los puntos se acreditan automáticamente al completar. No requiere acción del cajero.',
              steps: ['Tarjeta completada → puntos acreditados automáticamente', 'Push: "¡Completaste tu tarjeta! +[X] puntos"', 'Puntos disponibles en programa E1', '✅ Sin acción requerida del cajero'],
              color: 'bg-warning/5 border-warning/20',
            },
          ]?.map(r => (
            <div key={r?.type} className={`rounded-xl p-4 border ${r?.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{r?.icon}</span>
                <p className="font-semibold text-foreground text-sm">{r?.title}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{r?.desc}</p>
              <div className="space-y-1.5">
                {r?.steps?.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-card scenario */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Icon name="Layers" size={18} className="text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Múltiples Tarjetas en el POS</h3>
            <p className="text-xs text-muted-foreground">Cómo se maneja cuando el cliente tiene varias tarjetas de sello activas</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <p className="font-medium text-foreground text-sm mb-2">✅ Compatibilidad activada</p>
            <p className="text-xs text-muted-foreground mb-3">Un check-in avanza TODAS las tarjetas que califiquen simultáneamente.</p>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-xs font-mono text-foreground">⭐ 3 sellos ganados:</p>
              <p className="text-xs font-mono text-muted-foreground">• Tarjeta del Café (5/8)</p>
              <p className="text-xs font-mono text-muted-foreground">• Tarjeta del Postre (3/6)</p>
              <p className="text-xs font-mono text-muted-foreground">• Tarjeta VIP (7/10)</p>
            </div>
          </div>
          <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl">
            <p className="font-medium text-foreground text-sm mb-2">⚠️ Compatibilidad desactivada</p>
            <p className="text-xs text-muted-foreground mb-3">Solo avanza la tarjeta de mayor prioridad (orden definido en el grid).</p>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-xs font-mono text-foreground">✓ Sello en 'Tarjeta del Café'</p>
              <p className="text-xs font-mono text-muted-foreground">Las demás tarjetas no avanzan</p>
              <p className="text-xs font-mono text-muted-foreground">por configuración de prioridad.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StampProgressPanel;
