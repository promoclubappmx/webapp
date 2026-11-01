import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

const POSHistoryScreen = ({ selectedEstablishment, establishments }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [selectedEstablishment, filterDate]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      let query = supabase?.from('pos_transactions')?.select('*, customer:customers(full_name, email)')?.order('created_at', { ascending: false });

      if (selectedEstablishment && selectedEstablishment !== 'all') {
        query = query?.eq('business_id', selectedEstablishment);
      }

      const now = new Date();
      if (filterDate === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())?.toISOString();
        query = query?.gte('created_at', start);
      } else if (filterDate === 'week') {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)?.toISOString();
        query = query?.gte('created_at', start);
      } else if (filterDate === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1)?.toISOString();
        query = query?.gte('created_at', start);
      }

      const { data, error } = await query?.limit(100);
      if (!error && data) {
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions?.filter(txn => {
    const customerName = txn?.customer?.full_name || txn?.customer_name || '';
    const txnNumber = txn?.transaction_number || txn?.id || '';
    const matchesSearch = txnNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         customerName?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = filterStatus === 'all' || txn?.status === filterStatus;
    const matchesPayment = filterPaymentMethod === 'all' || txn?.payment_method === filterPaymentMethod;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-emerald-600 bg-emerald-500/10',
      pending: 'text-amber-600 bg-amber-500/10',
      cancelled: 'text-rose-600 bg-rose-500/10',
      refunded: 'text-muted-foreground bg-muted',
    };
    return colors?.[status] || 'text-muted-foreground bg-muted';
  };

  const getStatusLabel = (status) => {
    const labels = { completed: 'Completada', pending: 'Pendiente', cancelled: 'Cancelada', refunded: 'Reembolsada' };
    return labels?.[status] || status;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = { cash: 'Banknote', card: 'CreditCard', transfer: 'ArrowRightLeft', mixed: 'Split' };
    return icons?.[method] || 'DollarSign';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', mixed: 'Mixto' };
    return labels?.[method] || method;
  };

  const totalSales = filteredTransactions?.filter(t => t?.status === 'completed')
    ?.reduce((sum, t) => sum + (parseFloat(t?.total_amount) || 0), 0);

  const completedCount = filteredTransactions?.filter(t => t?.status === 'completed')?.length;

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="Receipt" size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Transacciones</p>
            <p className="text-xl font-bold text-foreground">{filteredTransactions?.length || 0}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Icon name="CheckCircle" size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completadas</p>
            <p className="text-xl font-bold text-foreground">{completedCount}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Icon name="TrendingUp" size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Ventas</p>
            <p className="text-xl font-bold text-foreground">${totalSales?.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
          />
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e?.target?.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="all">Todo el historial</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e?.target?.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completadas</option>
            <option value="pending">Pendientes</option>
            <option value="cancelled">Canceladas</option>
            <option value="refunded">Reembolsadas</option>
          </select>
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e?.target?.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Todos los métodos</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="mixed">Mixto</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="ClipboardList" size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Historial de Transacciones</h3>
          </div>
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={loadTransactions} loading={loading}>
            Actualizar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Cargando transacciones...</p>
            </div>
          </div>
        ) : filteredTransactions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Icon name="ClipboardList" size={24} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No hay transacciones para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Número</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Método</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions?.map(txn => (
                  <tr key={txn?.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-foreground">{txn?.transaction_number || `#${txn?.id?.slice(0, 8)}`}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-foreground text-sm">{txn?.customer?.full_name || txn?.customer_name || 'Sin cliente'}</p>
                        <p className="text-xs text-muted-foreground">{txn?.customer?.email || ''}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(txn?.created_at)?.toLocaleString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Icon name={getPaymentMethodIcon(txn?.payment_method)} size={15} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{getPaymentMethodLabel(txn?.payment_method)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold text-foreground">${parseFloat(txn?.total_amount || 0)?.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(txn?.status)}`}>
                        {getStatusLabel(txn?.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(txn)} iconName="Eye">
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Detalle de Transacción</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedTransaction?.transaction_number || `#${selectedTransaction?.id?.slice(0, 8)}`}</p>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Icon name="X" size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Cliente</p>
                  <p className="font-medium text-foreground">{selectedTransaction?.customer?.full_name || selectedTransaction?.customer_name || 'Sin cliente'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Estado</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction?.status)}`}>
                    {getStatusLabel(selectedTransaction?.status)}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Método de Pago</p>
                  <p className="font-medium text-foreground">{getPaymentMethodLabel(selectedTransaction?.payment_method)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Fecha</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedTransaction?.created_at)?.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${parseFloat(selectedTransaction?.subtotal || 0)?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span className="font-medium">${parseFloat(selectedTransaction?.tax_amount || 0)?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="font-medium text-rose-600">-${parseFloat(selectedTransaction?.discount_amount || 0)?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
                  <span>Total</span>
                  <span>${parseFloat(selectedTransaction?.total_amount || 0)?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSHistoryScreen;
