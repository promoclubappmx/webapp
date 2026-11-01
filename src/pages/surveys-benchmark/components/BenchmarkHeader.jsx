import React from 'react';
import Icon from '../../../components/AppIcon';

const BenchmarkHeader = ({ radius, setRadius, category, setCategory }) => {
  const radiusOptions = [
    { value: 1, label: '1 km' },
    { value: 3, label: '3 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
  ];

  const categoryOptions = [
    'Restaurante',
    'Cafetería',
    'Bar / Cantina',
    'Panadería',
    'Tienda de conveniencia',
    'Spa / Salón de belleza',
    'Gimnasio',
    'Farmacia',
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Benchmark de satisfacción
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compara tu NPS y satisfacción vs otros negocios de tu categoría en tu zona.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-full">
              <Icon name="Lock" size={12} />
              Datos agregados y anonimizados de negocios PromoClub en tu área
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Radius selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Radio:</span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {radiusOptions?.map(opt => (
                <button
                  key={opt?.value}
                  onClick={() => setRadius(opt?.value)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    radius === opt?.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {opt?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Categoría:</span>
            <select
              value={category}
              onChange={e => setCategory(e?.target?.value)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {categoryOptions?.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkHeader;
