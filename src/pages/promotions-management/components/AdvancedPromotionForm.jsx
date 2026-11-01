import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CatalogItemSelector from '../../../components/ui/CatalogItemSelector';
import { supabase } from '../../../lib/supabase';

const PROMO_TYPES = [
  { value: 'standard', label: 'Estándar', icon: 'Tag', color: 'bg-blue-100 text-blue-700', borderColor: 'border-blue-300', description: 'Descuento general configurable', plan: 'PRO' },
  { value: 'flash_deal', label: 'Flash Deal', icon: 'Zap', color: 'bg-red-100 text-red-700', borderColor: 'border-red-300', description: '30-60 min con push a cercanos', plan: 'PRO' },
  { value: 'happy_hour', label: 'Happy Hour', icon: 'Clock', color: 'bg-amber-100 text-amber-700', borderColor: 'border-amber-300', description: 'Horarios recurrentes automáticos', plan: 'PRO' },
  { value: 'limited_drop', label: 'Drop Limitado', icon: 'Flame', color: 'bg-purple-100 text-purple-700', borderColor: 'border-purple-300', description: 'Cantidad + ventana de tiempo', plan: 'PRO' },
  { value: 'birthday', label: 'Cumpleaños', icon: 'Cake', color: 'bg-pink-100 text-pink-700', borderColor: 'border-pink-300', description: 'Automática para clientes en su mes', plan: 'PRO' },
  { value: 'first_visit', label: 'Primera Visita', icon: 'Star', color: 'bg-green-100 text-green-700', borderColor: 'border-green-300', description: 'Incentivo para nuevos visitantes', plan: 'PRO' },
  { value: 'weather', label: 'Por Clima', icon: 'Cloud', color: 'bg-cyan-100 text-cyan-700', borderColor: 'border-cyan-300', description: 'Trigger automático por clima', plan: 'PREMIUM' },
  { value: 'inverse_demand', label: 'Demanda Inversa', icon: 'TrendingDown', color: 'bg-orange-100 text-orange-700', borderColor: 'border-orange-300', description: 'Activa con baja afluencia', plan: 'PREMIUM' },
  { value: 'advent', label: 'Calendario Adviento', icon: 'Gift', color: 'bg-yellow-100 text-yellow-700', borderColor: 'border-yellow-300', description: '12, 24 o 31 días de ofertas', plan: 'PREMIUM' },
  { value: 'vip_access', label: 'Acceso VIP', icon: 'Crown', color: 'bg-gray-900 text-yellow-400', borderColor: 'border-yellow-400', description: 'Acceso anticipado para VIPs', plan: 'PREMIUM' }
];

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Porcentaje (%)' },
  { value: 'fixed', label: 'Monto fijo ($)' },
  { value: '2x1', label: '2x1' },
  { value: '3x2', label: '3x2' },
  { value: 'free_product', label: 'Producto gratis' },
  { value: 'free_upgrade', label: 'Upgrade gratuito' },
  { value: 'special_price', label: 'Precio especial' }
];

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Todos los clientes' },
  { value: 'new', label: 'Clientes nuevos' },
  { value: 'returning', label: 'Clientes recurrentes' },
  { value: 'vip', label: 'Nivel VIP' },
  { value: 'crm_segment', label: 'Segmento CRM' }
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Pública' },
  { value: 'code_only', label: 'Solo código' },
  { value: 'geofence', label: 'Solo geofence' },
  { value: 'push_only', label: 'Solo push' }
];

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const WEATHER_CONDITIONS = [
  { value: 'rain', label: 'Lluvia' },
  { value: 'intense_sun', label: 'Sol intenso' },
  { value: 'cloudy', label: 'Nublado' },
  { value: 'cold', label: 'Frío (< 20°C)' },
  { value: 'hot', label: 'Calor (> 30°C)' },
  { value: 'wind', label: 'Viento fuerte' }
];

const VIP_LEVELS = [
  { value: 'bronze', label: 'Bronce' },
  { value: 'silver', label: 'Plata' },
  { value: 'gold', label: 'Oro' }
];

