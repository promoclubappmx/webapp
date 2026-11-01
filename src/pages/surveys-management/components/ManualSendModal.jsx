import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const clients = [
  { id: 1, name: 'Carlos Mendoza', phone: '+52 55 1234 5678' },
  { id: 2, name: 'María López', phone: '+52 55 2345 6789' },
  { id: 3, name: 'Roberto García', phone: '+52 55 3456 7890' },
  { id: 4, name: 'Ana Pérez', phone: '+52 55 4567 8901' },
  { id: 5, name: 'Luis Fernández', phone: '+52 55 5678 9012' },
];

const ManualSendModal = ({ survey, onClose }) => {
  const [audience, setAudience] = useState('all');
  const [channel, setChannel] = useState('push');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [sent, setSent] = useState(false);

  const filteredClients = clients?.filter(c =>
    c?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
    c?.phone?.includes(search)
  );

  const toggleClient = (id) => {
    setSelectedClients(prev =>
      prev?.includes(id) ? prev?.filter(c => c !== id) : [...prev, id]
    );
  };

  const recipientCount = audience === 'all' ? 234 : audience === 'segment' ? 87 : selectedClients?.length;

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-emerald-600" />
          </div>
          <p className="text-base font-semibold text-foreground">✓ Encuesta enviada a {recipientCount} clientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Enviar encuesta manualmente</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <Icon name="X" size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Survey name */}
          <div className="p-3 bg-muted/20 rounded-xl">
            <p className="text-xs text-muted-foreground mb-0.5">Encuesta seleccionada</p>
            <p className="text-sm font-semibold text-foreground">{survey?.name}</p>
          </div>

          {/* Audience */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Destinatarios</label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Todos mis clientes', count: 234 },
                { value: 'segment', label: 'Segmento: Clientes VIP', count: 87 },
                { value: 'specific', label: 'Clientes específicos', count: null },
              ]?.map(opt => (
                <label key={opt?.value} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="radio"
                    name="audience"
                    value={opt?.value}
                    checked={audience === opt?.value}
                    onChange={() => setAudience(opt?.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-foreground flex-1">{opt?.label}</span>
                  {opt?.count && (
                    <span className="text-xs text-muted-foreground font-mono">{opt?.count} clientes</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {audience === 'specific' && (
            <div>
              <input
                value={search}
                onChange={e => setSearch(e?.target?.value)}
                placeholder="Buscar por nombre o teléfono..."
                className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2"
              />
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filteredClients?.map(c => (
                  <label key={c?.id} className="flex items-center gap-2 p-2 hover:bg-muted/20 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedClients?.includes(c?.id)}
                      onChange={() => toggleClient(c?.id)}
                      className="w-3.5 h-3.5 rounded text-primary"
                    />
                    <span className="text-sm text-foreground">{c?.name}</span>
                    <span className="text-xs text-muted-foreground">{c?.phone}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Channel */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Canal de envío</label>
            <div className="flex gap-2">
              {[{ value: 'push', label: '📱 Push notification' }, { value: 'whatsapp', label: '💬 WhatsApp' }]?.map(ch => (
                <button
                  key={ch?.value}
                  onClick={() => setChannel(ch?.value)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                    channel === ch?.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
                  }`}
                >
                  {ch?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Mensaje personalizado <span className="text-muted-foreground font-normal">({message?.length}/160)</span>
            </label>
            <textarea
              value={message}
              onChange={e => e?.target?.value?.length <= 160 && setMessage(e?.target?.value)}
              placeholder="Hola, nos gustaría conocer tu opinión sobre tu última visita..."
              rows={3}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Counter */}
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
            <span className="text-xs text-muted-foreground">Envíos manuales este mes</span>
            <span className="text-xs font-mono font-semibold text-foreground">120 / 500</span>
          </div>

          {/* Preview */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 mb-1">Vista previa de notificación</p>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="ClipboardList" size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">PromoSpot</p>
                <p className="text-xs text-muted-foreground">{message || 'Hola, nos gustaría conocer tu opinión...'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={audience === 'specific' && selectedClients?.length === 0}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Icon name="Send" size={14} />
            Enviar ahora ({recipientCount} clientes)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualSendModal;
