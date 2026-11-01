import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MOCK_CUSTOMERS = [
  { id: 1, name: 'María González', phone: '555-1234', lastVisit: 'hace 2 días', reviews: 0 },
  { id: 2, name: 'Roberto Sánchez', phone: '555-5678', lastVisit: 'hace 5 días', reviews: 1 },
  { id: 3, name: 'Ana Martínez', phone: '555-9012', lastVisit: 'hace 1 semana', reviews: 0 },
  { id: 4, name: 'Luis Pérez', phone: '555-3456', lastVisit: 'hace 3 días', reviews: 2 },
];

const MOCK_HISTORY = [
  { id: 1, customer: 'María González', date: '08 Mar 2026', status: 'reseña dejada' },
  { id: 2, customer: 'Carlos López', date: '07 Mar 2026', status: 'vista' },
  { id: 3, customer: 'Sofía Ramírez', date: '06 Mar 2026', status: 'enviada' },
  { id: 4, customer: 'Diego Torres', date: '05 Mar 2026', status: 'reseña dejada' },
  { id: 5, customer: 'Valentina Cruz', date: '04 Mar 2026', status: 'enviada' },
];

const STATUS_STYLES = {
  'enviada': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'vista': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'reseña dejada': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const ManualRequests = ({ branch }) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sentToday, setSentToday] = useState(2);
  const [toastMsg, setToastMsg] = useState('');

  const filtered = MOCK_CUSTOMERS?.filter(c =>
    c?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
    c?.phone?.includes(search)
  );

  const handleSend = (customer) => {
    if (sentToday >= 10) {
      setToastMsg('Has alcanzado el límite de 10 solicitudes manuales por día');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    setSentToday(prev => prev + 1);
    setSelectedCustomer(null);
    setSearch('');
    setToastMsg(`Solicitud enviada a ${customer?.name}`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Solicitudes manuales</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Envía solicitudes de reseña a clientes específicos con interacción verificada</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
          <Icon name="Send" size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{sentToday}/10</span>
          <span className="text-xs text-muted-foreground">hoy</span>
        </div>
      </div>
      {toastMsg && (
        <div className="mb-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
          <Icon name="CheckCircle" size={14} />
          {toastMsg}
        </div>
      )}
      {/* Search */}
      <div className="relative mb-4">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre o teléfono..."
          value={search}
          onChange={e => { setSearch(e?.target?.value); setSelectedCustomer(null); }}
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {/* Results */}
      {search && (
        <div className="border border-border rounded-lg overflow-hidden mb-5">
          {filtered?.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No se encontraron clientes con interacción verificada en esta sucursal</div>
          ) : (
            filtered?.map(customer => (
              <div
                key={customer?.id}
                className={`flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${selectedCustomer?.id === customer?.id ? 'bg-primary/5' : ''}`}
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="User" size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{customer?.name}</p>
                    <p className="text-xs text-muted-foreground">{customer?.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">Última visita: {customer?.lastVisit}</span>
                  {customer?.reviews > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">Ya tiene {customer?.reviews} reseña{customer?.reviews > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {selectedCustomer && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{selectedCustomer?.name}</p>
            <p className="text-xs text-muted-foreground">Última visita: {selectedCustomer?.lastVisit} · {selectedCustomer?.reviews > 0 ? `Ya tiene ${selectedCustomer?.reviews} reseña(s)` : 'Sin reseñas aún'}</p>
          </div>
          <button
            onClick={() => handleSend(selectedCustomer)}
            disabled={sentToday >= 10}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Icon name="Send" size={14} />
            Enviar solicitud
          </button>
        </div>
      )}
      {/* History */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Historial de solicitudes manuales</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2">Cliente</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2">Fecha</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_HISTORY?.map(row => (
                <tr key={row?.id}>
                  <td className="py-2.5 text-sm text-foreground">{row?.customer}</td>
                  <td className="py-2.5 text-sm text-muted-foreground">{row?.date}</td>
                  <td className="py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES?.[row?.status]}`}>
                      {row?.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManualRequests;
