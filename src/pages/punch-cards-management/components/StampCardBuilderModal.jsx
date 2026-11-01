import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

// ─── GOOGLE FONTS IMPORT ─────────────────────────────────────────────────────
const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Outfit:wght@700;900&family=Plus+Jakarta+Sans:wght@700&family=Montserrat:wght@700;900&family=Poppins:wght@600;700&family=Raleway:wght@700;800&family=Oswald:wght@600;700&family=Lato:wght@700;900&family=Nunito:wght@700;800&family=Roboto+Slab:wght@700&family=Merriweather:wght@700&family=Dancing+Script:wght@700&family=Pacifico&family=Bebas+Neue&family=Anton&display=swap';

// ─── DATA ───────────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'cafe-premium', name: 'Café Premium', category: 'Café', thumb: '☕',
    bg: 'linear-gradient(135deg,#1B4332,#2D6A4F,#1B4332)', accent: '#D4A853', textColor: '#FFFFFF',
    stampStyle: 'gold', emptyStyle: 'border-accent', layout: 'grid', cols: 5, borderRadius: 14,
    font: 'playfair', pattern: 'Puntos', patternOpacity: 8, effect: 'emboss',
    badge: true, badgeText: 'MEMBER CARD', separator: 'ornament', border: 'Borde dorado',
    stampCount: 10, orientation: 'horizontal', shape: 'rounded',
  },
  {
    id: 'minimalista', name: 'Minimalista Negro', category: 'Premium', thumb: '⬛',
    bg: '#0A0A0A', accent: '#FFFFFF', textColor: '#FFFFFF',
    stampStyle: 'white', emptyStyle: 'border-white', layout: 'row', cols: 5, borderRadius: 10,
    font: 'jetbrains', pattern: 'Sin patrón', patternOpacity: 5, effect: 'flat',
    badge: false, badgeText: '', separator: 'none', border: 'Borde blanco sutil',
    stampCount: 8, orientation: 'horizontal', shape: 'rounded',
  },
  {
    id: 'fitness', name: 'Fitness Power', category: 'Gym', thumb: '💪',
    bg: 'linear-gradient(135deg,#1A1A2E,#16213E,#0F3460)', accent: '#E94560', textColor: '#FFFFFF',
    stampStyle: 'neon-red', emptyStyle: 'border-neon-red', layout: 'grid', cols: 5, borderRadius: 10,
    font: 'outfit-black', pattern: 'Cuadrícula', patternOpacity: 8, effect: 'glow',
    badge: true, badgeText: 'POWER MEMBER', separator: 'none', border: 'Borde neón rojo',
    stampCount: 12, orientation: 'horizontal', shape: 'square',
  },
  {
    id: 'salon', name: 'Salón Elegante', category: 'Belleza', thumb: '💄',
    bg: 'linear-gradient(135deg,#FCE4EC,#F8BBD0)', accent: '#AD1457', textColor: '#1A1A1A',
    stampStyle: 'pink', emptyStyle: 'border-pink', layout: 'grid', cols: 5, borderRadius: 20,
    font: 'playfair', pattern: 'Rosas', patternOpacity: 6, effect: 'soft',
    badge: true, badgeText: 'BEAUTY CLUB', separator: 'dots', border: 'Borde rosa',
    stampCount: 8, orientation: 'vertical', shape: 'rounded',
  },
  {
    id: 'mexico', name: 'Sabor México', category: 'Restaurante', thumb: '🌮',
    bg: 'linear-gradient(135deg,#7B2D00,#A63D00,#5D1F00)', accent: '#FFB627', textColor: '#FFFFFF',
    stampStyle: 'amber', emptyStyle: 'border-amber', layout: 'grid', cols: 5, borderRadius: 14,
    font: 'outfit-bold', pattern: 'Azteca', patternOpacity: 10, effect: 'texture',
    badge: true, badgeText: 'CLIENTE FRECUENTE', separator: 'ornament', border: 'Borde ámbar',
    stampCount: 10, orientation: 'horizontal', shape: 'rounded',
  },
  {
    id: 'wellness', name: 'Wellness Spa', category: 'Bienestar', thumb: '🧘',
    bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', accent: '#2E7D32', textColor: '#1A1A1A',
    stampStyle: 'green', emptyStyle: 'border-green', layout: 'zigzag', cols: 5, borderRadius: 20,
    font: 'playfair', pattern: 'Hojas', patternOpacity: 6, effect: 'nature',
    badge: false, badgeText: '', separator: 'wave', border: 'Borde verde sage',
    stampCount: 8, orientation: 'vertical', shape: 'rounded',
  },
  {
    id: 'tech', name: 'Digital Tech', category: 'Tech', thumb: '🎮',
    bg: 'linear-gradient(135deg,#0D0221,#190535,#0D0221)', accent: '#00F5FF', textColor: '#FFFFFF',
    stampStyle: 'cyan', emptyStyle: 'border-cyan', layout: 'grid', cols: 5, borderRadius: 10,
    font: 'jetbrains', pattern: 'Circuito', patternOpacity: 8, effect: 'cyber',
    badge: true, badgeText: 'LEVEL UP', separator: 'none', border: 'Borde cyan neón',
    stampCount: 10, orientation: 'horizontal', shape: 'square',
  },
  {
    id: 'boutique', name: 'Boutique Retail', category: 'Retail', thumb: '👜',
    bg: '#FAFAF8', accent: '#1A1A1A', textColor: '#1A1A1A',
    stampStyle: 'black', emptyStyle: 'border-black', layout: 'grid', cols: 5, borderRadius: 14,
    font: 'playfair', pattern: 'Lino', patternOpacity: 5, effect: 'paper',
    badge: true, badgeText: 'VIP', separator: 'line', border: 'Doble borde negro',
    stampCount: 8, orientation: 'horizontal', shape: 'rounded',
  },
  {
    id: 'mariscos', name: 'Mariscos & Mar', category: 'Mariscos', thumb: '🦐',
    bg: 'linear-gradient(135deg,#003554,#005F73,#0A9396)', accent: '#94D2BD', textColor: '#FFFFFF',
    stampStyle: 'teal', emptyStyle: 'border-teal', layout: 'arc', cols: 5, borderRadius: 20,
    font: 'outfit-bold', pattern: 'Olas', patternOpacity: 8, effect: 'deep-ocean',
    badge: false, badgeText: '', separator: 'wave', border: 'Borde teal',
    stampCount: 10, orientation: 'horizontal', shape: 'rounded',
  },
];

const TEMPLATE_CATEGORIES = ['Todos', 'Café', 'Premium', 'Gym', 'Belleza', 'Restaurante', 'Bienestar', 'Tech', 'Retail', 'Mariscos'];

const CARD_ICONS = [
  { id: 'star', icon: '⭐' }, { id: 'coffee', icon: '☕' }, { id: 'fire', icon: '🔥' },
  { id: 'heart', icon: '❤️' }, { id: 'crown', icon: '👑' }, { id: 'diamond', icon: '💎' },
  { id: 'pizza', icon: '🍕' }, { id: 'taco', icon: '🌮' }, { id: 'burger', icon: '🍔' },
  { id: 'sushi', icon: '🍣' }, { id: 'cake', icon: '🎂' }, { id: 'icecream', icon: '🍦' },
  { id: 'scissors', icon: '✂️' }, { id: 'flower', icon: '🌸' }, { id: 'leaf', icon: '🌿' },
  { id: 'wave', icon: '🌊' }, { id: 'muscle', icon: '💪' }, { id: 'yoga', icon: '🧘' },
  { id: 'ring', icon: '💍' }, { id: 'bag', icon: '👜' }, { id: 'music', icon: '🎵' },
  { id: 'palette', icon: '🎨' }, { id: 'rocket', icon: '🚀' }, { id: 'trophy', icon: '🏆' },
  { id: 'car', icon: '🚗' }, { id: 'book', icon: '📚' }, { id: 'camera', icon: '📷' },
  { id: 'gem', icon: '💠' }, { id: 'sun', icon: '☀️' }, { id: 'moon', icon: '🌙' },
  { id: 'lightning', icon: '⚡' }, { id: 'snowflake', icon: '❄️' }, { id: 'rainbow', icon: '🌈' },
  { id: 'butterfly', icon: '🦋' }, { id: 'paw', icon: '🐾' }, { id: 'anchor', icon: '⚓' },
  { id: 'compass', icon: '🧭' }, { id: 'key', icon: '🔑' }, { id: 'lock', icon: '🔒' },
  { id: 'bell', icon: '🔔' }, { id: 'gift', icon: '🎁' }, { id: 'balloon', icon: '🎈' },
  { id: 'medal', icon: '🥇' }, { id: 'shield', icon: '🛡️' }, { id: 'target', icon: '🎯' },
  { id: 'dice', icon: '🎲' }, { id: 'chess', icon: '♟️' }, { id: 'tennis', icon: '🎾' },
  // Additional icons
  { id: 'wine', icon: '🍷' }, { id: 'beer', icon: '🍺' }, { id: 'cocktail', icon: '🍹' },
  { id: 'tea', icon: '🍵' }, { id: 'bread', icon: '🥐' }, { id: 'donut', icon: '🍩' },
  { id: 'cookie', icon: '🍪' }, { id: 'candy', icon: '🍬' }, { id: 'chocolate', icon: '🍫' },
  { id: 'fruit', icon: '🍓' }, { id: 'avocado', icon: '🥑' }, { id: 'salad', icon: '🥗' },
  { id: 'noodles', icon: '🍜' }, { id: 'shrimp', icon: '🦐' }, { id: 'fish', icon: '🐟' },
  { id: 'crab', icon: '🦀' }, { id: 'lobster', icon: '🦞' }, { id: 'steak', icon: '🥩' },
  { id: 'chicken', icon: '🍗' }, { id: 'hotdog', icon: '🌭' }, { id: 'sandwich', icon: '🥪' },
  { id: 'fries', icon: '🍟' }, { id: 'popcorn', icon: '🍿' }, { id: 'nachos', icon: '🧆' },
  { id: 'spa', icon: '💆' }, { id: 'nail', icon: '💅' }, { id: 'lipstick', icon: '💋' },
  { id: 'perfume', icon: '🧴' }, { id: 'dress', icon: '👗' }, { id: 'shoe', icon: '👠' },
  { id: 'hat', icon: '🎩' }, { id: 'glasses', icon: '👓' }, { id: 'watch', icon: '⌚' },
  { id: 'bike', icon: '🚲' }, { id: 'gym', icon: '🏋️' }, { id: 'swim', icon: '🏊' },
  { id: 'run', icon: '🏃' }, { id: 'soccer', icon: '⚽' }, { id: 'basketball', icon: '🏀' },
  { id: 'baseball', icon: '⚾' }, { id: 'golf', icon: '⛳' }, { id: 'bowling', icon: '🎳' },
  { id: 'game', icon: '🎮' }, { id: 'puzzle', icon: '🧩' }, { id: 'art', icon: '🖼️' },
  { id: 'laptop', icon: '💻' }, { id: 'phone', icon: '📱' }, { id: 'headphones', icon: '🎧' },
  { id: 'plant', icon: '🪴' }, { id: 'tree', icon: '🌳' }, { id: 'mountain', icon: '⛰️' },
  { id: 'beach', icon: '🏖️' }, { id: 'house', icon: '🏠' }, { id: 'building', icon: '🏢' },
  { id: 'sparkle', icon: '✨' }, { id: 'fire2', icon: '🔆' }, { id: 'check', icon: '✅' },
  { id: 'percent', icon: '💯' }, { id: 'money', icon: '💰' }, { id: 'ticket', icon: '🎫' },
];

