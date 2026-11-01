import React from 'react';
import Icon from '../../../components/AppIcon';
import { useCurrency } from '../../../contexts/CurrencyContext';

const TYPE_LABELS = {
  digital: 'Gift Card Digital',
  corporate: 'Gift Card Corporativa',
  prepaid: 'Tarjeta Prepago',
  promo: 'Promo de Recarga',
};

const GiftCardWalletPreviewModal = ({ card, onClose }) => {
  const { formatPrice } = useCurrency();

  if (!card) return null;

  const exampleBalance = card?.denominations?.[1] || card?.denominations?.[0] || 500;
  const exampleCode = 'CAFE-R0MA-2025';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={e => e?.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Vista Previa — Wallet del Usuario</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Así se vería en la app B2C</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Phone mockup */}
        <div className="p-6">
          <div className="mx-auto w-64 bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
            {/* Phone screen */}
            <div className="bg-gray-100 rounded-[2rem] overflow-hidden">
              {/* Status bar */}
              <div className="bg-gray-900 px-5 pt-2 pb-1 flex items-center justify-between">
                <span className="text-white text-xs font-medium">9:41</span>
                <div className="flex items-center gap-1">
                  <Icon name="Wifi" size={10} className="text-white" />
                  <Icon name="Battery" size={10} className="text-white" />
                </div>
              </div>

              {/* App header */}
              <div className="bg-white px-4 py-3 flex items-center gap-2 border-b border-gray-100">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Icon name="CreditCard" size={12} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-800">Mi Wallet</span>
              </div>

              {/* Gift card visual */}
              <div className="p-3">
                <div className={`bg-gradient-to-br ${card?.gradient} rounded-2xl p-4 relative overflow-hidden shadow-lg`}>
                  {/* Decorative circles */}
                  <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-white/10" />

                  {/* Card top */}
                  <div className="relative flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white/70 text-[9px] uppercase tracking-widest font-medium">{TYPE_LABELS?.[card?.type]}</p>
                      <p className="text-white text-xs font-bold mt-0.5 leading-tight">{card?.name?.length > 28 ? card?.name?.slice(0, 28) + '…' : card?.name}</p>
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Icon name={card?.icon} size={14} className="text-white" />
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="relative mb-3">
                    <p className="text-white/60 text-[9px] uppercase tracking-wider">Saldo disponible</p>
                    <p className="text-white text-2xl font-bold">{formatPrice(exampleBalance)}</p>
                  </div>

                  {/* Code */}
                  <div className="relative flex items-center justify-between">
                    <p className="text-white/80 font-mono text-[10px] tracking-widest">{exampleCode}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                        <Icon name="QrCode" size={12} className="text-gray-800" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {card?.message && (
                  <div className="mt-2 px-1">
                    <p className="text-[10px] text-gray-500 italic text-center">"{card?.message}"</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="bg-primary text-white text-[10px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1">
                    <Icon name="Scan" size={10} />
                    Canjear
                  </button>
                  {card?.type === 'prepaid' && (
                    <button className="bg-white border border-gray-200 text-gray-700 text-[10px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1">
                      <Icon name="Plus" size={10} />
                      Recargar
                    </button>
                  )}
                  {card?.type !== 'prepaid' && (
                    <button className="bg-white border border-gray-200 text-gray-700 text-[10px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1">
                      <Icon name="Share2" size={10} />
                      Compartir
                    </button>
                  )}
                </div>

                {/* Validity */}
                <div className="mt-2 text-center">
                  <p className="text-[9px] text-gray-400">
                    {card?.validityDays ? `Válida por ${card?.validityDays} días desde la compra` : 'Sin fecha de vencimiento'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card info summary */}
        <div className="px-5 pb-5">
          <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Template</span>
              <span className="font-medium text-foreground">{card?.templateLabel}</span>
            </div>
            {card?.denominations && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Denominaciones</span>
                <span className="font-medium text-foreground">{card?.denominations?.map(d => `$${d}`)?.join(', ')}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Vigencia</span>
              <span className="font-medium text-foreground">{card?.validityDays ? `${card?.validityDays} días` : 'Permanente'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardWalletPreviewModal;
