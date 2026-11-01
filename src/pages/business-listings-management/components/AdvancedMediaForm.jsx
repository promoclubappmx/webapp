import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AdvancedMediaForm = ({ formData, onChange }) => {
  const [activeSection, setActiveSection] = useState('tour360');
  const [newBeforeAfter, setNewBeforeAfter] = useState({ before: null, after: null, label: '' });
  const [sliderPos, setSliderPos] = useState(50);

  const tour360Url = formData?.tour360Url || '';
  const tour360Type = formData?.tour360Type || 'link';
  const beforeAfterPairs = formData?.beforeAfterPairs || [];
  const featuredProduct = formData?.featuredProduct || { name: '', price: '', photo: null, description: '', rotationType: 'weekly' };
  const videoTestimonials = formData?.videoTestimonials || [];

  const sections = [
    { id: 'tour360', label: 'Tour 360°', icon: 'Globe' },
    { id: 'beforeafter', label: 'Antes/Después', icon: 'Columns' },
    { id: 'featured', label: 'Destacado', icon: 'Star' },
    { id: 'testimonials', label: 'Testimoniales', icon: 'Video' },
  ];

  const addBeforeAfter = () => {
    if (!newBeforeAfter?.before || !newBeforeAfter?.after) return;
    onChange('beforeAfterPairs', [...beforeAfterPairs, { ...newBeforeAfter, id: Date.now() }]);
    setNewBeforeAfter({ before: null, after: null, label: '' });
  };

  const removeBeforeAfter = (id) => onChange('beforeAfterPairs', beforeAfterPairs?.filter(p => p?.id !== id));

  const addVideoTestimonial = () => {
    const url = prompt('Pega la URL del video testimonial (YouTube, Vimeo o link directo):');
    if (!url) return;
    onChange('videoTestimonials', [...videoTestimonials, { id: Date.now(), url, customerName: '', duration: '30s' }]);
  };

  const updateTestimonial = (id, field, val) => {
    onChange('videoTestimonials', videoTestimonials?.map(t => t?.id === id ? { ...t, [field]: val } : t));
  };

  const removeTestimonial = (id) => onChange('videoTestimonials', videoTestimonials?.filter(t => t?.id !== id));

  const handleFeaturedPhotoUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    onChange('featuredProduct', { ...featuredProduct, photo: { url: URL.createObjectURL(file), name: file?.name } });
  };

  return (
    <div className="space-y-0">
      {/* Sub-nav */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-xl overflow-x-auto">
        {sections?.map(s => (
          <button key={s?.id} onClick={() => setActiveSection(s?.id)}
            className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
              activeSection === s?.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Icon name={s?.icon} size={14} />
            <span className="hidden sm:inline">{s?.label}</span>
          </button>
        ))}
      </div>

      {/* Tour 360° */}
      {activeSection === 'tour360' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Tour virtual / Vista 360°</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Imagen 360° o link de Google Street View interior. Visor inmersivo en tu ficha.</p>
            <div className="flex gap-3 mb-4">
              {[
                { value: 'link', label: 'Link externo', icon: 'Link' },
                { value: 'streetview', label: 'Google Street View', icon: 'Map' },
                { value: 'upload', label: 'Subir imagen 360°', icon: 'Upload' },
              ]?.map(opt => (
                <button key={opt?.value} onClick={() => onChange('tour360Type', opt?.value)}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 border rounded-xl transition-all ${
                    tour360Type === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                  }`}>
                  <Icon name={opt?.icon} size={20} className={tour360Type === opt?.value ? 'text-primary' : 'text-muted-foreground'} />
                  <span className="text-xs font-medium text-foreground">{opt?.label}</span>
                </button>
              ))}
            </div>

            {(tour360Type === 'link' || tour360Type === 'streetview') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {tour360Type === 'streetview' ? 'URL de Google Street View interior' : 'URL del tour virtual'}
                </label>
                <input
                  type="url"
                  value={tour360Url}
                  onChange={e => onChange('tour360Url', e?.target?.value)}
                  placeholder={tour360Type === 'streetview' ? 'https://www.google.com/maps/...' : 'https://my.matterport.com/...'}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {tour360Type === 'streetview' && (
                  <p className="text-xs text-muted-foreground mt-1">En Google Maps: Busca tu negocio → Fotos → Selecciona foto 360° → Compartir → Copiar link</p>
                )}
              </div>
            )}

            {tour360Type === 'upload' && (
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <Icon name="Globe" size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Sube una imagen equirectangular (360°)</p>
                <p className="text-xs text-muted-foreground mb-3">Formatos: JPG, PNG — Recomendado: 4096×2048px</p>
                <label className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => { if(e?.target?.files?.[0]) onChange('tour360File', { name: e?.target?.files?.[0]?.name, url: URL.createObjectURL(e?.target?.files?.[0]) }); }} />
                  Seleccionar imagen 360°
                </label>
              </div>
            )}

            {tour360Url && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                <p className="text-xs text-green-700">Tour virtual configurado. Se mostrará como visor inmersivo en tu ficha.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Antes/Después */}
      {activeSection === 'beforeafter' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Fotos Antes / Después</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Pares de fotos con slider interactivo. Ideal para salones, barberías, talleres, remodelaciones, dentistas.</p>

            {/* Preview slider */}
            {beforeAfterPairs?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-foreground mb-2">Preview del slider:</p>
                <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: '200px' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-sm text-blue-600 font-medium">ANTES</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                    <span className="text-sm text-green-600 font-medium">DESPUÉS</span>
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
                    style={{ left: `${sliderPos}%` }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <Icon name="ChevronsLeftRight" size={16} className="text-foreground" />
                    </div>
                  </div>
                  <input type="range" min="0" max="100" value={sliderPos}
                    onChange={e => setSliderPos(parseInt(e?.target?.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">Arrastra para comparar</p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {beforeAfterPairs?.map(pair => (
                <div key={pair?.id} className="flex items-center gap-3 p-3 border border-border rounded-xl">
                  <div className="flex gap-2 flex-1">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-xs text-blue-600 font-medium">ANTES</div>
                    <Icon name="ArrowRight" size={16} className="text-muted-foreground self-center" />
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center text-xs text-green-600 font-medium">DESPUÉS</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{pair?.label || 'Sin etiqueta'}</p>
                  </div>
                  <button onClick={() => removeBeforeAfter(pair?.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-foreground">Agregar par Antes/Después</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Foto ANTES</label>
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                    <Icon name="Upload" size={20} className="text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Subir foto</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { if(e?.target?.files?.[0]) setNewBeforeAfter(p => ({ ...p, before: URL.createObjectURL(e?.target?.files?.[0]) })); }} />
                  </label>
                  {newBeforeAfter?.before && <p className="text-xs text-green-600 mt-1">✓ Foto cargada</p>}
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Foto DESPUÉS</label>
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                    <Icon name="Upload" size={20} className="text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Subir foto</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { if(e?.target?.files?.[0]) setNewBeforeAfter(p => ({ ...p, after: URL.createObjectURL(e?.target?.files?.[0]) })); }} />
                  </label>
                  {newBeforeAfter?.after && <p className="text-xs text-green-600 mt-1">✓ Foto cargada</p>}
                </div>
              </div>
              <input type="text" value={newBeforeAfter?.label}
                onChange={e => setNewBeforeAfter(p => ({ ...p, label: e?.target?.value }))}
                placeholder="Etiqueta (ej: Corte de cabello, Remodelación baño)" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={addBeforeAfter}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Icon name="Plus" size={16} /> Agregar par
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Producto/Servicio destacado */}
      {activeSection === 'featured' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Producto / Servicio destacado</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Slot rotativo diario/semanal: foto + nombre + precio del producto estrella o servicio del momento.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre del producto/servicio</label>
                  <input type="text" value={featuredProduct?.name}
                    onChange={e => onChange('featuredProduct', { ...featuredProduct, name: e?.target?.value })}
                    placeholder="Ej: Café de especialidad" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input type="number" value={featuredProduct?.price}
                      onChange={e => onChange('featuredProduct', { ...featuredProduct, price: e?.target?.value })}
                      placeholder="0.00" className="w-full pl-7 pr-16 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">MXN</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descripción breve</label>
                <textarea rows={2} maxLength={150} value={featuredProduct?.description}
                  onChange={e => onChange('featuredProduct', { ...featuredProduct, description: e?.target?.value })}
                  placeholder="Describe brevemente este producto o servicio..." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Foto del destacado</label>
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                  {featuredProduct?.photo ? (
                    <div className="text-center">
                      <Icon name="CheckCircle" size={24} className="text-green-500 mx-auto mb-1" />
                      <p className="text-xs text-green-600">{featuredProduct?.photo?.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icon name="ImagePlus" size={24} className="text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Subir foto del producto</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedPhotoUpload} />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rotación del destacado</label>
                <div className="flex gap-3">
                  {[
                    { value: 'daily', label: 'Diario' },
                    { value: 'weekly', label: 'Semanal' },
                    { value: 'manual', label: 'Manual' },
                  ]?.map(opt => (
                    <button key={opt?.value}
                      onClick={() => onChange('featuredProduct', { ...featuredProduct, rotationType: opt?.value })}
                      className={`flex-1 py-2 text-sm font-medium border rounded-lg transition-colors ${
                        featuredProduct?.rotationType === opt?.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                      }`}>
                      {opt?.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimoniales en video */}
      {activeSection === 'testimonials' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="text-base font-semibold text-foreground">Testimoniales en video</h3>
              </div>
              {videoTestimonials?.length < 5 && (
                <button onClick={addVideoTestimonial}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                  <Icon name="Plus" size={14} /> Agregar video
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">Video corto (30s) de un cliente real hablando de su experiencia. Social proof en video. Máx. 5 videos.</p>
            {videoTestimonials?.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Icon name="Video" size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Sin testimoniales en video</p>
                <p className="text-xs text-muted-foreground mb-3">Los videos de clientes reales generan hasta 3× más confianza que texto</p>
                <button onClick={addVideoTestimonial}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                  + Agregar primer testimonial
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {videoTestimonials?.map(t => (
                  <div key={t?.id} className="flex items-center gap-3 p-4 border border-border rounded-xl">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon name="Play" size={20} className="text-red-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <input type="text" value={t?.customerName}
                        onChange={e => updateTestimonial(t?.id, 'customerName', e?.target?.value)}
                        placeholder="Nombre del cliente" className="w-full px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none" />
                      <p className="text-xs text-muted-foreground truncate">{t?.url}</p>
                    </div>
                    <select value={t?.duration} onChange={e => updateTestimonial(t?.id, 'duration', e?.target?.value)}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none">
                      <option value="15s">15s</option>
                      <option value="30s">30s</option>
                      <option value="60s">60s</option>
                    </select>
                    <button onClick={() => removeTestimonial(t?.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <Icon name="Trash2" size={14} />
                    </button>
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

export default AdvancedMediaForm;
