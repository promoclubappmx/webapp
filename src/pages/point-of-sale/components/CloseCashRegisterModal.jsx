import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

const CloseCashRegisterModal = ({ terminal, session, userId, onClose, onClosed }) => {
  const [cutType, setCutType] = useState('partial');
  const [closingAmount, setClosingAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);

  useEffect(() => {
    const loadWithdrawals = async () => {
      if (!session?.session_id) { setLoadingWithdrawals(false); return; }
      try {
        const { data } = await supabase?.from('cash_withdrawals')?.select('amount, reason, withdrawn_at')?.eq('session_id', session?.session_id)?.order('withdrawn_at', { ascending: false });
        setWithdrawals(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingWithdrawals(false);
      }
    };
    loadWithdrawals();
  }, [session?.session_id]);

  const totalWithdrawals = withdrawals?.reduce((s, w) => s + (w?.amount || 0), 0);
  const expectedAmount = (session?.opening_amount || 0) + (session?.total_sales || 0) - totalWithdrawals;
  const difference = closingAmount ? parseFloat(closingAmount) - expectedAmount : 0;

  const handleClose = async () => {
    if (!closingAmount || parseFloat(closingAmount) < 0) {
      alert('Ingrese el monto de cierre');
      return;
    }
    setLoading(true);
    try {
      const today = new Date()?.toISOString()?.split('T')?.[0];
      const { error } = await supabase?.from('cash_register_sessions')?.update({
          status: 'closed',
          closing_amount: parseFloat(closingAmount),
          expected_amount: expectedAmount,
          difference_amount: difference,
          closed_at: new Date()?.toISOString(),
          closed_by: userId,
          cut_type: cutType,
          final_cut_date: cutType === 'final' ? today : null,
          notes: notes || null,
          updated_at: new Date()?.toISOString(),
        })?.eq('id', session?.session_id);
      if (error) throw error;
      onClosed({ cutType, closingAmount: parseFloat(closingAmount), expectedAmount, difference, totalWithdrawals });
    } catch (err) {
      console.error('Error closing cash register:', err);
      alert('Error al cerrar la caja: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Icon name="Lock" size={18} className="text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Cerrar Caja Registradora</h3>
              <p className="text-xs text-muted-foreground">{terminal?.terminal_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Cut Type Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Tipo de Corte *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCutType('partial')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  cutType === 'partial' ?'border-amber-500 bg-amber-50' :'border-border hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="RefreshCw" size={15} className={cutType === 'partial' ? 'text-amber-600' : 'text-muted-foreground'} />
                  <span className={`text-sm font-semibold ${cutType === 'partial' ? 'text-amber-700' : 'text-foreground'}`}>
                    Corte Parcial
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">La caja puede volver a abrirse durante el día</p>
              </button>
              <button
                onClick={() => setCutType('final')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  cutType === 'final' ?'border-rose-500 bg-rose-50' :'border-border hover:border-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="Lock" size={15} className={cutType === 'final' ? 'text-rose-600' : 'text-muted-foreground'} />
                  <span className={`text-sm font-semibold ${cutType === 'final' ? 'text-rose-700' : 'text-foreground'}`}>
                    Corte Final
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">La caja queda bloqueada por el resto del día</p>
              </button>
            </div>
            {cutType === 'final' && (
              <div className="mt-2 bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
                <Icon name="AlertTriangle" size={15} className="text-rose-600 mt-0.5 shrink-0" />
                <p className="text-xs text-rose-700">
                  <strong>Corte Final:</strong> Esta caja no podrá abrirse nuevamente hasta el día siguiente.
                </p>
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground mb-3">Resumen Financiero</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto de Apertura</span>
              <span className="font-medium">${(session?.opening_amount || 0)?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Ventas</span>
              <span className="font-medium text-emerald-600">+${(session?.total_sales || 0)?.toFixed(2)}</span>
            </div>
            {totalWithdrawals > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Retiros de Efectivo</span>
                <span className="font-medium text-rose-600">-${totalWithdrawals?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="font-semibold text-foreground">Monto Esperado</span>
              <span className="font-bold text-primary">${expectedAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Closing Amount */}
          <Input
            type="number"
            label="Efectivo Contado en Caja *"
            placeholder="0.00"
            value={closingAmount}
            onChange={(e) => setClosingAmount(e?.target?.value)}
            step="0.01"
          />

          {/* Difference */}
          {closingAmount && (
            <div className={`rounded-lg p-3 flex items-center justify-between ${
              Math.abs(difference) < 0.01
                ? 'bg-emerald-50 border border-emerald-200'
                : difference > 0
                ? 'bg-amber-50 border border-amber-200' :'bg-rose-50 border border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                <Icon
                  name={Math.abs(difference) < 0.01 ? 'CheckCircle' : 'AlertTriangle'}
                  size={16}
                  className={Math.abs(difference) < 0.01 ? 'text-emerald-600' : difference > 0 ? 'text-amber-600' : 'text-rose-600'}
                />
                <span className="text-sm font-medium text-foreground">
                  {Math.abs(difference) < 0.01 ? 'Caja Cuadrada' : difference > 0 ? 'Sobrante' : 'Faltante'}
                </span>
              </div>
              <span className={`text-lg font-bold ${
                Math.abs(difference) < 0.01 ? 'text-emerald-600' : difference > 0 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {difference >= 0 ? '+' : ''}${difference?.toFixed(2)}
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Notas (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e?.target?.value)}
              placeholder="Observaciones sobre el cierre..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button
              onClick={handleClose}
              loading={loading}
              iconName="Lock"
              className={`flex-1 text-white border-0 ${cutType === 'final' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}
              disabled={!closingAmount}
            >
              {cutType === 'final' ? 'Corte Final' : 'Corte Parcial'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseCashRegisterModal;
