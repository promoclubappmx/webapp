import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BENEFIT_TYPES = [
  { type: 'quantity_included', label: 'Cantidad incluida', icon: 'Package', desc: 'Café, clases, servicios con límite diario/mensual/ilimitado' },
  { type: 'discount_percent', label: 'Descuento porcentual', icon: 'Percent', desc: 'Descuento % en compras del negocio' },
  { type: 'catalog_price', label: 'Precios especiales', icon: 'Tag', desc: 'Precios especiales en ítems del catálogo' },
  { type: 'points_multiplier', label: 'Multiplicador de puntos', icon: 'Star', desc: '2x, 3x puntos por visita/compra' },
  { type: 'exclusive_access', label: 'Beneficios exclusivos', icon: 'Crown', desc: 'Acceso anticipado, reservaciones prioritarias, badges' },
];

const MODEL_OPTIONS = [
  { value: 'daily_limit', label: 'Límite diario', desc: 'El contador se reinicia a medianoche', icon: 'Sun' },
  { value: 'monthly_quota', label: 'Cuota mensual', desc: 'No se acumulan al siguiente mes', icon: 'Calendar' },
  { value: 'unlimited', label: 'Ilimitado', desc: 'Sin límite durante la vigencia', icon: 'Infinity' },
];

const MULTIPLIERS = [1.5, 2, 3, 5];

