import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const LanguagesForm = ({ formData, onChange }) => {
  const [translating, setTranslating] = useState(false);
  const [menuTranslating, setMenuTranslating] = useState(false);
  const [menuTranslated, setMenuTranslated] = useState(false);

  const bilingualFields = [
    { key: 'shortDescriptionEN', sourceKey: 'shortDescription', label: 'Descripción corta', placeholder: 'Short description in English...' },
    { key: 'longDescriptionEN', sourceKey: 'longDescription', label: 'Descripción larga', placeholder: 'Tell customers what makes your business special...' },
    { key: 'howToGetEN', sourceKey: 'howToGet', label: 'Indicaciones de ubicación', placeholder: 'How to get there in English...' },
  ];

  const filledFields = bilingualFields?.filter(f => formData?.[f?.key]);
  const completionPct = Math.round((filledFields?.length / bilingualFields?.length) * 100);

  const simulateTranslate = async (field) => {
    setTranslating(field);
    await new Promise(r => setTimeout(r, 1200));
    const mockTranslations = {
      shortDescription: formData?.shortDescription ? `[EN] ${formData?.shortDescription}` : 'The best specialty coffee in the Historic Center',
      longDescription: formData?.longDescription ? `[EN] ${formData?.longDescription}` : 'We are a specialty coffee shop with over 10 years of experience...',
      howToGet: formData?.howToGet ? `[EN] ${formData?.howToGet}` : 'We are located inside the main market, stall 42, second floor.',
    };
    const sourceKey = bilingualFields?.find(f => f?.key === field)?.sourceKey;
    onChange(field, mockTranslations?.[sourceKey] || '');
    setTranslating(false);
  };

  const simulateMenuTranslate = async () => {
    setMenuTranslating(true);
    await new Promise(r => setTimeout(r, 2000));
    setMenuTranslating(false);
    setMenuTranslated(true);
  };

  const menuCategories = formData?.menuCategories || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Ficha bilingüe (Español + Inglés)</h3>
          <p className="text-xs text-muted-foreground mt-1">Los usuarios con idioma preferido en inglés verán automáticamente la versión en inglés.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">Completitud EN:</div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
            <span className="text-xs font-medium text-foreground">{completionPct}%</span>
          </div>
        </div>
      </div>
      {/* Bilingual fields */}
      <div className="space-y-6">
        {bilingualFields?.map(field => (
          <div key={field?.key} className="border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">{field?.label}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Español */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">🇲🇽 Español</span>
                </div>
                <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3 min-h-[60px]">
                  {formData?.[field?.sourceKey] || <span className="text-muted-foreground italic">No configurado aún</span>}
                </p>
              </div>
              {/* Inglés */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">🇺🇸 English</span>
                  <button
                    onClick={() => simulateTranslate(field?.key)}
                    disabled={translating === field?.key || !formData?.[field?.sourceKey]}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    {translating === field?.key ? (
                      <><Icon name="Loader" size={12} className="animate-spin" /> Traduciendo...</>
                    ) : (
                      <><Icon name="Sparkles" size={12} /> Traducir con IA</>
                    )}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData?.[field?.key] || ''}
                  onChange={e => onChange(field?.key, e?.target?.value)}
                  placeholder={field?.placeholder}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Menú traducido */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-foreground">Menú digital en inglés</h4>
            <p className="text-xs text-muted-foreground">La IA traduce todo el menú de un golpe</p>
          </div>
          <button
            onClick={simulateMenuTranslate}
            disabled={menuTranslating || menuCategories?.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {menuTranslating ? (
              <><Icon name="Loader" size={16} className="animate-spin" /> Traduciendo menú...</>
            ) : (
              <><Icon name="Sparkles" size={16} /> Traducir menú al inglés</>
            )}
          </button>
        </div>

        {menuCategories?.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="UtensilsCrossed" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Primero configura tu menú digital en la pestaña Avanzado</p>
          </div>
        ) : menuTranslated ? (
          <div className="p-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-xs text-green-700 flex items-center gap-2">
              <Icon name="CheckCircle" size={14} />
              Menú traducido. Revisa y ajusta las traducciones antes de publicar.
            </div>
            <div className="space-y-3">
              {menuCategories?.map(cat => (
                <div key={cat?.id}>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="px-3 py-2 bg-muted/30 rounded-lg text-xs font-semibold text-foreground">{cat?.name}</div>
                    <input
                      type="text"
                      defaultValue={`[EN] ${cat?.name}`}
                      className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none"
                    />
                  </div>
                  {(cat?.products || [])?.slice(0, 2)?.map(prod => (
                    <div key={prod?.id} className="grid grid-cols-2 gap-3 mb-1 pl-4">
                      <div className="px-3 py-1.5 bg-muted/20 rounded-lg text-xs text-foreground">{prod?.name || 'Producto'}</div>
                      <input
                        type="text"
                        defaultValue={`[EN] ${prod?.name || 'Product'}`}
                        className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Icon name="Languages" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{menuCategories?.length} categoría(s) listas para traducir</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguagesForm;
