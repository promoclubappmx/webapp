import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';

// ─── Sample prize pool ───────────────────────────────────────────────────────
const DEFAULT_PRIZES = [
  { id: 1, label: 'Café gratis', emoji: '☕', color: '#22C55E', probability: 15 },
  { id: 2, label: '10% descuento', emoji: '🏷️', color: '#3B82F6', probability: 25 },
  { id: 3, label: '5 puntos bonus', emoji: '⭐', color: '#F97316', probability: 35 },
  { id: 4, label: 'Postre gratis', emoji: '🍰', color: '#8B5CF6', probability: 15 },
  { id: 5, label: '20% descuento', emoji: '🎁', color: '#EF4444', probability: 7 },
  { id: 6, label: 'Gran premio', emoji: '🏆', color: '#EAB308', probability: 3 },
];

function pickPrize(prizes) {
  const total = prizes?.reduce((s, p) => s + p?.probability, 0);
  let r = Math.random() * total;
  for (const p of prizes) { r -= p?.probability; if (r <= 0) return p; }
  return prizes?.[prizes?.length - 1];
}

// ─── Prize Reveal Overlay ────────────────────────────────────────────────────
const PrizeReveal = ({ prize, onReset, mechLabel }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center z-50 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0 scale-90'}`}
      style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="text-center px-6">
        <div className="text-7xl mb-4 animate-bounce">{prize?.emoji}</div>
        <div className="text-white text-2xl font-bold mb-2">¡Ganaste!</div>
        <div className="text-4xl font-extrabold mb-1" style={{ color: prize?.color }}>{prize?.label}</div>
        <div className="text-white/60 text-sm mb-8">Demo de {mechLabel}</div>
        <div className="flex gap-3 justify-center">
          <button onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-semibold transition-all">
            <RotateCcw size={16} /> Jugar de nuevo
          </button>
        </div>
      </div>
      {/* Confetti particles */}
      {[...Array(20)]?.map((_, i) => (
        <div key={i} className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            background: ['#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899']?.[i % 7],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `confettiFall ${1 + Math.random() * 2}s ease-in forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }} />
      ))}
    </div>
  );
};

// ─── WHEEL DEMO ──────────────────────────────────────────────────────────────
const WheelDemo = ({ prizes, mechLabel }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);
  const [started, setStarted] = useState(false);

  const spin = () => {
    if (spinning) return;
    setStarted(true);
    setPrize(null);
    setSpinning(true);
    const won = pickPrize(prizes);
    const prizeIndex = prizes?.findIndex(p => p?.id === won?.id);
    const segAngle = 360 / prizes?.length;
    const targetAngle = 360 * 5 + (360 - prizeIndex * segAngle - segAngle / 2);
    const newRot = rotation + targetAngle;
    setRotation(newRot);
    setTimeout(() => { setSpinning(false); setPrize(won); }, 3500);
  };

  const reset = () => { setPrize(null); setStarted(false); setRotation(0); };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 relative">
      {prize && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl"
          style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}>
          {prizes?.map((p, i) => {
            const angle = (360 / prizes?.length) * i;
            const rad = (angle * Math.PI) / 180;
            const rad2 = ((angle + 360 / prizes?.length) * Math.PI) / 180;
            const x1 = 100 + 95 * Math.cos(rad); const y1 = 100 + 95 * Math.sin(rad);
            const x2 = 100 + 95 * Math.cos(rad2); const y2 = 100 + 95 * Math.sin(rad2);
            const mx = 100 + 65 * Math.cos((rad + rad2) / 2); const my = 100 + 65 * Math.sin((rad + rad2) / 2);
            return (
              <g key={p?.id}>
                <path d={`M100,100 L${x1},${y1} A95,95 0 0,1 ${x2},${y2} Z`} fill={p?.color} stroke="white" strokeWidth="2" />
                <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="white">{p?.emoji}</text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="12" fill="white" stroke="#e2e8f0" strokeWidth="2" />
        </svg>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 z-10"
          style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '20px solid #1e293b', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
      </div>
      <button onClick={spin} disabled={spinning}
        className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all active:scale-95 disabled:opacity-60"
        style={{ background: spinning ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        {spinning ? '¡Girando...!' : started ? '¡Girar de nuevo!' : '¡Girar la ruleta!'}
      </button>
    </div>
  );
};

// ─── SCRATCH DEMO ────────────────────────────────────────────────────────────
const ScratchDemo = ({ prizes, mechLabel }) => {
  const canvasRef = useRef(null);
  const [prize] = useState(() => pickPrize(prizes));
  const [revealed, setRevealed] = useState(false);
  const [scratching, setScratching] = useState(false);
  const [scratchPct, setScratchPct] = useState(0);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas?.getContext('2d');
    ctx.fillStyle = '#94a3b8';
    ctx?.fillRect(0, 0, canvas?.width, canvas?.height);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx?.fillText('RASPA AQUÍ', canvas?.width / 2, canvas?.height / 2 - 8);
    ctx.font = '14px sans-serif';
    ctx?.fillText('✦ ✦ ✦', canvas?.width / 2, canvas?.height / 2 + 14);
  }, []);

  const scratch = useCallback((e) => {
    if (!isDrawing?.current) return;
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');
    const rect = canvas?.getBoundingClientRect();
    const scaleX = canvas?.width / rect?.width;
    const scaleY = canvas?.height / rect?.height;
    const clientX = e?.touches ? e?.touches?.[0]?.clientX : e?.clientX;
    const clientY = e?.touches ? e?.touches?.[0]?.clientY : e?.clientY;
    const x = (clientX - rect?.left) * scaleX;
    const y = (clientY - rect?.top) * scaleY;
    ctx.globalCompositeOperation = 'destination-out';
    ctx?.beginPath();
    ctx?.arc(x, y, 28, 0, Math.PI * 2);
    ctx?.fill();
    // Check revealed %
    const data = ctx?.getImageData(0, 0, canvas?.width, canvas?.height)?.data;
    let transparent = 0;
    for (let i = 3; i < data?.length; i += 4) { if (data?.[i] < 128) transparent++; }
    const pct = Math.round((transparent / (canvas?.width * canvas?.height)) * 100);
    setScratchPct(pct);
    if (pct > 60 && !revealed) setRevealed(true);
  }, [revealed]);

  const reset = () => {
    setRevealed(false);
    setScratchPct(0);
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#94a3b8';
    ctx?.fillRect(0, 0, canvas?.width, canvas?.height);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx?.fillText('RASPA AQUÍ', canvas?.width / 2, canvas?.height / 2 - 8);
    ctx.font = '14px sans-serif';
    ctx?.fillText('✦ ✦ ✦', canvas?.width / 2, canvas?.height / 2 + 14);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 relative">
      {revealed && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="text-white/80 text-sm font-medium">Raspa la tarjeta para revelar tu premio</div>
      <div className="relative w-72 h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400"
        style={{ background: `linear-gradient(135deg, ${prize?.color}33, ${prize?.color}66)` }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="text-6xl">{prize?.emoji}</div>
          <div className="text-white font-bold text-lg">{prize?.label}</div>
        </div>
        <canvas ref={canvasRef} width={288} height={176} className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={() => { isDrawing.current = true; setScratching(true); }}
          onMouseUp={() => { isDrawing.current = false; setScratching(false); }}
          onMouseLeave={() => { isDrawing.current = false; setScratching(false); }}
          onMouseMove={scratch}
          onTouchStart={() => { isDrawing.current = true; }}
          onTouchEnd={() => { isDrawing.current = false; }}
          onTouchMove={scratch}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-40 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${scratchPct}%` }} />
        </div>
        <span className="text-white/60 text-xs">{scratchPct}% raspado</span>
      </div>
    </div>
  );
};

