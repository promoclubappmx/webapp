import React, { useState, useRef, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import useCategorias from '../../../hooks/useCategorias';
import { supabase } from '../../../lib/supabase';

const MAX_OUTPUT_SIZE = 512;
const MAX_FILE_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Image Crop Editor Component ────────────────────────────────────────────
const LogoCropEditor = ({ imageSrc, onConfirm, onCancel }) => {
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

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx?.strokeRect(1, 1, PREVIEW_SIZE - 2, PREVIEW_SIZE - 2);

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx?.beginPath();
      ctx?.moveTo((PREVIEW_SIZE / 3) * i, 0);
      ctx?.lineTo((PREVIEW_SIZE / 3) * i, PREVIEW_SIZE);
      ctx?.stroke();
      ctx?.beginPath();
      ctx?.moveTo(0, (PREVIEW_SIZE / 3) * i);
      ctx?.lineTo(PREVIEW_SIZE, (PREVIEW_SIZE / 3) * i);
      ctx?.stroke();
    }
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e?.clientX - offset?.x, y: e?.clientY - offset?.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e?.clientX - dragStart?.x, y: e?.clientY - dragStart?.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e) => {
    const touch = e?.touches?.[0];
    setDragging(true);
    setDragStart({ x: touch?.clientX - offset?.x, y: touch?.clientY - offset?.y });
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;
    const touch = e?.touches?.[0];
    setOffset({ x: touch?.clientX - dragStart?.x, y: touch?.clientY - dragStart?.y });
  };

  const handleConfirm = () => {
    if (!imgRef?.current) return;
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = MAX_OUTPUT_SIZE;
    outputCanvas.height = MAX_OUTPUT_SIZE;
    const ctx = outputCanvas?.getContext('2d');

    const ratio = MAX_OUTPUT_SIZE / PREVIEW_SIZE;
    const drawW = imgRef?.current?.naturalWidth * scale * ratio;
    const drawH = imgRef?.current?.naturalHeight * scale * ratio;
    const drawX = (MAX_OUTPUT_SIZE - drawW) / 2 + offset?.x * ratio;
    const drawY = (MAX_OUTPUT_SIZE - drawH) / 2 + offset?.y * ratio;

    ctx?.drawImage(imgRef?.current, drawX, drawY, drawW, drawH);
    const dataURL = outputCanvas?.toDataURL('image/jpeg', 0.85);
    onConfirm(dataURL);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon name="Crop" size={20} className="text-blue-600" />
            Ajustar Logo
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          Arrastra para reposicionar · Usa el deslizador para ajustar el tamaño
        </p>

        <div className="flex justify-center mb-4">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg border-2 border-blue-300 cursor-move select-none"
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              style={{ display: 'block' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <Icon name="ZoomOut" size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(parseFloat(e?.target?.value))}
            className="flex-1 accent-blue-600"
          />
          <Icon name="ZoomIn" size={16} className="text-gray-400 flex-shrink-0" />
        </div>

        <p className="text-xs text-center text-gray-400 mb-4">
          La imagen se guardará como 512×512 px · JPG comprimido
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Usar esta imagen
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Category icons map ──────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  'Bares y vida nocturna': 'Wine',
  'Belleza y cuidado personal': 'Sparkles',
  'Compras y retail': 'ShoppingBag',
  'Deporte y fitness': 'Dumbbell',
  'Educación': 'GraduationCap',
  'Entretenimiento': 'Film',
  'Mascotas': 'PawPrint',
  'Restaurantes y comida': 'UtensilsCrossed',
  'Salud y medicina': 'Heart',
  'Servicios automotrices': 'Car',
  'Servicios generales': 'Wrench',
  'Servicios profesionales': 'Briefcase',
  'Turismo y hospedaje': 'MapPin',
};

// ─── Category Info Box ───────────────────────────────────────────────────────
const CategoryInfoBox = ({ categoriaId, categoriaNombre }) => {
  const { subcategorias, loadingSubcategorias } = useCategorias(categoriaId, null);
  const [allTipos, setAllTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  useEffect(() => {
    if (!categoriaId) {
      setAllTipos([]);
      return;
    }
    const fetchAllTipos = async () => {
      setLoadingTipos(true);
      try {
        const { data, error } = await supabase?.from('business_establishment_types')?.select('id, nombre, subcategoria_id, business_subcategories!inner(categoria_id)')?.eq('business_subcategories.categoria_id', categoriaId)?.order('nombre', { ascending: true });
        if (!error) setAllTipos(data || []);
      } catch {
        setAllTipos([]);
      } finally {
        setLoadingTipos(false);
      }
    };
    fetchAllTipos();
  }, [categoriaId]);

  if (!categoriaId) return null;

  const isLoading = loadingSubcategorias || loadingTipos;

  return (
    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0" />
        <span className="text-sm font-semibold text-blue-800">Información de la categoría</span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-blue-600 text-sm py-1">
          <div className="animate-spin"><Icon name="Loader" size={14} /></div>
          <span>Cargando información...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Category type */}
          <div className="flex items-start gap-2">
            <Icon name="Tag" size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Tipo de categoría</span>
              <p className="text-sm text-blue-900 font-medium">{categoriaNombre}</p>
            </div>
          </div>

          {/* Subcategories */}
          {subcategorias?.length > 0 && (
            <div className="flex items-start gap-2">
              <Icon name="Layers" size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Subcategorías</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subcategorias?.map(sub => (
                    <span
                      key={sub?.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                    >
                      {sub?.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Establishment types */}
          {allTipos?.length > 0 && (
            <div className="flex items-start gap-2">
              <Icon name="Store" size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Tipos de establecimiento</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {allTipos?.map(tipo => (
                    <span
                      key={tipo?.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                    >
                      {tipo?.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {subcategorias?.length === 0 && allTipos?.length === 0 && (
            <p className="text-xs text-blue-600 italic">No hay subcategorías ni tipos de establecimiento registrados para esta categoría.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Step4 Component ────────────────────────────────────────────────────
const Step4BusinessData = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(formData?.logoNegocio || null);
  const [cropSrc, setCropSrc] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  const fileInputRef = useRef(null);

  const { categorias, loadingCategorias } = useCategorias(null, null);

  const filteredCategorias = categorias?.filter(c =>
    c?.nombre?.toLowerCase()?.includes(categorySearch?.toLowerCase())
  );

  const handleCategoriaSelect = (cat) => {
    updateFormData({ categoria_id: cat?.id, categoria_nombre: cat?.nombre });
    setErrors(prev => ({ ...prev, categoria_id: '' }));
  };

  const handlePhoneChange = (value) => {
    const digits = value?.replace(/\D/g, '')?.slice(0, 10);
    updateFormData({ contactPhone: digits });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.nombreComercial) {
      newErrors.nombreComercial = 'El nombre comercial es obligatorio';
    } else if (formData?.nombreComercial?.length < 3) {
      newErrors.nombreComercial = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData?.nombreComercial?.length > 100) {
      newErrors.nombreComercial = 'El nombre no puede exceder 100 caracteres';
    }

    if (!formData?.categoria_id) {
      newErrors.categoria_id = 'Selecciona una categoría para continuar';
    }

    if (!formData?.contactPhone) {
      newErrors.contactPhone = 'El teléfono principal es obligatorio';
    } else if (formData?.contactPhone?.replace(/\D/g, '')?.length !== 10) {
      newErrors.contactPhone = 'El teléfono debe tener 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES?.includes(file?.type)) {
      setErrors(prev => ({ ...prev, logoNegocio: 'Formato no permitido. Usa JPG, PNG o WEBP.' }));
      return;
    }

    if (file?.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logoNegocio: `El archivo no debe superar ${MAX_FILE_MB}MB.` }));
      return;
    }

    setErrors(prev => ({ ...prev, logoNegocio: '' }));

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropSrc(ev?.target?.result);
    };
    reader?.readAsDataURL(file);

    e.target.value = '';
  };

  const handleCropConfirm = (croppedDataURL) => {
    setCropSrc(null);
    setLogoPreview(croppedDataURL);
    updateFormData({ logoNegocio: croppedDataURL, logoFileName: 'logo.jpg' });
  };

  const handleCropCancel = () => {
    setCropSrc(null);
  };

  const handleLogoRemove = () => {
    setLogoPreview(null);
    updateFormData({ logoNegocio: null, logoFileName: null });
    setErrors(prev => ({ ...prev, logoNegocio: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Crop Editor Modal */}
      {cropSrc && (
        <LogoCropEditor
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Datos del Negocio</h3>
        <p className="text-gray-600">
          Información que aparecerá en tu perfil público
        </p>
      </div>
      {/* Logo Upload */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-md"
                />
                <button
                  type="button"
                  onClick={handleLogoRemove}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-white border-2 border-dashed border-blue-300 flex items-center justify-center">
                <Icon name="Image" size={32} className="text-blue-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-gray-900 mb-2 flex items-center">
              <Icon name="Image" size={18} className="mr-2 text-blue-600" />
              Logotipo del Negocio
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Sube el logo de tu negocio para personalizar tu perfil
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileSelect}
            />
            {!logoPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef?.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Icon name="Upload" size={16} />
                Subir Logo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef?.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-300 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Icon name="Crop" size={16} />
                Cambiar y ajustar
              </button>
            )}
            <p className="text-xs text-gray-500 mt-2">JPG, PNG o WEBP · Máx. 2MB · Se guardará como 512×512 px</p>
            {errors?.logoNegocio && (
              <p className="text-sm text-red-600 font-medium mt-1 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors?.logoNegocio}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Nombre Comercial */}
      <Input
        label="Nombre Comercial"
        type="text"
        placeholder=""
        value={formData?.nombreComercial || ''}
        onChange={(e) => updateFormData({ nombreComercial: e?.target?.value })}
        error={errors?.nombreComercial}
        required
      />
      {/* Categoría Section - Solo categoría principal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-600 rounded-full" />
          <h4 className="text-base font-semibold text-gray-900">Categoría</h4>
        </div>
        <p className="text-sm text-gray-500">
          Clasifica tu negocio para que los clientes te encuentren fácilmente.
        </p>

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e?.target?.value)}
            placeholder="Buscar categoría..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          />
        </div>

        {/* Category Grid */}
        {loadingCategorias ? (
          <div className="flex items-center justify-center py-8 text-blue-600">
            <div className="animate-spin mr-2"><Icon name="Loader" size={20} /></div>
            <span className="text-sm">Cargando categorías...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-xl bg-white">
            {filteredCategorias?.map((cat) => {
              const isSelected = formData?.categoria_id === cat?.id;
              const iconName = CATEGORY_ICONS?.[cat?.nombre] || 'Tag';
              return (
                <button
                  key={cat?.id}
                  type="button"
                  onClick={() => handleCategoriaSelect(cat)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-xs font-medium gap-2 min-h-[80px] ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700' :'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon
                      name={iconName}
                      size={18}
                      className={isSelected ? 'text-blue-600' : 'text-gray-500'}
                    />
                  </div>
                  <span className="text-center leading-tight">{cat?.nombre}</span>
                </button>
              );
            })}
          </div>
        )}

        {errors?.categoria_id && (
          <p className="text-sm text-red-600 font-medium flex items-center gap-1">
            <Icon name="AlertCircle" size={14} />
            {errors?.categoria_id}
          </p>
        )}

        {formData?.categoria_id && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Check" size={12} className="text-white" />
            </div>
            <p className="text-sm text-green-700 font-medium">
              Categoría seleccionada: <strong>{formData?.categoria_nombre}</strong>
            </p>
          </div>
        )}

        {/* Category Info Box */}
        <CategoryInfoBox
          categoriaId={formData?.categoria_id}
          categoriaNombre={formData?.categoria_nombre}
        />
      </div>
      {/* Contacto Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-600 rounded-full" />
          <h4 className="text-base font-semibold text-gray-900">Contacto</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Teléfono principal */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Teléfono <span className="text-xs text-gray-500 font-normal">(recomendado)</span> <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-base">🇲🇽</span>
              </div>
              <input
                type="tel"
                value={formData?.contactPhone || ''}
                onChange={(e) => handlePhoneChange(e?.target?.value)}
                placeholder="10 dígitos"
                maxLength={10}
                className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all ${
                  errors?.contactPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors?.contactPhone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <Icon name="AlertCircle" size={13} />{errors?.contactPhone}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Este teléfono es visible para los usuarios de PromoClub.</p>
          </div>

          {/* Correo electrónico de contacto */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Email de contacto <span className="text-xs text-gray-500 font-normal">(opcional)</span>
            </label>
            <input
              type="email"
              value={formData?.contactEmail || ''}
              onChange={(e) => updateFormData({ contactEmail: e?.target?.value })}
              placeholder="contacto@minegocio.com"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
            />
          </div>
        </div>
      </div>
      <div className="flex space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
          className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
        >
          Atrás
        </Button>
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={handleNext}
          iconName="ArrowRight"
          iconPosition="right"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Step4BusinessData;