const SOLID_COLORS = [
  '#0A0A0A', '#1B4332', '#1A3FE0', '#7B2D00', '#AD1457',
  '#2E7D32', '#003554', '#4C1D95', '#FAFAF8', '#FFF8F0',
  '#F0F4FF', '#1A0A0E', '#0F3460', '#4A1942', '#003049',
];

const GRADIENT_2_PRESETS = [
  { name: 'Bosque', c1: '#1B4332', c2: '#2D6A4F' },
  { name: 'Noche', c1: '#1A1A2E', c2: '#4338CA' },
  { name: 'Océano', c1: '#003554', c2: '#0A9396' },
  { name: 'Atardecer', c1: '#7B2D00', c2: '#D97706' },
  { name: 'Rosa', c1: '#FCE4EC', c2: '#AD1457' },
  { name: 'Real', c1: '#4C1D95', c2: '#EC4899' },
  { name: 'Menta', c1: '#E8F5E9', c2: '#2E7D32' },
  { name: 'Cyber', c1: '#0D0221', c2: '#00F5FF' },
];

const ACCENT_COLORS = [
  '#D4A853', '#FFFFFF', '#E94560', '#FFB627', '#AD1457',
  '#2E7D32', '#00F5FF', '#1A1A1A', '#94D2BD', '#FF6B35',
  '#C9B037', '#4ECDC4', '#FFE66D', '#A8EDEA', '#FF8C00',
];

const TEXT_COLORS = ['#FFFFFF', '#000000', '#F5F5F5', '#1A1A1A', '#D4A853', '#00F5FF', '#FFB627', '#E94560'];

const STAMP_FULL_STYLES = [
  { id: 'gold', name: 'Oro Premium', bg: 'radial-gradient(circle, #FFE082, #D4A853, #A0762A)', shadow: '0 0 8px rgba(212,168,83,0.6)' },
  { id: 'white', name: 'Blanco Sólido', bg: 'rgba(255,255,255,0.95)', shadow: '0 2px 6px rgba(0,0,0,0.4)' },
  { id: 'neon-red', name: 'Neón Rojo', bg: 'radial-gradient(circle, #FF6B8A, #E94560)', shadow: '0 0 10px rgba(233,69,96,0.7)' },
  { id: 'pink', name: 'Rosa Elegante', bg: 'radial-gradient(circle, #F48FB1, #AD1457)', shadow: '0 0 6px rgba(173,20,87,0.4)' },
  { id: 'amber', name: 'Ámbar Estrella', bg: 'radial-gradient(circle, #FFDE7D, #FFB627, #E09000)', shadow: '0 0 8px rgba(255,182,39,0.5)' },
  { id: 'green', name: 'Verde Natural', bg: 'radial-gradient(circle, #81C784, #2E7D32)', shadow: '0 0 6px rgba(46,125,50,0.4)' },
  { id: 'cyan', name: 'Cyan Neón', bg: 'radial-gradient(circle, #80FFFF, #00F5FF, #00BCD4)', shadow: '0 0 12px rgba(0,245,255,0.8)' },
  { id: 'black', name: 'Negro Diamante', bg: 'radial-gradient(circle, #424242, #1A1A1A)', shadow: '0 0 4px rgba(255,255,255,0.2)' },
  { id: 'teal', name: 'Teal Mar', bg: 'radial-gradient(circle, #B2DFDB, #4DB6AC, #00897B)', shadow: '0 0 6px rgba(0,137,123,0.4)' },
  { id: 'blue', name: 'Azul Royal', bg: 'radial-gradient(circle, #90CAF9, #1A3FE0, #0D2A9E)', shadow: '0 0 8px rgba(26,63,224,0.5)' },
  { id: 'purple', name: 'Púrpura', bg: 'radial-gradient(circle, #CE93D8, #7B1FA2)', shadow: '0 0 6px rgba(123,31,162,0.4)' },
  { id: 'red', name: 'Rojo Clásico', bg: 'radial-gradient(circle, #EF9A9A, #C62828)', shadow: '0 0 6px rgba(198,40,40,0.4)' },
  { id: 'custom', name: 'Color personalizado', bg: null, shadow: '0 0 6px rgba(0,0,0,0.3)' },
];

const STAMP_EMPTY_STYLES = [
  { id: 'border-accent', name: 'Borde simple (con acento)' },
  { id: 'border-white', name: 'Borde blanco' },
  { id: 'border-neon-red', name: 'Borde neón rojo' },
  { id: 'border-pink', name: 'Borde rosa' },
  { id: 'border-amber', name: 'Borde ámbar (dashed)' },
  { id: 'border-green', name: 'Borde verde' },
  { id: 'border-cyan', name: 'Borde cyan' },
  { id: 'border-black', name: 'Borde negro' },
  { id: 'border-teal', name: 'Borde teal' },
  { id: 'border-custom', name: 'Color personalizado' },
];

const LAYOUTS = [
  { id: 'grid', icon: '▦', name: 'Cuadrícula', desc: 'Filas y columnas ordenadas. El más universal.' },
  { id: 'row', icon: '▬', name: 'Fila única', desc: 'Una sola línea horizontal. Ideal para pocos sellos.' },
  { id: 'zigzag', icon: '〰️', name: 'Camino zigzag', desc: 'Los sellos forman una ruta hacia el premio. Gamificado.' },
  { id: 'arc', icon: '⌢', name: 'Arco', desc: 'Semicírculo superior. Elegante y diferente.' },
  { id: 'circle', icon: '◯', name: 'Círculo', desc: 'Distribución circular completa. Visual y llamativo.' },
];

const BORDER_RADII = [
  { id: 10, name: 'Suave pequeño', desc: '10px de radio, apariencia casi cuadrada.' },
  { id: 14, name: 'Suave mediano', desc: '14px de radio, estándar.' },
  { id: 20, name: 'Redondeado', desc: '20px de radio, friendly y moderno.' },
  { id: 26, name: 'Muy redondeado', desc: '26px de radio, pill-like en los extremos.' },
  { id: 4, name: 'Angular / Sharp', desc: '4px de radio, estética brutal/tech.' },
];

