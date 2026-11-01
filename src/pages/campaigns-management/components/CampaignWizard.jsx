import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

// ─── Datos mock ───────────────────────────────────────────────────────────────
const OBJETIVOS = [
  {
    id: 'adquisicion',
    nombre: 'Adquisición',
    descripcion: 'Atraer nuevos clientes a tu negocio',
    icono: 'UserPlus',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-500',
  },
  {
    id: 'reactivacion',
    nombre: 'Reactivación',
    descripcion: 'Recuperar clientes inactivos que no han visitado',
    icono: 'RefreshCw',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-500',
  },
  {
    id: 'upsell',
    nombre: 'Upsell',
    descripcion: 'Aumentar el ticket promedio de clientes existentes',
    icono: 'TrendingUp',
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-500',
  },
];

const SEGMENTOS = [
  { id: 'todos', nombre: 'Todos mis clientes', alcance: '~1,240 clientes', icono: 'Users' },
  { id: 'nuevos', nombre: 'Clientes nuevos (primera visita en últimos 30 días)', alcance: '~180 clientes', icono: 'UserPlus' },
  { id: 'dormidos', nombre: 'Clientes dormidos (sin visita en más de 30 días)', alcance: '~420 clientes', icono: 'Moon' },
  { id: 'vip', nombre: 'Nivel VIP (clientes con más puntos acumulados)', alcance: '~95 clientes', icono: 'Star' },
  { id: 'comportamiento', nombre: 'Por comportamiento (visitó X veces, canjeó Y cupón)', alcance: '~240 clientes', icono: 'Activity' },
];

const CANALES_PASO = [
  { id: 'push', nombre: 'Notificación push', icono: 'Bell' },
  { id: 'cupon', nombre: 'Cupón', icono: 'Tag' },
  { id: 'email', nombre: 'Email', icono: 'Mail' },
  { id: 'story', nombre: 'Story en feed', icono: 'Image' },
];

const DIVISIONES = [
  { id: '50-50', label: '50 / 50' },
  { id: '70-30', label: '70 / 30' },
  { id: '80-20', label: '80 / 20' },
];

const PASOS_WIZARD = [
  { id: 1, nombre: 'Objetivo' },
  { id: 2, nombre: 'Audiencia' },
  { id: 3, nombre: 'Secuencia' },
  { id: 4, nombre: 'Configuración' },
];

