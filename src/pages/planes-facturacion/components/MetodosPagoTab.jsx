import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const cardBrandIcons = {
  visa: 'CreditCard',
  mastercard: 'CreditCard',
  amex: 'CreditCard',
  default: 'CreditCard',
};

const MetodosPagoTab = ({ paymentMethods = [], userId, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'card', card_holder_name: '', card_last4: '', card_brand: 'visa', card_exp_month: '', card_exp_year: '' });

  const handleSetDefault = async (methodId) => {
    if (!userId) return;
    try {
      await supabase?.from('billing_payment_methods')?.update({ is_default: false })?.eq('user_id', userId);
      await supabase?.from('billing_payment_methods')?.update({ is_default: true })?.eq('id', methodId);
      onRefresh?.();
    } catch (err) {
      console.error('Error setting default:', err);
    }
  };

  const handleDelete = async (methodId) => {
    if (!userId) return;
    try {
      await supabase?.from('billing_payment_methods')?.update({ is_active: false })?.eq('id', methodId);
      onRefresh?.();
    } catch (err) {
      console.error('Error deleting method:', err);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const isFirst = paymentMethods?.length === 0;
      await supabase?.from('billing_payment_methods')?.insert({
        user_id: userId,
        type: form?.type,
        card_brand: form?.card_brand,
        card_last4: form?.card_last4?.slice(-4),
        card_exp_month: parseInt(form?.card_exp_month) || null,
        card_exp_year: parseInt(form?.card_exp_year) || null,
        card_holder_name: form?.card_holder_name,
        is_default: isFirst,
        is_active: true,
      });
      setShowForm(false);
      setForm({ type: 'card', card_holder_name: '', card_last4: '', card_brand: 'visa', card_exp_month: '', card_exp_year: '' });
      onRefresh?.();
    } catch (err) {
      console.error('Error saving payment method:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">Métodos de Pago</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={15} />
          Agregar método
        </button>
      </div>
      {/* Add form */}
      {showForm && (
        <div className="mb-6 p-5 bg-muted/30 border border-border rounded-xl">
          <h4 className="text-sm font-semibold text-foreground mb-4">Nueva Tarjeta</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre del titular</label>
              <input
                type="text"
                value={form?.card_holder_name}
                onChange={(e) => setForm(p => ({ ...p, card_holder_name: e?.target?.value }))}
                placeholder="Como aparece en la tarjeta"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Últimos 4 dígitos</label>
              <input
                type="text"
                value={form?.card_last4}
                onChange={(e) => setForm(p => ({ ...p, card_last4: e?.target?.value?.replace(/\D/g, '')?.slice(0, 4) }))}
                placeholder="4242"
                maxLength={4}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Mes de vencimiento</label>
              <input
                type="number"
                value={form?.card_exp_month}
                onChange={(e) => setForm(p => ({ ...p, card_exp_month: e?.target?.value }))}
                placeholder="MM"
                min={1} max={12}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Año de vencimiento</label>
              <input
                type="number"
                value={form?.card_exp_year}
                onChange={(e) => setForm(p => ({ ...p, card_exp_year: e?.target?.value }))}
                placeholder="AAAA"
                min={2024}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !form?.card_holder_name || !form?.card_last4}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {paymentMethods?.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="CreditCard" size={24} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No tienes métodos de pago registrados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods?.map((method) => (
            <div key={method?.id} className={`flex items-center justify-between p-4 rounded-xl border ${method?.is_default ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name={cardBrandIcons?.[method?.card_brand] || 'CreditCard'} size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground capitalize">
                    {method?.card_brand || 'Tarjeta'} •••• {method?.card_last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {method?.card_holder_name}
                    {method?.card_exp_month && method?.card_exp_year && ` · Vence ${String(method?.card_exp_month)?.padStart(2, '0')}/${method?.card_exp_year}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method?.is_default && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Predeterminada</span>
                )}
                {!method?.is_default && (
                  <button
                    onClick={() => handleSetDefault(method?.id)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                  >
                    Predeterminar
                  </button>
                )}
                <button
                  onClick={() => handleDelete(method?.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetodosPagoTab;