const AdvancedPromotionForm = ({ promotion, onSave, onCancel, isLoading }) => {
  const [step, setStep] = useState(promotion ? 2 : 1); // step 1: type selection, step 2: form
  const [selectedType, setSelectedType] = useState(promotion?.promoType || null);
  
  // Add this block - missing state declarations
  const [requireMinPurchase, setRequireMinPurchase] = useState(promotion?.requireMinPurchase || false);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(promotion?.minPurchaseAmount || '');
  
  const [form, setForm] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    imageUrl: promotion?.imageUrl || '',
    catalogItemIds: promotion?.catalogItemIds || [],
    imageSource: promotion?.imageSource || 'custom',
    discountType: promotion?.discountType || 'percentage',
    discountValue: promotion?.discountValue || 0,
    startDate: promotion?.startDate || '',
    endDate: promotion?.endDate || '',
    startTime: promotion?.startTime || '',
    endTime: promotion?.endTime || '',
    activeDays: promotion?.activeDays || [],
    totalLimit: promotion?.totalLimit || '',
    perUserLimit: promotion?.perUserLimit || 1,
    targetAudience: promotion?.targetAudience || 'all',
    visibility: promotion?.visibility || 'public',
    status: promotion?.status || 'draft',
    // Flash Deal
    flashDuration: promotion?.flashDuration || 30,
    pushRadius: promotion?.pushRadius || 1,
    pushMessage: promotion?.pushMessage || '',
    showCountdown: promotion?.showCountdown || true,
    // Happy Hour
    happyHourDays: promotion?.happyHourDays || [],
    autoActivate: promotion?.autoActivate || true,
    showNextHour: promotion?.showNextHour || true,
    reminderMinutes: promotion?.reminderMinutes || 30,
    // Limited Drop
    totalStock: promotion?.totalStock || 10,
    showStockCounter: promotion?.showStockCounter || true,
    lowStockThreshold: promotion?.lowStockThreshold || 5,
    releaseTime: promotion?.releaseTime || '',
    enableWaitlist: promotion?.enableWaitlist || false,
    // Birthday
    birthdayWindow: promotion?.birthdayWindow || 'week',
    birthdayMessage: promotion?.birthdayMessage || '',
    autoPush: promotion?.autoPush || true,
    requireId: promotion?.requireId || false,
    // First Visit
    welcomeMessage: promotion?.welcomeMessage || '',
    validDays: promotion?.validDays || 7,
    // Weather
    weatherCondition: promotion?.weatherCondition || 'rain',
    weatherMessage: promotion?.weatherMessage || '',
    deactivateOnChange: promotion?.deactivateOnChange || true,
    minActiveDuration: promotion?.minActiveDuration || 1,
    // Inverse Demand
    occupancyThreshold: promotion?.occupancyThreshold || 30,
    dataSource: promotion?.dataSource || 'checkins',
    inverseMessage: promotion?.inverseMessage || '',
    maxActivationsPerDay: promotion?.maxActivationsPerDay || 3,
    // Advent
    adventDays: promotion?.adventDays || 24,
    adventStartDate: promotion?.adventStartDate || '',
    dailyPush: promotion?.dailyPush || true,
    // VIP Access
    earlyAccessHours: promotion?.earlyAccessHours || 24,
    minVipLevel: promotion?.minVipLevel || 'bronze',
    vipExclusive: promotion?.vipExclusive || false,
    vipMessage: promotion?.vipMessage || ''
  });

  const [productImageUrl, setProductImageUrl] = useState(null);
  const [imageSource, setImageSource] = useState(promotion?.imageSource || 'custom');

  // Fetch first selected catalog item's image
  useEffect(() => {
    const fetchProductImage = async () => {
      if (form?.catalogItemIds?.length > 0) {
        try {
          const { data } = await supabase
            ?.from('catalog_items')
            ?.select('image_url, name')
            ?.eq('id', form?.catalogItemIds?.[0])
            ?.single();
          setProductImageUrl(data?.image_url || null);
        } catch {
          setProductImageUrl(null);
        }
      } else {
        setProductImageUrl(null);
        if (imageSource === 'product') setImageSource('custom');
      }
    };
    fetchProductImage();
  }, [form?.catalogItemIds]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      activeDays: prev?.activeDays?.includes(day)
        ? prev?.activeDays?.filter(d => d !== day)
        : [...(prev?.activeDays || []), day]
    }));
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleSubmit = (status) => {
    const typeConfig = PROMO_TYPES?.find(t => t?.value === selectedType);
    const finalImageUrl = imageSource === 'product' ? (productImageUrl || form?.imageUrl) : form?.imageUrl;
    onSave({ ...form, imageUrl: finalImageUrl, imageSource, promoType: selectedType, promoTypeLabel: typeConfig?.label, status, requireMinPurchase, minPurchaseAmount: requireMinPurchase ? minPurchaseAmount : '' });
  };

  const typeConfig = PROMO_TYPES?.find(t => t?.value === selectedType);

  if (step === 1) {
    return (
      <div className="bg-card rounded-xl shadow-xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Nueva Promoción</h2>
            <p className="text-sm text-muted-foreground">Selecciona el tipo de promoción</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-muted rounded-lg"><Icon name="X" size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-3">
            {PROMO_TYPES?.map(type => (
              <button
                key={type?.value}
                onClick={() => handleSelectType(type?.value)}
                className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  selectedType === type?.value ? `${type?.borderColor} shadow-md` : 'border-border hover:border-primary/40'
                }`}
              >
                {type?.plan === 'PREMIUM' && (
                  <span className="absolute top-2 right-2 text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded-full">PREMIUM</span>
                )}
                {type?.plan === 'PRO' && (
                  <span className="absolute top-2 right-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">PRO</span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${type?.color}`}>
                  <Icon name={type?.icon} size={20} />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-sm font-semibold text-foreground">{type?.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{type?.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-xl w-full max-w-3xl">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(1)} className="p-2 hover:bg-muted rounded-lg">
            <Icon name="ArrowLeft" size={18} className="text-muted-foreground" />
          </button>
          {typeConfig && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${typeConfig?.color}`}>
              <Icon name={typeConfig?.icon} size={18} />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">{typeConfig?.label || 'Promoción'}</h2>
            <p className="text-sm text-muted-foreground">{typeConfig?.description}</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-muted rounded-lg"><Icon name="X" size={20} /></button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[65vh] space-y-5">
        {/* Base Fields */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Título <span className="text-muted-foreground text-xs">(máx. 60 caracteres)</span></label>
            <input type="text" maxLength={60} value={form?.title} onChange={e => update('title', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              placeholder="Ej: Flash Deal de tarde - 40% OFF" />
            <p className="text-xs text-muted-foreground mt-0.5 text-right">{form?.title?.length}/60</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descripción <span className="text-muted-foreground text-xs">(máx. 300 caracteres)</span></label>
            <textarea rows={3} maxLength={300} value={form?.description} onChange={e => update('description', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none"
              placeholder="Describe tu promoción..." />
            <p className="text-xs text-muted-foreground mt-0.5 text-right">{form?.description?.length}/300</p>
          </div>

          {/* Catalog Item Selector */}
          <div>
            <CatalogItemSelector
              selectedItems={form?.catalogItemIds || []}
              onChange={(items) => update('catalogItemIds', items)}
              businessType="all"
              label="Producto/Servicio Promocionado"
              description="Vincula esta promoción con uno o más productos o servicios de tu catálogo"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Imagen de la promoción <span className="text-muted-foreground text-xs">(16:9 recomendado)</span></label>

            {/* Image source toggle - only when catalog items selected */}
            {form?.catalogItemIds?.length > 0 && (
              <div className="flex gap-2 p-1 bg-muted rounded-lg mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setImageSource('product');
                    if (productImageUrl) update('imageUrl', productImageUrl);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    imageSource === 'product' ?'bg-card shadow text-foreground' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="Package" size={15} />
                  Usar imagen del producto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageSource('custom');
                    update('imageUrl', '');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    imageSource === 'custom' ?'bg-card shadow text-foreground' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="Upload" size={15} />
                  Imagen personalizada
                </button>
              </div>
            )}

            {/* Product image preview */}
            {imageSource === 'product' && form?.catalogItemIds?.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden mb-2">
                {productImageUrl ? (
                  <div className="relative">
                    <img src={productImageUrl} alt="Imagen del producto" className="w-full h-40 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <Icon name="Package" size={12} />
                      Imagen del producto/servicio seleccionado
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center bg-muted/50 text-muted-foreground gap-2">
                    <Icon name="ImageOff" size={24} />
                    <p className="text-xs">El producto no tiene imagen</p>
                    <button type="button" onClick={() => setImageSource('custom')} className="text-xs text-primary underline">Subir imagen personalizada</button>
                  </div>
                )}
              </div>
            )}

            {/* Custom image input */}
            {(imageSource === 'custom' || form?.catalogItemIds?.length === 0) && (
              <div className="flex items-start gap-3">
                {form?.imageUrl ? (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                    <img src={form?.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => update('imageUrl', '')}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                    >
                      <Icon name="X" size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center flex-shrink-0 bg-muted/30">
                    <Icon name="ImagePlus" size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="url"
                    value={form?.imageUrl}
                    onChange={e => update('imageUrl', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm mb-2"
                    placeholder="https://... (URL de imagen)"
                  />
                  <p className="text-xs text-muted-foreground">Ingresa la URL de una imagen o sube una desde tu dispositivo.</p>
                  <label className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:underline">
                    <Icon name="Upload" size={12} />
                    Subir imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e?.target?.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => update('imageUrl', ev?.target?.result);
                          reader?.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discount Config */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tipo de descuento</label>
            <select value={form?.discountType} onChange={e => update('discountType', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm">
              {DISCOUNT_TYPES?.map(d => <option key={d?.value} value={d?.value}>{d?.label}</option>)}
            </select>
          </div>
          {['percentage', 'fixed', 'special_price']?.includes(form?.discountType) && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {form?.discountType === 'percentage' ? 'Porcentaje (%)' : 'Valor ($)'}
              </label>
              <input type="number" min="0" value={form?.discountValue} onChange={e => update('discountValue', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm" />
            </div>
          )}
        </div>

        {/* Minimum Purchase */}
        <div className="border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">¿Requiere monto mínimo de compra?</p>
              <p className="text-xs text-muted-foreground mt-0.5">El descuento solo aplica si el cliente supera este monto</p>
            </div>
            <button
              type="button"
              onClick={() => setRequireMinPurchase(prev => !prev)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                requireMinPurchase ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                requireMinPurchase ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          {requireMinPurchase && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Monto mínimo requerido</label>
              <div className="flex items-center gap-0">
                <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-lg text-sm font-medium text-muted-foreground">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPurchaseAmount}
                  onChange={e => setMinPurchaseAmount(e?.target?.value)}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="px-3 py-2 bg-muted border border-l-0 border-border rounded-r-lg text-sm font-medium text-muted-foreground">MXN</span>
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        {!['birthday', 'first_visit']?.includes(selectedType) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de inicio</label>
              <input type="date" value={form?.startDate} onChange={e => update('startDate', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de fin</label>
              <input type="date" value={form?.endDate} onChange={e => update('endDate', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm" />
            </div>
          </div>
        )}

        {/* Flash Deal specific */}
        {selectedType === 'flash_deal' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-red-800 flex items-center gap-2"><Icon name="Zap" size={15} />Configuración Flash Deal</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Duración (min)</label>
                <select value={form?.flashDuration} onChange={e => update('flashDuration', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm">
                  {[30, 45, 60]?.map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Radio push (km)</label>
                <input type="number" min="0.5" max="5" step="0.5" value={form?.pushRadius} onChange={e => update('pushRadius', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form?.showCountdown} onChange={e => update('showCountdown', e?.target?.checked)} className="rounded" />
                  <span className="text-xs text-foreground">Mostrar countdown</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Mensaje push (máx. 100 chars)</label>
              <input type="text" maxLength={100} value={form?.pushMessage} onChange={e => update('pushMessage', e?.target?.value)}
                className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                placeholder="¡Flash Deal activo! Ven ahora y obtén 40% OFF" />
            </div>
          </div>
        )}

        {/* Happy Hour specific */}
        {selectedType === 'happy_hour' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-800 flex items-center gap-2"><Icon name="Clock" size={15} />Configuración Happy Hour</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Hora inicio</label>
                <input type="time" value={form?.startTime} onChange={e => update('startTime', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Hora fin</label>
                <input type="time" value={form?.endTime} onChange={e => update('endTime', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK?.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    form?.activeDays?.includes(day) ? 'bg-amber-500 text-white border-amber-500' : 'border-border text-muted-foreground hover:border-amber-300'
                  }`}>{day}</button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form?.autoActivate} onChange={e => update('autoActivate', e?.target?.checked)} className="rounded" />
                <span className="text-xs text-foreground">Activación automática</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form?.showNextHour} onChange={e => update('showNextHour', e?.target?.checked)} className="rounded" />
                <span className="text-xs text-foreground">Mostrar próximo happy hour</span>
              </label>
            </div>
          </div>
        )}

        {/* Limited Drop specific */}
        {selectedType === 'limited_drop' && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-purple-800 flex items-center gap-2"><Icon name="Flame" size={15} />Configuración Drop Limitado</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Stock total</label>
                <input type="number" min="1" value={form?.totalStock} onChange={e => update('totalStock', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Umbral "casi agotado"</label>
                <input type="number" min="1" value={form?.lowStockThreshold} onChange={e => update('lowStockThreshold', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Hora de liberación</label>
                <input type="time" value={form?.releaseTime} onChange={e => update('releaseTime', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form?.showStockCounter} onChange={e => update('showStockCounter', e?.target?.checked)} className="rounded" />
                <span className="text-xs text-foreground">Mostrar contador de restantes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form?.enableWaitlist} onChange={e => update('enableWaitlist', e?.target?.checked)} className="rounded" />
                <span className="text-xs text-foreground">Lista de espera al agotarse</span>
              </label>
            </div>
          </div>
        )}

        {/* Birthday specific */}
        {selectedType === 'birthday' && (
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-pink-800 flex items-center gap-2"><Icon name="Cake" size={15} />Configuración Cumpleaños</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Ventana de validez</label>
                <select value={form?.birthdayWindow} onChange={e => update('birthdayWindow', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm">
                  <option value="day">Día exacto</option>
                  <option value="week">Semana del cumpleaños</option>
                  <option value="month">Mes del cumpleaños</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form?.autoPush} onChange={e => update('autoPush', e?.target?.checked)} className="rounded" />
                  <span className="text-xs text-foreground">Push automático el día del cumpleaños</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Mensaje de felicitación (máx. 200 chars)</label>
              <textarea rows={2} maxLength={200} value={form?.birthdayMessage} onChange={e => update('birthdayMessage', e?.target?.value)}
                className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm resize-none"
                placeholder="¡Feliz cumpleaños! Hoy tienes un regalo especial de nuestra parte..." />
            </div>
          </div>
        )}

        {/* First Visit specific */}
        {selectedType === 'first_visit' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-green-800 flex items-center gap-2"><Icon name="Star" size={15} />Configuración Primera Visita</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Días de validez (1-30)</label>
                <input type="number" min="1" max="30" value={form?.validDays} onChange={e => update('validDays', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Mensaje de bienvenida (máx. 200 chars)</label>
              <textarea rows={2} maxLength={200} value={form?.welcomeMessage} onChange={e => update('welcomeMessage', e?.target?.value)}
                className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm resize-none"
                placeholder="¡Bienvenido! Como nuevo cliente tienes un regalo especial..." />
            </div>
          </div>
        )}

        {/* Weather specific */}
        {selectedType === 'weather' && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-cyan-800 flex items-center gap-2"><Icon name="Cloud" size={15} />Configuración Por Clima</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Condición climática</label>
                <select value={form?.weatherCondition} onChange={e => update('weatherCondition', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm">
                  {WEATHER_CONDITIONS?.map(w => <option key={w?.value} value={w?.value}>{w?.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Duración mínima activa (horas)</label>
                <select value={form?.minActiveDuration} onChange={e => update('minActiveDuration', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm">
                  {[1, 2, 3, 4]?.map(h => <option key={h} value={h}>{h} hora(s)</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Mensaje contextual</label>
              <input type="text" value={form?.weatherMessage} onChange={e => update('weatherMessage', e?.target?.value)}
                className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                placeholder="¡Está lloviendo! Ven por un café caliente con 20% OFF" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form?.deactivateOnChange} onChange={e => update('deactivateOnChange', e?.target?.checked)} className="rounded" />
              <span className="text-xs text-foreground">Desactivar cuando el clima cambie</span>
            </label>
          </div>
        )}

        {/* Inverse Demand specific */}
        {selectedType === 'inverse_demand' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-orange-800 flex items-center gap-2"><Icon name="TrendingDown" size={15} />Configuración Demanda Inversa</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Umbral de ocupación (%)</label>
                <input type="number" min="10" max="50" value={form?.occupancyThreshold} onChange={e => update('occupancyThreshold', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Fuente de datos</label>
                <select value={form?.dataSource} onChange={e => update('dataSource', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm">
                  <option value="checkins">Check-ins última hora</option>
                  <option value="beacons">Beacons BLE</option>
                  <option value="manual">Toggle manual del staff</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Máx. activaciones/día</label>
                <input type="number" min="1" max="5" value={form?.maxActivationsPerDay} onChange={e => update('maxActivationsPerDay', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Mensaje contextual</label>
              <input type="text" value={form?.inverseMessage} onChange={e => update('inverseMessage', e?.target?.value)}
                className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                placeholder="¡Hay lugar! Ven ahora y obtén 30% de descuento" />
            </div>
          </div>
        )}

        {/* Advent Calendar specific */}
        {selectedType === 'advent' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2"><Icon name="Gift" size={15} />Configuración Calendario de Adviento</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Número de días</label>
                <select value={form?.adventDays} onChange={e => update('adventDays', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm">
                  {[12, 24, 31]?.map(d => <option key={d} value={d}>{d} días</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Fecha de inicio</label>
                <input type="date" value={form?.adventStartDate} onChange={e => update('adventStartDate', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form?.dailyPush} onChange={e => update('dailyPush', e?.target?.checked)} className="rounded" />
              <span className="text-xs text-foreground">Push diario recordando la nueva oferta</span>
            </label>
          </div>
        )}

        {/* VIP Access specific */}
        {selectedType === 'vip_access' && (
          <div className="bg-gray-900 border border-yellow-400/30 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-yellow-400 flex items-center gap-2"><Icon name="Crown" size={15} />Configuración Acceso VIP</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-yellow-400/70 mb-1">Horas de anticipación</label>
                <select value={form?.earlyAccessHours} onChange={e => update('earlyAccessHours', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-yellow-400/30 rounded bg-gray-800 text-yellow-100 text-sm">
                  {[12, 24, 48, 72]?.map(h => <option key={h} value={h}>{h} horas</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-yellow-400/70 mb-1">Nivel mínimo requerido</label>
                <select value={form?.minVipLevel} onChange={e => update('minVipLevel', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-yellow-400/30 rounded bg-gray-800 text-yellow-100 text-sm">
                  {VIP_LEVELS?.map(l => <option key={l?.value} value={l?.value}>{l?.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-yellow-400/70 mb-1">Mensaje exclusivo para VIPs</label>
              <input type="text" value={form?.vipMessage} onChange={e => update('vipMessage', e?.target?.value)}
                className="w-full px-2 py-1.5 border border-yellow-400/30 rounded bg-gray-800 text-yellow-100 text-sm"
                placeholder="Acceso exclusivo para nuestros clientes VIP..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form?.vipExclusive} onChange={e => update('vipExclusive', e?.target?.checked)} className="rounded" />
              <span className="text-xs text-yellow-200">Exclusiva solo para VIPs (no se abre al público después)</span>
            </label>
          </div>
        )}

        {/* Audience & Visibility */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Audiencia objetivo</label>
            <select value={form?.targetAudience} onChange={e => update('targetAudience', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm">
              {AUDIENCE_OPTIONS?.map(a => <option key={a?.value} value={a?.value}>{a?.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Visibilidad</label>
            <select value={form?.visibility} onChange={e => update('visibility', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm">
              {VISIBILITY_OPTIONS?.map(v => <option key={v?.value} value={v?.value}>{v?.label}</option>)}
            </select>
          </div>
        </div>

        {/* Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Límite total de canjes</label>
            <input type="number" min="0" value={form?.totalLimit} onChange={e => update('totalLimit', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              placeholder="Sin límite" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Límite por usuario</label>
            <input type="number" min="1" value={form?.perUserLimit} onChange={e => update('perUserLimit', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-6 border-t border-border">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={isLoading} iconName="Save" iconPosition="left">
            Guardar borrador
          </Button>
          <Button variant="default" onClick={() => handleSubmit('active')} disabled={isLoading}
            iconName={isLoading ? 'Loader2' : 'Send'} iconPosition="left">
            {isLoading ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPromotionForm;
