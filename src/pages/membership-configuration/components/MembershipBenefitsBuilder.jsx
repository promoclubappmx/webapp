import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BENEFIT_TYPES = [
  { type: 'quantity_included', label: 'Cantidad incluida', icon: 'Package', desc: 'Producto/servicio incluido por día, mes o ilimitado' },
  { type: 'discount_percent', label: 'Descuento porcentual', icon: 'Percent', desc: 'Descuento % en compras del negocio' },
  { type: 'catalog_price', label: 'Precios especiales', icon: 'Tag', desc: 'Precios especiales en ítems del catálogo' },
  { type: 'points_multiplier', label: 'Multiplicador de puntos', icon: 'Star', desc: 'Multiplica los puntos ganados por visita/compra' },
  { type: 'exclusive_access', label: 'Beneficios exclusivos', icon: 'Crown', desc: 'Acceso anticipado, reservaciones prioritarias y más' },
];

const MODEL_OPTIONS = [
  { value: 'daily_limit', label: 'Límite diario', desc: 'El contador se reinicia a medianoche', icon: 'Sun' },
  { value: 'monthly_quota', label: 'Cuota mensual', desc: 'No se acumulan al siguiente mes', icon: 'Calendar' },
  { value: 'unlimited', label: 'Ilimitado', desc: 'Sin límite durante la vigencia', icon: 'Infinity' },
];

