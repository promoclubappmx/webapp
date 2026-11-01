import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const PerfilFiscalTab = ({ user, userProfile }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    rfc: '',
    razon_social: '',
    regimen_fiscal: '',
    business_address: '',
    business_city: '',
    business_state: '',
    business_postal_code: '',
    contact_email: '',
    contact_phone: '',
  });

  useEffect(() => {
    if (user?.id) loadFiscalData();
  }, [user?.id]);

  const loadFiscalData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase?.from('business_settings')?.select('rfc, razon_social, regimen_fiscal, business_address, business_city, business_state, business_postal_code, contact_email, contact_phone')?.eq('owner_id', user?.id)?.maybeSingle();
      if (!error && data) {
        setForm({
          rfc: data?.rfc || '',
          razon_social: data?.razon_social || '',
          regimen_fiscal: data?.regimen_fiscal || '',
          business_address: data?.business_address || '',
          business_city: data?.business_city || '',
          business_state: data?.business_state || '',
          business_postal_code: data?.business_postal_code || '',
          contact_email: data?.contact_email || '',
          contact_phone: data?.contact_phone || '',
        });
      }
    } catch (err) {
      console.error('Error loading fiscal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase?.from('business_settings')?.update({
        rfc: form?.rfc,
        razon_social: form?.razon_social,
        regimen_fiscal: form?.regimen_fiscal,
        business_address: form?.business_address,
        business_city: form?.business_city,
        business_state: form?.business_state,
        business_postal_code: form?.business_postal_code,
        contact_email: form?.contact_email,
        contact_phone: form?.contact_phone,
      })?.eq('owner_id', user?.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving fiscal data:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => setForm(p => ({ ...p, [field]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  const fields = [
    { key: 'rfc', label: 'RFC', placeholder: 'XAXX010101000', col: 1 },
    { key: 'razon_social', label: 'Razón Social', placeholder: 'Nombre o razón social fiscal', col: 1 },
    { key: 'regimen_fiscal', label: 'Régimen Fiscal', placeholder: 'Ej: 601 - General de Ley Personas Morales', col: 2 },
    { key: 'business_address', label: 'Dirección Fiscal', placeholder: 'Calle, número, colonia', col: 2 },
    { key: 'business_city', label: 'Ciudad', placeholder: 'Ciudad', col: 1 },
    { key: 'business_state', label: 'Estado', placeholder: 'Estado', col: 1 },
    { key: 'business_postal_code', label: 'Código Postal', placeholder: '00000', col: 1 },
    { key: 'contact_email', label: 'Email de Facturación', placeholder: 'facturacion@empresa.com', col: 1 },
    { key: 'contact_phone', label: 'Teléfono de Contacto', placeholder: '+52 55 0000 0000', col: 1 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Perfil Fiscal</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Datos utilizados para la emisión de facturas</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-success text-sm">
            <Icon name="CheckCircle" size={16} />
            Guardado
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields?.map((field) => (
          <div key={field?.key} className={field?.col === 2 ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-medium text-muted-foreground mb-1">{field?.label}</label>
            <input
              type="text"
              value={form?.[field?.key] || ''}
              onChange={(e) => handleChange(field?.key, e?.target?.value)}
              placeholder={field?.placeholder}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Icon name="Save" size={15} />
              Guardar Perfil Fiscal
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PerfilFiscalTab;
