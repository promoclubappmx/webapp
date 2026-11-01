import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { updatePunchCard } from '../../../services/rewardsService';

const STAMP_SHAPES = [
  { id: 'circle', icon: '⭕', name: 'Círculo' },
  { id: 'star', icon: '⭐', name: 'Estrella' },
  { id: 'heart', icon: '❤️', name: 'Corazón' },
  { id: 'diamond', icon: '💎', name: 'Diamante' },
  { id: 'flame', icon: '🔥', name: 'Llama' },
  { id: 'lightning', icon: '⚡', name: 'Rayo' },
  { id: 'leaf', icon: '🍃', name: 'Hoja' },
  { id: 'crown', icon: '👑', name: 'Corona' },
  { id: 'coffee', icon: '☕', name: 'Café' },
  { id: 'pizza', icon: '🍕', name: 'Pizza' },
  { id: 'scissors', icon: '✂️', name: 'Tijera' },
  { id: 'dumbbell', icon: '🏋️', name: 'Mancuerna' },
  { id: 'bag', icon: '🛍️', name: 'Bolsa' },
  { id: 'footprint', icon: '👣', name: 'Huella' },
  { id: 'gift', icon: '🎁', name: 'Regalo' },
  { id: 'gem', icon: '💍', name: 'Joya' },
];

const CARD_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626',
  '#0891B2', '#7C2D12', '#1D4ED8', '#065F46', '#92400E',
  '#BE185D', '#0F766E', '#1E40AF', '#6D28D9', '#B45309', '#047857'
];

const TEMPLATES = [
  { id: 'cafe_warm', name: 'Café Cálido', color: '#92400E', colorSec: '#D97706', icon: 'coffee', layout: 'grid', font: 'default', cat: 'cafe' },
  { id: 'cafe_dark', name: 'Café Oscuro', color: '#1C1917', colorSec: '#44403C', icon: 'coffee', layout: 'grid', font: 'bold', cat: 'cafe' },
  { id: 'cafe_fresh', name: 'Café Fresco', color: '#065F46', colorSec: '#059669', icon: 'leaf', layout: 'grid', font: 'rounded', cat: 'cafe' },
  { id: 'rest_vibrant', name: 'Restaurante Vibrante', color: '#DC2626', colorSec: '#D97706', icon: 'pizza', layout: 'grid', font: 'bold', cat: 'restaurant' },
  { id: 'rest_elegant', name: 'Restaurante Elegante', color: '#1E1B4B', colorSec: '#4338CA', icon: 'gem', layout: 'grid', font: 'serif', cat: 'restaurant' },
  { id: 'beauty_elegant', name: 'Belleza Elegante', color: '#BE185D', colorSec: '#9D174D', icon: 'scissors', layout: 'grid', font: 'serif', cat: 'beauty' },
  { id: 'beauty_modern', name: 'Belleza Moderna', color: '#6D28D9', colorSec: '#7C3AED', icon: 'crown', layout: 'grid', font: 'rounded', cat: 'beauty' },
  { id: 'fitness_energy', name: 'Fitness Energético', color: '#1D4ED8', colorSec: '#0891B2', icon: 'dumbbell', layout: 'grid', font: 'bold', cat: 'fitness' },
  { id: 'fitness_dark', name: 'Fitness Oscuro', color: '#111827', colorSec: '#1F2937', icon: 'lightning', layout: 'grid', font: 'bold', cat: 'fitness' },
  { id: 'generic_neutral', name: 'Genérico Neutral', color: '#374151', colorSec: '#6B7280', icon: 'star', layout: 'grid', font: 'default', cat: 'generic' },
  { id: 'generic_purple', name: 'Genérico Morado', color: '#7C3AED', colorSec: '#6D28D9', icon: 'diamond', layout: 'grid', font: 'default', cat: 'generic' },
  { id: 'generic_teal', name: 'Genérico Teal', color: '#0F766E', colorSec: '#0891B2', icon: 'heart', layout: 'grid', font: 'rounded', cat: 'generic' },
];

const STAMP_EFFECTS = [
  { id: 'stamp', name: 'Stamp', desc: 'Cae desde arriba con rebote' },
  { id: 'fill', name: 'Fill', desc: 'Se llena de adentro hacia afuera' },
  { id: 'glow', name: 'Glow', desc: 'Aparece con resplandor' },
  { id: 'pop', name: 'Pop', desc: 'Explosión de partículas' },
];