const BenefitModal = ({ onSave, onClose }) => {
  const [step, setStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [config, setConfig] = useState({
    model: 'daily_limit',
    quantity: 1,
    item_name: '',
    discount_percent: 20,
    multiplier: 2,
    exclusive_options: [],
  });

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep('config');
  };

  const handleSave = () => {
    onSave?.({ type: selectedType, ...config });
    onClose?.();
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
                value={config?.item_name}
                onChange={e => setConfig(c => ({ ...c, item_name: e?.target?.value }))}
                placeholder="Buscar en catálogo... ej: Café Americano"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Modelo de cantidad</label>
              <div className="space-y-2">
                {MODEL_OPTIONS?.map(opt => (
                  <button
                    key={opt?.value}
                    onClick={() => setConfig(c => ({ ...c, model: opt?.value }))}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${config?.model === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name={opt?.icon} size={18} className={config?.model === opt?.value ? 'text-primary' : 'text-muted-foreground'} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                        <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {config?.model !== 'unlimited' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Cantidad {config?.model === 'daily_limit' ? 'por día' : 'por mes'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={config?.quantity}
                    onChange={e => setConfig(c => ({ ...c, quantity: parseInt(e?.target?.value) || 1 }))}
                    className="w-24 px-3 py-2 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                  />
                  <span className="text-sm text-muted-foreground">
                    {config?.item_name ? `${config?.item_name} ${config?.model === 'daily_limit' ? 'por día' : 'por mes'}` : 'unidades'}
                  </span>
                </div>
              </div>
            )}
            {config?.item_name && (
              <div className="bg-muted/30 rounded-xl p-3 text-sm text-muted-foreground">
                <Icon name="Eye" size={14} className="inline mr-1" />
                Ejemplo: <em>"{config?.quantity} {config?.item_name} {config?.model === 'daily_limit' ? 'por día incluido' : config?.model === 'monthly_quota' ? 'al mes incluidos' : 'ilimitados'} en tu membresía"</em>
              </div>
            )}
          </div>
        );

      case 'discount_percent':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Porcentaje de descuento: <strong>{config?.discount_percent}%</strong>
              </label>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={config?.discount_percent}
                onChange={e => setConfig(c => ({ ...c, discount_percent: parseInt(e?.target?.value) }))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5%</span><span>50%</span>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-sm text-muted-foreground">
              <Icon name="Eye" size={14} className="inline mr-1" />
              Con este descuento, un producto de <strong>$200 MXN</strong> cuesta <strong>${(200 * (1 - config?.discount_percent / 100))?.toFixed(2)} MXN</strong> para suscriptores
            </div>
          </div>
        );

      case 'points_multiplier':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Multiplicador</label>
              <div className="flex gap-2 flex-wrap">
                {[1.5, 2, 3, 5]?.map(m => (
                  <button
                    key={m}
                    onClick={() => setConfig(c => ({ ...c, multiplier: m }))}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${config?.multiplier === m ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-sm text-muted-foreground">
              <Icon name="Star" size={14} className="inline mr-1 text-amber-500" />
              Los suscriptores ganan <strong>{config?.multiplier}x más puntos</strong> en cada visita o compra.
              Se aplica automáticamente al acreditar puntos.
            </div>
          </div>
        );

      case 'exclusive_access':
        const exclusiveOpts = [
          { id: 'flash_deals', label: 'Acceso anticipado a flash deals', desc: '30 min antes que el público' },
          { id: 'priority_reservations', label: 'Reservaciones con prioridad', desc: 'Confirma antes que no suscriptores' },
          { id: 'exclusive_badge', label: 'Badge exclusivo en perfil', desc: 'Ej: Socio Fundador' },
          { id: 'priority_queue', label: 'Fila preferente', desc: 'Visible para el staff al validar' },
        ];
        return (
          <div className="space-y-3">
            {exclusiveOpts?.map(opt => (
              <label key={opt?.id} className="flex items-start gap-3 p-3 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
                <input
                  type="checkbox"
                  checked={config?.exclusive_options?.includes(opt?.id)}
                  onChange={e => {
                    const opts = config?.exclusive_options || [];
                    setConfig(c => ({
                      ...c,
                      exclusive_options: e?.target?.checked ? [...opts, opt?.id] : opts?.filter(o => o !== opt?.id)
                    }));
                  }}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                  <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                </div>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-semibold text-foreground">
            {step === 'type' ? 'Agregar beneficio' : 'Configurar beneficio'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === 'type' ? (
            <div className="space-y-2">
              {BENEFIT_TYPES?.map(bt => (
                <button
                  key={bt?.type}
                  onClick={() => handleTypeSelect(bt?.type)}
                  className="w-full text-left p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon name={bt?.icon} size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{bt?.label}</p>
                      <p className="text-xs text-muted-foreground">{bt?.desc}</p>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button onClick={() => setStep('type')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <Icon name="ArrowLeft" size={14} />
                Cambiar tipo
              </button>
              <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-xl">
                <Icon name={BENEFIT_TYPES?.find(b => b?.type === selectedType)?.icon || 'Star'} size={18} className="text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {BENEFIT_TYPES?.find(b => b?.type === selectedType)?.label}
                </span>
              </div>
              {renderConfig()}
            </div>
          )}
        </div>

        {step === 'config' && (
          <div className="flex gap-3 p-6 border-t border-border">
            <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              Agregar beneficio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const getBenefitIcon = (type) => {
  const icons = { quantity_included: 'Package', discount_percent: 'Percent', catalog_price: 'Tag', points_multiplier: 'Star', exclusive_access: 'Crown' };
  return icons?.[type] || 'Gift';
};

const getBenefitDescription = (benefit) => {
  switch (benefit?.type) {
    case 'quantity_included':
      return `${benefit?.quantity} ${benefit?.item_name} ${benefit?.model === 'daily_limit' ? 'por día' : benefit?.model === 'monthly_quota' ? 'por mes' : 'ilimitados'}`;
    case 'discount_percent':
      return `${benefit?.discount_percent}% de descuento en compras`;
    case 'points_multiplier':
      return `${benefit?.multiplier}x multiplicador de puntos`;
    case 'exclusive_access':
      return `${(benefit?.exclusive_options || [])?.length} beneficio(s) exclusivo(s)`;
    default:
      return 'Beneficio configurado';
  }
};

const getModelBadge = (model) => {
  const badges = { daily_limit: { label: 'Diario', color: 'bg-blue-100 text-blue-700' }, monthly_quota: { label: 'Mensual', color: 'bg-purple-100 text-purple-700' }, unlimited: { label: 'Ilimitado', color: 'bg-emerald-100 text-emerald-700' } };
  return badges?.[model];
};

const MembershipBenefitsBuilder = ({ benefits = [], onAdd, onRemove }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Icon name="Gift" size={18} className="text-primary" />
          ¿Qué incluye la membresía?
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Agregar beneficio
        </button>
      </div>
      {benefits?.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
          <Icon name="Gift" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Sin beneficios configurados</p>
          <p className="text-xs text-muted-foreground mt-1">Agrega al menos un beneficio para activar la membresía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {benefits?.map((benefit, idx) => {
            const modelBadge = getModelBadge(benefit?.model);
            return (
              <div key={idx} className="flex items-center gap-3 p-4 border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={getBenefitIcon(benefit?.type)} size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{getBenefitDescription(benefit)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {modelBadge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${modelBadge?.color}`}>{modelBadge?.label}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRemove?.(idx)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <BenefitModal
          onSave={(benefit) => { onAdd?.(benefit); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default MembershipBenefitsBuilder;