const FONTS = [
  { id: 'playfair', name: 'Playfair Display', style: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 }, desc: 'Elegante y clásica. Beauty, boutique, spa.' },
  { id: 'outfit-black', name: 'Outfit Black', style: { fontFamily: '"Outfit", sans-serif', fontWeight: 900 }, desc: 'Ultra bold y geométrica. Gym, tech.' },
  { id: 'outfit-bold', name: 'Outfit Bold', style: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 }, desc: 'Clara y moderna. Universal.' },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', style: { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontWeight: 700 }, desc: 'Limpia y contemporánea. Excelente legibilidad.' },
  { id: 'jetbrains', name: 'JetBrains Mono', style: { fontFamily: 'monospace', fontWeight: 700 }, desc: 'Técnica y diferente. Tech, digital, gaming.' },
  { id: 'montserrat', name: 'Montserrat', style: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }, desc: 'Geométrica y versátil. Muy popular en branding.' },
  { id: 'montserrat-black', name: 'Montserrat Black', style: { fontFamily: '"Montserrat", sans-serif', fontWeight: 900 }, desc: 'Impactante y fuerte. Ideal para destacar.' },
  { id: 'poppins', name: 'Poppins', style: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 }, desc: 'Amigable y moderna. Perfecta para apps.' },
  { id: 'raleway', name: 'Raleway', style: { fontFamily: '"Raleway", sans-serif', fontWeight: 700 }, desc: 'Elegante y delgada. Moda y lifestyle.' },
  { id: 'oswald', name: 'Oswald', style: { fontFamily: '"Oswald", sans-serif', fontWeight: 600 }, desc: 'Condensada y potente. Deportes y fitness.' },
  { id: 'lato', name: 'Lato Bold', style: { fontFamily: '"Lato", sans-serif', fontWeight: 700 }, desc: 'Humanista y legible. Restaurantes y cafés.' },
  { id: 'nunito', name: 'Nunito', style: { fontFamily: '"Nunito", sans-serif', fontWeight: 700 }, desc: 'Redondeada y amigable. Niños y entretenimiento.' },
  { id: 'roboto-slab', name: 'Roboto Slab', style: { fontFamily: '"Roboto Slab", serif', fontWeight: 700 }, desc: 'Serif moderna. Profesional y confiable.' },
  { id: 'merriweather', name: 'Merriweather', style: { fontFamily: '"Merriweather", serif', fontWeight: 700 }, desc: 'Serif clásica. Lectura cómoda y elegante.' },
  { id: 'dancing-script', name: 'Dancing Script', style: { fontFamily: '"Dancing Script", cursive', fontWeight: 700 }, desc: 'Cursiva elegante. Bakeries y pastelerías.' },
  { id: 'pacifico', name: 'Pacifico', style: { fontFamily: '"Pacifico", cursive', fontWeight: 400 }, desc: 'Playful y retro. Surf, playa, casual.' },
  { id: 'bebas-neue', name: 'Bebas Neue', style: { fontFamily: '"Bebas Neue", sans-serif', fontWeight: 400 }, desc: 'Todo mayúsculas, impactante. Gym, streetwear.' },
  { id: 'anton', name: 'Anton', style: { fontFamily: '"Anton", sans-serif', fontWeight: 400 }, desc: 'Condensada y bold. Titulares y carteles.' },
];

const PATTERNS = ['Sin patrón', 'Puntos', 'Cuadrícula', 'Azteca', 'Circuito', 'Olas', 'Hojas', 'Rosas', 'Lino'];

const EFFECTS = [
  { id: 'emboss', name: 'Embossed Premium', desc: 'Sombra profunda 3D + brillo interno. El más lujoso.' },
  { id: 'flat', name: 'Flat Clean', desc: 'Sombra sutil y mínima. Estética moderna.' },
  { id: 'glow', name: 'Glow Neón', desc: 'Resplandor de color externo. Ideal para estilos oscuros.' },
  { id: 'soft', name: 'Soft Shadow', desc: 'Sombra suave y cálida. Ideal para tarjetas claras.' },
  { id: 'cyber', name: 'Cyber Neon', desc: 'Barra de progreso con efecto luz. Ideal para tech.' },
  { id: 'nature', name: 'Nature', desc: 'Sombra orgánica con tinte verde. Ideal para spa/wellness.' },
  { id: 'paper', name: 'Paper', desc: 'Estética de papel premium con sombra mínima.' },
  { id: 'deep-ocean', name: 'Deep Ocean', desc: 'Sombra de profundidad azul marino. Ideal para tarjetas oscuras.' },
  { id: 'texture', name: 'Texture', desc: 'Textura visual con profundidad. Ideal para tarjetas temáticas.' },
];

const BORDER_STYLES = [
  'Sin borde', 'Borde dorado', 'Borde blanco sutil', 'Borde neón rojo', 'Borde rosa',
  'Borde ámbar', 'Borde verde sage', 'Borde cyan neón', 'Doble borde negro', 'Borde teal', 'Borde azul',
  'Borde personalizado',
];

const SEPARATOR_OPTIONS = [
  { id: 'line', label: '— Línea simple' },
  { id: 'ornament', label: '✦ Ornamento' },
  { id: 'dots', label: '··· Puntos' },
  { id: 'wave', label: '〜 Wave' },
];

// ─── DEFAULT DESIGN STATE ────────────────────────────────────────────────────

