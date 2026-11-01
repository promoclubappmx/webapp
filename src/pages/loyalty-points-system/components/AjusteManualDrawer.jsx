import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MOTIVOS = [
  { value: 'error_acreditacion', label: 'Error de acreditación' },
  { value: 'compensacion', label: 'Compensación al cliente' },
  { value: 'ajuste_contable', label: 'Ajuste contable' },
  { value: 'migracion', label: 'Migración de programa anterior' },
  { value: 'promocion_especial', label: 'Promoción especial' },
  { value: 'otro', label: 'Otro (especificar)' },
];

const MOCK_CLIENTS = [
  { id: 1, name: 'María García', email: 'maria.garcia@email.com', points: 2450 },
  { id: 2, name: 'Juan Rodríguez', email: 'juan.rodriguez@email.com', points: 1230 },
  { id: 3, name: 'Ana Martínez', email: 'ana.martinez@email.com', points: 5670 },
  { id: 4, name: 'Pedro López', email: 'pedro.lopez@email.com', points: 890 },
];

const AUDIT_LOG = [
  { id: 1, staff: 'Carlos Mendoza', date: '2026-03-05T14:30:00', client: 'María García', op: 'add', amount: 100, motivo: 'Compensación al cliente', note: 'Espera prolongada' },
  { id: 2, staff: 'Carlos Mendoza', date: '2026-03-03T10:15:00', client: 'Juan Rodríguez', op: 'subtract', amount: 50, motivo: 'Ajuste contable', note: 'Doble check-in accidental' },
  { id: 3, staff: 'Laura Sánchez', date: '2026-03-01T16:00:00', client: 'Ana Martínez', op: 'add', amount: 200, motivo: 'Migración de programa anterior', note: '' },
];

const AjusteManualDrawer = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [op, setOp] = useState('add');
  const [amount, setAmount] = useState('');
  const [motivo, setMotivo] = useState('');
  const [otroMotivo, setOtroMotivo] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [showAudit, setShowAudit] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const filteredClients = MOCK_CLIENTS?.filter(c =>
    c?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
    c?.email?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const newBalance = selectedClient
    ? op === 'add'
      ? selectedClient?.points + (parseInt(amount) || 0)
      : Math.max(0, selectedClient?.points - (parseInt(amount) || 0))
    : 0;

  const handleConfirm = () => {
    if (!selectedClient || !amount || !motivo || pin?.length < 4) return;
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setSelectedClient(null);
      setAmount('');
      setMotivo('');
      setOtroMotivo('');
      setNote('');
      setPin('');
      setSearch('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-card border-l border-border flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Ajuste manual de saldo</h3>
            <p className="text-xs text-muted-foreground">Solo Owner y Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAudit(!showAudit)}
              className="text-xs text-primary hover:underline">Ver auditoría</button>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
              <Icon name="X" size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {showAudit ? (
          <div className="p-5 flex-1">
            <h4 className="font-semibold text-foreground mb-4">Log de auditoría</h4>
            <div className="space-y-3">
              {AUDIT_LOG?.map(log => (
                <div key={log?.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{log?.client}</span>
                    <span className={`text-xs font-semibold ${
                      log?.op === 'add' ? 'text-emerald-600' : 'text-destructive'
                    }`}>
                      {log?.op === 'add' ? '+' : '-'}{log?.amount} pts
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{log?.motivo}</p>
                  {log?.note && <p className="text-xs text-muted-foreground italic">"{log?.note}"</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {log?.staff} · {new Date(log.date)?.toLocaleString('es-MX')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5 flex-1 space-y-5">
            {confirmed ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Icon name="Check" size={32} className="text-emerald-600" />
                </div>
                <p className="font-semibold text-foreground">Ajuste aplicado</p>
                <p className="text-sm text-muted-foreground mt-1">Registro de auditoría generado</p>
              </div>
            ) : (
              <>
                {/* Client search */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Buscar cliente</label>
                  <input value={search} onChange={e => { setSearch(e?.target?.value); setSelectedClient(null); }}
                    placeholder="Nombre o email..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                  {search && !selectedClient && (
                    <div className="mt-1 border border-border rounded-lg overflow-hidden">
                      {filteredClients?.map(c => (
                        <button key={c?.id} onClick={() => { setSelectedClient(c); setSearch(c?.name); }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 text-left border-b border-border last:border-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">{c?.name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{c?.name}</p>
                            <p className="text-xs text-muted-foreground">{c?.points?.toLocaleString()} pts actuales</p>
                          </div>
                        </button>
                      ))}
                      {filteredClients?.length === 0 && (
                        <p className="p-3 text-sm text-muted-foreground">Sin resultados</p>
                      )}
                    </div>
                  )}
                </div>

                {selectedClient && (
                  <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-medium text-primary">{selectedClient?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedClient?.name}</p>
                      <p className="text-sm text-muted-foreground">Saldo actual: <strong>{selectedClient?.points?.toLocaleString()} pts</strong></p>
                    </div>
                  </div>
                )}

                {/* Operation */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Operación</label>
                  <div className="flex gap-3">
                    {[{ id: 'add', label: 'Agregar puntos', icon: 'Plus', color: 'text-emerald-600' }, { id: 'subtract', label: 'Quitar puntos', icon: 'Minus', color: 'text-destructive' }]?.map(o => (
                      <button key={o?.id} onClick={() => setOp(o?.id)}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          op === o?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        }`}>
                        <Icon name={o?.icon} size={16} className={op === o?.id ? 'text-primary' : o?.color} />
                        <span className="text-sm font-medium text-foreground">{o?.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Cantidad de puntos</label>
                  <input type="number" min="1" value={amount} onChange={e => setAmount(e?.target?.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                  {selectedClient && amount && (
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saldo actual:</span>
                        <span className="font-medium">{selectedClient?.points?.toLocaleString()} pts</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Saldo resultante:</span>
                        <span className={`font-semibold ${
                          newBalance > selectedClient?.points ? 'text-emerald-600' : 'text-destructive'
                        }`}>{newBalance?.toLocaleString()} pts</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Motivo */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Motivo <span className="text-destructive">*</span></label>
                  <select value={motivo} onChange={e => setMotivo(e?.target?.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                    <option value="">Seleccionar motivo...</option>
                    {MOTIVOS?.map(m => <option key={m?.value} value={m?.value}>{m?.label}</option>)}
                  </select>
                  {motivo === 'otro' && (
                    <input value={otroMotivo} onChange={e => setOtroMotivo(e?.target?.value)}
                      placeholder="Especifica el motivo..."
                      className="mt-2 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Nota interna (opcional)</label>
                  <textarea value={note} onChange={e => setNote(e?.target?.value?.slice(0, 200))} rows={2}
                    placeholder="Solo visible para el staff..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none" />
                  <p className="text-xs text-muted-foreground mt-1">{note?.length}/200</p>
                </div>

                {/* PIN */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">PIN de Admin <span className="text-destructive">*</span></label>
                  <input type="password" value={pin} onChange={e => setPin(e?.target?.value)} maxLength={6}
                    placeholder="••••"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                  <p className="text-xs text-muted-foreground mt-1">Capa de seguridad para prevenir ajustes no autorizados.</p>
                </div>

                <Button
                  onClick={handleConfirm}
                  iconName="Check"
                  className="w-full"
                  disabled={!selectedClient || !amount || !motivo || pin?.length < 4}
                >
                  Confirmar ajuste
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AjusteManualDrawer;