const BenefitModal = ({ onSave, onClose }) => {
  const [step, setStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [config, setConfig] = useState({});

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep('config');
  };

  const handleSave = () => {
    onSave({ type: selectedType, ...config });
    onClose();
  };

  const renderConfig = () => {
    switch (selectedType) {
      case 'quantity_included':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Producto o servicio</label>
              <input
                type="text"
                value={config?.itemName || ''}
                onChange={e => setConfig({ ...config, itemName: e?.target?.value })}
                placeholder="Café Americano, Clase de yoga..."
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Modelo de cantidad</label>
              <div className="space-y-2">
                {MODEL_OPTIONS?.map(m => (
                  <button
                    key={m?.value}
                    onClick={() => setConfig({ ...config, model: m?.value })}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-colors flex items-start gap-3 ${
                      config?.model === m?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <Icon name={m?.icon} size={18} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{m?.label}</p>
                      <p className="text-xs text-muted-foreground">{m?.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {config?.model && config?.model !== 'unlimited' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Cantidad {config?.model === 'daily_limit' ? 'por día' : 'por mes'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={config?.quantity || ''}
                  onChange={e => setConfig({ ...config, quantity: parseInt(e?.target?.value) })}
                  className="w-24 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
            {config?.model && config?.model !== 'unlimited' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Al agotar el límite</label>
                <div className="space-y-2">
                  {[
                    { value: 'normal_price', label: 'Precio normal del catálogo' },
                    { value: 'special_price', label: 'Precio especial para suscriptores' },
                    { value: 'unavailable', label: 'No disponible hasta el siguiente período' },
                  ]?.map(opt => (
                    <label key={opt?.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="limit_action"
                        value={opt?.value}
                        checked={config?.limitAction === opt?.value}
                        onChange={() => setConfig({ ...config, limitAction: opt?.value })}
                        className="text-primary"
                      />
                      <span className="text-sm text-foreground">{opt?.label}</span>
                    </label>
                  ))}
                </div>
                {config?.limitAction === 'special_price' && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={config?.specialPrice || ''}
                      onChange={e => setConfig({ ...config, specialPrice: e?.target?.value })}
                      placeholder="35"
                      className="w-24 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm text-muted-foreground">MXN</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'discount_percent':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Porcentaje de descuento</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={config?.discountPercent || 20}
                  onChange={e => setConfig({ ...config, discountPercent: parseInt(e?.target?.value) })}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 w-20">
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={config?.discountPercent || 20}
                    onChange={e => setConfig({ ...config, discountPercent: parseInt(e?.target?.value) })}
                    className="w-14 px-2 py-1.5 border border-border rounded-lg text-sm bg-background text-center focus:outline-none"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              {config?.discountPercent && (
                <p className="text-xs text-muted-foreground mt-2 bg-muted/40 rounded-lg px-3 py-2">
                  Con este descuento, un producto de <strong>$200 MXN</strong> cuesta <strong className="text-emerald-600">${(200 * (1 - config?.discountPercent / 100))?.toFixed(0)} MXN</strong> para suscriptores
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Aplica a</label>
              {['Todos los productos', 'Categorías específicas', 'Ítems específicos']?.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="applies_to"
                    checked={config?.appliesTo === i}
                    onChange={() => setConfig({ ...config, appliesTo: i })}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">{opt}</span>
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.stackable || false}
                onChange={e => setConfig({ ...config, stackable: e?.target?.checked })}
                className="text-primary rounded"
              />
              <span className="text-sm text-foreground">Acumulable con otras promociones activas</span>
            </label>
          </div>
        );

      case 'points_multiplier':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Multiplicador</label>
              <div className="flex gap-2 flex-wrap">
                {MULTIPLIERS?.map(m => (
                  <button
                    key={m}
                    onClick={() => setConfig({ ...config, multiplier: m })}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-colors ${
                      config?.multiplier === m ? 'border-primary bg-primary text-white' : 'border-border text-foreground hover:border-primary'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
                <input
                  type="number"
                  min={1.5}
                  max={10}
                  step={0.5}
                  value={![1.5,2,3,5]?.includes(config?.multiplier) ? config?.multiplier || '' : ''}
                  onChange={e => setConfig({ ...config, multiplier: parseFloat(e?.target?.value) })}
                  placeholder="Custom"
                  className="w-24 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Aplica a</label>
              {['Todos los check-ins y compras', 'Solo check-ins', 'Solo compras via Order Ahead']?.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mult_applies"
                    checked={config?.multiplierAppliesTo === i}
                    onChange={() => setConfig({ ...config, multiplierAppliesTo: i })}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">{opt}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <Icon name="Info" size={12} className="inline mr-1 text-blue-600" />
              El multiplicador se aplica automáticamente al acreditar puntos. No requiere validación manual del staff.
            </p>
          </div>
        );

      case 'exclusive_access':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground mb-2">Tipo de exclusividad</label>
            {[
              { key: 'early_flash', label: 'Acceso anticipado a flash deals', desc: '30 min antes que el público' },
              { key: 'priority_reservations', label: 'Reservaciones con prioridad', desc: 'Siempre confirma antes que clientes no suscritos' },
              { key: 'exclusive_badge', label: 'Badge exclusivo en perfil', desc: 'Nombre del badge visible en su perfil' },
              { key: 'priority_queue', label: 'Fila preferente', desc: 'El staff lo ve al validar' },
            ]?.map(opt => (
              <label key={opt?.key} className="flex items-start gap-3 p-3 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
                <input
                  type="checkbox"
                  checked={config?.[opt?.key] || false}
                  onChange={e => setConfig({ ...config, [opt?.key]: e?.target?.checked })}
                  className="mt-0.5 text-primary rounded"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                  <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                </div>
              </label>
            ))}
            {config?.exclusive_badge && (
              <input
                type="text"
                value={config?.badgeName || ''}
                onChange={e => setConfig({ ...config, badgeName: e?.target?.value })}
                placeholder="Ej: Socio Fundador"
                className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">
            {step === 'type' ? 'Agregar beneficio' : BENEFIT_TYPES?.find(b => b?.type === selectedType)?.label}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5">
          {step === 'type' ? (
            <div className="space-y-2">
              {BENEFIT_TYPES?.map(bt => (
                <button
                  key={bt?.type}
                  onClick={() => handleTypeSelect(bt?.type)}
                  className="w-full text-left p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex items-start gap-3"
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={bt?.icon} size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{bt?.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{bt?.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              {renderConfig()}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  Agregar beneficio
                </button>
                <button
                  onClick={() => setStep('type')}
                  className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Atrás
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getBenefitSummary = (benefit) => {
  switch (benefit?.type) {
    case 'quantity_included':
      if (benefit?.model === 'daily_limit') return `${benefit?.quantity || 1} ${benefit?.itemName || 'ítem'} por día incluido`;
      if (benefit?.model === 'monthly_quota') return `${benefit?.quantity || 1} ${benefit?.itemName || 'ítem'} al mes incluido`;
      return `${benefit?.itemName || 'ítem'} ilimitado`;
    case 'discount_percent':
      return `${benefit?.discountPercent || 20}% de descuento en compras`;
    case 'catalog_price':
      return 'Precios especiales en catálogo';
    case 'points_multiplier':
      return `${benefit?.multiplier || 2}x puntos por visita/compra`;
    case 'exclusive_access':
      return 'Beneficios exclusivos de suscriptor';
    default:
      return 'Beneficio';
  }
};

const getModelBadge = (benefit) => {
  if (benefit?.type !== 'quantity_included') return null;
  const labels = { daily_limit: 'Diario', monthly_quota: 'Mensual', unlimited: 'Ilimitado' };
  const colors = { daily_limit: 'bg-blue-100 text-blue-700', monthly_quota: 'bg-purple-100 text-purple-700', unlimited: 'bg-emerald-100 text-emerald-700' };
  return { label: labels?.[benefit?.model], color: colors?.[benefit?.model] };
};

const BENEFIT_ICONS = {
  quantity_included: 'Package',
  discount_percent: 'Percent',
  catalog_price: 'Tag',
  points_multiplier: 'Star',
  exclusive_access: 'Crown',
};

const MembershipBenefitsBuilder = ({ benefits, onAdd, onRemove }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-foreground">¿Qué incluye la membresía?</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Agregar beneficio
        </button>
      </div>
      {benefits?.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Icon name="Gift" size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aún no has agregado beneficios</p>
          <p className="text-xs mt-1">Agrega al menos un beneficio para activar la membresía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {benefits?.map((benefit, idx) => {
            const badge = getModelBadge(benefit);
            return (
              <div key={idx} className="flex items-center gap-3 p-4 border border-border rounded-xl">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={BENEFIT_ICONS?.[benefit?.type] || 'Gift'} size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{getBenefitSummary(benefit)}</p>
                  {badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge?.color}`}>{badge?.label}</span>
                  )}
                </div>
                <button
                  onClick={() => onRemove(idx)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <BenefitModal
          onSave={onAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default MembershipBenefitsBuilder;
