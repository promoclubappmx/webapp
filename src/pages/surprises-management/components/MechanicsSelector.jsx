import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import MechanicDemoModal from './MechanicDemoModal';

const ALL_MECHANICS = [
  {
    id: 'wheel',
    label: 'Ruleta',
    emoji: '🎡',
    desc: 'Rueda giratoria con segmentos de colores. Visual y emocionante.',
    badge: 'Universal',
    badgeColor: 'bg-blue-100 text-blue-700',
    tags: ['Universal'],
    popular: true,
  },
  {
    id: 'scratch',
    label: 'Raspa y Gana',
    emoji: '🎫',
    desc: 'Tarjeta virtual con capa opaca que el usuario raspa.',
    badge: 'Universal',
    badgeColor: 'bg-blue-100 text-blue-700',
    tags: ['Universal'],
    popular: true,
  },
  {
    id: 'chest',
    label: 'Cofre Misterioso',
    emoji: '📦',
    desc: 'Tres cofres cerrados, el usuario elige uno.',
    badge: 'Familiar',
    badgeColor: 'bg-green-100 text-green-700',
    tags: ['Familiar'],
  },
  {
    id: 'envelope',
    label: 'Sobre Sorpresa',
    emoji: '✉️',
    desc: 'Sobre animado que el usuario abre con un tap.',
    badge: 'Universal',
    badgeColor: 'bg-blue-100 text-blue-700',
    tags: ['Universal'],
  },
  {
    id: 'dice',
    label: 'Dados',
    emoji: '🎲',
    desc: 'Lanza uno o dos dados virtuales. El resultado determina tu premio.',
    badge: 'Bar · Entretenimiento',
    badgeColor: 'bg-purple-100 text-purple-700',
    tags: ['Familiar', 'Temático'],
    isNew: true,
  },
  {
    id: 'balloon',
    label: 'Globo',
    emoji: '🎈',
    desc: 'Infla el globo tocando la pantalla. Cuando explota, revela tu premio.',
    badge: 'Gen Z · Familiar',
    badgeColor: 'bg-pink-100 text-pink-700',
    tags: ['Gen Z', 'Familiar'],
    isNew: true,
  },
  {
    id: 'loteria',
    label: 'Lotería Mexicana',
    emoji: '🃏',
    desc: '¡Buenas! Recibe un cartón y descubre si ganaste al completar tu figura.',
    badge: 'Cultural MX',
    badgeColor: 'bg-red-100 text-red-700',
    tags: ['Cultural MX', 'Familiar'],
    isNew: true,
    isCultural: true,
  },
  {
    id: 'fishing',
    label: 'Pesca',
    emoji: '🎣',
    desc: 'Lanza tu anzuelo al estanque y descubre qué pesca hoy.',
    badge: 'Playa · Familiar',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    tags: ['Familiar', 'Temático'],
    isNew: true,
  },
  {
    id: 'gacha',
    label: 'Cápsula Gacha',
    emoji: '🎰',
    desc: 'Gira la máquina de cápsulas y descubre tu sorpresa.',
    badge: 'Gen Z · Millennials',
    badgeColor: 'bg-violet-100 text-violet-700',
    tags: ['Gen Z'],
    isNew: true,
  },
  {
    id: 'tree',
    label: 'Árbol Sacudidor',
    emoji: '🌳',
    desc: 'Sacude el teléfono para hacer caer los premios del árbol.',
    badge: 'Familiar · Café',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    tags: ['Familiar', 'Temático'],
    isNew: true,
  },
  {
    id: 'vending',
    label: 'Máquina Expendedora',
    emoji: '🏧',
    desc: 'Presiona el botón y descubre qué producto te da la máquina hoy.',
    badge: 'Universal',
    badgeColor: 'bg-blue-100 text-blue-700',
    tags: ['Universal'],
    isNew: true,
  },
];

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'Universal', label: 'Universal' },
  { id: 'Familiar', label: 'Familiar' },
  { id: 'Gen Z', label: 'Gen Z' },
  { id: 'Cultural MX', label: 'Cultural MX' },
  { id: 'Temático', label: 'Temático' },
];