// ─── Componente principal ─────────────────────────────────────────────────────
const CampaignWizard = ({ onClose, onSave, initialData = null, userTier = 'premium' }) => {
  const isPremium = true;
  const [pasoActual, setPasoActual] = useState(1);

  const [objetivo, setObjetivo] = useState(initialData?.objetivo || null);
  const [segmentos, setSegmentos] = useState(initialData?.segmentos || []);
  const [nombreCampaña, setNombreCampaña] = useState(initialData?.name || '');

  // Paso 3 – secuencia multi-paso
  const [secuencia, setSecuencia] = useState(
    initialData?.secuencia || [
      { id: Date.now(), canal: 'push', mensaje: '', retraso: 0 },
    ]
  );

  // Paso 4 – A/B y grupo de control
  const [abActivo, setAbActivo] = useState(initialData?.abActivo || false);
  const [varianteA, setVarianteA] = useState(
    initialData?.varianteA || { titulo: '', descuento: '', cta: '' }
  );
  const [varianteB, setVarianteB] = useState(
    initialData?.varianteB || { titulo: '', descuento: '', cta: '' }
  );
  const [division, setDivision] = useState(initialData?.division || '50-50');
  const [grupoControlActivo, setGrupoControlActivo] = useState(
    initialData?.grupoControlActivo || false
  );
  const [porcentajeControl, setPorcentajeControl] = useState(
    initialData?.porcentajeControl || 10
  );

  const puedeAvanzar = () => {
    if (pasoActual === 1) return !!objetivo;
    if (pasoActual === 2) return segmentos?.length > 0 && nombreCampaña?.trim() !== '';
    return true;
  };

  const avanzar = () => {
    if (pasoActual < 4) setPasoActual(p => p + 1);
  };

  const retroceder = () => {
    if (pasoActual > 1) setPasoActual(p => p - 1);
  };

  const handleGuardar = () => {
    const data = {
      name: nombreCampaña,
      objetivo,
      segmentos,
      secuencia,
      abActivo: isPremium ? abActivo : false,
      varianteA: isPremium && abActivo ? varianteA : null,
      varianteB: isPremium && abActivo ? varianteB : null,
      division: isPremium && abActivo ? division : null,
      grupoControlActivo: isPremium ? grupoControlActivo : false,
      porcentajeControl: isPremium && grupoControlActivo ? porcentajeControl : null,
      type: objetivo || 'seasonal',
      status: 'draft',
      startDate: new Date()?.toISOString()?.split('T')?.[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0],
      budget: 0,
      channels: [...new Set(secuencia.map(s => s.canal))],
      targetAudience: segmentos?.[0] || 'all',
    };
    onSave(data);
  };

  const toggleSegmento = (id) => {
    setSegmentos(prev =>
      prev?.includes(id) ? prev?.filter(s => s !== id) : [...prev, id]
    );
  };

  const agregarPaso = () => {
    if (secuencia?.length >= 4) return;
    setSecuencia(prev => [
      ...prev,
      { id: Date.now(), canal: 'push', mensaje: '', retraso: 1 },
    ]);
  };

  const eliminarPaso = (id) => {
    setSecuencia(prev => prev?.filter(p => p?.id !== id));
  };

  const actualizarPaso = (id, campo, valor) => {
    setSecuencia(prev =>
      prev?.map(p => (p?.id === id ? { ...p, [campo]: valor } : p))
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Crear Campaña</h2>
            <p className="text-sm text-muted-foreground">Paso {pasoActual} de {PASOS_WIZARD?.length}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {PASOS_WIZARD?.map((paso, idx) => (
              <React.Fragment key={paso?.id}>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      pasoActual > paso?.id
                        ? 'bg-primary text-primary-foreground'
                        : pasoActual === paso?.id
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {pasoActual > paso?.id ? <Icon name="Check" size={12} /> : paso?.id}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      pasoActual >= paso?.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {paso?.nombre}
                  </span>
                </div>
                {idx < PASOS_WIZARD?.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded ${
                      pasoActual > paso?.id ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── PASO 1: Objetivo ── */}
          {pasoActual === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">¿Cuál es el objetivo de tu campaña?</h3>
              <p className="text-sm text-muted-foreground mb-5">Selecciona el objetivo principal para personalizar tu campaña.</p>
              <div className="grid grid-cols-1 gap-4">
                {OBJETIVOS?.map(obj => (
                  <button
                    key={obj?.id}
                    onClick={() => setObjetivo(obj?.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      objetivo === obj?.id
                        ? `${obj?.border} ${obj?.bg}`
                        : 'border-border hover:border-primary/40 bg-card'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${obj?.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon name={obj?.icono} size={24} className={obj?.color} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{obj?.nombre}</p>
                      <p className="text-sm text-muted-foreground">{obj?.descripcion}</p>
                    </div>
                    {objetivo === obj?.id && (
                      <div className="ml-auto">
                        <Icon name="CheckCircle2" size={22} className="text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── PASO 2: Audiencia ── */}
          {pasoActual === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Selecciona tu audiencia</h3>
              <p className="text-sm text-muted-foreground mb-4">Elige uno o más segmentos para esta campaña.</p>

              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground mb-1">Nombre de la campaña *</label>
                <Input
                  value={nombreCampaña}
                  onChange={e => setNombreCampaña(e?.target?.value)}
                  placeholder="Ej: Campaña Reactivación Verano"
                />
              </div>

              <div className="space-y-3">
                {SEGMENTOS?.map(seg => {
                  const activo = segmentos?.includes(seg?.id);
                  return (
                    <button
                      key={seg?.id}
                      onClick={() => toggleSegmento(seg?.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        activo
                          ? 'border-primary bg-primary/5' :'border-border hover:border-primary/40 bg-card'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activo ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon name={seg?.icono} size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{seg?.nombre}</p>
                        <p className="text-xs text-muted-foreground">{seg?.alcance}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          activo ? 'bg-primary border-primary' : 'border-border'
                        }`}
                      >
                        {activo && <Icon name="Check" size={12} className="text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PASO 3: Secuencia multi-paso ── */}
          {pasoActual === 3 && (
            <div className="relative">
              <h3 className="text-lg font-semibold text-foreground mb-1">Constructor de secuencia</h3>
              <p className="text-sm text-muted-foreground mb-5">Define los pasos de tu campaña (máximo 4 acciones).</p>

              <div className="space-y-4">
                {secuencia?.map((paso, idx) => (
                  <div key={paso?.id} className="border border-border rounded-xl p-4 bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-foreground">Paso {idx + 1}</span>
                      {secuencia?.length > 1 && (
                        <button
                          onClick={() => eliminarPaso(paso?.id)}
                          className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Canal</label>
                        <select
                          value={paso?.canal}
                          onChange={e => actualizarPaso(paso?.id, 'canal', e?.target?.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {CANALES_PASO?.map(c => (
                            <option key={c?.id} value={c?.id}>{c?.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          {idx === 0 ? 'Enviar al inicio' : `Retraso (días)`}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={paso?.retraso}
                          onChange={e => actualizarPaso(paso?.id, 'retraso', parseInt(e?.target?.value) || 0)}
                          disabled={idx === 0}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Mensaje / Contenido</label>
                      <textarea
                        value={paso?.mensaje}
                        onChange={e => actualizarPaso(paso?.id, 'mensaje', e?.target?.value)}
                        placeholder="Escribe el contenido de este paso..."
                        rows={2}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {secuencia?.length < 4 && (
                <button
                  onClick={agregarPaso}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Icon name="Plus" size={16} />
                  Agregar paso
                </button>
              )}
            </div>
          )}

          {/* ── PASO 4: A/B + Grupo de control ── */}
          {pasoActual === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Configuración avanzada</h3>
                <p className="text-sm text-muted-foreground">Optimiza el rendimiento de tu campaña con pruebas A/B y grupos de control.</p>
              </div>

              {/* A/B Testing */}
              <div className={`border rounded-xl p-4 relative`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">Activar prueba A/B</p>
                    <p className="text-xs text-muted-foreground">Compara dos variantes y descubre cuál funciona mejor</p>
                  </div>
                  <button
                    onClick={() => setAbActivo(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      abActivo ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        abActivo ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {abActivo && (
                  <div className="mt-4 space-y-4">
                    <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                      Enviaremos cada variante a una parte de tu audiencia y te mostraremos cuál funcionó mejor.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Variante A */}
                      <div className="border border-border rounded-lg p-3">
                        <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                          <span className="w-5 h-5 bg-blue-500 text-white rounded text-xs flex items-center justify-center">A</span>
                          Variante A
                        </p>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Título de promo"
                            value={varianteA?.titulo}
                            onChange={e => setVarianteA(v => ({ ...v, titulo: e?.target?.value }))}
                            className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="% descuento"
                            value={varianteA?.descuento}
                            onChange={e => setVarianteA(v => ({ ...v, descuento: e?.target?.value }))}
                            className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="Texto del CTA"
                            value={varianteA?.cta}
                            onChange={e => setVarianteA(v => ({ ...v, cta: e?.target?.value }))}
                            className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {/* Variante B */}
                      <div className="border border-border rounded-lg p-3">
                        <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                          <span className="w-5 h-5 bg-green-500 text-white rounded text-xs flex items-center justify-center">B</span>
                          Variante B
                        </p>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Título de promo"
                            value={varianteB?.titulo}
                            onChange={e => setVarianteB(v => ({ ...v, titulo: e?.target?.value }))}
                            className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="% descuento"
                            value={varianteB?.descuento}
                            onChange={e => setVarianteB(v => ({ ...v, descuento: e?.target?.value }))}
                            className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="Texto del CTA"
                            value={varianteB?.cta}
                            onChange={e => setVarianteB(v => ({ ...v, cta: e?.target?.value }))}
                            className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* División de audiencia */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">División de audiencia</label>
                      <div className="flex gap-2">
                        {DIVISIONES?.map(d => (
                          <button
                            key={d?.id}
                            onClick={() => setDivision(d?.id)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                              division === d?.id
                                ? 'border-primary bg-primary/10 text-primary' :'border-border text-muted-foreground hover:border-primary/40'
                            }`}
                          >
                            {d?.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grupo de control */}
              <div className={`border rounded-xl p-4 relative`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">Grupo de control</p>
                    <p className="text-xs text-muted-foreground">Mide el impacto real de tu campaña</p>
                  </div>
                  <button
                    onClick={() => setGrupoControlActivo(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      grupoControlActivo ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        grupoControlActivo ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {grupoControlActivo && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs text-muted-foreground bg-purple-50 border border-purple-200 rounded-lg p-3">
                      Este grupo no recibirá la campaña, lo que nos permite medir el impacto real de tus acciones.
                    </p>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-muted-foreground">Porcentaje sin campaña</label>
                        <span className="text-sm font-bold text-primary">{porcentajeControl}%</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={30}
                        step={5}
                        value={porcentajeControl}
                        onChange={e => setPorcentajeControl(parseInt(e?.target?.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>5%</span>
                        <span>30%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={pasoActual === 1 ? onClose : retroceder}>
            {pasoActual === 1 ? 'Cancelar' : 'Anterior'}
          </Button>
          {pasoActual < 4 ? (
            <Button onClick={avanzar} disabled={!puedeAvanzar()} iconName="ChevronRight" iconSize={16}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleGuardar} iconName="Check" iconSize={16}>
              Crear campaña
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
