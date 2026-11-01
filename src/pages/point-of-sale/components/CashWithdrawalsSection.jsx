import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

const CashWithdrawalsSection = ({ session, userId, onWithdrawalAdded }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: '', reason: '', notes: '' });

  const loadWithdrawals = async () => {
    if (!session?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase?.from('cash_withdrawals')?.select('*')?.eq('session_id', session?.id)?.order('withdrawn_at', { ascending: false });
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      console.error('Error loading withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, [session?.id]);

  const handleSave = async () => {
    if (!form?.amount || parseFloat(form?.amount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    if (!form?.reason?.trim()) {
      alert('Ingresa el motivo del retiro');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase?.from('cash_withdrawals')?.insert({
        session_id: session?.id,
        terminal_id: session?.terminal_id || null,
        user_id: userId,
        amount: parseFloat(form?.amount),
        reason: form?.reason?.trim(),
        notes: form?.notes?.trim() || null,
        withdrawn_at: new Date()?.toISOString(),
      });
      if (error) throw error;
      setForm({ amount: '', reason: '', notes: '' });
      setShowForm(false);
      await loadWithdrawals();
      onWithdrawalAdded?.();
    } catch (err) {
      console.error('Error saving withdrawal:', err);
      alert('Error al registrar el retiro: ' + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const totalWithdrawals = withdrawals?.reduce((s, w) => s + (w?.amount || 0), 0);

  if (!session || session?.status !== 'open') {
    return (
      <div className="border border-dashed border-border rounded-xl p-8 text-center">
        <Icon name="Wallet" size={24} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Abre una caja para registrar retiros de efectivo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Retiros de Efectivo</h3>
          <p className="text-sm text-muted-foreground">Registra salidas de efectivo de la caja</p>
        </div>
        <div className="flex items-center gap-3">
          {totalWithdrawals > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Retirado</p>
              <p className="text-sm font-bold text-rose-600">${totalWithdrawals?.toFixed(2)}</p>
            </div>
          )}
          <Button onClick={() => setShowForm(true)} iconName="Minus" size="sm" variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
            Registrar Retiro
          </Button>
        </div>
      </div>
      {/* Withdrawal Form */}
      {showForm && (
        <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon name="Minus" size={14} className="text-rose-600" />
            Nuevo Retiro de Efectivo
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Monto *"
              placeholder="0.00"
              value={form?.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e?.target?.value }))}
              step="0.01"
            />
            <Input
              label="Motivo *"
              placeholder="Ej: Pago a proveedor"
              value={form?.reason}
              onChange={(e) => setForm(f => ({ ...f, reason: e?.target?.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Notas</label>
            <textarea
              value={form?.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e?.target?.value }))}
              placeholder="Detalles adicionales..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} loading={saving} iconName="Save" className="bg-rose-600 hover:bg-rose-700 text-white border-0">
              Guardar Retiro
            </Button>
          </div>
        </div>
      )}
      {/* Withdrawals List */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : withdrawals?.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-6 text-center">
          <Icon name="Wallet" size={20} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Sin retiros registrados en esta sesión</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Hora</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Motivo</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {withdrawals?.map((w) => (
                <tr key={w?.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">
                    {new Date(w.withdrawn_at)?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-sm text-foreground">{w?.reason}</p>
                    {w?.notes && <p className="text-xs text-muted-foreground">{w?.notes}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-sm font-semibold text-rose-600">-${(w?.amount || 0)?.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 border-t border-border">
                <td colSpan={2} className="px-4 py-2.5 text-sm font-semibold text-foreground">Total Retirado</td>
                <td className="px-4 py-2.5 text-right text-sm font-bold text-rose-600">-${totalWithdrawals?.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default CashWithdrawalsSection;
