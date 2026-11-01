import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

const OpenCashRegisterModal = ({ terminal, userId, onClose, onOpened }) => {
  const [openingAmount, setOpeningAmount] = useState('100.00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (!openingAmount || parseFloat(openingAmount) < 0) {
      alert('Ingrese un monto de apertura válido');
      return;
    }
    setLoading(true);
    try {
      const sessionNumber = `SES-${Date.now()}`;
      const { data, error } = await supabase?.from('cash_register_sessions')?.insert({
          terminal_id: terminal?.terminal_id,
          user_id: userId,
          business_id: terminal?.location_id || null,
          session_number: sessionNumber,
          status: 'open',
          opening_amount: parseFloat(openingAmount),
          total_sales: 0,
          total_transactions: 0,
          opened_at: new Date()?.toISOString(),
          opened_by: userId,
          notes: notes || null,
        })?.select()?.single();
      if (error) throw error;
      onOpened(data);
    } catch (err) {
      console.error('Error opening cash register:', err);
      alert('Error al abrir la caja: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Icon name="Unlock" size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Abrir Caja Registradora</h3>
              <p className="text-xs text-muted-foreground">{terminal?.terminal_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Info" size={15} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Inicio de Turno</span>
            </div>
            <p className="text-xs text-emerald-600">
              Ingresa el efectivo inicial con el que comenzará el turno. Este monto se usará para calcular el balance al cierre.
            </p>
          </div>
          {terminal?.location_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="MapPin" size={14} />
              <span>{terminal?.location_name}</span>
            </div>
          )}
          <Input
            type="number"
            label="Monto de Apertura *"
            placeholder="100.00"
            value={openingAmount}
            onChange={(e) => setOpeningAmount(e?.target?.value)}
            step="0.01"
          />
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Notas (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e?.target?.value)}
              placeholder="Observaciones sobre la apertura..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleOpen} loading={loading} iconName="Unlock" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
              Abrir Caja
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenCashRegisterModal;
