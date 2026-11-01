import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PRESET_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#10B981',
  '#14B8A6', '#06B6D4', '#3B82F6', '#1D4ED8',
];

const MembershipGeneralConfig = ({ data, onChange }) => {
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customHex, setCustomHex] = useState('');

  const handleChange = (field, value) => {
    onChange?.({ ...data, [field]: value });
  };

  const handleColorSelect = (color) => {
    handleChange('accent_color', color);
  };

  const handleCustomHex = (val) => {
    setCustomHex(val);
    if (/^#[0-9A-Fa-f]{6}$/?.test(val)) {
      handleChange('accent_color', val);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
        <Icon name="Info" size={18} className="text-primary" />
        Información de la membresía
      </h2>
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre de la membresía
            <span className="text-muted-foreground font-normal ml-2 text-xs">({(data?.name || '')?.length}/40)</span>
          </label>
          <input
            type="text"
            maxLength={40}
            value={data?.name || ''}
            onChange={e => handleChange('name', e?.target?.value)}
            placeholder="Club Café · Membresía VIP · Pase Mensual"
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <p className="text-xs text-muted-foreground mt-1">Visible para el cliente en la app</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Descripción corta
            <span className="text-muted-foreground font-normal ml-2 text-xs">({(data?.description || '')?.length}/120)</span>
          </label>
          <textarea
            maxLength={120}
            rows={3}
            value={data?.description || ''}
            onChange={e => handleChange('description', e?.target?.value)}
            placeholder="Todo lo que necesitas para tu café diario por una cuota fija mensual"
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">Visible para el cliente en la app</p>
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Imagen de portada</label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
            {data?.cover_image ? (
              <div className="relative">
                <img src={data?.cover_image} alt="Portada" className="w-full h-32 object-cover rounded-lg" />
                <button
                  onClick={() => handleChange('cover_image', '')}
                  className="absolute top-2 right-2 w-7 h-7 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ) : (
              <div>
                <Icon name="ImagePlus" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Arrastra una imagen o haz clic para subir</p>
                <p className="text-xs text-muted-foreground mt-1">Formato recomendado: 16:9, mín 800px</p>
                <p className="text-xs text-muted-foreground">Si no hay imagen, se genera automáticamente con el color de acento</p>
              </div>
            )}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Color de acento</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS?.map(color => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${data?.accent_color === color ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <button
              onClick={() => setShowCustomColor(!showCustomColor)}
              className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors"
              title="Color personalizado"
            >
              <Icon name="Plus" size={14} className="text-muted-foreground" />
            </button>
          </div>
          {showCustomColor && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: data?.accent_color || '#6366F1' }} />
              <input
                type="text"
                value={customHex}
                onChange={e => handleCustomHex(e?.target?.value)}
                placeholder="#6366F1"
                className="w-32 px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
              <span className="text-xs text-muted-foreground">Hex válido: #RRGGBB</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Se usa para el diseño de la tarjeta digital del cliente</p>
        </div>

        {/* Max capacity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-sm font-medium text-foreground">Cupo máximo de suscriptores</label>
              <p className="text-xs text-muted-foreground">Opcional — útil para membresías exclusivas</p>
            </div>
            <button
              onClick={() => handleChange('max_subscribers', data?.max_subscribers ? null : 100)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${data?.max_subscribers ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                style={{ left: data?.max_subscribers ? '22px' : '2px' }}
              />
            </button>
          </div>
          {data?.max_subscribers && (
            <div className="flex items-center gap-3 mt-2">
              <input
                type="number"
                min={1}
                value={data?.max_subscribers}
                onChange={e => handleChange('max_subscribers', parseInt(e?.target?.value) || 1)}
                className="w-28 px-3 py-2 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-sm text-muted-foreground">suscriptores máximo</span>
            </div>
          )}
          {data?.max_subscribers && (
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <Icon name="Info" size={12} />
              Al alcanzar el cupo, aparece como "Lista de espera" en la app del cliente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipGeneralConfig;