// ─── Animated Preview Components ────────────────────────────────────────────

const WheelPreview = () => {
  const segments = ['#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899','#06B6D4'];
  return (
    <div className="relative w-14 h-14 mx-auto" style={{ animation: 'spin 2s linear infinite' }}>
      <svg viewBox="0 0 56 56" className="w-full h-full drop-shadow-md">
        {segments?.map((color, i) => {
          const angle = (360 / segments?.length) * i;
          const rad = (angle * Math.PI) / 180;
          const rad2 = ((angle + 360 / segments?.length) * Math.PI) / 180;
          const x1 = 28 + 26 * Math.cos(rad);
          const y1 = 28 + 26 * Math.sin(rad);
          const x2 = 28 + 26 * Math.cos(rad2);
          const y2 = 28 + 26 * Math.sin(rad2);
          return (
            <path
              key={i}
              d={`M28,28 L${x1},${y1} A26,26 0 0,1 ${x2},${y2} Z`}
              fill={color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
        <circle cx="28" cy="28" r="5" fill="white" stroke="#ccc" strokeWidth="1" />
      </svg>
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '8px solid #1e293b' }} />
    </div>
  );
};

const ScratchPreview = () => {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setRevealed(r => r >= 100 ? 0 : r + 8), 120);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-14 h-10 mx-auto relative rounded-lg overflow-hidden border-2 border-amber-400 bg-amber-50">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-amber-600">🏆</span>
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg transition-all duration-100"
        style={{ clipPath: `inset(0 ${revealed}% 0 0)` }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {revealed < 50 && <span className="text-xs text-white font-bold opacity-70">RASPA</span>}
      </div>
    </div>
  );
};

const ChestPreview = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setOpen(o => !o), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex gap-1.5 justify-center items-end">
      {[false, open, false]?.map((isOpen, i) => (
        <div key={i} className={`transition-all duration-500 ${i === 1 ? 'scale-110' : 'scale-90 opacity-70'}`}>
          <div className="w-8 h-6 relative">
            <div className={`w-8 h-3 bg-amber-700 rounded-t-md border border-amber-900 transition-all duration-500 origin-bottom ${isOpen ? '-rotate-45 -translate-y-1' : ''}`} />
            <div className="w-8 h-4 bg-amber-600 rounded-b-md border border-amber-800 flex items-center justify-center">
              {isOpen && <span className="text-xs">✨</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EnvelopePreview = () => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 4), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-14 h-10 mx-auto relative">
      <div className={`w-full h-full bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center transition-all duration-500 ${phase >= 2 ? 'scale-105' : ''}`}>
        {phase < 2 ? (
          <svg viewBox="0 0 40 28" className="w-10 h-7">
            <rect x="1" y="1" width="38" height="26" rx="3" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2"/>
            <path d={phase === 0 ? "M1,1 L20,16 L39,1" : "M1,1 L20,8 L39,1"} fill="none" stroke="#3B82F6" strokeWidth="2"/>
          </svg>
        ) : (
          <span className="text-xl" style={{ animation: phase === 3 ? 'bounce 0.3s ease' : '' }}>
            {phase === 2 ? '💌' : '🎁'}
          </span>
        )}
      </div>
    </div>
  );
};

const DicePreview = () => {
  const [face, setFace] = useState(1);
  const [shaking, setShaking] = useState(false);
  const dots = {
    1: [[50,50]],
    2: [[25,25],[75,75]],
    3: [[25,25],[50,50],[75,75]],
    4: [[25,25],[75,25],[25,75],[75,75]],
    5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
    6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
  };
  useEffect(() => {
    const roll = () => {
      setShaking(true);
      setTimeout(() => { setFace(Math.floor(Math.random() * 6) + 1); setShaking(false); }, 400);
    };
    roll();
    const t = setInterval(roll, 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={`w-12 h-12 mx-auto bg-white border-2 border-gray-300 rounded-xl shadow-md flex items-center justify-center transition-transform duration-100 ${shaking ? 'rotate-12 scale-95' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-9 h-9">
        {(dots?.[face] || [])?.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="10" fill="#1e293b" />
        ))}
      </svg>
    </div>
  );
};

const BalloonPreview = () => {
  const [size, setSize] = useState(0.6);
  const [exploded, setExploded] = useState(false);
  const [color, setColor] = useState('#EF4444');
  useEffect(() => {
    const colors = ['#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899'];
    let growing = true;
    const t = setInterval(() => {
      if (exploded) return;
      setSize(s => {
        if (s >= 1.1) { setExploded(true); setTimeout(() => { setExploded(false); setSize(0.5); setColor(colors?.[Math.floor(Math.random()*colors?.length)]); }, 700); return s; }
        return s + 0.04;
      });
    }, 80);
    return () => clearInterval(t);
  }, [exploded]);
  if (exploded) return (
    <div className="w-14 h-14 mx-auto flex items-center justify-center">
      <span className="text-2xl" style={{ animation: 'ping 0.5s ease-out' }}>🎉</span>
    </div>
  );
  return (
    <div className="w-14 h-14 mx-auto flex flex-col items-center justify-end">
      <div
        className="rounded-full transition-all duration-75 shadow-lg"
        style={{ width: `${size * 40}px`, height: `${size * 44}px`, background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color})`, transform: `scale(${size})` }}
      />
      <div className="w-0.5 h-3 bg-gray-400 mt-0.5" />
    </div>
  );
};

const LoteriaPreview = () => {
  const cards = ['☕','⭐','🗺️','💰','🏆','🎵','🌮','🔑','❤️','🌟','🎭','🍀','🎪','🎯','🎨','🏅'];
  const [revealed, setRevealed] = useState(0);
  const [marked, setMarked] = useState(new Set());
  useEffect(() => {
    const t = setInterval(() => {
      setRevealed(r => {
        const next = r + 1;
        if (next > cards?.length) { setMarked(new Set()); return 0; }
        setMarked(m => { const nm = new Set(m); nm?.add(Math.floor(Math.random() * 16)); return nm; });
        return next;
      });
    }, 600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-14 mx-auto">
      <div className="grid grid-cols-4 gap-0.5">
        {cards?.map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm flex items-center justify-center text-xs transition-all duration-300 ${marked?.has(i) ? 'bg-red-500 text-white scale-110' : 'bg-amber-100 border border-amber-300'}`}>
            {marked?.has(i) ? '✓' : ''}
          </div>
        ))}
      </div>
      <div className="text-center mt-1 text-xs text-amber-700 font-bold truncate">
        {revealed > 0 ? cards?.[revealed % cards?.length] : '🃏'}
      </div>
    </div>
  );
};

const FishingPreview = () => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 5), 600);
    return () => clearInterval(t);
  }, []);
  const fishY = phase >= 3 ? -8 : 8;
  return (
    <div className="w-14 h-14 mx-auto relative overflow-hidden rounded-lg">
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-cyan-300 to-blue-500 rounded-b-lg opacity-80">
        {[0,1,2]?.map(i => (
          <div key={i} className="absolute bottom-1 text-xs opacity-50" style={{ left: `${20 + i*20}%`, animation: `bounce ${1+i*0.3}s ease-in-out infinite` }}>🐟</div>
        ))}
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <div className="text-lg" style={{ transform: phase >= 2 ? 'rotate(-20deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>🎣</div>
        <div className="w-0.5 mx-auto bg-gray-400" style={{ height: `${phase >= 3 ? 12 : 20}px`, transition: 'height 0.3s' }} />
        {phase >= 3 && <div className="text-sm text-center" style={{ transform: `translateY(${fishY}px)`, transition: 'transform 0.3s' }}>🐠</div>}
      </div>
    </div>
  );
};

const GachaPreview = () => {
  const [phase, setPhase] = useState(0);
  const capsuleColors = ['#EF4444','#3B82F6','#22C55E','#F97316','#8B5CF6'];
  const [capsuleColor, setCapsuleColor] = useState(capsuleColors?.[0]);
  useEffect(() => {
    const t = setInterval(() => {
      setPhase(p => {
        if (p >= 4) { setCapsuleColor(capsuleColors?.[Math.floor(Math.random()*capsuleColors?.length)]); return 0; }
        return p + 1;
      });
    }, 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-14 h-14 mx-auto relative flex flex-col items-center justify-center">
      <div className="w-10 h-12 bg-gradient-to-b from-gray-200 to-gray-300 rounded-xl border-2 border-gray-400 relative overflow-hidden shadow-md">
        <div className="absolute top-1 left-1 right-1 h-5 bg-blue-100 rounded-lg border border-blue-200 flex items-center justify-center overflow-hidden">
          {['🔴','🔵','🟢','🟡','🟣']?.map((c,i) => (
            <div key={i} className="w-2 h-2 rounded-full mx-0.5" style={{ background: capsuleColors?.[i], opacity: 0.8 }} />
          ))}
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full border border-gray-500 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full" style={{ background: phase >= 3 ? capsuleColor : '#9CA3AF', transition: 'background 0.3s' }} />
        </div>
        {phase === 2 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full animate-bounce" style={{ background: capsuleColor }} />
          </div>
        )}
      </div>
      {phase >= 3 && (
        <div className="absolute -bottom-1 text-xs font-bold" style={{ color: capsuleColor }}>✨</div>
      )}
    </div>
  );
};

const TreePreview = () => {
  const [shake, setShake] = useState(false);
  const [falling, setFalling] = useState([]);
  useEffect(() => {
    const t = setInterval(() => {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setFalling([
          { id: Date.now(), x: 30 + Math.random() * 20, emoji: ['🍎','💰','⭐','🎁']?.[Math.floor(Math.random()*4)] },
        ]);
        setTimeout(() => setFalling([]), 800);
      }, 300);
    }, 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-14 h-14 mx-auto relative overflow-hidden">
      <div className={`text-4xl text-center transition-transform duration-200 ${shake ? 'rotate-6' : ''}`} style={{ lineHeight: '48px' }}>🌳</div>
      {falling?.map(f => (
        <div key={f?.id} className="absolute text-sm" style={{ left: `${f?.x}%`, top: '10px', animation: 'fall 0.8s ease-in forwards' }}>
          {f?.emoji}
        </div>
      ))}
    </div>
  );
};

const VendingPreview = () => {
  const [selected, setSelected] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const items = ['☕','🍰','🥤','🍫','🧃','🍪'];
  useEffect(() => {
    const t = setInterval(() => {
      const idx = Math.floor(Math.random() * items?.length);
      setSelected(idx);
      setTimeout(() => { setDispensing(true); setTimeout(() => { setDispensing(false); setSelected(null); }, 500); }, 600);
    }, 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-12 h-14 mx-auto bg-gradient-to-b from-slate-200 to-slate-300 rounded-lg border-2 border-slate-400 shadow-md overflow-hidden relative">
      <div className="p-1 grid grid-cols-3 gap-0.5">
        {items?.map((item, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm flex items-center justify-center text-xs transition-all duration-200 ${selected === i ? 'bg-yellow-300 scale-110 ring-1 ring-yellow-500' : 'bg-white/70'}`}>
            {item}
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-slate-500 flex items-center justify-center">
        {dispensing && <span className="text-xs animate-bounce">{selected !== null ? items?.[selected] : '🎁'}</span>}
      </div>
    </div>
  );
};

const PREVIEW_COMPONENTS = {
  wheel: WheelPreview,
  scratch: ScratchPreview,
  chest: ChestPreview,
  envelope: EnvelopePreview,
  dice: DicePreview,
  balloon: BalloonPreview,
  loteria: LoteriaPreview,
  fishing: FishingPreview,
  gacha: GachaPreview,
  tree: TreePreview,
  vending: VendingPreview,
};

// ─── Config Panels ───────────────────────────────────────────────────────────

const DiceConfig = ({ config, onChange }) => {
  const c = config || {};
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Número de dados</label>
        <div className="flex gap-3">
          {['1 dado', '2 dados']?.map(opt => (
            <button
              key={opt}
              onClick={() => onChange({ ...c, diceCount: opt === '1 dado' ? 1 : 2 })}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                (c?.diceCount || 1) === (opt === '1 dado' ? 1 : 2)
                  ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      {(c?.diceCount || 1) === 2 && (
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Modo de resolución con 2 dados</label>
          <select
            value={c?.diceMode || 'sum'}
            onChange={e => onChange({ ...c, diceMode: e?.target?.value })}
            className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
          >
            <option value="sum">Por suma de valores (2-12)</option>
            <option value="exact">Por combinación exacta (dobles = gran premio)</option>
          </select>
        </div>
      )}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Estilo visual de los dados</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'classic', label: 'Clásico', desc: 'Blanco con puntos negros', emoji: '⚀' },
            { id: 'modern', label: 'Moderno', desc: 'Negro con puntos neon', emoji: '🎲' },
            { id: 'themed', label: 'Temático', desc: 'Imágenes del negocio', emoji: '🖼️' },
          ]?.map(style => (
            <button
              key={style?.id}
              onClick={() => onChange({ ...c, diceStyle: style?.id })}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                (c?.diceStyle || 'classic') === style?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="text-2xl mb-1">{style?.emoji}</div>
              <p className="text-xs font-medium text-foreground">{style?.label}</p>
              <p className="text-xs text-muted-foreground">{style?.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BalloonConfig = ({ config, onChange }) => {
  const c = config || {};
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Rango de explosión (toques)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Mínimo</label>
            <input
              type="number" min="1" max="20"
              value={c?.minTaps || 5}
              onChange={e => onChange({ ...c, minTaps: parseInt(e?.target?.value) })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Máximo</label>
            <input
              type="number" min="1" max="30"
              value={c?.maxTaps || 15}
              onChange={e => onChange({ ...c, maxTaps: parseInt(e?.target?.value) })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Un rango amplio (5-20) genera más tensión que uno estrecho (8-10).</p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Modo de interacción</label>
        <div className="flex gap-3">
          {[
            { id: 'tap', label: 'Tap repetido' },
            { id: 'hold', label: 'Tap sostenido' },
          ]?.map(opt => (
            <button
              key={opt?.id}
              onClick={() => onChange({ ...c, tapMode: opt?.id })}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                (c?.tapMode || 'tap') === opt?.id
                  ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
        <div>
          <p className="text-sm font-medium text-foreground">Premio por tamaño del globo</p>
          <p className="text-xs text-muted-foreground">Globo grande al explotar = premios mayores</p>
        </div>
        <button
          onClick={() => onChange({ ...c, sizeAffectsPrize: !c?.sizeAffectsPrize })}
          className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${c?.sizeAffectsPrize ? 'bg-primary' : 'bg-muted'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${c?.sizeAffectsPrize ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Color del globo</label>
        <div className="flex gap-2 flex-wrap">
          {['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4']?.map(color => (
            <button
              key={color}
              onClick={() => onChange({ ...c, balloonColor: color })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${(c?.balloonColor || '#EF4444') === color ? 'border-foreground scale-110' : 'border-transparent'}`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const LoteriaConfig = ({ config, onChange }) => {
  const c = config || {};
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Configuración de ganador</label>
        <select
          value={c?.winCondition || 'line_and_full'}
          onChange={e => onChange({ ...c, winCondition: e?.target?.value })}
          className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
        >
          <option value="one_line">1 línea = premio (más fácil)</option>
          <option value="two_lines">2 líneas = premio (moderado)</option>
          <option value="line_and_full">1 línea = premio menor · Cartón completo = gran premio (recomendado)</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Velocidad del cantor</label>
        <div className="flex gap-3">
          {['Lento', 'Moderado', 'Rápido']?.map(speed => (
            <button
              key={speed}
              onClick={() => onChange({ ...c, cantorSpeed: speed?.toLowerCase() })}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                (c?.cantorSpeed || 'moderado') === speed?.toLowerCase()
                  ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              {speed}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Moderado = 1.5 segundos entre cada carta</p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Voz del cantor</label>
        <div className="flex gap-3">
          {[
            { id: 'text', label: 'Solo texto animado' },
            { id: 'text_sound', label: 'Texto + sonido' },
          ]?.map(opt => (
            <button
              key={opt?.id}
              onClick={() => onChange({ ...c, cantorMode: opt?.id })}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                (c?.cantorMode || 'text') === opt?.id
                  ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-2">
          <span className="text-lg">🃏</span>
          <div>
            <p className="text-sm font-medium text-amber-800">Set de ilustraciones requerido</p>
            <p className="text-xs text-amber-700 mt-0.5">La Lotería requiere 54 ilustraciones configuradas antes de activarse. PromoClub incluye un set base con íconos universales de negocios locales.</p>
            <button className="mt-2 text-xs text-amber-700 underline font-medium">Configurar ilustraciones →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FishingConfig = ({ config, onChange }) => {
  const c = config || {};
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Cuerpo de agua</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'pond', label: 'Estanque', emoji: '🌿', desc: 'Verde, naturaleza' },
            { id: 'sea', label: 'Mar/Océano', emoji: '🌊', desc: 'Azul profundo, olas' },
            { id: 'river', label: 'Río', emoji: '🏞️', desc: 'Café claro, corriente' },
            { id: 'palapa', label: 'Palapa', emoji: '🏖️', desc: 'Tema playero — Mazatlán' },
          ]?.map(style => (
            <button
              key={style?.id}
              onClick={() => onChange({ ...c, waterStyle: style?.id })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                (c?.waterStyle || 'sea') === style?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
            >
              <span className="text-xl">{style?.emoji}</span>
              <p className="text-xs font-medium text-foreground mt-1">{style?.label}</p>
              <p className="text-xs text-muted-foreground">{style?.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Tiempo de espera (segundos)</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Mínimo</label>
            <input
              type="number" min="0.5" max="10" step="0.5"
              value={c?.minWait || 1.5}
              onChange={e => onChange({ ...c, minWait: parseFloat(e?.target?.value) })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Máximo</label>
            <input
              type="number" min="1" max="15" step="0.5"
              value={c?.maxWait || 3}
              onChange={e => onChange({ ...c, maxWait: parseFloat(e?.target?.value) })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">La variabilidad genera más tensión que un tiempo fijo.</p>
      </div>
    </div>
  );
};

const GachaConfig = ({ config, onChange }) => {
  const c = config || {};
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Estilo de máquina</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'classic', label: 'Clásico', desc: 'Metal cromado, años 80', emoji: '🔩' },
            { id: 'modern', label: 'Moderno', desc: 'Transparente con LEDs', emoji: '💡' },
            { id: 'kawaii', label: 'Kawaii', desc: 'Colores pastel, stickers', emoji: '🌸' },
          ]?.map(style => (
            <button
              key={style?.id}
              onClick={() => onChange({ ...c, machineStyle: style?.id })}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                (c?.machineStyle || 'modern') === style?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="text-2xl mb-1">{style?.emoji}</div>
              <p className="text-xs font-medium text-foreground">{style?.label}</p>
              <p className="text-xs text-muted-foreground">{style?.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Objeto dentro de la cápsula</label>
        <select
          value={c?.capsuleContent || 'mystery'}
          onChange={e => onChange({ ...c, capsuleContent: e?.target?.value })}
          className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
        >
          <option value="mystery">Sorpresa total — solo se ve "?"</option>
          <option value="business_icon">Ícono del negocio</option>
          <option value="prize_icon">Ícono del tipo de premio</option>
        </select>
      </div>
    </div>
  );
};

const TreeConfig = ({ config, onChange }) => {
  const c = config || {};
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Tipo de árbol</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'fruit', label: 'Frutal', emoji: '🍎' },
            { id: 'coffee', label: 'Café', emoji: '☕' },
            { id: 'money', label: 'Dinero', emoji: '💰' },
            { id: 'christmas', label: 'Navidad', emoji: '🎄' },
            { id: 'tropical', label: 'Tropical', emoji: '🌴' },
            { id: 'custom', label: 'Personalizado', emoji: '🖼️' },
          ]?.map(tree => (
            <button
              key={tree?.id}
              onClick={() => onChange({ ...c, treeType: tree?.id })}
              className={`p-2 rounded-xl border-2 text-center transition-all ${
                (c?.treeType || 'fruit') === tree?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="text-xl">{tree?.emoji}</div>
              <p className="text-xs font-medium text-foreground mt-0.5">{tree?.label}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Sensibilidad del acelerómetro</label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-12">Baja</span>
          <input
            type="range" min="1" max="10"
            value={c?.sensitivity || 5}
            onChange={e => onChange({ ...c, sensitivity: parseInt(e?.target?.value) })}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-12 text-right">Alta</span>
          <span className="text-xs font-medium text-foreground w-6 text-center">{c?.sensitivity || 5}</span>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Zona de captura</label>
        <div className="flex gap-3">
          {[
            { id: 'fixed', label: 'Fija' },
            { id: 'sliding', label: 'Deslizable' },
          ]?.map(opt => (
            <button
              key={opt?.id}
              onClick={() => onChange({ ...c, captureZone: opt?.id })}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                (c?.captureZone || 'fixed') === opt?.id
                  ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">La zona deslizable hace que el usuario sienta que tiene control.</p>
      </div>
    </div>
  );
};

const VendingConfig = ({ config, onChange }) => {
  const c = config || {};
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Estilo de máquina</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'modern', label: 'Moderna', desc: 'Blanca y azul, minimalista', emoji: '🏧' },
            { id: 'retro', label: 'Retro', desc: 'Metal gris, años 70-80', emoji: '🔧' },
            { id: 'colorful', label: 'Colorida', desc: 'Colores brillantes, candy', emoji: '🍬' },
            { id: 'branded', label: 'Branded', desc: 'Colores del negocio', emoji: '🏷️' },
          ]?.map(style => (
            <button
              key={style?.id}
              onClick={() => onChange({ ...c, machineStyle: style?.id })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                (c?.machineStyle || 'modern') === style?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
            >
              <span className="text-xl">{style?.emoji}</span>
              <p className="text-xs font-medium text-foreground mt-1">{style?.label}</p>
              <p className="text-xs text-muted-foreground">{style?.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Modo de selección</label>
        <div className="flex gap-3">
          {[
            { id: 'client_choice', label: 'Cliente elige' },
            { id: 'auto', label: 'Sistema elige' },
          ]?.map(opt => (
            <button
              key={opt?.id}
              onClick={() => onChange({ ...c, selectionMode: opt?.id })}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                (c?.selectionMode || 'client_choice') === opt?.id
                  ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">"Cliente elige" genera mayor sensación de agencia aunque el resultado es aleatorio.</p>
      </div>
      <div className="p-3 bg-muted/30 rounded-xl border border-border">
        <p className="text-sm font-medium text-foreground mb-1">Productos en la máquina</p>
        <p className="text-xs text-muted-foreground">Configura hasta 12 items visibles (3 filas × 4 columnas). Cada item tiene imagen, nombre y mapeo al pool de premios.</p>
        <button className="mt-2 text-xs text-primary underline font-medium">Configurar productos →</button>
      </div>
    </div>
  );
};

const MECHANIC_CONFIGS = {
  dice: DiceConfig,
  balloon: BalloonConfig,
  loteria: LoteriaConfig,
  fishing: FishingConfig,
  gacha: GachaConfig,
  tree: TreeConfig,
  vending: VendingConfig,
};

// ─── Main Component ──────────────────────────────────────────────────────────

const MechanicsSelector = ({ selectedMechanic, onSelect, mechanicConfig, onConfigChange, prizes }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [demoMechanic, setDemoMechanic] = useState(null);

  const filtered = activeFilter === 'all'
    ? ALL_MECHANICS
    : ALL_MECHANICS?.filter(m => m?.tags?.includes(activeFilter));

  const selected = ALL_MECHANICS?.find(m => m?.id === selectedMechanic);
  const ConfigComponent = MECHANIC_CONFIGS?.[selectedMechanic];

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(40px) rotate(180deg); opacity: 0; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.8); opacity: 0; } }
      `}</style>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Mecánica de juego</h3>
        <span className="text-xs text-muted-foreground">{ALL_MECHANICS?.length} mecánicas disponibles</span>
      </div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS?.map(f => (
          <button
            key={f?.id}
            onClick={() => setActiveFilter(f?.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeFilter === f?.id
                ? 'bg-primary text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f?.label}
          </button>
        ))}
      </div>
      {/* Mechanics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered?.map(m => {
          const PreviewComponent = PREVIEW_COMPONENTS?.[m?.id];
          return (
            <div
              key={m?.id}
              className={`p-3 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                selectedMechanic === m?.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-muted-foreground hover:shadow-sm'
              }`}
            >
              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                {m?.isNew && (
                  <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full font-medium">Nuevo</span>
                )}
                {m?.isCultural && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">Cultural MX</span>
                )}
                {m?.popular && !m?.isNew && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full font-medium">Popular</span>
                )}
              </div>
              {/* Animated preview area — clickable to select */}
              <button
                onClick={() => onSelect(m?.id)}
                className="w-full text-left"
              >
                <div className="h-14 flex items-center justify-center mb-2 relative">
                  {PreviewComponent ? (
                    <PreviewComponent />
                  ) : (
                    <span className="text-3xl">{m?.emoji}</span>
                  )}
                </div>
                <p className="font-semibold text-foreground text-xs text-center">{m?.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 text-center leading-tight line-clamp-2">{m?.desc}</p>
                <div className="mt-2 flex justify-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m?.badgeColor}`}>
                    {m?.badge}
                  </span>
                </div>
              </button>
              {/* Demo button */}
              <button
                onClick={(e) => { e?.stopPropagation(); setDemoMechanic(m); }}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-all border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60"
              >
                <Play size={11} />
                Demo
              </button>
            </div>
          );
        })}
      </div>
      {/* Config panel for new mechanics */}
      {ConfigComponent && selected && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selected?.emoji}</span>
              <div>
                <h4 className="font-semibold text-foreground">Configuración: {selected?.label}</h4>
                <p className="text-xs text-muted-foreground">{selected?.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setDemoMechanic(selected)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
            >
              <Play size={12} />
              Vista previa
            </button>
          </div>
          <ConfigComponent
            config={mechanicConfig?.[selectedMechanic] || {}}
            onChange={cfg => onConfigChange({ ...mechanicConfig, [selectedMechanic]: cfg })}
          />
        </div>
      )}
      {/* Demo Modal */}
      {demoMechanic && (
        <MechanicDemoModal
          mechanic={demoMechanic}
          mechanicConfig={mechanicConfig}
          prizes={prizes}
          onClose={() => setDemoMechanic(null)}
        />
      )}
    </div>
  );
};

export default MechanicsSelector;
export { ALL_MECHANICS };