const FONTS = [
  { id: 'default', name: 'Plus Jakarta Sans', preview: 'Aa' },
  { id: 'mono', name: 'JetBrains Mono', preview: 'Aa' },
  { id: 'serif', name: 'Crimson Text', preview: 'Aa' },
  { id: 'rounded', name: 'DM Sans', preview: 'Aa' },
  { id: 'bold', name: 'Manrope Bold', preview: 'Aa' },
  { id: 'display', name: 'Cabinet Grotesk', preview: 'Aa' },
];

const PhonePreview = ({ design, card }) => {
  const [filledStamps, setFilledStamps] = useState(3);
  const [darkMode, setDarkMode] = useState(false);
  const stampIcon = STAMP_SHAPES?.find(s => s?.id === design?.stampIcon)?.icon || '⭐';
  const count = card?.stamp_count || 8;
  const bgStyle = design?.gradientType === 'gradient'
    ? { background: `linear-gradient(135deg, ${design?.color}, ${design?.colorSec || '#2563EB'})` }
    : { background: design?.color };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2 mb-1">
        <button
          type="button"
          onClick={() => setDarkMode(false)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!darkMode ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
        >
          ☀️ Clara
        </button>
        <button
          type="button"
          onClick={() => setDarkMode(true)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${darkMode ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
        >
          🌙 Oscura
        </button>
      </div>

      {/* Phone Frame */}
      <div className={`w-56 rounded-3xl border-4 border-foreground/20 shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Status bar */}
        <div className={`flex items-center justify-between px-4 py-2 text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
          <span>9:41</span>
          <div className="flex gap-1">
            <Icon name="Wifi" size={10} />
            <Icon name="Battery" size={10} />
          </div>
        </div>
        {/* App header */}
        <div className={`px-4 py-2 flex items-center gap-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Icon name="ArrowLeft" size={14} className={darkMode ? 'text-white' : 'text-gray-700'} />
          <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mi Wallet</span>
        </div>
        {/* Card */}
        <div className="p-3">
          <div className="rounded-2xl p-4 text-white shadow-lg" style={bgStyle}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs opacity-60">PromoClub</p>
                <h4 className="font-bold text-sm leading-tight">{card?.name || 'Mi Tarjeta de Sello'}</h4>
              </div>
              <span className="text-2xl">{stampIcon}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 my-3">
              {Array.from({ length: Math.min(count, 10) })?.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFilledStamps(i < filledStamps ? i : i + 1)}
                  className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center transition-all"
                  style={{ background: i < filledStamps ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)' }}
                >
                  <span style={{ fontSize: '12px', filter: i < filledStamps ? 'none' : 'grayscale(1) opacity(0.4)' }}>{stampIcon}</span>
                </button>
              ))}
              {count > 10 && <span className="text-xs opacity-70 self-center">+{count - 10}</span>}
              <div className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center bg-yellow-400/20 text-xs">🎁</div>
            </div>
            <div className="border-t border-white/20 pt-2">
              <p className="text-xs opacity-60">Recompensa</p>
              <p className="font-semibold text-xs">{card?.reward_value || 'Premio al completar'}</p>
            </div>
          </div>
          {filledStamps >= count && (
            <div className={`mt-2 rounded-xl p-3 text-center ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <p className="text-lg">🎉</p>
              <p className={`font-bold text-xs ${darkMode ? 'text-green-400' : 'text-green-700'}`}>¡Tarjeta completada!</p>
              <button type="button" className="mt-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">Reclamar recompensa</button>
            </div>
          )}
          <p className={`text-xs text-center mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Toca los sellos para simular</p>
        </div>
      </div>
    </div>
  );
};

const PunchCardVisualDesigner = ({ card, onClose, onSaved }) => {
  const [design, setDesign] = useState({
    color: card?.card_color || '#7C3AED',
    colorSec: card?.card_color_secondary || '#2563EB',
    gradientType: card?.card_gradient_type || 'solid',
    gradientDir: card?.card_gradient_direction || 'diagonal',
    stampIcon: card?.stamp_icon || 'star',
    stampLayout: card?.stamp_layout || 'grid',
    stampSize: card?.stamp_size || 'medium',
    stampEffect: card?.stamp_effect || 'stamp',
    fontStyle: card?.font_style || 'default',
    showLogo: card?.show_logo !== false,
    accentColor: card?.accent_color || '#FFFFFF',
  });
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeSection, setActiveSection] = useState('background');

  const set = (k, v) => setDesign(p => ({ ...p, [k]: v }));

  const applyTemplate = (tpl) => {
    setDesign(p => ({
      ...p,
      color: tpl?.color,
      colorSec: tpl?.colorSec,
      gradientType: 'gradient',
      stampIcon: tpl?.icon,
      stampLayout: tpl?.layout,
      fontStyle: tpl?.font,
    }));
    setShowTemplates(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePunchCard(card?.id, {
        cardColor: design?.color,
        cardColorSecondary: design?.colorSec,
        cardGradientType: design?.gradientType,
        cardGradientDirection: design?.gradientDir,
        stampIcon: design?.stampIcon,
        stampLayout: design?.stampLayout,
        stampSize: design?.stampSize,
        stampEffect: design?.stampEffect,
        fontStyle: design?.fontStyle,
        showLogo: design?.showLogo,
        accentColor: design?.accentColor,
      });
      onSaved?.();
    } catch (err) {
      console.error('Error saving design:', err);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'background', label: 'Fondo', icon: 'Palette' },
    { id: 'stamps', label: 'Sellos', icon: 'Star' },
    { id: 'layout', label: 'Disposición', icon: 'LayoutGrid' },
    { id: 'typography', label: 'Tipografía', icon: 'Type' },
    { id: 'effects', label: 'Efectos', icon: 'Sparkles' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Icon name="Palette" size={18} className="text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Diseñador Visual</h2>
              <p className="text-xs text-muted-foreground">{card?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
              <Icon name="LayoutTemplate" size={14} className="mr-1.5" />
              Templates
            </Button>
            <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="X" size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Templates Gallery */}
        {showTemplates && (
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground mb-3">Templates pre-diseñados</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {TEMPLATES?.map(tpl => {
                const bgStyle = { background: `linear-gradient(135deg, ${tpl?.color}, ${tpl?.colorSec})` };
                const icon = STAMP_SHAPES?.find(s => s?.id === tpl?.icon)?.icon || '⭐';
                return (
                  <button
                    key={tpl?.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all group"
                  >
                    <div className="p-3 text-white text-center" style={bgStyle}>
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="flex gap-0.5 justify-center">
                        {[0,1,2,3]?.map(i => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i < 2 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />
                        ))}
                      </div>
                    </div>
                    <div className="p-1.5 bg-card">
                      <p className="text-xs text-foreground font-medium truncate">{tpl?.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex max-h-[70vh] overflow-hidden">
          {/* Editor Panel */}
          <div className="flex-1 flex flex-col">
            {/* Section Tabs */}
            <div className="flex gap-1 p-3 border-b border-border bg-muted/20 overflow-x-auto">
              {sections?.map(s => (
                <button
                  key={s?.id}
                  type="button"
                  onClick={() => setActiveSection(s?.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeSection === s?.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={s?.icon} size={13} />
                  {s?.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              {/* Background Section */}
              {activeSection === 'background' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Tipo de fondo</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'solid', label: 'Sólido' },
                        { id: 'gradient', label: 'Gradiente' },
                      ]?.map(t => (
                        <button
                          key={t?.id}
                          type="button"
                          onClick={() => set('gradientType', t?.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                            design?.gradientType === t?.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                          }`}
                        >
                          {t?.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Color principal</p>
                    <div className="flex gap-2 flex-wrap">
                      {CARD_COLORS?.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set('color', c)}
                          className={`w-9 h-9 rounded-full border-4 transition-all ${design?.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Hex:</span>
                      <input
                        type="text"
                        value={design?.color}
                        onChange={e => set('color', e?.target?.value)}
                        className="w-28 px-2 py-1 border border-border rounded bg-input text-foreground text-xs font-mono"
                      />
                      <input type="color" value={design?.color} onChange={e => set('color', e?.target?.value)} className="w-8 h-8 rounded cursor-pointer border border-border" />
                    </div>
                  </div>
                  {design?.gradientType === 'gradient' && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Color secundario</p>
                      <div className="flex gap-2 flex-wrap">
                        {CARD_COLORS?.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => set('colorSec', c)}
                            className={`w-9 h-9 rounded-full border-4 transition-all ${design?.colorSec === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Hex:</span>
                        <input
                          type="text"
                          value={design?.colorSec}
                          onChange={e => set('colorSec', e?.target?.value)}
                          className="w-28 px-2 py-1 border border-border rounded bg-input text-foreground text-xs font-mono"
                        />
                        <input type="color" value={design?.colorSec} onChange={e => set('colorSec', e?.target?.value)} className="w-8 h-8 rounded cursor-pointer border border-border" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stamps Section */}
              {activeSection === 'stamps' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Forma de los sellos</p>
                    <div className="grid grid-cols-8 gap-2">
                      {STAMP_SHAPES?.map(s => (
                        <button
                          key={s?.id}
                          type="button"
                          onClick={() => set('stampIcon', s?.id)}
                          title={s?.name}
                          className={`p-2 rounded-lg border-2 text-xl flex items-center justify-center transition-all ${
                            design?.stampIcon === s?.id ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          {s?.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Color de acento (sellos llenos)</p>
                    <div className="flex items-center gap-2">
                      <input type="color" value={design?.accentColor} onChange={e => set('accentColor', e?.target?.value)} className="w-10 h-10 rounded cursor-pointer border border-border" />
                      <input
                        type="text"
                        value={design?.accentColor}
                        onChange={e => set('accentColor', e?.target?.value)}
                        className="w-28 px-2 py-1 border border-border rounded bg-input text-foreground text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Tamaño de los sellos</p>
                    <div className="flex gap-2">
                      {['small', 'medium', 'large']?.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set('stampSize', s)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                            design?.stampSize === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                          }`}
                        >
                          {s === 'small' ? 'Pequeño' : s === 'medium' ? 'Mediano' : 'Grande'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Section */}
              {activeSection === 'layout' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Disposición de los sellos</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'grid', name: 'Grid', desc: '2-3 filas, universal', icon: '⊞' },
                        { id: 'horizontal', name: 'Horizontal', desc: '1 fila, scroll', icon: '▬' },
                        { id: 'circle', name: 'Círculo', desc: 'Arco alrededor del premio', icon: '◯' },
                        { id: 'path', name: 'Camino', desc: 'Path tipo juego de mesa', icon: '〰' },
                      ]?.map(l => (
                        <button
                          key={l?.id}
                          type="button"
                          onClick={() => set('stampLayout', l?.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            design?.stampLayout === l?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          <div className="text-2xl mb-1">{l?.icon}</div>
                          <p className="text-sm font-medium text-foreground">{l?.name}</p>
                          <p className="text-xs text-muted-foreground">{l?.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-foreground">Mostrar logo del negocio</p>
                      <p className="text-xs text-muted-foreground">Esquina superior izquierda de la tarjeta</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => set('showLogo', !design?.showLogo)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${design?.showLogo ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${design?.showLogo ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Typography Section */}
              {activeSection === 'typography' && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Tipografía del nombre</p>
                  <div className="grid grid-cols-2 gap-3">
                    {FONTS?.map(f => (
                      <button
                        key={f?.id}
                        type="button"
                        onClick={() => set('fontStyle', f?.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          design?.fontStyle === f?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <p className="text-2xl font-bold text-foreground mb-1">{f?.preview}</p>
                        <p className="text-xs text-muted-foreground">{f?.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Effects Section */}
              {activeSection === 'effects' && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Efecto al recibir un sello</p>
                  <div className="grid grid-cols-2 gap-3">
                    {STAMP_EFFECTS?.map(e => (
                      <button
                        key={e?.id}
                        type="button"
                        onClick={() => set('stampEffect', e?.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          design?.stampEffect === e?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <p className="font-semibold text-foreground text-sm">{e?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{e?.desc}</p>
                        {design?.stampEffect === e?.id && (
                          <span className="mt-2 inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Seleccionado</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground">
                      💡 Toca los sellos en la vista previa para ver la animación en acción.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-72 border-l border-border p-5 bg-muted/20 overflow-y-auto flex flex-col items-center">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4 self-start">Vista Previa</h3>
            <PhonePreview design={design} card={card} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Icon name="Loader2" size={15} className="mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Icon name="Save" size={15} className="mr-2" />Guardar diseño</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PunchCardVisualDesigner;
