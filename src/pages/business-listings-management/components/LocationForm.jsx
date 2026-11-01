import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import BusinessLocationMap from './BusinessLocationMap';
import { supabase } from '../../../lib/supabase';
import { getAddressByPostalCode, getColoniasFromAddresses } from '../../../services/copomexService';

const ESTADOS_MX = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','México','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas'];

// Validation rules
const validateField = (field, value) => {
  switch (field) {
    case 'street':
      if (!value || !value?.trim()) return 'La calle y número son requeridos';
      if (value?.trim()?.length < 5) return 'La calle debe tener al menos 5 caracteres';
      return null;
    case 'colonia':
      if (!value || !value?.trim()) return 'La colonia es requerida';
      return null;
    case 'city':
      if (!value || !value?.trim()) return 'La ciudad es requerida';
      return null;
    case 'state':
      if (!value || !value?.trim()) return 'El estado es requerido';
      return null;
    case 'postalCode':
      if (!value || !value?.trim()) return 'El código postal es requerido';
      if (!/^\d{5}$/?.test(value?.trim())) return 'El código postal debe tener exactamente 5 dígitos';
      return null;
    case 'latitude':
      if (value !== null && value !== '' && value !== undefined) {
        const num = parseFloat(value);
        if (isNaN(num) || num < -90 || num > 90) return 'La latitud debe estar entre -90 y 90';
      }
      return null;
    case 'longitude':
      if (value !== null && value !== '' && value !== undefined) {
        const num = parseFloat(value);
        if (isNaN(num) || num < -180 || num > 180) return 'La longitud debe estar entre -180 y 180';
      }
      return null;
    default:
      return null;
  }
};

const REQUIRED_FIELDS = ['street', 'colonia', 'city', 'state', 'postalCode'];

