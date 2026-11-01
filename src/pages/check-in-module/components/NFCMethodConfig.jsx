import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const mockTags = [
  { id: 1, name: 'Tag Mostrador', location: 'Mostrador / Caja', action: 'Check-in', taps: 89, active: true },
  { id: 2, name: 'Tag Mesa 1', location: 'Mesa 1', action: 'Check-in + Menú', taps: 34, active: true },
  { id: 3, name: 'Tag Entrada', location: 'Entrada', action: 'Check-in', taps: 12, active: false },
];

const NFCMethodConfig = ({ onBack }) => {
  const [tags, setTags] = useState(mockTags);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [newTag, setNewTag] = useState({ name: '', location: 'mostrador', action: 'check-in' });

  const toggleTag = (id) => {
    setTags(prev => prev?.map(t => t?.id === id ? { ...t, active: !t?.active } : t));
  };

  const actionLabels = {
    'check-in': 'Solo check-in',
    'check-in-coupon': 'Check-in + Cupón',
    'check-in-menu': 'Check-in + Menú',
    'promo': 'Solo promo',
  };

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          Volver a Métodos
        </button>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">NFC / Tap</h2>
          <p className="text-sm text-muted-foreground">Gestiona los tags NFC registrados en tu negocio.</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setModalStep(1); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Registrar nuevo tag
        </button>
      </div>
      {tags?.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-xl p-12 text-center">
          <Icon name="Wifi" size={48} className="text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Sin tags NFC registrados</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">Los tags NFC eliminan la fricción del check-in. El usuario solo toca su teléfono.</p>
          <div className="flex gap-3 justify-center">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Comprar tags NFC en tienda PromoSpot</button>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 border border-border rounded-lg text-sm">Ya tengo tags, registrar</button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ubicación</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Taps/mes</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tags?.map(tag => (
                <tr key={tag?.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Icon name="Wifi" size={15} className="text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{tag?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{tag?.location}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{tag?.action}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">{tag?.taps}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleTag(tag?.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        tag?.active ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        tag?.active ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 p-3 bg-muted/40 rounded-lg">
        <p className="text-xs text-muted-foreground">
          Los tags NFC funcionan con iPhone (iOS 13+) y Android (4.0+). Actualmente <strong>84%</strong> de tus clientes tienen dispositivos compatibles.
        </p>
      </div>
      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Registrar nuevo tag NFC</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="p-5">
              {/* Steps */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3]?.map(s => (
                  <React.Fragment key={s}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      modalStep >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>{s}</div>
                    {s < 3 && <div className={`flex-1 h-0.5 ${ modalStep > s ? 'bg-primary' : 'bg-border'}`} />}
                  </React.Fragment>
                ))}
              </div>

              {modalStep === 1 && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="Smartphone" size={36} className="text-orange-500" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Acerca tu teléfono al tag NFC</h4>
                  <p className="text-sm text-muted-foreground">Coloca el teléfono sobre el tag NFC que quieres registrar.</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Esperando lectura NFC...
                  </div>
                  <button onClick={() => setModalStep(2)} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm">Simular detección</button>
                </div>
              )}

              {modalStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Icon name="CheckCircle" size={16} className="text-green-600" />
                    <span className="text-sm text-green-700">Tag detectado: <strong>NFC-A4B2C8D1</strong></span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Nombre del tag</label>
                    <input
                      type="text"
                      placeholder="Ej: Tag Mostrador"
                      value={newTag?.name}
                      onChange={e => setNewTag(p => ({ ...p, name: e?.target?.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Ubicación</label>
                    <select
                      value={newTag?.location}
                      onChange={e => setNewTag(p => ({ ...p, location: e?.target?.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="mostrador">Mostrador / Caja</option>
                      <option value="mesa">Mesa</option>
                      <option value="entrada">Entrada</option>
                      <option value="vitrina">Vitrina</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Acción</label>
                    <select
                      value={newTag?.action}
                      onChange={e => setNewTag(p => ({ ...p, action: e?.target?.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {Object.entries(actionLabels)?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setModalStep(3)} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium">Registrar tag</button>
                </div>
              )}

              {modalStep === 3 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="CheckCircle" size={32} className="text-green-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">¡Tag registrado!</h4>
                  <p className="text-sm text-muted-foreground">El tag <strong>'{newTag?.name || 'Nuevo Tag'}'</strong> está activo y listo para usar.</p>
                  <button
                    onClick={() => {
                      setTags(prev => [...prev, { id: Date.now(), name: newTag?.name || 'Nuevo Tag', location: newTag?.location, action: actionLabels?.[newTag?.action], taps: 0, active: true }]);
                      setShowModal(false);
                      setModalStep(1);
                      setNewTag({ name: '', location: 'mostrador', action: 'check-in' });
                    }}
                    className="mt-4 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium"
                  >
                    Listo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFCMethodConfig;