const defaultDesign = {
  cardIcon: 'star',
  customIconUrl: null,
  businessLogoUrl: null,
  heroImageUrl: null,
  rewardEmoji: '🎁',
  rewardText: '',
  bgType: 'solid',
  solidColor: '#1A3FE0',
  grad2c1: '#1B4332', grad2c2: '#2D6A4F',
  grad3c1: '#0D0221', grad3c2: '#190535', grad3c3: '#0D0221',
  accentColor: '#D4A853',
  textColor: '#FFFFFF',
  stampCount: 8,
  stampFullStyle: 'gold',
  customStampColor: '#FFD700',
  stampEmptyStyle: 'border-accent',
  customEmptyBorderColor: '#D4A853',
  stampSize: 36,
  layout: 'grid',
  layoutCols: 5,
  orientation: 'horizontal',
  cardShape: 'rounded',
  borderRadius: 14,
  font: 'outfit-bold',
  pattern: 'Sin patrón',
  patternOpacity: 8,
  effect: 'flat',
  badgeEnabled: false,
  badgeText: 'MEMBER CARD',
  separatorEnabled: false,
  separatorType: 'line',
  borderStyle: 'Sin borde',
  customBorderColor: '#D4A853',
  templateImageUrl: null,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const getBgStyle = (d) => {
  if (d?.templateImageUrl) return { backgroundImage: `url(${d?.templateImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  if (d?.bgType === 'solid') return { background: d?.solidColor };
  if (d?.bgType === 'gradient2') return { background: `linear-gradient(135deg, ${d?.grad2c1}, ${d?.grad2c2})` };
  if (d?.bgType === 'gradient3') return { background: `linear-gradient(135deg, ${d?.grad3c1}, ${d?.grad3c2}, ${d?.grad3c3})` };
  return { background: d?.solidColor };
};

const getCardShadow = (effect, accent) => {
  const shadows = {
    emboss: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset`,
    flat: `0 4px 20px rgba(0,0,0,0.15)`,
    glow: `0 0 30px ${accent}60, 0 8px 32px rgba(0,0,0,0.3)`,
    soft: `0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)`,
    cyber: `0 0 20px ${accent}80, 0 4px 16px rgba(0,0,0,0.4)`,
    nature: `0 8px 24px rgba(46,125,50,0.2), 0 4px 12px rgba(0,0,0,0.1)`,
    paper: `0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)`,
    'deep-ocean': `0 16px 48px rgba(0,53,84,0.5), 0 4px 16px rgba(0,0,0,0.3)`,
    texture: `0 8px 24px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)`,
  };
  return shadows?.[effect] || shadows?.flat;
};

const getStampFullStyle = (styleId, customColor) => {
  if (styleId === 'custom') {
    const c = customColor || '#FFD700';
    return { background: `radial-gradient(circle, ${c}dd, ${c})`, boxShadow: `0 0 8px ${c}80` };
  }
  const s = STAMP_FULL_STYLES?.find(x => x?.id === styleId);
  return s ? { background: s?.bg, boxShadow: s?.shadow } : { background: '#D4A853' };
};

const getEmptyBorderStyle = (styleId, accent, customColor) => {
  if (styleId === 'border-custom') return `2px solid ${customColor || accent}`;
  const map = {
    'border-accent': `2px solid ${accent}`,
    'border-white': `2px solid rgba(255,255,255,0.6)`,
    'border-neon-red': `2px solid #E94560`,
    'border-pink': `2px solid #AD1457`,
    'border-amber': `2px dashed #FFB627`,
    'border-green': `2px solid #2E7D32`,
    'border-cyan': `2px solid #00F5FF`,
    'border-black': `2px solid #1A1A1A`,
    'border-teal': `2px solid #94D2BD`,
  };
  return map?.[styleId] || `2px solid ${accent}`;
};

const getFontStyle = (fontId) => {
  const f = FONTS?.find(x => x?.id === fontId);
  return f ? f?.style : { fontFamily: 'sans-serif', fontWeight: 700 };
};

const getCardBorderStyle = (borderStyle, customColor) => {
  if (borderStyle === 'Borde personalizado') return { border: `2px solid ${customColor || '#D4A853'}` };
  const map = {
    'Sin borde': {},
    'Borde dorado': { border: '2px solid #D4A853' },
    'Borde blanco sutil': { border: '1px solid rgba(255,255,255,0.3)' },
    'Borde neón rojo': { border: '2px solid #E94560', boxShadow: '0 0 8px #E9456040' },
    'Borde rosa': { border: '2px solid #AD1457' },
    'Borde ámbar': { border: '2px solid #FFB627' },
    'Borde verde sage': { border: '2px solid #2E7D32' },
    'Borde cyan neón': { border: '2px solid #00F5FF', boxShadow: '0 0 8px #00F5FF40' },
    'Doble borde negro': { border: '3px double #1A1A1A' },
    'Borde teal': { border: '2px solid #94D2BD' },
    'Borde azul': { border: '2px solid #1A3FE0' },
  };
  return map?.[borderStyle] || {};
};

// ─── CARD PREVIEW COMPONENT ──────────────────────────────────────────────────

const CARD_ICONS_MAP_PREVIEW = {};
CARD_ICONS?.forEach(ic => { CARD_ICONS_MAP_PREVIEW[ic.id] = ic?.icon; });

const STAMP_FULL_BG_PREVIEW = {
  gold: 'radial-gradient(circle, #FFE082, #D4A853, #A0762A)',
  white: 'rgba(255,255,255,0.95)',
  'neon-red': 'radial-gradient(circle, #FF6B8A, #E94560)',
  pink: 'radial-gradient(circle, #F48FB1, #AD1457)',
  amber: 'radial-gradient(circle, #FFDE7D, #FFB627, #E09000)',
  green: 'radial-gradient(circle, #81C784, #2E7D32)',
  cyan: 'radial-gradient(circle, #80FFFF, #00F5FF, #00BCD4)',
  black: 'radial-gradient(circle, #424242, #1A1A1A)',
  teal: 'radial-gradient(circle, #B2DFDB, #4DB6AC, #00897B)',
  blue: 'radial-gradient(circle, #90CAF9, #1A3FE0, #0D2A9E)',
  purple: 'radial-gradient(circle, #CE93D8, #7B1FA2)',
  red: 'radial-gradient(circle, #EF9A9A, #C62828)',
};

const CardPreviewInline = ({ design, cardName, filledStamps, onStampClick }) => {
  const d = design || defaultDesign;
  const count = d?.stampCount || 8;
  const accentColor = d?.accentColor || '#D4A853';
  const textColor = d?.textColor || '#FFFFFF';
  const isVertical = d?.orientation === 'vertical';

  const getBgStyleLocal = () => {
    if (d?.templateImageUrl) return { backgroundImage: `url(${d?.templateImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (d?.bgType === 'gradient2') return { background: `linear-gradient(135deg, ${d?.grad2c1 || '#1B4332'}, ${d?.grad2c2 || '#2D6A4F'})` };
    if (d?.bgType === 'gradient3') return { background: `linear-gradient(135deg, ${d?.grad3c1 || '#0D0221'}, ${d?.grad3c2 || '#190535'}, ${d?.grad3c3 || '#0D0221'})` };
    return { background: d?.solidColor || '#7C3AED' };
  };

  const getBorderStyleLocal = () => {
    if (d?.borderStyle === 'Borde personalizado') return { border: `2px solid ${d?.customBorderColor || '#D4A853'}` };
    const map = {
      'Sin borde': {}, 'Borde dorado': { border: '2px solid #D4A853' },
      'Borde blanco sutil': { border: '1px solid rgba(255,255,255,0.3)' },
      'Borde neón rojo': { border: '2px solid #E94560' }, 'Borde rosa': { border: '2px solid #AD1457' },
      'Borde ámbar': { border: '2px solid #FFB627' }, 'Borde verde sage': { border: '2px solid #2E7D32' },
      'Borde cyan neón': { border: '2px solid #00F5FF' }, 'Doble borde negro': { border: '3px double #1A1A1A' },
      'Borde teal': { border: '2px solid #94D2BD' }, 'Borde azul': { border: '2px solid #1A3FE0' },
    };
    return map?.[d?.borderStyle] || {};
  };

  const getShapeBorderRadius = () => {
    if (d?.cardShape === 'square') return 4;
    if (d?.cardShape === 'circle-card') return 9999;
    if (d?.cardShape === 'pill') return 40;
    return d?.borderRadius || 14;
  };

  const getStampBg = (i) => {
    if (i < filledStamps) {
      if (d?.stampFullStyle === 'custom') {
        const c = d?.customStampColor || '#FFD700';
        return { background: `radial-gradient(circle, ${c}dd, ${c})` };
      }
      return { background: STAMP_FULL_BG_PREVIEW?.[d?.stampFullStyle] || 'rgba(255,255,255,0.9)' };
    }
    if (d?.stampEmptyStyle === 'border-custom') {
      return { background: 'rgba(255,255,255,0.05)', border: `2px solid ${d?.customEmptyBorderColor || accentColor}` };
    }
    return { background: 'rgba(255,255,255,0.1)', border: `2px solid ${accentColor}` };
  };

  const getIconDisplay = () => {
    if (d?.businessLogoUrl) return <img src={d?.businessLogoUrl} alt="logo" className="h-7 object-contain" />;
    if (d?.customIconUrl) return <img src={d?.customIconUrl} alt="icon" className="w-7 h-7 object-cover rounded" />;
    return <span style={{ fontSize: 24 }}>{CARD_ICONS_MAP_PREVIEW?.[d?.cardIcon] || '⭐'}</span>;
  };

  const fontStyle = getFontStyle(d?.font);

  return (
    <div
      className="p-4 shadow-xl relative overflow-hidden"
      style={{
        ...getBgStyleLocal(),
        ...getBorderStyleLocal(),
        borderRadius: getShapeBorderRadius(),
        color: textColor,
        ...(isVertical ? { maxWidth: 220, margin: '0 auto' } : {}),
      }}
    >
      {/* Hero image */}
      {d?.heroImageUrl && (
        <div className="mb-3 -mx-4 -mt-4 overflow-hidden" style={{ height: 80 }}>
          <img src={d?.heroImageUrl} alt="hero" className="w-full h-full object-cover" />
        </div>
      )}
      {/* Badge */}
      {d?.badgeEnabled && d?.badgeText && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest"
          style={{ background: accentColor, color: '#000', fontSize: 8 }}>
          {d?.badgeText}
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs opacity-60">PromoClub</p>
          <h4 className="text-base font-bold leading-tight truncate" style={{ color: textColor, ...fontStyle }}>
            {cardName || 'Nombre de la tarjeta'}
          </h4>
        </div>
        <div className="ml-2 flex-shrink-0">{getIconDisplay()}</div>
      </div>
      {/* Separator */}
      {d?.separatorEnabled && (
        <div className="my-1.5 text-center opacity-40" style={{ fontSize: 10 }}>
          {d?.separatorType === 'line' && <div style={{ borderTop: `1px solid ${accentColor}` }} />}
          {d?.separatorType === 'ornament' && '✦ ✦ ✦'}
          {d?.separatorType === 'dots' && '· · · · ·'}
          {d?.separatorType === 'wave' && '〜〜〜〜〜'}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 my-3">
        {Array.from({ length: Math.min(count, 12) })?.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onStampClick && onStampClick(i)}
            className="rounded-full flex items-center justify-center text-base transition-all"
            style={{ width: 30, height: 30, ...getStampBg(i) }}
          >
            {i < filledStamps && (
              d?.customIconUrl
                ? <img src={d?.customIconUrl} alt="stamp" className="w-4 h-4 object-cover rounded-full" />
                : <span style={{ fontSize: 14 }}>{CARD_ICONS_MAP_PREVIEW?.[d?.cardIcon] || '⭐'}</span>
            )}
          </button>
        ))}
        {count > 12 && <span className="text-xs opacity-70 self-center">+{count - 12}</span>}
        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm"
          style={{ borderColor: accentColor, background: 'rgba(255,215,0,0.15)' }}>
          {d?.rewardEmoji || '🎁'}
        </div>
      </div>
      <div className="border-t pt-2" style={{ borderColor: `${accentColor}40` }}>
        <p className="text-xs opacity-60">Recompensa</p>
        <p className="text-xs font-semibold" style={{ color: accentColor }}>
          {d?.rewardEmoji || '🎁'} {d?.rewardText || 'Premio al completar'}
        </p>
      </div>
    </div>
  );
};

// ─── TABS ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'templates', icon: '🗂️', label: 'Plantillas' },
  { id: 'identity', icon: '✏️', label: 'Identidad' },
  { id: 'color', icon: '🎨', label: 'Color' },
  { id: 'stamps', icon: '⭐', label: 'Sellos' },
  { id: 'layout', icon: '📐', label: 'Layout' },
  { id: 'font', icon: 'Aa', label: 'Fuente' },
  { id: 'extras', icon: '✨', label: 'Extras' },
];

// ─── MAIN MODAL ──────────────────────────────────────────────────────────────

const StampCardBuilderModal = ({ isOpen, onClose, onSave, initialName = '', initialDescription = '', initialDesign = null, externalRewardValue = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('templates');
  const [design, setDesign] = useState(initialDesign || { ...defaultDesign });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateCategory, setTemplateCategory] = useState('Todos');
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [hasManualChanges, setHasManualChanges] = useState(false);
  const [confirmTemplateModal, setConfirmTemplateModal] = useState(false);
  const [confirmCloseModal, setConfirmCloseModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [infoCollapsed, setInfoCollapsed] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFilledStamps, setPreviewFilledStamps] = useState(3);
  const [businessLogoOptions, setBusinessLogoOptions] = useState([]);
  const scrollRef = useRef(null);
  const templateImageRef = useRef(null);
  const customIconRef = useRef(null);
  const heroImageRef = useRef(null);

  // Inject Google Fonts
  useEffect(() => {
    if (!document.getElementById('stamp-builder-fonts')) {
      const link = document.createElement('link');
      link.id = 'stamp-builder-fonts';
      link.rel = 'stylesheet';
      link.href = GOOGLE_FONTS_URL;
      document.head?.appendChild(link);
    }
  }, []);

  // Load business logos from Supabase
  useEffect(() => {
    const loadBusinessLogos = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          ?.from('business_settings')
          ?.select('logo_horizontal_url, logo_isotipo_url, logo_blanco_url, brand_name')
          ?.eq('owner_id', user?.id)
          ?.single();
        if (data) {
          const logos = [];
          if (data?.logo_horizontal_url) logos?.push({ url: data?.logo_horizontal_url, label: 'Logo horizontal' });
          if (data?.logo_isotipo_url) logos?.push({ url: data?.logo_isotipo_url, label: 'Isotipo' });
          if (data?.logo_blanco_url) logos?.push({ url: data?.logo_blanco_url, label: 'Logo blanco' });
          setBusinessLogoOptions(logos);
        }
      } catch (err) {
        // silently fail
      }
    };
    if (isOpen) loadBusinessLogos();
  }, [isOpen, user?.id]);

  // Sync external reward value to design
  useEffect(() => {
    if (externalRewardValue && !design?.rewardText) {
      setDesign(prev => ({ ...prev, rewardText: externalRewardValue }));
    }
  }, [externalRewardValue]);

  const setD = (key, val) => {
    setDesign(prev => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (activeTab !== 'templates') setHasManualChanges(true);
  };

  const applyTemplate = (tpl) => {
    const bgType = tpl?.bg?.startsWith('linear-gradient')
      ? (tpl?.bg?.match(/#[0-9A-Fa-f]{6}/g)?.length >= 3 ? 'gradient3' : 'gradient2')
      : 'solid';
    let grad2c1 = design?.grad2c1, grad2c2 = design?.grad2c2;
    let grad3c1 = design?.grad3c1, grad3c2 = design?.grad3c2, grad3c3 = design?.grad3c3;
    let solidColor = design?.solidColor;
    if (bgType === 'solid') solidColor = tpl?.bg;
    if (bgType === 'gradient2') {
      const match = tpl?.bg?.match(/#[0-9A-Fa-f]{6}/g);
      if (match) { grad2c1 = match?.[0]; grad2c2 = match?.[1] || match?.[0]; }
    }
    if (bgType === 'gradient3') {
      const match = tpl?.bg?.match(/#[0-9A-Fa-f]{6}/g);
      if (match) { grad3c1 = match?.[0]; grad3c2 = match?.[1] || match?.[0]; grad3c3 = match?.[2] || match?.[0]; }
    }
    setDesign(prev => ({
      ...prev,
      bgType, solidColor, grad2c1, grad2c2, grad3c1, grad3c2, grad3c3,
      accentColor: tpl?.accent,
      textColor: tpl?.textColor,
      stampFullStyle: tpl?.stampStyle,
      stampEmptyStyle: tpl?.emptyStyle,
      layout: tpl?.layout,
      layoutCols: tpl?.cols,
      borderRadius: tpl?.borderRadius,
      font: tpl?.font,
      pattern: tpl?.pattern,
      patternOpacity: tpl?.patternOpacity || 8,
      effect: tpl?.effect,
      badgeEnabled: tpl?.badge,
      badgeText: tpl?.badgeText || 'MEMBER CARD',
      separatorEnabled: tpl?.separator && tpl?.separator !== 'none',
      separatorType: tpl?.separator === 'none' ? 'line' : (tpl?.separator || 'line'),
      borderStyle: tpl?.border || 'Sin borde',
      stampCount: tpl?.stampCount || prev?.stampCount,
      orientation: tpl?.orientation || 'horizontal',
      cardShape: tpl?.shape || 'rounded',
      templateImageUrl: null,
    }));
    setSelectedTemplate(tpl?.id);
    setIsDirty(true);
  };

  const handleTemplateClick = (tpl) => {
    if (hasManualChanges) {
      setPendingTemplate(tpl);
      setConfirmTemplateModal(true);
    } else {
      applyTemplate(tpl);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      setConfirmCloseModal(true);
    } else {
      onClose();
    }
  };

  // ── APPLY DESIGN: no name validation required ──
  const handleApply = () => {
    onSave(design);
  };

  const handleTemplateImageUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setD('templateImageUrl', ev?.target?.result);
      setD('bgType', 'image');
    };
    reader?.readAsDataURL(file);
  };

  const handleCustomIconUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setD('customIconUrl', ev?.target?.result);
      setD('cardIcon', 'custom');
    };
    reader?.readAsDataURL(file);
  };

  const handleHeroImageUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setD('heroImageUrl', ev?.target?.result);
    };
    reader?.readAsDataURL(file);
  };

  const filteredTemplates = templateCategory === 'Todos' ? TEMPLATES : TEMPLATES?.filter(t => t?.category === templateCategory);

  useEffect(() => {
    if (scrollRef?.current) scrollRef.current.scrollTop = 0;
  }, [activeTab]);

  if (!isOpen) return null;

  // ── TAB CONTENT ──────────────────────────────────────────────────────────

  const renderTemplates = () => (
    <div className="space-y-4">
      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {TEMPLATE_CATEGORIES?.map(cat => (
          <button key={cat} type="button" onClick={() => setTemplateCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${templateCategory === cat ? 'bg-primary text-white' : 'border border-border text-muted-foreground hover:border-muted-foreground'}`}>
            {cat}
          </button>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredTemplates?.map(tpl => {
          const isSelected = selectedTemplate === tpl?.id;
          const bgStyle = tpl?.bg?.startsWith('linear') ? { background: tpl?.bg } : { background: tpl?.bg };
          const accentColors = [tpl?.accent, tpl?.accent, tpl?.accent, tpl?.accent + '38', tpl?.accent + '38'];
          return (
            <button key={tpl?.id} type="button" onClick={() => handleTemplateClick(tpl)}
              className={`rounded-xl overflow-hidden transition-all text-left ${isSelected ? 'ring-2 ring-primary ring-offset-1' : 'border border-border hover:border-muted-foreground'}`}>
              <div className="relative flex items-center justify-between px-2 py-2" style={{ ...bgStyle, height: 70 }}>
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="Check" size={10} className="text-white" />
                  </div>
                )}
                <div className="ml-1">
                  <p className="uppercase tracking-wider" style={{ fontSize: 9, color: tpl?.textColor, opacity: 0.7 }}>PromoClub</p>
                  <p className="font-bold" style={{ fontSize: 13, color: tpl?.textColor }}>{tpl?.name}</p>
                </div>
                <div style={{ fontSize: 26 }}>{tpl?.thumb}</div>
              </div>
              <div className="bg-white flex items-center justify-between px-2 py-1.5" style={{ height: 32 }}>
                <div className="flex gap-1">
                  {accentColors?.map((c, i) => (
                    <div key={i} className="rounded-full" style={{ width: 11, height: 11, background: c }} />
                  ))}
                </div>
                <p className="uppercase tracking-wider text-muted-foreground" style={{ fontSize: 9 }}>{tpl?.category}</p>
              </div>
            </button>
          );
        })}
      </div>
      {/* Upload image for template */}
      <div className="p-3 bg-muted/30 rounded-xl space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Imagen personalizada como plantilla</p>
        <p className="text-xs text-muted-foreground">Sube una imagen para usarla como fondo de tu tarjeta.</p>
        <input ref={templateImageRef} type="file" accept="image/*" className="hidden" onChange={handleTemplateImageUpload} />
        <button type="button" onClick={() => templateImageRef?.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-xs font-medium text-muted-foreground hover:text-primary">
          <Icon name="Upload" size={14} />
          {design?.templateImageUrl ? '✅ Imagen cargada — cambiar' : 'Subir imagen de fondo'}
        </button>
        {design?.templateImageUrl && (
          <div className="flex items-center gap-2">
            <img src={design?.templateImageUrl} alt="Template preview" className="w-16 h-10 object-cover rounded-lg border border-border" />
            <button type="button" onClick={() => { setD('templateImageUrl', null); setD('bgType', 'solid'); }}
              className="text-xs text-destructive hover:underline">Quitar imagen</button>
          </div>
        )}
      </div>
      {/* Note */}
      <div className="p-3 bg-muted/40 rounded-xl">
        <p className="text-xs text-muted-foreground">Al cambiar de plantilla, tu nombre, ícono y recompensa se conservan. Solo cambia el diseño visual. Puedes ajustar cualquier elemento en las pestañas siguientes.</p>
      </div>
    </div>
  );

  const renderIdentity = () => (
    <div className="space-y-5">
      {/* Icon grid */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Ícono de la tarjeta</p>
        <div className="grid grid-cols-8 gap-1.5 mb-3" style={{ maxHeight: 220, overflowY: 'auto' }}>
          {CARD_ICONS?.map(ic => (
            <button key={ic?.id} type="button" onClick={() => { setD('cardIcon', ic?.id); setD('customIconUrl', null); setD('businessLogoUrl', null); }}
              className={`rounded-lg flex items-center justify-center transition-all hover:scale-105 ${design?.cardIcon === ic?.id && !design?.customIconUrl && !design?.businessLogoUrl ? 'border-2 border-primary bg-primary/8' : 'border border-border'}`}
              style={{ width: 36, height: 36, fontSize: 18 }}>
              {ic?.icon}
            </button>
          ))}
        </div>
        {/* Custom icon upload */}
        <div className="p-3 bg-muted/30 rounded-xl space-y-2">
          <p className="text-xs font-medium text-foreground">Ícono personalizado</p>
          <input ref={customIconRef} type="file" accept="image/*" className="hidden" onChange={handleCustomIconUpload} />
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => customIconRef?.current?.click()}
              className={`flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg transition-all text-xs font-medium ${design?.customIconUrl ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
              <Icon name="Upload" size={13} />
              {design?.customIconUrl ? 'Cambiar ícono' : 'Subir ícono'}
            </button>
            {design?.customIconUrl && (
              <>
                <img src={design?.customIconUrl} alt="Custom icon" className="w-9 h-9 object-cover rounded-lg border-2 border-primary" />
                <button type="button" onClick={() => { setD('customIconUrl', null); setD('cardIcon', 'star'); }}
                  className="text-xs text-destructive hover:underline">Quitar</button>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">PNG, SVG o JPG. Se mostrará en lugar del emoji seleccionado.</p>
        </div>
      </div>

      {/* Business Logo Section */}
      <div className="p-3 bg-muted/30 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🏢</span>
          <p className="text-xs font-bold text-foreground">Logotipo del negocio</p>
        </div>
        <p className="text-xs text-muted-foreground">Usa el logotipo de tu perfil de negocio o sube uno nuevo para mostrarlo en la tarjeta.</p>
        {/* Logos from business profile */}
        {businessLogoOptions?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Logos del perfil del negocio:</p>
            <div className="flex gap-2 flex-wrap">
              {businessLogoOptions?.map((logo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setD('businessLogoUrl', logo?.url); setD('customIconUrl', null); }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${design?.businessLogoUrl === logo?.url ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                >
                  <img src={logo?.url} alt={logo?.label} className="h-8 object-contain max-w-16" />
                  <span className="text-xs text-muted-foreground" style={{ fontSize: 9 }}>{logo?.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {businessLogoOptions?.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No hay logos en el perfil del negocio. Puedes subir uno abajo.</p>
        )}
        {/* Upload custom logo */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">O sube un logotipo:</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="business-logo-upload"
            onChange={(e) => {
              const file = e?.target?.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                setD('businessLogoUrl', ev?.target?.result);
                setD('customIconUrl', null);
              };
              reader?.readAsDataURL(file);
            }}
          />
          <div className="flex items-center gap-3">
            <label htmlFor="business-logo-upload"
              className={`flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all text-xs font-medium ${design?.businessLogoUrl && !businessLogoOptions?.find(l => l?.url === design?.businessLogoUrl) ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
              <Icon name="Upload" size={13} />
              Subir logotipo
            </label>
            {design?.businessLogoUrl && (
              <>
                <img src={design?.businessLogoUrl} alt="Business logo" className="h-8 object-contain max-w-16 rounded border border-border" />
                <button type="button" onClick={() => setD('businessLogoUrl', null)}
                  className="text-xs text-destructive hover:underline">Quitar</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero / Banner image */}
      <div className="p-3 bg-muted/30 rounded-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🖼️</span>
          <p className="text-xs font-bold text-foreground">Imagen hero / banner</p>
        </div>
        <p className="text-xs text-muted-foreground">Imagen alusiva a tu negocio o a la tarjeta. Se muestra en la parte superior de la tarjeta.</p>
        <input ref={heroImageRef} type="file" accept="image/*" className="hidden" onChange={handleHeroImageUpload} />
        <button type="button" onClick={() => heroImageRef?.current?.click()}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg transition-all text-xs font-medium ${design?.heroImageUrl ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
          <Icon name="Image" size={14} />
          {design?.heroImageUrl ? '✅ Imagen cargada — cambiar' : 'Subir imagen hero / banner'}
        </button>
        {design?.heroImageUrl && (
          <div className="flex items-center gap-2">
            <img src={design?.heroImageUrl} alt="Hero preview" className="w-24 h-12 object-cover rounded-lg border border-border" />
            <button type="button" onClick={() => setD('heroImageUrl', null)}
              className="text-xs text-destructive hover:underline">Quitar imagen</button>
          </div>
        )}
      </div>

      {/* Reward */}
      <div className="p-3 rounded-xl border border-border" style={{ background: 'var(--muted, #f4f4f5)' }}>
        <p className="text-xs font-bold text-muted-foreground mb-2">🎁 Recompensa al completar</p>
        {externalRewardValue && (
          <div className="mb-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-primary">📌 Premio del formulario: <strong>{externalRewardValue}</strong></p>
            <button type="button" onClick={() => setD('rewardText', externalRewardValue)}
              className="text-xs text-primary underline mt-0.5">Usar este valor</button>
          </div>
        )}
        <div className="flex gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Emoji</p>
            <input type="text" maxLength={2} value={design?.rewardEmoji}
              onChange={e => setD('rewardEmoji', e?.target?.value)}
              className="w-16 px-2 py-2 border border-border rounded-lg bg-background text-center text-xl focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Premio</p>
            <input type="text" value={design?.rewardText}
              onChange={e => setD('rewardText', e?.target?.value)}
              placeholder={externalRewardValue || 'Ej: Café americano gratis'}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderColor = () => (
    <div className="space-y-5">
      {/* Background type */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Tipo de fondo</p>
        <div className="grid grid-cols-3 gap-2">
          {[['solid', '🟦 Color sólido'], ['gradient2', '🌅 Gradiente 2pts'], ['gradient3', '🌓 Gradiente 3pts']]?.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setD('bgType', id)}
              className={`p-2 rounded-xl border-2 text-xs font-medium text-center transition-all ${design?.bgType === id ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* Solid */}
      {design?.bgType === 'solid' && (
        <div>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {SOLID_COLORS?.map(c => (
              <button key={c} type="button" onClick={() => setD('solidColor', c)}
                className="rounded-lg transition-all hover:scale-105"
                style={{ width: 30, height: 30, background: c, border: design?.solidColor === c ? '2.5px solid #000' : '2px solid transparent', boxShadow: design?.solidColor === c ? '0 0 0 2px white, 0 0 0 4px #000' : 'none' }} />
            ))}
          </div>
          <div className="flex gap-2">
            <input type="color" value={design?.solidColor} onChange={e => setD('solidColor', e?.target?.value)}
              className="w-10 h-8 rounded border border-border cursor-pointer" />
            <input type="text" value={design?.solidColor} onChange={e => setD('solidColor', e?.target?.value)}
              className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none" />
          </div>
        </div>
      )}
      {/* Gradient 2 */}
      {design?.bgType === 'gradient2' && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Presets rápidos</p>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_2_PRESETS?.map(p => (
              <button key={p?.name} type="button" onClick={() => { setD('grad2c1', p?.c1); setD('grad2c2', p?.c2); }}
                className="rounded-lg overflow-hidden border border-border hover:border-muted-foreground transition-all"
                style={{ height: 36, background: `linear-gradient(135deg, ${p?.c1}, ${p?.c2})` }}>
                <span className="text-white text-center block" style={{ fontSize: 8, paddingTop: 20 }}>{p?.name}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['grad2c1', 'Color inicial'], ['grad2c2', 'Color final']]?.map(([key, label]) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className="flex gap-1">
                  <input type="color" value={design?.[key]} onChange={e => setD(key, e?.target?.value)}
                    className="w-8 h-8 rounded border border-border cursor-pointer" />
                  <input type="text" value={design?.[key]} onChange={e => setD(key, e?.target?.value)}
                    className="flex-1 px-2 py-1 border border-border rounded bg-background text-xs font-mono focus:outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Gradient 3 */}
      {design?.bgType === 'gradient3' && (
        <div className="grid grid-cols-3 gap-2">
          {[['grad3c1', 'Inicio'], ['grad3c2', 'Medio'], ['grad3c3', 'Final']]?.map(([key, label]) => (
            <div key={key}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <div className="flex flex-col gap-1">
                <input type="color" value={design?.[key]} onChange={e => setD(key, e?.target?.value)}
                  className="w-full h-8 rounded border border-border cursor-pointer" />
                <input type="text" value={design?.[key]} onChange={e => setD(key, e?.target?.value)}
                  className="w-full px-2 py-1 border border-border rounded bg-background text-xs font-mono focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Accent */}
      <div>
        <div className="h-px bg-border my-1" />
        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide mt-3">Color de acento</p>
        <p className="text-xs text-muted-foreground mb-2">Se aplica a: sellos activos, barra de progreso, bordes, textos secundarios.</p>
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          {ACCENT_COLORS?.map(c => (
            <button key={c} type="button" onClick={() => setD('accentColor', c)}
              className="rounded-lg transition-all hover:scale-105"
              style={{ width: 30, height: 30, background: c, border: design?.accentColor === c ? '2.5px solid #000' : '2px solid transparent', boxShadow: design?.accentColor === c ? '0 0 0 2px white, 0 0 0 4px #000' : 'none' }} />
          ))}
        </div>
        <div className="flex gap-2">
          <input type="color" value={design?.accentColor} onChange={e => setD('accentColor', e?.target?.value)}
            className="w-10 h-8 rounded border border-border cursor-pointer" />
          <input type="text" value={design?.accentColor} onChange={e => setD('accentColor', e?.target?.value)}
            className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none" />
        </div>
      </div>
      {/* Text color */}
      <div>
        <div className="h-px bg-border my-1" />
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide mt-3">Color del texto principal</p>
        <div className="flex gap-2 flex-wrap">
          {TEXT_COLORS?.map(c => (
            <button key={c} type="button" onClick={() => setD('textColor', c)}
              className="rounded-full transition-all hover:scale-105"
              style={{ width: 26, height: 26, background: c, border: design?.textColor === c ? '2.5px solid #666' : '1px solid #ccc' }} />
          ))}
          <input type="color" value={design?.textColor} onChange={e => setD('textColor', e?.target?.value)}
            className="w-7 h-7 rounded-full border border-border cursor-pointer" />
        </div>
      </div>
    </div>
  );

  const renderStamps = () => {
    const count = design?.stampCount || 8;
    const weeksEst = Math.ceil(count / 2);
    return (
      <div className="space-y-5">
        {/* Count */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total de sellos para completar</p>
            <span className="text-2xl font-bold text-primary font-mono">{count}</span>
          </div>
          <input type="range" min={3} max={20} value={count} onChange={e => setD('stampCount', parseInt(e?.target?.value))}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>3</span><span>20</span></div>
          <p className="text-xs text-muted-foreground mt-2">Con {count} sellos visitando 2 veces/semana, la tarjeta se completa en ~{weeksEst} semanas.</p>
        </div>
        {/* Full style */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Estilo del sello al completarse</p>
          <div className="grid grid-cols-2 gap-2">
            {STAMP_FULL_STYLES?.map(s => (
              <button key={s?.id} type="button" onClick={() => setD('stampFullStyle', s?.id)}
                className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${design?.stampFullStyle === s?.id ? 'border-primary bg-primary/8' : 'border-border hover:border-muted-foreground'}`}>
                <div className="rounded-full flex-shrink-0" style={{
                  width: 24, height: 24,
                  ...(s?.id === 'custom'
                    ? { background: `radial-gradient(circle, ${design?.customStampColor || '#FFD700'}dd, ${design?.customStampColor || '#FFD700'})` }
                    : { background: s?.bg, boxShadow: s?.shadow })
                }} />
                <span className="text-xs font-bold text-foreground">{s?.name}</span>
              </button>
            ))}
          </div>
          {/* Custom stamp color picker */}
          {design?.stampFullStyle === 'custom' && (
            <div className="mt-3 p-3 bg-muted/30 rounded-xl">
              <p className="text-xs font-medium text-foreground mb-2">Color personalizado del sello</p>
              <div className="flex gap-2 items-center">
                <input type="color" value={design?.customStampColor || '#FFD700'}
                  onChange={e => setD('customStampColor', e?.target?.value)}
                  className="w-10 h-8 rounded border border-border cursor-pointer" />
                <input type="text" value={design?.customStampColor || '#FFD700'}
                  onChange={e => setD('customStampColor', e?.target?.value)}
                  className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none" />
                <div className="w-8 h-8 rounded-full border border-border"
                  style={{ background: `radial-gradient(circle, ${design?.customStampColor || '#FFD700'}dd, ${design?.customStampColor || '#FFD700'})` }} />
              </div>
            </div>
          )}
        </div>
        {/* Empty style */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Estilo del sello vacío</p>
          <div className="grid grid-cols-2 gap-2">
            {STAMP_EMPTY_STYLES?.map(s => (
              <button key={s?.id} type="button" onClick={() => setD('stampEmptyStyle', s?.id)}
                className={`p-2 rounded-xl border-2 text-xs font-bold text-left transition-all ${design?.stampEmptyStyle === s?.id ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
                {s?.name}
              </button>
            ))}
          </div>
          {/* Custom empty border color picker */}
          {design?.stampEmptyStyle === 'border-custom' && (
            <div className="mt-3 p-3 bg-muted/30 rounded-xl">
              <p className="text-xs font-medium text-foreground mb-2">Color personalizado del borde vacío</p>
              <div className="flex gap-2 items-center">
                <input type="color" value={design?.customEmptyBorderColor || '#D4A853'}
                  onChange={e => setD('customEmptyBorderColor', e?.target?.value)}
                  className="w-10 h-8 rounded border border-border cursor-pointer" />
                <input type="text" value={design?.customEmptyBorderColor || '#D4A853'}
                  onChange={e => setD('customEmptyBorderColor', e?.target?.value)}
                  className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none" />
                <div className="w-8 h-8 rounded-full border-2"
                  style={{ borderColor: design?.customEmptyBorderColor || '#D4A853' }} />
              </div>
            </div>
          )}
        </div>
        {/* Stamp size */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tamaño de cada sello</p>
            <span className="text-lg font-bold text-primary font-mono">{design?.stampSize || 36}px</span>
          </div>
          <input type="range" min={28} max={56} value={design?.stampSize || 36}
            onChange={e => setD('stampSize', parseInt(e?.target?.value))}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Pequeño</span><span>Grande</span></div>
        </div>
        {/* Progress simulator */}
        <div className="p-3 bg-muted/30 rounded-xl">
          <p className="text-xs font-bold text-foreground mb-3">🎮 Simula el progreso del cliente</p>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button type="button" onClick={() => setD('_simStamps', Math.max(0, (design?._simStamps || 0) - 1))}
              className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-lg font-bold hover:border-primary transition-colors">−</button>
            <span className="text-sm font-bold text-foreground">{design?._simStamps || 0} / {count}</span>
            <button type="button" onClick={() => setD('_simStamps', Math.min(count, (design?._simStamps || 0) + 1))}
              className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-lg font-bold hover:border-primary transition-colors">+</button>
          </div>
          <div className="flex gap-2 justify-center">
            {[['Vacía', 0], ['Mitad', Math.floor(count / 2)], ['Llena', count]]?.map(([label, val]) => (
              <button key={label} type="button" onClick={() => setD('_simStamps', val)}
                className="px-3 py-1 text-xs border border-border rounded-lg hover:border-primary hover:text-primary transition-colors">
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">La simulación es solo visual. No afecta la configuración.</p>
        </div>
      </div>
    );
  };

  const renderLayout = () => (
    <div className="space-y-5">
      {/* Orientation */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Orientación de la tarjeta</p>
        <div className="grid grid-cols-2 gap-2">
          {[['horizontal', '↔️ Horizontal'], ['vertical', '↕️ Vertical']]?.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setD('orientation', id)}
              className={`p-3 rounded-xl border-2 text-xs font-medium text-center transition-all ${design?.orientation === id ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* Card shape */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Forma de la tarjeta</p>
        <div className="grid grid-cols-2 gap-2">
          {[['rounded', '⬜ Redondeada'], ['square', '🔲 Cuadrada'], ['circle-card', '⭕ Circular'], ['pill', '💊 Pill']]?.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setD('cardShape', id)}
              className={`p-3 rounded-xl border-2 text-xs font-medium text-center transition-all ${design?.cardShape === id ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* Layout distribution */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Distribución de los sellos</p>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS?.map(l => (
            <button key={l?.id} type="button" onClick={() => setD('layout', l?.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${design?.layout === l?.id ? 'border-primary bg-primary/8' : 'border-border hover:border-muted-foreground'}`}>
              <div className="text-lg mb-1">{l?.icon}</div>
              <p className="text-xs font-bold text-foreground">{l?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{l?.desc}</p>
            </button>
          ))}
        </div>
        {(design?.layout === 'grid' || design?.layout === 'zigzag') && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Columnas por fila</p>
            <div className="flex gap-2">
              {[3, 4, 5, 6]?.map(n => (
                <button key={n} type="button" onClick={() => setD('layoutCols', n)}
                  className={`w-10 h-10 rounded-xl border-2 text-sm font-bold transition-all ${design?.layoutCols === n ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Border radius */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Curvatura de las esquinas</p>
        <div className="grid grid-cols-2 gap-2">
          {BORDER_RADII?.map(r => (
            <button key={r?.id} type="button" onClick={() => setD('borderRadius', r?.id)}
              className={`p-2 rounded-xl border-2 text-left transition-all ${design?.borderRadius === r?.id ? 'border-primary bg-primary/8' : 'border-border hover:border-muted-foreground'}`}>
              <p className="text-xs font-bold text-foreground">{r?.name}</p>
              <p className="text-xs text-muted-foreground">{r?.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFont = () => (
    <div className="space-y-3">
      <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Tipografía del nombre</p>
      {FONTS?.map(f => (
        <button key={f?.id} type="button" onClick={() => setD('font', f?.id)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${design?.font === f?.id ? 'border-primary bg-primary/8' : 'border-border hover:border-muted-foreground'}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{f?.name}</p>
              <p style={{ ...f?.style, fontSize: 19 }} className="text-foreground">
                {initialName || 'Mi Tarjeta de Sello'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{f?.desc}</p>
            </div>
            {design?.font === f?.id && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                <Icon name="Check" size={10} className="text-white" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );

  const renderExtras = () => (
    <div className="space-y-5">
      {/* Pattern */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Patrón de textura del fondo</p>
        <div className="grid grid-cols-3 gap-2">
          {PATTERNS?.map(p => (
            <button key={p} type="button" onClick={() => setD('pattern', p)}
              className={`p-2 rounded-xl border-2 text-xs font-medium text-center transition-all ${design?.pattern === p ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
              {p}
            </button>
          ))}
        </div>
        {design?.pattern !== 'Sin patrón' && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Intensidad del patrón</p>
              <span className="text-xs font-bold text-primary font-mono">{design?.patternOpacity || 8}%</span>
            </div>
            <input type="range" min={2} max={20} value={design?.patternOpacity || 8}
              onChange={e => setD('patternOpacity', parseInt(e?.target?.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Sutil</span><span>Marcado</span></div>
          </div>
        )}
      </div>
      {/* Effect */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Efecto de sombra y profundidad</p>
        <div className="grid grid-cols-2 gap-2">
          {EFFECTS?.map(e => (
            <button key={e?.id} type="button" onClick={() => setD('effect', e?.id)}
              className={`p-2 rounded-xl border-2 text-left transition-all ${design?.effect === e?.id ? 'border-primary bg-primary/8' : 'border-border hover:border-muted-foreground'}`}>
              <p className="text-xs font-bold text-foreground">{e?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{e?.desc}</p>
            </button>
          ))}
        </div>
      </div>
      {/* Decorative elements */}
      <div className="p-3 bg-muted/30 rounded-xl space-y-4 border border-border">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Elementos decorativos</p>
        {/* Badge */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-foreground">Badge de membresía</p>
            <button type="button" onClick={() => setD('badgeEnabled', !design?.badgeEnabled)}
              className={`w-10 h-5 rounded-full transition-colors relative ${design?.badgeEnabled ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${design?.badgeEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {design?.badgeEnabled && (
            <input type="text" maxLength={20} value={design?.badgeText}
              onChange={e => setD('badgeText', e?.target?.value)}
              placeholder="MEMBER CARD"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs font-mono uppercase focus:outline-none" />
          )}
        </div>
        {/* Separator */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-foreground">Separador decorativo</p>
            <button type="button" onClick={() => setD('separatorEnabled', !design?.separatorEnabled)}
              className={`w-10 h-5 rounded-full transition-colors relative ${design?.separatorEnabled ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${design?.separatorEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {design?.separatorEnabled && (
            <div className="flex gap-2">
              {SEPARATOR_OPTIONS?.map(s => (
                <button key={s?.id} type="button" onClick={() => setD('separatorType', s?.id)}
                  className={`flex-1 p-2 rounded-lg border-2 text-xs text-center transition-all ${design?.separatorType === s?.id ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground'}`}>
                  {s?.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Border */}
        <div>
          <p className="text-xs font-medium text-foreground mb-2">Borde exterior</p>
          <div className="grid grid-cols-2 gap-1.5">
            {BORDER_STYLES?.map(b => (
              <button key={b} type="button" onClick={() => setD('borderStyle', b)}
                className={`p-2 rounded-lg border-2 text-xs text-left transition-all ${design?.borderStyle === b ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
                {b}
              </button>
            ))}
          </div>
          {design?.borderStyle === 'Borde personalizado' && (
            <div className="mt-2 flex gap-2 items-center">
              <input type="color" value={design?.customBorderColor || '#D4A853'}
                onChange={e => setD('customBorderColor', e?.target?.value)}
                className="w-10 h-8 rounded border border-border cursor-pointer" />
              <input type="text" value={design?.customBorderColor || '#D4A853'}
                onChange={e => setD('customBorderColor', e?.target?.value)}
                className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const tabContent = {
    templates: renderTemplates,
    identity: renderIdentity,
    color: renderColor,
    stamps: renderStamps,
    layout: renderLayout,
    font: renderFont,
    extras: renderExtras,
  };

  const getTabDot = (tabId) => {
    if (tabId === 'identity') {
      return initialName?.trim() ? 'green' : 'gray';
    }
    return 'gray';
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className="bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ width: 700, maxWidth: '95vw', height: '92vh', maxHeight: '92vh' }}>
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
            <div>
              <h2 className="text-base font-bold text-foreground">Constructor de Tarjeta de Sello</h2>
              <p className="text-xs text-muted-foreground">La vista previa se actualiza en tiempo real en el formulario</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowPreviewModal(true)}
                className="px-4 py-1.5 text-xs font-bold border border-border text-foreground rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5">
                <Icon name="Eye" size={13} />
                Vista previa
              </button>
              <button type="button" onClick={handleApply}
                className="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Aplicar diseño
              </button>
              <button type="button" onClick={handleClose}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors ml-1">
                <Icon name="X" size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Tabs sticky */}
          <div className="flex border-b border-border bg-background flex-shrink-0 overflow-x-auto">
            {TABS?.map(tab => {
              const dot = getTabDot(tab?.id);
              return (
                <button key={tab?.id} type="button" onClick={() => setActiveTab(tab?.id)}
                  className={`flex flex-col items-center px-4 py-2 text-xs font-medium transition-colors relative flex-shrink-0 ${activeTab === tab?.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  <span className="text-sm">{tab?.icon}</span>
                  <span className="mt-0.5 whitespace-nowrap" style={{ fontSize: 10 }}>{tab?.label}</span>
                  {dot === 'green' && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-success" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Info note */}
          <div className="px-4 pt-3 flex-shrink-0">
            <button type="button" onClick={() => setInfoCollapsed(!infoCollapsed)}
              className="w-full flex items-center justify-between p-2 bg-muted/40 rounded-lg text-xs text-muted-foreground hover:bg-muted/60 transition-colors">
              <span>ℹ️ Todas las reglas son opcionales. La vista previa se actualiza en tiempo real.</span>
              <Icon name={infoCollapsed ? 'ChevronDown' : 'ChevronUp'} size={12} />
            </button>
            {!infoCollapsed && (
              <div className="mt-1 p-2 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                La vista previa se actualiza en tiempo real en el formulario de nueva tarjeta. Navega entre pestañas sin perder tu configuración.
              </div>
            )}
          </div>

          {/* Tab content scrollable */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {tabContent?.[activeTab]?.()}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Vista previa de la tarjeta</h3>
              <button type="button" onClick={() => setShowPreviewModal(false)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <Icon name="X" size={16} className="text-muted-foreground" />
              </button>
            </div>
            <CardPreviewInline
              design={design}
              cardName={initialName || 'Nombre de la tarjeta'}
              filledStamps={previewFilledStamps}
              onStampClick={(i) => setPreviewFilledStamps(i < previewFilledStamps ? i : i + 1)}
            />
            <div className="mt-4 flex items-center justify-center gap-3">
              <button type="button" onClick={() => setPreviewFilledStamps(Math.max(0, previewFilledStamps - 1))}
                className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-lg font-bold hover:border-primary transition-colors">−</button>
              <span className="text-sm font-medium text-muted-foreground">{previewFilledStamps} / {design?.stampCount || 8} sellos</span>
              <button type="button" onClick={() => setPreviewFilledStamps(Math.min(design?.stampCount || 8, previewFilledStamps + 1))}
                className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-lg font-bold hover:border-primary transition-colors">+</button>
            </div>
            <div className="flex gap-2 justify-center mt-2">
              {[['Vacía', 0], ['Mitad', Math.floor((design?.stampCount || 8) / 2)], ['Llena', design?.stampCount || 8]]?.map(([label, val]) => (
                <button key={label} type="button" onClick={() => setPreviewFilledStamps(val)}
                  className="px-3 py-1 text-xs border border-border rounded-lg hover:border-primary hover:text-primary transition-colors">
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">Toca los sellos para simular el progreso</p>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowPreviewModal(false)}
                className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                Seguir editando
              </button>
              <button type="button" onClick={() => { setShowPreviewModal(false); handleApply(); }}
                className="flex-1 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Aplicar diseño
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm template change */}
      {confirmTemplateModal && pendingTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-background rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-foreground mb-2">¿Aplicar plantilla "{pendingTemplate?.name}"?</h3>
            <p className="text-sm text-muted-foreground mb-4">Esto reemplazará tu diseño visual actual. Tu contenido (nombre, ícono, recompensa) se conserva.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setConfirmTemplateModal(false); setPendingTemplate(null); }}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Cancelar</button>
              <button type="button" onClick={() => { applyTemplate(pendingTemplate); setConfirmTemplateModal(false); setPendingTemplate(null); }}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Aplicar plantilla</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm close */}
      {confirmCloseModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-background rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-foreground mb-2">¿Salir sin guardar?</h3>
            <p className="text-sm text-muted-foreground mb-4">Los cambios se perderán.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmCloseModal(false)}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Continuar editando</button>
              <button type="button" onClick={() => { setConfirmCloseModal(false); onClose(); }}
                className="px-4 py-2 text-sm bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors">Salir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StampCardBuilderModal;
export { defaultDesign };