const LocationForm = ({ formData, onChange, errors: externalErrors, onValidate }) => {
  const multipleEntrances = formData?.multipleEntrances || [];
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSummaryBanner, setShowSummaryBanner] = useState(false);
  const [realtimeToast, setRealtimeToast] = useState(null);
  const channelRef = useRef(null);

  // COPOMEX state
  const [colonias, setColonias] = useState([]);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState(null);
  const [cpAddresses, setCpAddresses] = useState([]);

  // Expose validation function to parent via onValidate callback
  useEffect(() => {
    if (onValidate) {
      onValidate(() => {
        const allTouched = {};
        const allErrors = {};
        REQUIRED_FIELDS?.forEach(f => {
          allTouched[f] = true;
          const err = validateField(f, formData?.[f]);
          if (err) allErrors[f] = err;
        });
        ['latitude', 'longitude']?.forEach(f => {
          const err = validateField(f, formData?.[f]);
          if (err) allErrors[f] = err;
        });
        setTouched(allTouched);
        setFieldErrors(allErrors);
        const hasErrors = Object.keys(allErrors)?.length > 0;
        if (hasErrors) setShowSummaryBanner(true);
        return !hasErrors;
      });
    }
  }, [formData, onValidate]);

  // Supabase real-time subscription
  useEffect(() => {
    const channel = supabase?.channel('business_locations_realtime')?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'business_locations',
      }, (payload) => {
        if (payload?.eventType === 'UPDATE' || payload?.eventType === 'INSERT') {
          const newData = payload?.new;
          if (newData) {
            if (newData?.street) onChange('street', newData?.street);
            if (newData?.colonia) onChange('colonia', newData?.colonia);
            if (newData?.city) onChange('city', newData?.city);
            if (newData?.state) onChange('state', newData?.state);
            if (newData?.postal_code) onChange('postalCode', newData?.postal_code);
            if (newData?.latitude) onChange('latitude', newData?.latitude);
            if (newData?.longitude) onChange('longitude', newData?.longitude);
            if (newData?.address) onChange('address', newData?.address);
            setRealtimeToast('Ubicación actualizada desde otro dispositivo');
            setTimeout(() => setRealtimeToast(null), 4000);
          }
        }
      })?.subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef?.current) {
        supabase?.removeChannel(channelRef?.current);
        channelRef.current = null;
      }
    };
  }, []);

  // Query COPOMEX when postal code is complete
  const lookupPostalCode = async (cp) => {
    if (!/^\d{5}$/?.test(cp)) {
      setColonias([]);
      setCpAddresses([]);
      setCpError(null);
      return;
    }
    setCpLoading(true);
    setCpError(null);
    try {
      const addresses = await getAddressByPostalCode(cp);
      setCpAddresses(addresses);
      const coloniaList = getColoniasFromAddresses(addresses);
      setColonias(coloniaList);

      // Auto-fill city, state, municipio from first result
      if (addresses?.length > 0) {
        const first = addresses?.[0];
        if (first?.estado) onChange('state', first?.estado);
        if (first?.municipio || first?.ciudad) onChange('city', first?.ciudad || first?.municipio);
        // If only one colonia, auto-select it
        if (coloniaList?.length === 1) {
          onChange('colonia', coloniaList?.[0]);
          handleChange('colonia', coloniaList?.[0]);
        } else {
          // Clear colonia so user picks from dropdown
          onChange('colonia', '');
        }
      }
    } catch (err) {
      setCpError('No se encontró información para este código postal');
      setColonias([]);
      setCpAddresses([]);
    } finally {
      setCpLoading(false);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, formData?.[field]);
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, value) => {
    onChange(field, value);
    if (touched?.[field]) {
      const err = validateField(field, value);
      setFieldErrors(prev => ({ ...prev, [field]: err }));
    }
    if (showSummaryBanner) {
      const updatedData = { ...formData, [field]: value };
      const stillHasErrors = REQUIRED_FIELDS?.some(f => !!validateField(f, updatedData?.[f]));
      if (!stillHasErrors) setShowSummaryBanner(false);
    }
  };

  const handlePostalCodeChange = (value) => {
    const cleaned = value?.replace(/\D/g, '');
    handleChange('postalCode', cleaned);
    if (cleaned?.length === 5) {
      lookupPostalCode(cleaned);
    } else {
      setColonias([]);
      setCpAddresses([]);
      setCpError(null);
    }
  };

  const getFieldClass = (field) => {
    const hasError = touched?.[field] && fieldErrors?.[field];
    return `w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-500 focus:ring-red-300' :'border-border focus:ring-primary/30'
    }`;
  };

  const FieldError = ({ field }) => {
    if (!touched?.[field] || !fieldErrors?.[field]) return null;
    return (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <Icon name="AlertCircle" size={11} />
        {fieldErrors?.[field]}
      </p>
    );
  };

  const addEntrance = () => {
    onChange('multipleEntrances', [...multipleEntrances, { id: Date.now(), label: '', description: '', lat: formData?.latitude || 23.6345, lng: formData?.longitude || -102.5528 }]);
  };

  const updateEntrance = (id, field, val) => {
    onChange('multipleEntrances', multipleEntrances?.map(e => e?.id === id ? { ...e, [field]: val } : e));
  };

  const removeEntrance = (id) => {
    onChange('multipleEntrances', multipleEntrances?.filter(e => e?.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Realtime toast */}
      {realtimeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-xl animate-fadeIn">
          <Icon name="RefreshCw" size={15} />
          {realtimeToast}
        </div>
      )}
      {/* Summary error banner */}
      {showSummaryBanner && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <Icon name="AlertTriangle" size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Completa los campos requeridos antes de guardar</p>
            <p className="text-xs text-red-600 mt-0.5">Revisa los campos marcados en rojo a continuación.</p>
          </div>
          <button onClick={() => setShowSummaryBanner(false)} className="text-red-400 hover:text-red-600">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}
      {/* Mapbox Interactive Map with geocoding + draggable pin */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Ubicación del negocio</h3>
        </div>
        <BusinessLocationMap formData={formData} onChange={onChange} />
        {touched?.['latitude'] && fieldErrors?.['latitude'] && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <Icon name="AlertCircle" size={11} />
            {fieldErrors?.['latitude']}
          </p>
        )}
        {touched?.['longitude'] && fieldErrors?.['longitude'] && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <Icon name="AlertCircle" size={11} />
            {fieldErrors?.['longitude']}
          </p>
        )}
      </div>
      {/* Address fields */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Dirección detallada</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Calle y número exterior <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData?.street || ''}
              onChange={e => handleChange('street', e?.target?.value)}
              onBlur={() => handleBlur('street')}
              placeholder="Av. Álvaro Obregón 123"
              className={getFieldClass('street')}
            />
            <FieldError field="street" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Número interior <span className="text-muted-foreground">(opcional)</span></label>
            <input type="text" value={formData?.interiorNumber || ''} onChange={e => onChange('interiorNumber', e?.target?.value)}
              placeholder="Depto 4B, Local 12"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          {/* Código Postal — triggers COPOMEX lookup */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Código postal <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={5}
                value={formData?.postalCode || ''}
                onChange={e => handlePostalCodeChange(e?.target?.value)}
                onBlur={() => handleBlur('postalCode')}
                placeholder="06600"
                className={getFieldClass('postalCode')}
              />
              {cpLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <FieldError field="postalCode" />
            {cpError && !cpLoading && (
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <Icon name="AlertCircle" size={11} />
                {cpError}
              </p>
            )}
            {colonias?.length > 0 && !cpLoading && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <Icon name="CheckCircle" size={11} />
                {colonias?.length} colonia{colonias?.length !== 1 ? 's' : ''} encontrada{colonias?.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Colonia — dropdown when COPOMEX returns results, text input otherwise */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Colonia <span className="text-red-500">*</span>
            </label>
            {colonias?.length > 0 ? (
              <select
                value={formData?.colonia || ''}
                onChange={e => handleChange('colonia', e?.target?.value)}
                onBlur={() => handleBlur('colonia')}
                className={getFieldClass('colonia')}
              >
                <option value="">Selecciona colonia</option>
                {colonias?.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData?.colonia || ''}
                onChange={e => handleChange('colonia', e?.target?.value)}
                onBlur={() => handleBlur('colonia')}
                placeholder={cpLoading ? 'Buscando colonias...' : 'Ingresa el código postal para ver colonias'}
                disabled={cpLoading}
                className={getFieldClass('colonia')}
              />
            )}
            <FieldError field="colonia" />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Ciudad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData?.city || ''}
              onChange={e => handleChange('city', e?.target?.value)}
              onBlur={() => handleBlur('city')}
              placeholder="Ciudad de México"
              className={getFieldClass('city')}
            />
            <FieldError field="city" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={formData?.state || ''}
              onChange={e => handleChange('state', e?.target?.value)}
              onBlur={() => handleBlur('state')}
              className={getFieldClass('state')}
            >
              <option value="">Selecciona estado</option>
              {ESTADOS_MX?.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <FieldError field="state" />
          </div>
        </div>
      </div>
      {/* Indicaciones adicionales */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Indicaciones adicionales</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              ¿Cómo llegar? <span className="text-muted-foreground text-xs">(opcional, máx. 200 caracteres)</span>
            </label>
            <div className="relative">
              <textarea
                maxLength={200}
                rows={3}
                value={formData?.howToGet || ''}
                onChange={e => onChange('howToGet', e?.target?.value)}
                placeholder='Ej: Estamos dentro del Mercado Pino Suárez, local 42, segundo piso'
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">{(formData?.howToGet || '')?.length}/200</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Piso / Local / Referencia <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <input type="text" value={formData?.floorLocal || ''} onChange={e => onChange('floorLocal', e?.target?.value)}
              placeholder='Ej: Plaza Mazatlán, Local 15, Planta baja'
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </div>
      {/* Multiple entrances — always visible */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Entradas múltiples</h3>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Si tu negocio tiene más de una entrada, agrégalas aquí para que los clientes puedan encontrarlas fácilmente.
          </p>
          {multipleEntrances?.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No hay entradas adicionales configuradas.</p>
          )}
          {multipleEntrances?.map(e => (
            <div key={e?.id} className="flex items-center gap-3">
              <input type="text" value={e?.label || ''} onChange={ev => updateEntrance(e?.id, 'label', ev?.target?.value)}
                placeholder="Nombre de la entrada (ej: Entrada principal)"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type="text" value={e?.description || ''} onChange={ev => updateEntrance(e?.id, 'description', ev?.target?.value)}
                placeholder="Descripción (ej: Frente a la calle Juárez)"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={() => removeEntrance(e?.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
          <button onClick={addEntrance}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
            <Icon name="Plus" size={12} />
            Agregar entrada
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationForm;