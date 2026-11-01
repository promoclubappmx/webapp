import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

const SupplierForm = ({ supplier, onSave, onCancel, isLoading }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contact_name: supplier?.contact_name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    rfc: supplier?.rfc || '',
    payment_terms: supplier?.payment_terms || 'net30',
    delivery_days: supplier?.delivery_days || '',
    notes: supplier?.notes || '',
    is_active: supplier?.is_active !== false,
    category_id: supplier?.category_id || '',
    // Address fields
    street: supplier?.street || '',
    ext_number: supplier?.ext_number || '',
    int_number: supplier?.int_number || '',
    neighborhood: supplier?.neighborhood || '',
    city: supplier?.city || '',
    state: supplier?.state || '',
    postal_code: supplier?.postal_code || '',
    country: supplier?.country || 'México',
    website: supplier?.website || '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase?.from('product_categories')?.select('id, name')?.eq('is_active', true)?.order('name');
        setCategories(data || []);
      } catch (e) {
        console.error('Categories fetch error:', e?.message);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">
          {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-muted rounded-lg">
          <Icon name="X" size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[70vh]">
        {/* General */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="Building2" size={15} className="text-primary" />Información general
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Nombre del proveedor *" value={form?.name} onChange={e => handleChange('name', e?.target?.value)} required placeholder="Distribuidora ABC" />
            </div>
            <Input label="Nombre de contacto" value={form?.contact_name} onChange={e => handleChange('contact_name', e?.target?.value)} placeholder="Juan Pérez" />
            <Input label="Email" type="email" value={form?.email} onChange={e => handleChange('email', e?.target?.value)} placeholder="contacto@proveedor.com" />
            <Input label="Teléfono" value={form?.phone} onChange={e => handleChange('phone', e?.target?.value)} placeholder="+52 55 1234 5678" />
            <Input label="Sitio web" value={form?.website} onChange={e => handleChange('website', e?.target?.value)} placeholder="https://..." />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Categoría del proveedor</label>
              <select value={form?.category_id} onChange={e => handleChange('category_id', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Sin categoría</option>
                {categories?.map(c => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="MapPin" size={15} className="text-primary" />Domicilio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Calle" value={form?.street} onChange={e => handleChange('street', e?.target?.value)} placeholder="Nombre de la calle" />
            </div>
            <Input label="Número exterior" value={form?.ext_number} onChange={e => handleChange('ext_number', e?.target?.value)} placeholder="123" />
            <Input label="Número interior" value={form?.int_number} onChange={e => handleChange('int_number', e?.target?.value)} placeholder="A, 2B, etc." />
            <Input label="Colonia" value={form?.neighborhood} onChange={e => handleChange('neighborhood', e?.target?.value)} placeholder="Nombre de la colonia" />
            <Input label="Código postal" value={form?.postal_code} onChange={e => handleChange('postal_code', e?.target?.value)} placeholder="06600" />
            <Input label="Ciudad / Municipio" value={form?.city} onChange={e => handleChange('city', e?.target?.value)} placeholder="Ciudad de México" />
            <Input label="Estado" value={form?.state} onChange={e => handleChange('state', e?.target?.value)} placeholder="CDMX" />
            <div className="md:col-span-2">
              <Input label="País" value={form?.country} onChange={e => handleChange('country', e?.target?.value)} />
            </div>
          </div>
        </div>

        {/* Fiscal & Commercial */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="FileText" size={15} className="text-primary" />Datos fiscales y condiciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="RFC" value={form?.rfc} onChange={e => handleChange('rfc', e?.target?.value)} placeholder="ABC123456789" />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Términos de pago</label>
              <select value={form?.payment_terms} onChange={e => handleChange('payment_terms', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
                <option value="immediate">Pago inmediato</option>
                <option value="net15">Neto 15 días</option>
                <option value="net30">Neto 30 días</option>
                <option value="net45">Neto 45 días</option>
                <option value="net60">Neto 60 días</option>
              </select>
            </div>
            <Input label="Días de entrega promedio" type="number" value={form?.delivery_days} onChange={e => handleChange('delivery_days', e?.target?.value)} placeholder="3" />
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="is_active" checked={form?.is_active} onChange={e => handleChange('is_active', e?.target?.checked)} className="w-4 h-4 text-primary rounded" />
              <label htmlFor="is_active" className="text-sm font-medium text-foreground cursor-pointer">Proveedor activo</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Notas internas</label>
              <textarea value={form?.notes} onChange={e => handleChange('notes', e?.target?.value)} rows={3} placeholder="Notas, condiciones especiales..." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
          <Button variant="default" type="submit" disabled={isLoading} iconName={isLoading ? 'Loader2' : 'Save'} iconPosition="left">
            {isLoading ? 'Guardando...' : 'Guardar Proveedor'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;
