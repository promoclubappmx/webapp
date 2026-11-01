import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

// ─── Image Crop Editor Component ────────────────────────────────────────────
const ImageCropEditor = ({ imageSrc, onConfirm, onCancel, title = 'Ajustar imagen' }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef(null);

  const PREVIEW_SIZE = 280;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img?.naturalWidth, h: img?.naturalHeight });
      const fitScale = Math.max(PREVIEW_SIZE / img?.naturalWidth, PREVIEW_SIZE / img?.naturalHeight);
      setScale(fitScale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    drawCanvas();
  }, [scale, offset, imgSize]);

  const drawCanvas = () => {
    const canvas = canvasRef?.current;
    if (!canvas || !imgRef?.current) return;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    const tileSize = 10;
    for (let row = 0; row < PREVIEW_SIZE / tileSize; row++) {
      for (let col = 0; col < PREVIEW_SIZE / tileSize; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? '#f0f0f0' : '#d0d0d0';
        ctx?.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
    const drawW = imgRef?.current?.naturalWidth * scale;
    const drawH = imgRef?.current?.naturalHeight * scale;
    const drawX = (PREVIEW_SIZE - drawW) / 2 + offset?.x;
    const drawY = (PREVIEW_SIZE - drawH) / 2 + offset?.y;
    ctx?.drawImage(imgRef?.current, drawX, drawY, drawW, drawH);
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 2;
    ctx?.strokeRect(1, 1, PREVIEW_SIZE - 2, PREVIEW_SIZE - 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx?.beginPath(); ctx?.moveTo((PREVIEW_SIZE / 3) * i, 0); ctx?.lineTo((PREVIEW_SIZE / 3) * i, PREVIEW_SIZE); ctx?.stroke();
      ctx?.beginPath(); ctx?.moveTo(0, (PREVIEW_SIZE / 3) * i); ctx?.lineTo(PREVIEW_SIZE, (PREVIEW_SIZE / 3) * i); ctx?.stroke();
    }
  };

  const handleMouseDown = (e) => { setDragging(true); setDragStart({ x: e?.clientX - offset?.x, y: e?.clientY - offset?.y }); };
  const handleMouseMove = (e) => { if (!dragging) return; setOffset({ x: e?.clientX - dragStart?.x, y: e?.clientY - dragStart?.y }); };
  const handleMouseUp = () => setDragging(false);
  const handleTouchStart = (e) => { const t = e?.touches?.[0]; setDragging(true); setDragStart({ x: t?.clientX - offset?.x, y: t?.clientY - offset?.y }); };
  const handleTouchMove = (e) => { if (!dragging) return; const t = e?.touches?.[0]; setOffset({ x: t?.clientX - dragStart?.x, y: t?.clientY - dragStart?.y }); };

  const handleConfirm = () => {
    if (!imgRef?.current) return;
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = 512; outputCanvas.height = 512;
    const ctx = outputCanvas?.getContext('2d');
    const ratio = 512 / PREVIEW_SIZE;
    const drawW = imgRef?.current?.naturalWidth * scale * ratio;
    const drawH = imgRef?.current?.naturalHeight * scale * ratio;
    const drawX = (512 - drawW) / 2 + offset?.x * ratio;
    const drawY = (512 - drawH) / 2 + offset?.y * ratio;
    ctx?.drawImage(imgRef?.current, drawX, drawY, drawW, drawH);
    onConfirm(outputCanvas?.toDataURL('image/jpeg', 0.85));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon name="Crop" size={20} className="text-primary" />
            {title}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors"><Icon name="X" size={20} /></button>
        </div>
        <p className="text-xs text-gray-500 mb-3">Arrastra para reposicionar · Usa el deslizador para ajustar el tamaño</p>
        <div className="flex justify-center mb-4">
          <div ref={containerRef} className="relative overflow-hidden rounded-lg border-2 border-primary/40 cursor-move select-none"
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
            <canvas ref={canvasRef} width={PREVIEW_SIZE} height={PREVIEW_SIZE} style={{ display: 'block' }} />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <Icon name="ZoomOut" size={16} className="text-gray-400 flex-shrink-0" />
          <input type="range" min={0.1} max={3} step={0.05} value={scale} onChange={(e) => setScale(parseFloat(e?.target?.value))} className="flex-1 accent-primary" />
          <Icon name="ZoomIn" size={16} className="text-gray-400 flex-shrink-0" />
        </div>
        <p className="text-xs text-center text-gray-400 mb-4">La imagen se guardará como 512×512 px · JPG comprimido</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="button" onClick={handleConfirm} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">Usar esta imagen</button>
        </div>
      </div>
    </div>
  );
};

const MediaGalleryForm = ({ formData, onChange, errors }) => {
  const businessImageRef = useRef(null);
  const coverRef = useRef(null);
  const galleryRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);

  const businessImage = formData?.logo || null;
  const cover = formData?.cover || null;
  const gallery = formData?.gallery || [];

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_MB = 5;

  const validateFile = (file) => {
    if (!ALLOWED_TYPES?.includes(file?.type)) return 'Formato no permitido. Usa JPG, PNG o WEBP.';
    if (file?.size > MAX_FILE_MB * 1024 * 1024) return `El archivo no debe superar ${MAX_FILE_MB}MB.`;
    return null;
  };

  const handleBusinessImageSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { alert(err); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev?.target?.result);
    reader?.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = (croppedDataURL) => {
    setCropSrc(null);
    // Convert dataURL to File object for upload
    fetch(croppedDataURL)?.then(r => r?.blob())?.then(blob => {
        const file = new File([blob], 'imagen-negocio.jpg', { type: 'image/jpeg' });
        onChange('logo', { url: croppedDataURL, file, name: 'imagen-negocio.jpg' });
      });
  };

  const handleCoverUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { alert(err); return; }
    const url = URL.createObjectURL(file);
    onChange('cover', { url, file, name: file?.name });
  };

  const handleGalleryUpload = (files) => {
    const newItems = Array.from(files)?.map((file, i) => ({
      id: Date.now() + i,
      url: URL.createObjectURL(file),
      file,
      caption: '',
      alt: file?.name
    }));
    onChange('gallery', [...gallery, ...newItems]?.slice(0, 20));
  };

  const removeGalleryItem = (id) => onChange('gallery', gallery?.filter(g => g?.id !== id));

  const updateCaption = (id, caption) => {
    onChange('gallery', gallery?.map(g => g?.id === id ? { ...g, caption } : g));
  };

  const handleDragStart = (idx) => setDraggedIdx(idx);
  const handleDrop = (idx) => {
    if (draggedIdx === null || draggedIdx === idx) return;
    const updated = [...gallery];
    const [item] = updated?.splice(draggedIdx, 1);
    updated?.splice(idx, 0, item);
    onChange('gallery', updated);
    setDraggedIdx(null);
  };

  const photoCount = gallery?.length;
  const completionMsg = photoCount === 0
    ? { color: 'text-destructive', text: 'Sin fotos — Agrega al menos una foto para publicar tu ficha.' }
    : photoCount < 5
    ? { color: 'text-amber-600', text: `${photoCount} de 20 fotos. Los negocios con 5+ fotos reciben 2.8× más visitas.` }
    : { color: 'text-green-600', text: `${photoCount} de 20 fotos. ¡Excelente! Tu galería está bien completa.` };

  return (
    <div className="space-y-8">
      {/* Crop Editor Modal */}
      {cropSrc && (
        <ImageCropEditor
          imageSrc={cropSrc}
          title="Ajustar imagen del negocio"
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Imagen del negocio (formerly Logo) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Imagen del negocio</h3>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex-shrink-0">
              {businessImage ? (
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-md">
                    <Image src={businessImage?.url} alt="Imagen del negocio" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => onChange('logo', null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-white border-2 border-dashed border-violet-300 flex items-center justify-center">
                  <Icon name="Image" size={32} className="text-violet-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Icon name="Image" size={16} className="text-violet-600" />
                Imagen principal del negocio
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Esta imagen representa tu negocio en el mapa, búsquedas y perfil público.
              </p>
              <input ref={businessImageRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleBusinessImageSelect} />
              {!businessImage ? (
                <button
                  type="button"
                  onClick={() => businessImageRef?.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Icon name="Upload" size={16} />
                  Subir imagen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => businessImageRef?.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-violet-300 text-violet-700 text-sm font-semibold rounded-lg hover:bg-violet-50 transition-colors"
                >
                  <Icon name="Crop" size={16} />
                  Cambiar y ajustar
                </button>
              )}
              <p className="text-xs text-gray-500 mt-2">JPG, PNG o WEBP · Máx. 5MB · Se guardará como 512×512 px</p>
              {businessImage && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-lg">
                      <Image src={businessImage?.url} alt="Preview pin" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">Así se verá en el mapa</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Foto de portada */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Foto de portada</h3>
          <span className="text-xs text-muted-foreground">(solo una)</span>
        </div>
        <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} className="hidden" />
        {cover ? (
          <div className="relative group rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: '300px' }}>
            <Image src={cover?.url} alt="Portada del negocio" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button onClick={() => coverRef?.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white text-foreground text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                <Icon name="RefreshCw" size={16} /> Cambiar
              </button>
              <button onClick={() => onChange('cover', null)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-destructive text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                <Icon name="Trash2" size={16} /> Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => coverRef?.current?.click()}
            className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
            style={{ aspectRatio: '16/9', maxHeight: '300px' }}
          >
            <Icon name="ImagePlus" size={40} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Subir foto de portada</p>
            <p className="text-xs text-muted-foreground">16:9 — Mín. 800×450px — Recomendado: 1200×675px</p>
            <p className="text-xs text-muted-foreground mt-1">Usa tu mejor foto: plato estrella, fachada o ambiente interior</p>
          </div>
        )}
      </div>

      {/* Galería */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-base font-semibold text-foreground">Galería</h3>
            <span className="text-xs text-muted-foreground">(múltiples fotos)</span>
          </div>
          <span className={`text-xs font-medium ${completionMsg?.color}`}>{completionMsg?.text}</span>
        </div>

        <input ref={galleryRef} type="file" multiple accept="image/jpeg,image/png,image/webp"
          onChange={e => handleGalleryUpload(e?.target?.files)} className="hidden" />

        <div
          onDragOver={e => { e?.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e?.preventDefault(); setDragOver(false); handleGalleryUpload(e?.dataTransfer?.files); }}
          className={`border-2 border-dashed rounded-xl p-4 transition-all ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          {gallery?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {gallery?.map((item, idx) => (
                <div key={item?.id} draggable onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => e?.preventDefault()} onDrop={() => handleDrop(idx)}
                  className="group relative cursor-move">
                  <div className="aspect-square rounded-lg overflow-hidden border border-border">
                    <Image src={item?.url} alt={item?.alt || 'Foto del negocio'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  </div>
                  <button onClick={() => removeGalleryItem(item?.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="X" size={12} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Principal</span>
                  )}
                  <input type="text" maxLength={80} value={item?.caption || ''}
                    onChange={e => updateCaption(item?.id, e?.target?.value)}
                    placeholder="Caption (opcional)"
                    className="w-full mt-1 px-2 py-1 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              ))}
              {gallery?.length < 20 && (
                <button onClick={() => galleryRef?.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer">
                  <Icon name="Plus" size={24} className="text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Agregar</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Images" size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Arrastra fotos aquí o haz clic para subir</p>
              <p className="text-xs text-muted-foreground mb-3">JPG, PNG, WebP — Mín. 600×400px — Máx. 20 fotos</p>
              <button onClick={() => galleryRef?.current?.click()}
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                Seleccionar fotos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaGalleryForm;