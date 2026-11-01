import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TrustCredibilityForm = ({ formData, onChange }) => {
  const [activeSection, setActiveSection] = useState('certifications');
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  const [newRule, setNewRule] = useState('');
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', specialty: '', years: '', photo: null });
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: '', type: 'cert' });
  const [newAward, setNewAward] = useState({ name: '', issuer: '', year: '' });
  const [expandedFaq, setExpandedFaq] = useState(null);

  const certifications = formData?.certifications || [];
  const awards = formData?.awards || [];
  const teamMembers = formData?.teamMembers || [];
  const licenses = formData?.licenses || [];
  const insurance = formData?.insurance || [];
  const faqs = formData?.faqs || [];
  const rules = formData?.rules || [];
  const news = formData?.news || [];

  const sections = [
    { id: 'certifications', label: 'Certificaciones', icon: 'Award', color: 'text-amber-700', bg: 'bg-amber-100', activeBg: 'bg-amber-600', hoverBg: 'hover:bg-amber-50', btn: 'bg-amber-600 hover:bg-amber-700 text-white' },
    { id: 'faq', label: 'FAQ', icon: 'HelpCircle', color: 'text-violet-700', bg: 'bg-violet-100', activeBg: 'bg-violet-600', hoverBg: 'hover:bg-violet-50', btn: 'bg-violet-600 hover:bg-violet-700 text-white' },
    { id: 'rules', label: 'Reglas', icon: 'FileText', color: 'text-rose-700', bg: 'bg-rose-100', activeBg: 'bg-rose-600', hoverBg: 'hover:bg-rose-50', btn: 'bg-rose-600 hover:bg-rose-700 text-white' },
    { id: 'news', label: 'Novedades', icon: 'Megaphone', color: 'text-teal-700', bg: 'bg-teal-100', activeBg: 'bg-teal-600', hoverBg: 'hover:bg-teal-50', btn: 'bg-teal-600 hover:bg-teal-700 text-white' },
  ];

  const activeSectionConfig = sections?.find(s => s?.id === activeSection) || sections?.[0];

  const addCert = () => {
    if (!newCert?.name) return;
    onChange('certifications', [...certifications, { ...newCert, id: Date.now() }]);
    setNewCert({ name: '', issuer: '', year: '', type: 'cert' });
  };

  const removeCert = (id) => onChange('certifications', certifications?.filter(c => c?.id !== id));

  const addAward = () => {
    if (!newAward?.name) return;
    onChange('awards', [...awards, { ...newAward, id: Date.now() }]);
    setNewAward({ name: '', issuer: '', year: '' });
  };

  const removeAward = (id) => onChange('awards', awards?.filter(a => a?.id !== id));

  const addTeamMember = () => {
    if (!newTeamMember?.name) return;
    onChange('teamMembers', [...teamMembers, { ...newTeamMember, id: Date.now() }]);
    setNewTeamMember({ name: '', role: '', specialty: '', years: '', photo: null });
  };

  const removeTeamMember = (id) => onChange('teamMembers', teamMembers?.filter(m => m?.id !== id));

  const addFaq = () => {
    if (!newFaq?.q || !newFaq?.a) return;
    onChange('faqs', [...faqs, { ...newFaq, id: Date.now() }]);
    setNewFaq({ q: '', a: '' });
  };

  const removeFaq = (id) => onChange('faqs', faqs?.filter(f => f?.id !== id));

  const addRule = () => {
    if (!newRule?.trim()) return;
    onChange('rules', [...rules, { id: Date.now(), text: newRule?.trim() }]);
    setNewRule('');
  };

  const removeRule = (id) => onChange('rules', rules?.filter(r => r?.id !== id));

  const addNews = () => {
    onChange('news', [...news, { id: Date.now(), title: '', body: '', date: new Date()?.toISOString()?.split('T')?.[0], pinned: false }]);
  };

  const updateNews = (id, field, val) => {
    onChange('news', news?.map(n => n?.id === id ? { ...n, [field]: val } : n));
  };

  const removeNews = (id) => onChange('news', news?.filter(n => n?.id !== id));

  return (
    <div className="space-y-0">
      {/* Sub-nav */}
      <div className="border-b border-border bg-muted/5 overflow-x-auto mb-6">
        <div className="flex items-center gap-2 px-1 py-3 min-w-max">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Sección:</span>
          {sections?.map(s => {
            const isActive = activeSection === s?.id;
            return (
              <button key={s?.id} onClick={() => setActiveSection(s?.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? `${s?.activeBg} text-white shadow-md ring-2 ring-offset-1 ring-current`
                    : `${s?.bg} ${s?.color} ${s?.hoverBg} hover:shadow-sm`
                }`}>
                <Icon name={s?.icon} size={13} className={isActive ? 'text-white' : s?.color} />
                {s?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Certificaciones y sellos */}
      {activeSection === 'certifications' && (
        <div className="space-y-6">
          {/* Certificaciones */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Certificaciones y sellos</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Distintivo H, ISO, COFEPRIS, orgánico, Great Place to Work, etc. Con verificación documental.</p>
            <div className="space-y-3 mb-4">
              {certifications?.map(cert => (
                <div key={cert?.id} className="flex items-center gap-3 p-3 border border-border rounded-xl">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Award" size={16} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{cert?.name}</p>
                    <p className="text-xs text-muted-foreground">{cert?.issuer}{cert?.year ? ` · ${cert?.year}` : ''}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Verificado</span>
                  <button onClick={() => removeCert(cert?.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-foreground">Agregar certificación</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" value={newCert?.name} onChange={e => setNewCert(p => ({ ...p, name: e?.target?.value }))}
                  placeholder="Nombre (ej: Distintivo H)" className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input type="text" value={newCert?.issuer} onChange={e => setNewCert(p => ({ ...p, issuer: e?.target?.value }))}
                  placeholder="Quién lo otorgó (ej: SECTUR)" className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input type="number" value={newCert?.year} onChange={e => setNewCert(p => ({ ...p, year: e?.target?.value }))}
                  placeholder="Año" className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <select value={newCert?.type} onChange={e => setNewCert(p => ({ ...p, type: e?.target?.value }))}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="cert">Certificación</option>
                  <option value="license">Licencia / Permiso</option>
                  <option value="insurance">Seguro / Garantía</option>
                  <option value="award">Premio</option>
                </select>
              </div>
              <button onClick={addCert}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${sections?.find(s => s?.id === activeSection)?.btn || 'bg-amber-600 hover:bg-amber-700 text-white'} rounded-lg transition-colors`}>
                <Icon name="Plus" size={16} /> Agregar
              </button>
            </div>
          </div>

          {/* Premios */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Premios y reconocimientos</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Lista de premios: nombre, quién lo otorgó, año.</p>
            <div className="space-y-3 mb-4">
              {awards?.map(award => (
                <div key={award?.id} className="flex items-center gap-3 p-3 border border-border rounded-xl">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🏆</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{award?.name}</p>
                    <p className="text-xs text-muted-foreground">{award?.issuer}{award?.year ? ` · ${award?.year}` : ''}</p>
                  </div>
                  <button onClick={() => removeAward(award?.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-foreground">Agregar premio</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" value={newAward?.name} onChange={e => setNewAward(p => ({ ...p, name: e?.target?.value }))}
                  placeholder="Nombre del premio" className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input type="text" value={newAward?.issuer} onChange={e => setNewAward(p => ({ ...p, issuer: e?.target?.value }))}
                  placeholder="Otorgado por" className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input type="number" value={newAward?.year} onChange={e => setNewAward(p => ({ ...p, year: e?.target?.value }))}
                  placeholder="Año" className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button onClick={addAward}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${sections?.find(s => s?.id === activeSection)?.btn || 'bg-amber-600 hover:bg-amber-700 text-white'} rounded-lg transition-colors`}>
                <Icon name="Plus" size={16} /> Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {activeSection === 'faq' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Preguntas frecuentes (FAQ)</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Preguntas y respuestas comunes configurables. Reduce mensajes directos al negocio.</p>
            <div className="space-y-2 mb-4">
              {faqs?.map((faq, idx) => (
                <div key={faq?.id} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq?.id ? null : faq?.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground text-left">{faq?.q || `Pregunta ${idx + 1}`}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e?.stopPropagation(); removeFaq(faq?.id); }} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Icon name="Trash2" size={14} />
                      </button>
                      <Icon name={expandedFaq === faq?.id ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
                    </div>
                  </button>
                  {expandedFaq === faq?.id && (
                    <div className="px-4 pb-4 space-y-2 border-t border-border">
                      <input type="text" value={faq?.q}
                        onChange={e => onChange('faqs', faqs?.map(f => f?.id === faq?.id ? { ...f, q: e?.target?.value } : f))}
                        placeholder="Pregunta" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none mt-3" />
                      <textarea rows={2} value={faq?.a}
                        onChange={e => onChange('faqs', faqs?.map(f => f?.id === faq?.id ? { ...f, a: e?.target?.value } : f))}
                        placeholder="Respuesta" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none resize-none" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-foreground">Nueva pregunta frecuente</p>
              <input type="text" value={newFaq?.q} onChange={e => setNewFaq(p => ({ ...p, q: e?.target?.value }))}
                placeholder="¿Cuál es la pregunta?" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <textarea rows={2} value={newFaq?.a} onChange={e => setNewFaq(p => ({ ...p, a: e?.target?.value }))}
                placeholder="Respuesta..." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              <button onClick={addFaq}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${sections?.find(s => s?.id === activeSection)?.btn || 'bg-violet-600 hover:bg-violet-700 text-white'} rounded-lg transition-colors`}>
                <Icon name="Plus" size={16} /> Agregar pregunta
              </button>
            </div>
            {faqs?.length === 0 && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700">💡 Sugerencias: ¿Cuáles son sus horarios? ¿Aceptan reservaciones? ¿Tienen estacionamiento? ¿Cuál es su especialidad?</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reglas */}
      {activeSection === 'rules' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Reglas del establecimiento</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Normas sobre vestimenta, mascotas, menores, alimentos externos, uso de instalaciones. Evita malentendidos.</p>
            <div className="space-y-2 mb-4">
              {rules?.map(rule => (
                <div key={rule?.id} className="flex items-center gap-3 p-3 border border-border rounded-xl">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="AlertCircle" size={14} className="text-amber-600" />
                  </div>
                  <span className="text-sm text-foreground flex-1">{rule?.text}</span>
                  <button onClick={() => removeRule(rule?.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newRule} onChange={e => setNewRule(e?.target?.value)}
                onKeyDown={e => e?.key === 'Enter' && addRule()}
                placeholder="Ej: No se permiten alimentos externos" className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={addRule}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${sections?.find(s => s?.id === activeSection)?.btn || 'bg-rose-600 hover:bg-rose-700 text-white'} rounded-lg transition-colors`}>
                <Icon name="Plus" size={16} /> Agregar
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['No se permiten mascotas', 'Código de vestimenta formal', 'Prohibido fumar en interiores', 'No se permiten menores de edad', 'No se permiten alimentos externos', 'Uso de casilleros obligatorio']?.map(suggestion => (
                <button key={suggestion} onClick={() => setNewRule(suggestion)}
                  className="text-xs px-2 py-1 bg-muted border border-border rounded-lg hover:bg-muted/70 transition-colors text-muted-foreground">
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Novedades */}
      {activeSection === 'news' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="text-base font-semibold text-foreground">Novedades / Qué hay de nuevo</h3>
              </div>
              <button onClick={addNews}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                <Icon name="Plus" size={14} /> Nueva novedad
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Update permanente tipo post: "Nuevo servicio disponible", "Remodelamos", "Horario extendido".</p>
            {news?.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Icon name="Megaphone" size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No hay novedades publicadas</p>
                <button onClick={addNews} className="mt-3 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                  + Crear primera novedad
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {news?.map(item => (
                  <div key={item?.id} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateNews(item?.id, 'pinned', !item?.pinned)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
                            item?.pinned ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon name="Pin" size={12} /> {item?.pinned ? 'Fijado' : 'Fijar'}
                        </button>
                        <input type="date" value={item?.date}
                          onChange={e => updateNews(item?.id, 'date', e?.target?.value)}
                          className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none" />
                      </div>
                      <button onClick={() => removeNews(item?.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                    <input type="text" value={item?.title}
                      onChange={e => updateNews(item?.id, 'title', e?.target?.value)}
                      placeholder="Título de la novedad (ej: Nuevo servicio disponible)" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <textarea rows={2} value={item?.body}
                      onChange={e => updateNews(item?.id, 'body', e?.target?.value)}
                      placeholder="Descripción breve..." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustCredibilityForm;