// ─── CHEST DEMO ──────────────────────────────────────────────────────────────
const ChestDemo = ({ prizes, mechLabel }) => {
  const [chosen, setChosen] = useState(null);
  const [prize, setPrize] = useState(null);
  const [opening, setOpening] = useState(false);

  const choose = (i) => {
    if (chosen !== null || opening) return;
    setChosen(i);
    setOpening(true);
    setTimeout(() => { setPrize(pickPrize(prizes)); }, 800);
  };
  const reset = () => { setChosen(null); setPrize(null); setOpening(false); };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 relative">
      {prize && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="text-white/80 text-lg font-semibold">Elige un cofre</div>
      <div className="flex gap-6">
        {[0, 1, 2]?.map(i => (
          <button key={i} onClick={() => choose(i)}
            className={`flex flex-col items-center gap-2 transition-all duration-300 ${chosen !== null && chosen !== i ? 'opacity-40 scale-90' : ''} ${chosen === i ? 'scale-110' : 'hover:scale-105'}`}>
            <div className="relative w-24 h-20">
              <div className={`absolute top-0 left-0 right-0 h-8 rounded-t-xl border-2 border-amber-800 transition-all duration-500 ${chosen === i ? '-rotate-45 -translate-y-4 origin-left' : ''}`}
                style={{ background: 'linear-gradient(135deg, #b45309, #92400e)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-2 bg-amber-400 rounded-full" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-xl border-2 border-amber-800 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
                {chosen === i && opening && <span className="text-2xl animate-bounce">✨</span>}
                {chosen !== i && <span className="text-amber-200 text-xs font-bold">?</span>}
              </div>
            </div>
            <span className="text-white/60 text-xs">Cofre {i + 1}</span>
          </button>
        ))}
      </div>
      {chosen === null && <p className="text-white/50 text-sm">Toca un cofre para abrirlo</p>}
    </div>
  );
};

// ─── ENVELOPE DEMO ───────────────────────────────────────────────────────────
const EnvelopeDemo = ({ prizes, mechLabel }) => {
  const [phase, setPhase] = useState(0); // 0=closed, 1=opening, 2=open, 3=prize
  const [prize, setPrize] = useState(null);

  const open = () => {
    if (phase > 0) return;
    setPhase(1);
    setTimeout(() => setPhase(2), 600);
    setTimeout(() => { setPrize(pickPrize(prizes)); setPhase(3); }, 1200);
  };
  const reset = () => { setPhase(0); setPrize(null); };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 relative">
      {prize && phase === 3 && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="text-white/80 text-lg font-semibold">
        {phase === 0 ? 'Toca el sobre para abrirlo' : phase < 3 ? 'Abriendo...' : ''}
      </div>
      <button onClick={open} disabled={phase > 0}
        className="relative w-56 h-40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-default">
        <div className={`w-full h-full rounded-2xl border-4 border-blue-300 flex items-center justify-center shadow-2xl transition-all duration-500 ${phase >= 2 ? 'scale-110' : ''}`}
          style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
          {phase === 0 && (
            <svg viewBox="0 0 200 140" className="w-full h-full p-4">
              <rect x="5" y="5" width="190" height="130" rx="10" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="3" />
              <path d="M5,5 L100,75 L195,5" fill="none" stroke="#3B82F6" strokeWidth="3" />
              <path d="M5,135 L70,75 M195,135 L130,75" fill="none" stroke="#93C5FD" strokeWidth="2" />
            </svg>
          )}
          {phase === 1 && (
            <svg viewBox="0 0 200 140" className="w-full h-full p-4">
              <rect x="5" y="5" width="190" height="130" rx="10" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="3" />
              <path d="M5,5 L100,40 L195,5" fill="none" stroke="#3B82F6" strokeWidth="3" />
            </svg>
          )}
          {phase >= 2 && <span className="text-6xl animate-bounce">💌</span>}
        </div>
      </button>
      {phase === 0 && <p className="text-white/50 text-sm">Toca el sobre</p>}
    </div>
  );
};

// ─── DICE DEMO ───────────────────────────────────────────────────────────────
const DiceDemo = ({ prizes, mechLabel, config }) => {
  const diceCount = config?.diceCount || 1;
  const [rolling, setRolling] = useState(false);
  const [faces, setFaces] = useState([1, 1]);
  const [prize, setPrize] = useState(null);
  const [shakeClass, setShakeClass] = useState('');

  const roll = () => {
    if (rolling) return;
    setPrize(null);
    setRolling(true);
    setShakeClass('animate-bounce');
    let count = 0;
    const interval = setInterval(() => {
      setFaces([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setShakeClass('');
        setRolling(false);
        setPrize(pickPrize(prizes));
      }
    }, 120);
  };
  const reset = () => { setPrize(null); setFaces([1, 1]); };

  const DiceFace = ({ value }) => {
    const dots = {
      1: [[50, 50]], 2: [[25, 25], [75, 75]], 3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [75, 25], [25, 75], [75, 75]], 5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
      6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
    };
    return (
      <div className={`w-24 h-24 bg-white rounded-2xl shadow-2xl border-4 border-gray-200 flex items-center justify-center ${shakeClass}`}>
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          {(dots?.[value] || [])?.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="9" fill="#1e293b" />)}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 relative">
      {prize && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="flex gap-6">
        {Array.from({ length: diceCount })?.map((_, i) => <DiceFace key={i} value={faces?.[i]} />)}
      </div>
      {diceCount === 2 && (
        <div className="text-white/70 text-lg font-bold">Suma: {faces?.[0] + faces?.[1]}</div>
      )}
      <button onClick={roll} disabled={rolling}
        className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all active:scale-95 disabled:opacity-60"
        style={{ background: rolling ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
        {rolling ? '¡Lanzando...!' : '¡Lanza los dados!'}
      </button>
    </div>
  );
};

// ─── BALLOON DEMO ────────────────────────────────────────────────────────────
const BalloonDemo = ({ prizes, mechLabel, config }) => {
  const minTaps = config?.minTaps || 5;
  const maxTaps = config?.maxTaps || 15;
  const balloonColor = config?.balloonColor || '#EF4444';
  const [taps, setTaps] = useState(0);
  const [exploded, setExploded] = useState(false);
  const [prize, setPrize] = useState(null);
  const [explodeAt] = useState(() => minTaps + Math.floor(Math.random() * (maxTaps - minTaps + 1)));
  const [particles, setParticles] = useState([]);

  const tap = () => {
    if (exploded) return;
    const newTaps = taps + 1;
    setTaps(newTaps);
    if (newTaps >= explodeAt) {
      setExploded(true);
      setParticles(Array.from({ length: 16 }, (_, i) => ({ id: i, x: 40 + Math.random() * 20, color: ['#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6']?.[i % 6] })));
      setTimeout(() => setPrize(pickPrize(prizes)), 600);
    }
  };
  const reset = () => { setTaps(0); setExploded(false); setPrize(null); setParticles([]); };

  const size = Math.min(1, 0.4 + (taps / explodeAt) * 0.6);
  const hue = Math.min(1, taps / explodeAt);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 relative">
      {prize && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="text-white/80 text-sm font-medium">
        {exploded ? '¡BOOM! 🎉' : `Toca para inflar (${taps}/${explodeAt})`}
      </div>
      <div className="relative h-52 w-52 flex items-end justify-center">
        {!exploded ? (
          <>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gray-400" />
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 transition-all duration-150 cursor-pointer"
              style={{
                width: `${size * 120}px`, height: `${size * 140}px`,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                background: `radial-gradient(circle at 35% 35%, ${balloonColor}aa, ${balloonColor})`,
                transform: `translateX(-50%) scale(${size})`,
                boxShadow: `0 8px 32px ${balloonColor}66`,
              }}
              onClick={tap} />
          </>
        ) : (
          <div className="relative w-full h-full">
            {particles?.map(p => (
              <div key={p?.id} className="absolute w-3 h-3 rounded-full"
                style={{ left: `${p?.x}%`, top: '40%', background: p?.color, animation: 'confettiFall 1s ease-out forwards', animationDelay: `${Math.random() * 0.3}s` }} />
            ))}
            <div className="absolute inset-0 flex items-center justify-center text-6xl">💥</div>
          </div>
        )}
      </div>
      <div className="w-48 h-3 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-150" style={{ width: `${(taps / explodeAt) * 100}%`, background: balloonColor }} />
      </div>
      {!exploded && (
        <button onClick={tap}
          className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all active:scale-95"
          style={{ background: `linear-gradient(135deg, ${balloonColor}, ${balloonColor}cc)` }}>
          🎈 ¡Inflar!
        </button>
      )}
    </div>
  );
};

// ─── LOTERIA DEMO ────────────────────────────────────────────────────────────
const LoteriaDemo = ({ prizes, mechLabel }) => {
  const cards = ['☕','⭐','🗺️','💰','🏆','🎵','🌮','🔑','❤️','🌟','🎭','🍀','🎪','🎯','🎨','🏅'];
  const phrases = ['¡El cafecito!','¡La estrella!','¡El mapa!','¡La moneda!','¡El trofeo!','¡La música!','¡La taquiza!','¡La llave!','¡El corazón!','¡La estrellita!','¡El teatro!','¡El trébol!','¡La feria!','¡El blanco!','¡El arte!','¡La medalla!'];
  const [revealed, setRevealed] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [prize, setPrize] = useState(null);
  const intervalRef = useRef(null);

  const [board] = useState(() => {
    const shuffled = [...Array(16)?.keys()]?.sort(() => Math.random() - 0.5);
    return shuffled;
  });
  const [marked, setMarked] = useState(new Set());

  const checkWin = (markedSet) => {
    const lines = [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],[0,5,10,15],[3,6,9,12]];
    return lines?.some(line => line?.every(i => markedSet?.has(i)));
  };

  const start = () => {
    if (running) return;
    setRunning(true);
    setRevealed([]); setMarked(new Set()); setWon(false); setPrize(null);
    const deck = [...Array(16)?.keys()]?.sort(() => Math.random() - 0.5);
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= deck?.length) { clearInterval(intervalRef?.current); setRunning(false); return; }
      const cardIdx = deck?.[i];
      setCurrentCard(cardIdx);
      setCurrentPhrase(phrases?.[cardIdx]);
      setRevealed(r => [...r, cardIdx]);
      setMarked(m => {
        const nm = new Set(m);
        if (board?.includes(cardIdx)) nm?.add(board?.indexOf(cardIdx));
        if (checkWin(nm) && !won) {
          clearInterval(intervalRef?.current);
          setRunning(false);
          setWon(true);
          setTimeout(() => setPrize(pickPrize(prizes)), 500);
        }
        return nm;
      });
      i++;
    }, 1200);
  };

  const reset = () => {
    clearInterval(intervalRef?.current);
    setRunning(false); setRevealed([]); setMarked(new Set()); setCurrentCard(null); setCurrentPhrase(''); setWon(false); setPrize(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 relative">
      {prize && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      {currentPhrase && (
        <div className="text-white font-bold text-xl animate-pulse text-center px-4">{currentPhrase}</div>
      )}
      <div className="grid grid-cols-4 gap-1.5 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
        {board?.map((cardIdx, i) => (
          <div key={i} className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-300 border-2 ${marked?.has(i) ? 'border-red-400 scale-105' : 'border-white/20'}`}
            style={{ background: marked?.has(i) ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)' }}>
            <span className="text-xl">{cards?.[cardIdx]}</span>
            {marked?.has(i) && <span className="text-red-300 text-xs font-bold">✓</span>}
          </div>
        ))}
      </div>
      <div className="text-white/60 text-xs">{marked?.size} casillas marcadas</div>
      {!running && !won && (
        <button onClick={start}
          className="px-8 py-3 rounded-2xl text-white font-bold shadow-lg transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
          🃏 ¡Buenas! Iniciar Lotería
        </button>
      )}
      {running && <div className="text-white/60 text-sm">Revelando cartas...</div>}
    </div>
  );
};

// ─── FISHING DEMO ────────────────────────────────────────────────────────────
const FishingDemo = ({ prizes, mechLabel, config }) => {
  const [phase, setPhase] = useState(0); // 0=idle, 1=casting, 2=waiting, 3=bite, 4=reeling
  const [prize, setPrize] = useState(null);
  const [lineLength, setLineLength] = useState(20);

  const cast = () => {
    if (phase > 0) return;
    setPhase(1);
    setTimeout(() => setPhase(2), 800);
    const waitTime = ((config?.minWait || 1.5) + Math.random() * ((config?.maxWait || 3) - (config?.minWait || 1.5))) * 1000;
    setTimeout(() => setPhase(3), 800 + waitTime);
    setTimeout(() => { setPhase(4); setPrize(pickPrize(prizes)); }, 800 + waitTime + 600);
  };
  const reset = () => { setPhase(0); setPrize(null); setLineLength(20); };

  const waterColors = { pond: ['#86efac','#4ade80'], sea: ['#67e8f9','#0891b2'], river: ['#a3a3a3','#78716c'], palapa: ['#fde68a','#f59e0b'] };
  const [c1, c2] = waterColors?.[config?.waterStyle || 'sea'];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 relative">
      {prize && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
        {/* Sky */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #1e3a5f 40%, transparent 40%)' }} />
        {/* Water */}
        <div className="absolute bottom-0 left-0 right-0 h-40 rounded-b-2xl" style={{ background: `linear-gradient(180deg, ${c1}, ${c2})` }}>
          {[0,1,2]?.map(i => (
            <div key={i} className="absolute text-lg opacity-40" style={{ left: `${15 + i * 28}%`, bottom: `${10 + i * 12}px`, animation: `bounce ${1.2 + i * 0.4}s ease-in-out infinite` }}>🐟</div>
          ))}
        </div>
        {/* Rod & line */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className={`text-4xl transition-all duration-500 ${phase === 3 ? 'rotate-12' : phase >= 1 ? '-rotate-6' : ''}`}>🎣</div>
          {phase >= 1 && (
            <div className="w-0.5 bg-gray-300 transition-all duration-500" style={{ height: phase >= 3 ? '60px' : '80px' }} />
          )}
          {phase >= 2 && phase < 4 && <div className="text-sm">🪝</div>}
          {phase === 3 && <div className="text-2xl animate-bounce">🐠</div>}
        </div>
        {/* Status */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-white font-bold text-sm drop-shadow">
            {phase === 0 ? '' : phase === 1 ? '¡Lanzando!' : phase === 2 ? '⏳ Esperando...' : phase === 3 ? '¡Jalón! 🎣' : '¡Pescado!'}
          </span>
        </div>
      </div>
      {phase === 0 && (
        <button onClick={cast}
          className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}>
          🎣 ¡Lanzar anzuelo!
        </button>
      )}
    </div>
  );
};

// ─── GACHA DEMO ──────────────────────────────────────────────────────────────
const GachaDemo = ({ prizes, mechLabel, config }) => {
  const [phase, setPhase] = useState(0); // 0=idle, 1=coin, 2=turning, 3=dispensing, 4=capsule
  const [prize, setPrize] = useState(null);
  const [capsuleColor, setCapsuleColor] = useState('#EF4444');

  const insert = () => {
    if (phase > 0) return;
    setPhase(1);
    setTimeout(() => setPhase(2), 500);
    setTimeout(() => setPhase(3), 1200);
    setTimeout(() => {
      const won = pickPrize(prizes);
      setCapsuleColor(won?.color);
      setPrize(won);
      setPhase(4);
    }, 2000);
  };
  const reset = () => { setPhase(0); setPrize(null); };

  const machineColors = { classic: ['#9ca3af','#6b7280'], modern: ['#1e293b','#334155'], kawaii: ['#fbcfe8','#f9a8d4'] };
  const [mc1, mc2] = machineColors?.[config?.machineStyle || 'modern'];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 relative">
      {prize && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="relative w-48 h-64 rounded-2xl shadow-2xl border-4 border-white/20 overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${mc1}, ${mc2})` }}>
        {/* Capsule display */}
        <div className="absolute top-4 left-4 right-4 h-24 rounded-xl border-2 border-white/30 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="flex flex-wrap gap-1 p-2">
            {prizes?.slice(0, 8)?.map((p, i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-white/30 transition-all duration-300"
                style={{ background: p?.color, opacity: phase === 2 ? 0.5 : 1, animation: phase === 2 ? `spin ${0.3 + i * 0.05}s linear infinite` : 'none' }} />
            ))}
          </div>
        </div>
        {/* Coin slot */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/40 rounded-full border border-white/20" />
        {phase >= 1 && <div className="absolute top-28 left-1/2 -translate-x-1/2 text-lg" style={{ animation: 'fall 0.5s ease-in forwards' }}>🪙</div>}
        {/* Handle */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className={`w-4 h-12 rounded-full border-2 border-white/30 transition-all duration-300 ${phase === 2 ? 'rotate-45' : ''}`}
            style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>
        {/* Dispenser */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-8 rounded-xl border-2 border-white/20 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          {phase >= 4 && (
            <div className="w-6 h-6 rounded-full border-2 border-white/50 animate-bounce"
              style={{ background: capsuleColor }} />
          )}
        </div>
      </div>
      {phase === 0 && (
        <button onClick={insert}
          className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
          🪙 Insertar moneda
        </button>
      )}
      {phase > 0 && phase < 4 && (
        <div className="text-white/70 text-sm">
          {phase === 1 ? 'Insertando moneda...' : phase === 2 ? '¡Girando la manivela!' : 'Dispensando cápsula...'}
        </div>
      )}
    </div>
  );
};

// ─── TREE DEMO ───────────────────────────────────────────────────────────────
const TreeDemo = ({ prizes, mechLabel, config }) => {
  const [shakes, setShakes] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [falling, setFalling] = useState([]);
  const [caught, setCaught] = useState([]);
  const [prize, setPrize] = useState(null);
  const treeEmojis = { fruit: '🌳', coffee: '🌿', money: '🌲', christmas: '🎄', tropical: '🌴', custom: '🌳' };
  const treeEmoji = treeEmojis?.[config?.treeType || 'fruit'];
  const itemEmojis = { fruit: ['🍎','🍊','🍋'], coffee: ['☕','🫘','🍵'], money: ['💰','💵','⭐'], christmas: ['🎁','⭐','🔔'], tropical: ['🥥','🌺','🍍'], custom: ['🎁','⭐','💰'] };
  const items = itemEmojis?.[config?.treeType || 'fruit'];

  const shake = () => {
    if (shaking) return;
    setShaking(true);
    const newItems = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i, x: 25 + Math.random() * 50, emoji: items?.[Math.floor(Math.random() * items?.length)],
    }));
    setFalling(newItems);
    setTimeout(() => {
      setShaking(false);
      setFalling([]);
      setCaught(c => [...c, ...newItems?.slice(0, 1)]);
      const newShakes = shakes + 1;
      setShakes(newShakes);
      if (newShakes >= 3) setTimeout(() => setPrize(pickPrize(prizes)), 300);
    }, 800);
  };
  const reset = () => { setShakes(0); setFalling([]); setCaught([]); setPrize(null); };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 relative">
      {prize && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="relative w-56 h-56 flex flex-col items-center justify-end">
        <div className={`text-8xl transition-transform duration-200 ${shaking ? 'rotate-6 scale-105' : ''}`} style={{ lineHeight: '1' }}>{treeEmoji}</div>
        {falling?.map(f => (
          <div key={f?.id} className="absolute text-2xl" style={{ left: `${f?.x}%`, top: '20%', animation: 'fall 0.8s ease-in forwards' }}>{f?.emoji}</div>
        ))}
        {/* Basket */}
        <div className="w-24 h-10 rounded-b-2xl border-2 border-amber-600 flex items-center justify-center gap-1 mt-2"
          style={{ background: 'rgba(180,83,9,0.3)' }}>
          {caught?.slice(-3)?.map((c, i) => <span key={i} className="text-sm">{c?.emoji}</span>)}
        </div>
      </div>
      <div className="text-white/70 text-sm">{shakes < 3 ? `Sacude ${3 - shakes} veces más` : '¡Listo!'}</div>
      <div className="w-40 h-2 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(shakes / 3) * 100}%` }} />
      </div>
      {!prize && (
        <button onClick={shake} disabled={shaking}
          className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all active:scale-95 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
          {shaking ? '¡Sacudiendo!' : '🌳 ¡Sacudir árbol!'}
        </button>
      )}
    </div>
  );
};

// ─── VENDING DEMO ────────────────────────────────────────────────────────────
const VendingDemo = ({ prizes, mechLabel, config }) => {
  const [selected, setSelected] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [prize, setPrize] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const items = ['☕','🍰','🥤','🍫','🧃','🍪','🍩','🥐','🍵','🫖','🍦','🎂'];
  const autoMode = config?.selectionMode === 'auto';

  useEffect(() => {
    if (autoMode && !prize) {
      const t = setInterval(() => setHighlight(Math.floor(Math.random() * 12)), 600);
      return () => clearInterval(t);
    }
  }, [autoMode, prize]);

  const press = (i) => {
    if (dispensing || prize) return;
    if (autoMode && i !== highlight) return;
    setSelected(i);
    setDispensing(true);
    setTimeout(() => { setDispensing(false); setPrize(pickPrize(prizes)); }, 1500);
  };
  const reset = () => { setSelected(null); setDispensing(false); setPrize(null); setHighlight(null); };

  const machineGrad = { modern: 'linear-gradient(180deg,#dbeafe,#bfdbfe)', retro: 'linear-gradient(180deg,#d1d5db,#9ca3af)', colorful: 'linear-gradient(180deg,#fce7f3,#fbcfe8)', branded: 'linear-gradient(180deg,#ede9fe,#ddd6fe)' };
  const grad = machineGrad?.[config?.machineStyle || 'modern'];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 relative">
      {prize && <PrizeReveal prize={prize} onReset={reset} mechLabel={mechLabel} />}
      <div className="relative w-56 rounded-2xl shadow-2xl border-4 border-white/20 overflow-hidden" style={{ background: grad }}>
        <div className="p-3 grid grid-cols-4 gap-1.5">
          {items?.map((item, i) => (
            <button key={i} onClick={() => press(i)} disabled={dispensing || !!prize}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-200 border-2 ${selected === i ? 'scale-90 border-blue-500 bg-blue-100' : highlight === i && autoMode ? 'border-yellow-400 bg-yellow-100 animate-pulse scale-105' : 'border-white/50 bg-white/60 hover:bg-white/80 hover:scale-105'}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="mx-3 mb-3 h-10 rounded-xl border-2 border-white/40 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.15)' }}>
          {dispensing && <span className="text-2xl animate-bounce">{selected !== null ? items?.[selected] : '🎁'}</span>}
          {!dispensing && !prize && <span className="text-xs text-gray-500 font-medium">{autoMode ? 'Espera el botón iluminado' : 'Elige un producto'}</span>}
        </div>
      </div>
    </div>
  );
};

// ─── Demo map ────────────────────────────────────────────────────────────────
const DEMO_COMPONENTS = {
  wheel: WheelDemo,
  scratch: ScratchDemo,
  chest: ChestDemo,
  envelope: EnvelopeDemo,
  dice: DiceDemo,
  balloon: BalloonDemo,
  loteria: LoteriaDemo,
  fishing: FishingDemo,
  gacha: GachaDemo,
  tree: TreeDemo,
  vending: VendingDemo,
};

// ─── Main Modal ──────────────────────────────────────────────────────────────
const MechanicDemoModal = ({ mechanic, mechanicConfig, prizes, onClose }) => {
  const DemoComponent = DEMO_COMPONENTS?.[mechanic?.id];
  const config = mechanicConfig?.[mechanic?.id] || {};
  const activePrizes = (prizes?.length > 0 ? prizes : DEFAULT_PRIZES)?.map(p => ({
    ...p,
    label: p?.label || p?.name || 'Premio',
    emoji: p?.emoji || (p?.type === 'points' ? '⭐' : p?.type === 'coupon' ? '🏷️' : '🎁'),
  }));

  if (!mechanic || !DemoComponent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <style>{`
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(200px) rotate(720deg); opacity: 0; } }
        @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(60px) rotate(180deg); opacity: 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(255,255,255,0.1)', minHeight: '560px' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mechanic?.emoji}</span>
            <div>
              <h3 className="text-white font-bold text-lg">{mechanic?.label}</h3>
              <p className="text-white/50 text-xs">Vista previa interactiva</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${mechanic?.badgeColor}`}>{mechanic?.badge}</span>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Prize pool strip */}
        <div className="px-5 py-2 border-b border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-white/40 text-xs flex-shrink-0">Premios:</span>
            {activePrizes?.map(p => (
              <div key={p?.id} className="flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium"
                style={{ background: `${p?.color}22`, border: `1px solid ${p?.color}44`, color: p?.color }}>
                <span>{p?.emoji}</span><span>{p?.label}</span><span className="opacity-60">{p?.probability}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo area */}
        <div className="relative" style={{ height: '380px' }}>
          <DemoComponent prizes={activePrizes} mechLabel={mechanic?.label} config={config} />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-white/40 text-xs">Esta es una demo con premios de ejemplo</p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-white/70 hover:text-white text-sm font-medium hover:bg-white/10 transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MechanicDemoModal;
