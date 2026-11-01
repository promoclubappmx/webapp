import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CashRegisterModal = ({ session, onClose, onAction }) => {
  const [openingAmount, setOpeningAmount] = useState('100.00');
  const [closingAmount, setClosingAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isOpen = session?.status === 'open';

  const handleOpenRegister = () => {
    if (!openingAmount || parseFloat(openingAmount) < 0) {
      alert('Ingrese un monto de apertura válido');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      onAction('open', { openingAmount: parseFloat(openingAmount), notes });
      setIsProcessing(false);
    }, 500);
  };

  const handleCloseRegister = () => {
    if (!closingAmount || parseFloat(closingAmount) < 0) {
      alert('Ingrese un monto de cierre válido');
      return;
    }

    const expected = session?.openingAmount + session?.totalSales;
    const difference = parseFloat(closingAmount) - expected;

    setIsProcessing(true);
    setTimeout(() => {
      onAction('close', {
        closingAmount: parseFloat(closingAmount),
        expectedAmount: expected,
        differenceAmount: difference,
        notes
      });
      setIsProcessing(false);
    }, 500);
  };

  if (isOpen) {
    const expectedAmount = session?.openingAmount + session?.totalSales;
    const difference = closingAmount ? parseFloat(closingAmount) - expectedAmount : 0;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg max-w-2xl w-full">
          <div className="border-b border-border p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="DollarSign" size={24} className="text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Cerrar Caja Registradora</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Session Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Número de Sesión</span>
                <span className="font-medium text-foreground">{session?.sessionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Apertura</span>
                <span className="font-medium text-foreground">
                  {new Date(session?.openedAt)?.toLocaleString('es-ES')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Abierto por</span>
                <span className="font-medium text-foreground">{session?.openedBy}</span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Resumen Financiero</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto de Apertura</span>
                  <span className="font-medium text-foreground">€{session?.openingAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de Ventas</span>
                  <span className="font-medium text-success">€{session?.totalSales?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transacciones</span>
                  <span className="font-medium text-foreground">{session?.totalTransactions}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-semibold text-foreground">Monto Esperado</span>
                  <span className="font-bold text-primary">€{expectedAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Closing Amount Input */}
            <div>
              <Input
                type="number"
                label="Monto de Cierre (Efectivo Contado)"
                placeholder="0.00"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e?.target?.value)}
                step="0.01"
                required
              />
            </div>

            {/* Difference Display */}
            {closingAmount && (
              <div className={`rounded-lg p-4 ${
                Math.abs(difference) < 0.01
                  ? 'bg-success/10 border border-success/20'
                  : difference > 0
                  ? 'bg-warning/10 border border-warning/20' :'bg-destructive/10 border border-destructive/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      name={Math.abs(difference) < 0.01 ? 'CheckCircle' : 'AlertTriangle'}
                      size={20}
                      className={Math.abs(difference) < 0.01 ? 'text-success' : difference > 0 ? 'text-warning' : 'text-destructive'}
                    />
                    <span className="font-medium text-foreground">
                      {Math.abs(difference) < 0.01
                        ? 'Caja Cuadrada'
                        : difference > 0
                        ? 'Sobrante' :'Faltante'}
                    </span>
                  </div>
                  <span className={`text-xl font-bold ${
                    Math.abs(difference) < 0.01 ? 'text-success' : difference > 0 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {difference >= 0 ? '+' : ''}€{difference?.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Notas (Opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e?.target?.value)}
                placeholder="Observaciones sobre el cierre de caja..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCloseRegister}
                loading={isProcessing}
                iconName="Lock"
                className="flex-1"
                disabled={!closingAmount}
              >
                Cerrar Caja
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full">
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="DollarSign" size={24} className="text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Abrir Caja Registradora</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Info" size={20} className="text-primary" />
              <span className="font-medium text-foreground">Inicio de Turno</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ingrese el monto inicial en efectivo con el que comenzará el turno. Este monto se usará para calcular el balance al cierre.
            </p>
          </div>

          <div>
            <Input
              type="number"
              label="Monto de Apertura"
              placeholder="100.00"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e?.target?.value)}
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Notas (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e?.target?.value)}
              placeholder="Observaciones sobre la apertura..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleOpenRegister}
              loading={isProcessing}
              iconName="Unlock"
              className="flex-1"
            >
              Abrir Caja
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashRegisterModal;