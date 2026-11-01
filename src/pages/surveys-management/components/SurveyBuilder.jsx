import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
      checked ? 'bg-primary' : 'bg-slate-300'
    }`}
  >
    <span
      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
      style={{ left: checked ? '22px' : '2px' }}
    />
  </button>
);

const questionTypes = [
  { id: 'nps', label: 'NPS (Escala 0-10)', icon: 'TrendingUp' },
  { id: 'stars', label: 'Escala de estrellas (1-5)', icon: 'Star' },
  { id: 'single', label: 'Opción múltiple (una respuesta)', icon: 'CircleDot' },
  { id: 'multi', label: 'Opción múltiple (varias respuestas)', icon: 'CheckSquare' },
  { id: 'open', label: 'Pregunta abierta', icon: 'AlignLeft' },
  { id: 'scale', label: 'Escala lineal', icon: 'Sliders' },
  { id: 'yesno', label: 'Sí / No', icon: 'ToggleLeft' },
];

const triggerOptions = [
  { id: 'checkin', label: 'Post check-in', delays: ['Inmediato', '15 min', '30 min', '1 hora'] },
  { id: 'coupon', label: 'Post canje de cupón/promo', delays: ['Inmediato', '15 min', '30 min'] },
  { id: 'order', label: 'Post Order Ahead completado', delays: ['30 min', '1 hora', '2 horas'] },
  { id: 'reservation', label: 'Post reservación cumplida', delays: ['1 hora', '2 horas', 'Al día siguiente'] },
  { id: 'manual', label: 'Envío manual', delays: ['Inmediato'] },
];

const QuestionPreview = ({ question }) => {
  if (question?.type === 'nps') {
    return (
      <div>
        <p className="text-xs font-medium text-foreground mb-2">{question?.text || '¿Qué tan probable es que nos recomiendes?'}</p>
        <div className="flex gap-0.5">
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} className={`flex-1 h-6 rounded text-center text-xs flex items-center justify-center font-bold ${
              i <= 6 ? 'bg-red-100 text-red-600' : i <= 8 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
            }`}>{i}</div>
          ))}
        </div>
      </div>
    );
  }
  if (question?.type === 'stars') {
    return (
      <div>
        <p className="text-xs font-medium text-foreground mb-2">{question?.text || '¿Cómo calificarías tu experiencia?'}</p>
        <div className="flex gap-1">
          {[1,2,3,4,5]?.map(i => <Icon key={i} name="Star" size={18} className="text-amber-400 fill-amber-400" />)}
        </div>
      </div>
    );
  }
  if (question?.type === 'yesno') {
    return (
      <div>
        <p className="text-xs font-medium text-foreground mb-2">{question?.text || '¿Recomendarías este lugar?'}</p>
        <div className="flex gap-2">
          <button className="flex-1 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">Sí</button>
          <button className="flex-1 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium">No</button>
        </div>
      </div>
    );
  }
  if (question?.type === 'single' || question?.type === 'multi') {
    return (
      <div>
        <p className="text-xs font-medium text-foreground mb-2">{question?.text || 'Selecciona una opción'}</p>
        <div className="space-y-1">
          {(question?.options || ['Opción 1', 'Opción 2', 'Opción 3'])?.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 bg-muted/30 rounded text-xs">
              <div className={`w-3 h-3 border border-border rounded-${question?.type === 'multi' ? 'sm' : 'full'} flex-shrink-0`} />
              {opt}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (question?.type === 'open') {
    return (
      <div>
        <p className="text-xs font-medium text-foreground mb-2">{question?.text || 'Cuéntanos tu experiencia'}</p>
        <div className="h-12 bg-muted/30 rounded border border-border/50 p-2 text-xs text-muted-foreground">
          {question?.placeholder || 'Escribe aquí...'}
        </div>
      </div>
    );
  }
  if (question?.type === 'scale') {
    return (
      <div>
        <p className="text-xs font-medium text-foreground mb-2">{question?.text || 'Califica del 1 al 7'}</p>
        <div className="flex gap-1">
          {[1,2,3,4,5,6,7]?.map(i => (
            <div key={i} className="flex-1 h-7 bg-muted/40 rounded text-center text-xs flex items-center justify-center font-medium">{i}</div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const SurveyBuilder = ({ survey, onSave, onCancel }) => {
  const [name, setName] = useState(survey?.name || '');
  const [title, setTitle] = useState(survey?.title || '');
  const [description, setDescription] = useState(survey?.description || '');
  const [anonymous, setAnonymous] = useState(false);
  const [selectedTriggers, setSelectedTriggers] = useState({ checkin: true, manual: false, coupon: false, order: false, reservation: false });
  const [triggerDelays, setTriggerDelays] = useState({ checkin: 'Inmediato', coupon: 'Inmediato', order: '30 min', reservation: '1 hora', manual: 'Inmediato' });
  const [questions, setQuestions] = useState([
    { id: 1, type: 'nps', text: '¿Qué tan probable es que nos recomiendes?', required: true },
    { id: 2, type: 'stars', text: '¿Cómo calificarías tu experiencia general?', required: true },
    { id: 3, type: 'open', text: '¿Qué podríamos mejorar?', placeholder: 'Cuéntanos...', required: false },
  ]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [incentiveActive, setIncentiveActive] = useState(false);
  const [incentiveType, setIncentiveType] = useState('points');
  const [thankYouTitle, setThankYouTitle] = useState('¡Gracias por tu opinión!');
  const [thankYouMsg, setThankYouMsg] = useState('Tu feedback nos ayuda a mejorar cada día.');

  const toggleTrigger = (id) => {
    setSelectedTriggers(prev => ({ ...prev, [id]: !prev?.[id] }));
  };

  const addQuestion = (type) => {
    const newQ = {
      id: Date.now(),
      type,
      text: '',
      required: false,
      options: type === 'single' || type === 'multi' ? ['Opción 1', 'Opción 2', 'Opción 3'] : undefined,
    };
    setQuestions(prev => [...prev, newQ]);
    setShowTypeSelector(false);
    setEditingQuestion(newQ?.id);
  };

  const removeQuestion = (id) => {
    setQuestions(prev => prev?.filter(q => q?.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(prev => prev?.map(q => q?.id === id ? { ...q, [field]: value } : q));
  };

  const hasNPSConflict = Object.entries(selectedTriggers)?.some(([k, v]) => v && k !== 'manual');

  const estimatedTime = Math.max(1, Math.ceil(questions?.length * 0.5));

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-screen -mx-6 -mt-6">
      {/* Left panel - Canvas */}
      <div className="flex-1 lg:w-3/5 p-6 overflow-y-auto border-r border-border">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onCancel} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <Icon name="ArrowLeft" size={18} className="text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-foreground">{survey ? 'Editar encuesta' : 'Nueva encuesta'}</h2>
            <p className="text-xs text-muted-foreground">Configura y construye tu encuesta personalizada</p>
          </div>
        </div>

        {/* General config */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Configuración general</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre interno (no visible para el cliente)</label>
              <input
                value={name}
                onChange={e => setName(e?.target?.value)}
                placeholder="Encuesta satisfacción post-visita marzo"
                className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Título visible para el cliente</label>
              <input
                value={title}
                onChange={e => setTitle(e?.target?.value)}
                placeholder="¿Cómo fue tu experiencia?"
                className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Descripción opcional</label>
              <textarea
                value={description}
                onChange={e => setDescription(e?.target?.value)}
                placeholder="Solo toma 1 minuto y nos ayuda a mejorar"
                rows={2}
                className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
              <div>
                <p className="text-sm font-medium text-foreground">Respuestas anónimas</p>
                <p className="text-xs text-muted-foreground">Las respuestas no se vincularán al perfil del cliente</p>
              </div>
              <Toggle checked={anonymous} onChange={setAnonymous} />
            </div>
          </div>
        </div>

        {/* Triggers */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Triggers de envío</h3>
          <div className="space-y-2 mb-3">
            {triggerOptions?.map(t => (
              <div key={t?.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                <input
                  type="checkbox"
                  checked={selectedTriggers?.[t?.id]}
                  onChange={() => toggleTrigger(t?.id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-sm text-foreground flex-1">{t?.label}</span>
                {selectedTriggers?.[t?.id] && t?.id !== 'manual' && (
                  <select
                    value={triggerDelays?.[t?.id]}
                    onChange={e => setTriggerDelays(prev => ({ ...prev, [t?.id]: e?.target?.value }))}
                    className="text-xs border border-border rounded-lg px-2 py-1 bg-card text-foreground focus:outline-none"
                  >
                    {t?.delays?.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
          {hasNPSConflict && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <Icon name="AlertTriangle" size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                ⚠️ Esta encuesta reemplazará el NPS automático para los triggers seleccionados. El NPS seguirá activo para los triggers no seleccionados.
              </p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Preguntas ({questions?.length})</h3>
            <button
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Icon name="Plus" size={14} />
              Agregar pregunta
            </button>
          </div>

          {showTypeSelector && (
            <div className="mb-4 p-3 bg-muted/20 rounded-xl border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Selecciona el tipo de pregunta:</p>
              <div className="grid grid-cols-2 gap-2">
                {questionTypes?.map(qt => (
                  <button
                    key={qt?.id}
                    onClick={() => addQuestion(qt?.id)}
                    className="flex items-center gap-2 p-2.5 bg-card border border-border rounded-lg text-xs font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors text-left"
                  >
                    <Icon name={qt?.icon} size={14} className="text-primary flex-shrink-0" />
                    {qt?.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {questions?.map((q, idx) => {
              const typeInfo = questionTypes?.find(t => t?.id === q?.type);
              const isEditing = editingQuestion === q?.id;
              return (
                <div key={q?.id} className="border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-3 bg-muted/20">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-card border border-border rounded-full text-muted-foreground font-medium">
                      {typeInfo?.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{q?.text || 'Sin texto'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingQuestion(isEditing ? null : q?.id)}
                        className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <Icon name={isEditing ? 'ChevronUp' : 'Pencil'} size={13} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => removeQuestion(q?.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Icon name="Trash2" size={13} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="p-3 space-y-2 border-t border-border">
                      <input
                        value={q?.text}
                        onChange={e => updateQuestion(q?.id, 'text', e?.target?.value)}
                        placeholder="Texto de la pregunta..."
                        className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {(q?.type === 'single' || q?.type === 'multi') && (
                        <div className="space-y-1">
                          {q?.options?.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input
                                value={opt}
                                onChange={e => {
                                  const newOpts = [...(q?.options || [])];
                                  newOpts[oi] = e?.target?.value;
                                  updateQuestion(q?.id, 'options', newOpts);
                                }}
                                className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none"
                              />
                              <button onClick={() => {
                                const newOpts = q?.options?.filter((_, i) => i !== oi);
                                updateQuestion(q?.id, 'options', newOpts);
                              }} className="p-1 hover:bg-red-50 rounded">
                                <Icon name="X" size={12} className="text-red-500" />
                              </button>
                            </div>
                          ))}
                          {(q?.options?.length || 0) < 8 && (
                            <button
                              onClick={() => updateQuestion(q?.id, 'options', [...(q?.options || []), `Opción ${(q?.options?.length || 0) + 1}`])}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Icon name="Plus" size={11} /> Agregar opción
                            </button>
                          )}
                        </div>
                      )}
                      {q?.type === 'open' && (
                        <input
                          value={q?.placeholder || ''}
                          onChange={e => updateQuestion(q?.id, 'placeholder', e?.target?.value)}
                          placeholder="Placeholder del campo..."
                          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none"
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={q?.required}
                          onChange={e => updateQuestion(q?.id, 'required', e?.target?.checked)}
                          className="w-3.5 h-3.5 rounded border-border text-primary"
                        />
                        <span className="text-xs text-muted-foreground">Pregunta obligatoria</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Thank you screen */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Pantalla de agradecimiento</h3>
          <div className="space-y-3">
            <input
              value={thankYouTitle}
              onChange={e => setThankYouTitle(e?.target?.value)}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              value={thankYouMsg}
              onChange={e => setThankYouMsg(e?.target?.value)}
              rows={2}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
              <div>
                <p className="text-sm font-medium text-foreground">Ofrecer incentivo al completar</p>
                <p className="text-xs text-muted-foreground">Se otorga independientemente de las respuestas</p>
              </div>
              <Toggle checked={incentiveActive} onChange={setIncentiveActive} />
            </div>
            {incentiveActive && (
              <>
                <div className="flex gap-2">
                  {['points', 'coupon', 'stamp']?.map(type => (
                    <button
                      key={type}
                      onClick={() => setIncentiveType(type)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        incentiveType === type
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
                      }`}
                    >
                      {type === 'points' ? '⭐ Puntos' : type === 'coupon' ? '🎟️ Cupón' : '🥊 Stamp'}
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700">
                    ⚠️ El incentivo se otorga independientemente de las respuestas dadas. No puedes condicionar el beneficio a un rating mínimo.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            Guardar borrador
          </button>
          <button className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2">
            <Icon name="Eye" size={14} />
            Vista previa
          </button>
          <button
            onClick={() => onSave({ name, title, description, questions })}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="Zap" size={14} />
            Activar encuesta
          </button>
        </div>
      </div>
      {/* Right panel - Preview */}
      <div className="lg:w-2/5 p-6 bg-muted/10 flex flex-col items-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Vista previa del cliente</p>
        <div className="w-72 bg-card border-4 border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Phone notch */}
          <div className="bg-gray-800 h-6 flex items-center justify-center">
            <div className="w-16 h-1.5 bg-gray-600 rounded-full" />
          </div>
          {/* Survey content */}
          <div className="p-4 min-h-96 overflow-y-auto">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="ClipboardList" size={22} className="text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{title || '¿Cómo fue tu experiencia?'}</h3>
              {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
              <p className="text-xs text-muted-foreground mt-1">~{estimatedTime} min</p>
            </div>
            <div className="space-y-4">
              {questions?.map((q, idx) => (
                <div key={q?.id} className="p-3 bg-muted/20 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Pregunta {idx + 1}{q?.required ? ' *' : ''}</p>
                  <QuestionPreview question={q} />
                </div>
              ))}
            </div>
            {questions?.length > 0 && (
              <div className="mt-4 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-sm font-bold text-emerald-700">{thankYouTitle}</p>
                  <p className="text-xs text-emerald-600 mt-1">{thankYouMsg}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;
