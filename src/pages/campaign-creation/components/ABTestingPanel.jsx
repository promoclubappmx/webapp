import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const VARIANT_COLORS = [
  { letter: 'A', bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  { letter: 'B', bg: 'bg-green-500', light: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
  { letter: 'C', bg: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
];

const SPLIT_OPTIONS = [
  { id: '50-50', label: '50 / 50', desc: '2 variantes iguales' },
  { id: '33-33-33', label: '33 / 33 / 33', desc: '3 variantes iguales' },
  { id: '70-30', label: '70 / 30', desc: 'Mayoría en A' },
  { id: '80-20', label: '80 / 20', desc: 'Prueba pequeña' },
];

const WHAT_TO_VARY = [
  'Mensaje del push (copy diferente)',
  'Valor del descuento (15% vs 20%)',
  'Imagen de la promo',
  'Tipo de incentivo (cupón vs puntos)',
  'Timing de envío (mañana vs tarde)',
  'Canal (push vs email vs WhatsApp)',
];

const ABTestingPanel = ({ data, onChange }) => {
  const [variantCount, setVariantCount] = useState(data?.variantCount || 2);

  const handleToggle = () => {
    onChange({ ...data, abEnabled: !data?.abEnabled });
  };

  const handleVariantChange = (idx, field, value) => {
    const variants = [...(data?.variants || [{ title: '', discount: '', cta: '' }, { title: '', discount: '', cta: '' }])];
    variants[idx] = { ...variants?.[idx], [field]: value };
    onChange({ ...data, variants });
  };

  const handleAddVariant = () => {
    if (variantCount >= 3) return;
    const newCount = variantCount + 1;
    setVariantCount(newCount);
    const variants = [...(data?.variants || []), { title: '', discount: '', cta: '' }];
    onChange({ ...data, variantCount: newCount, variants });
  };

  const handleRemoveVariant = () => {
    if (variantCount <= 2) return;
    const newCount = variantCount - 1;
    setVariantCount(newCount);
    const variants = (data?.variants || [])?.slice(0, newCount);
    onChange({ ...data, variantCount: newCount, variants });
  };

  const variants = data?.variants || Array(variantCount)?.fill(null)?.map(() => ({ title: '', discount: '', cta: '' }));

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <Icon name="FlaskConical" size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Prueba A/B</p>
            <p className="text-xs text-muted-foreground">Compara variantes y descubre cuál funciona mejor</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            data?.abEnabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            data?.abEnabled ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>
      {data?.abEnabled && (
        <div className="p-4 space-y-5">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">Enviaremos cada variante a una parte de tu audiencia y te mostraremos cuál funcionó mejor. Al finalizar, podrás enviar la variante ganadora al resto.</p>
          </div>

          {/* Qué variar */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">¿Qué puedes variar?</p>
            <div className="flex flex-wrap gap-1.5">
              {WHAT_TO_VARY?.map((item, i) => (
                <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{item}</span>
              ))}
            </div>
          </div>

          {/* Variantes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">Variantes ({variantCount})</p>
              <div className="flex items-center gap-2">
                {variantCount > 2 && (
                  <button onClick={handleRemoveVariant} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                    <Icon name="Minus" size={12} /> Quitar variante
                  </button>
                )}
                {variantCount < 3 && (
                  <button onClick={handleAddVariant} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                    <Icon name="Plus" size={12} /> Agregar variante C
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array(variantCount)?.fill(null)?.map((_, idx) => {
                const vc = VARIANT_COLORS?.[idx];
                const variant = variants?.[idx] || { title: '', discount: '', cta: '' };
                return (
                  <div key={idx} className={`border ${vc?.border} ${vc?.light} rounded-xl p-3`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-6 h-6 ${vc?.bg} text-white rounded text-xs font-bold flex items-center justify-center`}>{vc?.letter}</span>
                      <span className={`text-sm font-semibold ${vc?.text}`}>Variante {vc?.letter}</span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Título de la promo"
                        value={variant?.title || ''}
                        onChange={e => handleVariantChange(idx, 'title', e?.target?.value)}
                        className="w-full px-2 py-1.5 border border-border rounded-lg text-xs bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="% descuento o incentivo"
                        value={variant?.discount || ''}
                        onChange={e => handleVariantChange(idx, 'discount', e?.target?.value)}
                        className="w-full px-2 py-1.5 border border-border rounded-lg text-xs bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="Texto del CTA"
                        value={variant?.cta || ''}
                        onChange={e => handleVariantChange(idx, 'cta', e?.target?.value)}
                        className="w-full px-2 py-1.5 border border-border rounded-lg text-xs bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* División de audiencia */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">División de audiencia</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SPLIT_OPTIONS?.map(opt => (
                <button
                  key={opt?.id}
                  onClick={() => onChange({ ...data, audienceSplit: opt?.id })}
                  className={`p-2 rounded-lg border-2 text-center transition-all ${
                    data?.audienceSplit === opt?.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <p className={`text-sm font-bold ${data?.audienceSplit === opt?.id ? 'text-primary' : 'text-foreground'}`}>{opt?.label}</p>
                  <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Métricas de comparación */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
              <Icon name="BarChart2" size={12} className="text-primary" />
              Métricas de comparación
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Tasa de apertura', 'Tasa de canje', 'Tasa de visita', 'Revenue generado', 'Costo por conversión']?.map(m => (
                <span key={m} className="text-xs bg-background border border-border rounded-full px-2 py-0.5 text-muted-foreground">{m}</span>
              ))}
            </div>
          </div>

          {/* Duración de la prueba */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Duración de la prueba</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={30}
                value={data?.testDuration || 7}
                onChange={e => onChange({ ...data, testDuration: parseInt(e?.target?.value) || 7 })}
                className="w-20 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">días antes de declarar un ganador</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABTestingPanel;
