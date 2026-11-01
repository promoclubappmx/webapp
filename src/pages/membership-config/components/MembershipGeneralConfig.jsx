import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ACCENT_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
  '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#6366F1',
  '#D97706', '#64748B'
];

const MembershipGeneralConfig = ({ data, onChange }) => {
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customHex, setCustomHex] = useState('');

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-base font-semibold text-foreground mb-5">Información de la membresía</h2>
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre de la membresía <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            maxLength={40}
            value={data?.name || ''}
            onChange={e => handleChange('name', e?.target?.value)}
            placeholder="Club Café · Membresía VIP · Pase Mensual"
            className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">{(data?.name || '')?.length}/40 · Visible para el cliente en la app</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Descripción corta</label>
          <textarea
            maxLength={120}
            value={data?.description || ''}
            onChange={e => handleChange('description', e?.target?.value)}
            placeholder="Todo lo que necesitas para tu café diario por una cuota fija mensual"
            rows={3}
            className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{(data?.description || '')?.length}/120</p>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Imagen de portada</label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Icon name="Upload" size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Arrastra una imagen o <span className="text-primary font-medium">selecciona archivo</span></p>
            <p className="text-xs text-muted-foreground mt-1">Formato 16:9 · Mín 800px ancho · JPG, PNG</p>
          </div>
          {!data?.coverImage && (
            <div
              className="mt-3 h-24 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: data?.accentColor || '#3B82F6' }}
            >
              {data?.name || 'Mi Membresía'}
            </div>
          )}
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Color de acento</label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS?.map(color => (
              <button
                key={color}
                onClick={() => handleChange('accentColor', color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  data?.accentColor === color ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <button
              onClick={() => setShowCustomColor(!showCustomColor)}
              className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors"
            >
              <Icon name="Plus" size={14} className="text-muted-foreground" />
            </button>
          </div>
          {showCustomColor && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={customHex}
                onChange={e => setCustomHex(e?.target?.value)}
                placeholder="#FF5733"
                className="w-28 px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => { if (/^#[0-9A-Fa-f]{6}$/?.test(customHex)) { handleChange('accentColor', customHex); setShowCustomColor(false); } }}
                className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>

        {/* Max Subscribers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Cupo máximo de suscriptores</label>
            <button
              onClick={() => handleChange('hasMaxSubscribers', !data?.hasMaxSubscribers)}
              className={`relative w-10 h-5 rounded-full transition-colors ${data?.hasMaxSubscribers ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${data?.hasMaxSubscribers ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          {data?.hasMaxSubscribers && (
            <div>
              <input
                type="number"
                min={1}
                value={data?.maxSubscribers || ''}
                onChange={e => handleChange('maxSubscribers', parseInt(e?.target?.value))}
                placeholder="100"
                className="w-32 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                <Icon name="Info" size={12} className="inline mr-1" />
                Aparece como <strong>Lista de espera</strong> al alcanzar el cupo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipGeneralConfig;
