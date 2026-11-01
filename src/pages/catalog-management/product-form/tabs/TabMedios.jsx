import React, { useState, useRef, useCallback } from 'react';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const TabMedios = ({ formData, errors, touched, onChange, onBlur, isLoading }) => {
  const { user } = useAuth();
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dragOverMain, setDragOverMain] = useState(false);
  const [dragOverGallery, setDragOverGallery] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingAltIndex, setEditingAltIndex] = useState(null);
  const mainImageRef = useRef(null);
  const galleryRef = useRef(null);

  const uploadToSupabase = async (file, folder = 'products') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('catalog-media')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('catalog-media').getPublicUrl(fileName);
    return urlData?.publicUrl;
  };

  const handleMainImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingMain(true);
    try {
      const url = await uploadToSupabase(file, 'main');
      onChange('mainImage', url);
      onChange('mainImageAlt', formData?.name || '');
    } catch (err) {
      console.error('Error uploading main image:', err);
      // Fallback: use object URL for preview
      const localUrl = URL.createObjectURL(file);
      onChange('mainImage', localUrl);
    } finally {
      setUploadingMain(false);
    }
  };

  const handleMainDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOverMain(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleMainImageFile(file);
  }, [formData?.name]);

  const handleMainDragOver = (e) => { e.preventDefault(); setDragOverMain(true); };
  const handleMainDragLeave = () => setDragOverMain(false);

  const handleGalleryFiles = async (files) => {
    const currentCount = formData?.gallery?.length || 0;
    const remaining = 8 - currentCount;
    if (remaining <= 0) return;
    const filesToProcess = Array.from(files).slice(0, remaining).filter(f => f.type.startsWith('image/'));
    if (!filesToProcess.length) return;
    setUploadingGallery(true);
    try {
      const newImages = await Promise.all(
        filesToProcess.map(async (file) => {
          try {
            const url = await uploadToSupabase(file, 'gallery');
            return { url, alt: '' };
          } catch {
            return { url: URL.createObjectURL(file), alt: '' };
          }
        })
      );
      onChange('gallery', [...(formData?.gallery || []), ...newImages]);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOverGallery(false);
    await handleGalleryFiles(e.dataTransfer.files);
  }, [formData?.gallery]);

  const handleGalleryDragOver = (e) => { e.preventDefault(); setDragOverGallery(true); };
  const handleGalleryDragLeave = () => setDragOverGallery(false);

  // Drag-and-drop reorder gallery
  const handleGalleryItemDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleGalleryItemDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex === targetIndex) return;
    const newGallery = [...(formData?.gallery || [])];
    const [moved] = newGallery.splice(sourceIndex, 1);
    newGallery.splice(targetIndex, 0, moved);
    onChange('gallery', newGallery);
    setDragOverIndex(null);
  };

  const handleGalleryItemDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleGalleryItemDragLeave = () => setDragOverIndex(null);

  const removeGalleryImage = (index) => {
    const newGallery = formData?.gallery?.filter((_, i) => i !== index);
    onChange('gallery', newGallery);
  };

  const updateGalleryAlt = (index, alt) => {
    const newGallery = formData?.gallery?.map((img, i) => i === index ? { ...img, alt } : img);
    onChange('gallery', newGallery);
  };

  const isYoutubeOrVimeo = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'));
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Main Image */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Imagen principal *
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Formato 1:1 recomendado, mínimo 800×800px. JPG, PNG o WebP.
        </p>
        <div
          onDrop={handleMainDrop}
          onDragOver={handleMainDragOver}
          onDragLeave={handleMainDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            dragOverMain ? 'border-primary bg-primary/5' : touched?.mainImage && errors?.mainImage ?'border-red-400 bg-red-50': 'border-border hover:border-primary/50'
          }`}
        >
          {uploadingMain ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Icon name="Loader2" size={36} className="text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
            </div>
          ) : formData?.mainImage ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative inline-block">
                <img
                  src={formData?.mainImage}
                  alt={formData?.mainImageAlt || 'Imagen principal'}
                  className="w-48 h-48 object-cover rounded-xl border border-border shadow"
                />
                <button
                  type="button"
                  onClick={() => { onChange('mainImage', null); onChange('mainImageAlt', ''); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
              <div className="w-full max-w-sm">
                <label className="block text-xs font-medium text-foreground mb-1">
                  Texto alternativo (Alt text) — SEO y accesibilidad
                </label>
                <input
                  type="text"
                  value={formData?.mainImageAlt || ''}
                  onChange={(e) => onChange('mainImageAlt', e.target.value)}
                  placeholder="Ej: Paella valenciana con mariscos frescos"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => mainImageRef.current?.click()}
                className="text-sm text-primary hover:underline"
              >
                Cambiar imagen
              </button>
            </div>
          ) : (
            <div className="py-6">
              <Icon name="ImagePlus" size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">Arrastra una imagen aquí</p>
              <p className="text-xs text-muted-foreground mb-4">o haz clic para seleccionar desde tu dispositivo</p>
              <Button
                size="sm"
                variant="outline"
                iconName="Upload"
                iconPosition="left"
                onClick={() => mainImageRef.current?.click()}
              >
                Seleccionar Imagen
              </Button>
            </div>
          )}
        </div>
        <input
          ref={mainImageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleMainImageFile(e.target.files[0]); }}
        />
        {touched?.mainImage && errors?.mainImage && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <Icon name="AlertCircle" size={12} />{errors?.mainImage}
          </p>
        )}
      </div>

      {/* Gallery */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Galería de imágenes
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Hasta 8 imágenes. Arrastra para reordenar. Agrega alt text a cada imagen para SEO y accesibilidad.
        </p>

        {/* Gallery drop zone */}
        <div
          onDrop={handleGalleryDrop}
          onDragOver={handleGalleryDragOver}
          onDragLeave={handleGalleryDragLeave}
          className={`border-2 border-dashed rounded-xl p-4 mb-4 transition-colors ${
            dragOverGallery ? 'border-primary bg-primary/5' : 'border-border'
          } ${(formData?.gallery?.length || 0) >= 8 ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="flex items-center justify-center gap-3 py-3">
            {uploadingGallery ? (
              <>
                <Icon name="Loader2" size={20} className="text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Subiendo imágenes...</span>
              </>
            ) : (
              <>
                <Icon name="Images" size={20} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {(formData?.gallery?.length || 0) >= 8
                    ? 'Límite de 8 imágenes alcanzado'
                    : `Arrastra imágenes aquí o `}
                </span>
                {(formData?.gallery?.length || 0) < 8 && (
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    selecciona archivos
                  </button>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formData?.gallery?.length || 0}/8
                </span>
              </>
            )}
          </div>
        </div>
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) handleGalleryFiles(e.target.files); }}
        />

        {/* Gallery grid */}
        {formData?.gallery?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData?.gallery?.map((image, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleGalleryItemDragStart(e, index)}
                onDrop={(e) => handleGalleryItemDrop(e, index)}
                onDragOver={(e) => handleGalleryItemDragOver(e, index)}
                onDragLeave={handleGalleryItemDragLeave}
                className={`relative group rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing ${
                  dragOverIndex === index ? 'border-primary bg-primary/5 scale-105' : 'border-border'
                }`}
              >
                <img
                  src={image?.url}
                  alt={image?.alt || `Imagen ${index + 1}`}
                  className="w-full h-28 object-cover rounded-lg"
                />
                {/* Drag handle indicator */}
                <div className="absolute top-1 left-1 bg-black/40 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="GripVertical" size={12} />
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="X" size={12} />
                </button>
                {/* Position badge */}
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs rounded px-1.5 py-0.5">
                  {index + 1}
                </div>
                {/* Alt text edit */}
                {editingAltIndex === index ? (
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 rounded-b-lg p-2">
                    <input
                      type="text"
                      value={image?.alt || ''}
                      onChange={(e) => updateGalleryAlt(index, e.target.value)}
                      onBlur={() => setEditingAltIndex(null)}
                      autoFocus
                      placeholder="Alt text..."
                      className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingAltIndex(index)}
                    className="absolute bottom-1 right-1 bg-black/50 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Editar alt text"
                  >
                    <Icon name="Pencil" size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {formData?.gallery?.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Icon name="Info" size={12} />
            Pasa el cursor sobre una imagen para editar su alt text o eliminarla. Arrastra para reordenar.
          </p>
        )}
      </div>

      {/* Video */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Video del {formData?.productOrService === 'service' ? 'servicio' : 'producto'}
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Pega una URL de YouTube o Vimeo para mostrar un video en la ficha del {formData?.productOrService === 'service' ? 'servicio' : 'producto'}.
        </p>
        <input
          type="url"
          value={formData?.videoUrl || ''}
          onChange={(e) => onChange('videoUrl', e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
        />
        {formData?.videoUrl && isYoutubeOrVimeo(formData?.videoUrl) && (
          <div className="mt-3 rounded-xl overflow-hidden border border-border aspect-video">
            <iframe
              src={getEmbedUrl(formData?.videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`Video del ${formData?.productOrService === 'service' ? 'servicio' : 'producto'}`}
            />
          </div>
        )}
        {formData?.videoUrl && !isYoutubeOrVimeo(formData?.videoUrl) && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <Icon name="AlertTriangle" size={12} />
            Solo se admiten URLs de YouTube o Vimeo
          </p>
        )}
      </div>
    </div>
  );
};

export default TabMedios;