import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TransactionHistory = ({ businessId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Mock transactions
  const mockTransactions = [
    {
      id: 'txn1',
      transactionNumber: 'TXN-20241217-000001',
      customer: {
        fullName: 'María García',
        email: 'maria.garcia@email.com'
      },
      items: [
        { name: 'Paella Valenciana', quantity: 2, price: 18.50 },
        { name: 'Sangría de la Casa', quantity: 2, price: 8.50 }
      ],
      subtotal: 54.00,
      taxAmount: 5.40,
      discountAmount: 5.00,
      totalAmount: 54.40,
      paymentMethod: 'card',
      status: 'completed',
      pointsEarned: 54,
      createdAt: '2024-12-17T14:30:00Z'
    },
    {
      id: 'txn2',
      transactionNumber: 'TXN-20241217-000002',
      customer: {
        fullName: 'Juan Martínez',
        email: 'juan.martinez@email.com'
      },
      items: [
        { name: 'Tapas Variadas', quantity: 1, price: 12.00 },
        { name: 'Café Espresso', quantity: 2, price: 2.50 }
      ],
      subtotal: 17.00,
      taxAmount: 1.70,
      discountAmount: 0,
      totalAmount: 18.70,
      paymentMethod: 'cash',
      status: 'completed',
      pointsEarned: 19,
      createdAt: '2024-12-17T15:45:00Z'
    },
    {
      id: 'txn3',
      transactionNumber: 'TXN-20241217-000003',
      customer: {
        fullName: 'Ana López',
        email: 'ana.lopez@email.com'
      },
      items: [
        { name: 'Tortilla Española', quantity: 3, price: 6.50 },
        { name: 'Cerveza Artesanal', quantity: 3, price: 4.50 }
      ],
      subtotal: 33.00,
      taxAmount: 3.30,
      discountAmount: 3.30,
      totalAmount: 33.00,
      paymentMethod: 'mixed',
      status: 'completed',
      pointsEarned: 33,
      createdAt: '2024-12-17T16:20:00Z'
    },
    {
      id: 'txn4',
      transactionNumber: 'TXN-20241217-000004',
      customer: {
        fullName: 'Pedro Sánchez',
        email: 'pedro.sanchez@email.com'
      },
      items: [
        { name: 'Gazpacho Andaluz', quantity: 2, price: 5.50 }
      ],
      subtotal: 11.00,
      taxAmount: 1.10,
      discountAmount: 0,
      totalAmount: 12.10,
      paymentMethod: 'transfer',
      status: 'completed',
      pointsEarned: 12,
      createdAt: '2024-12-17T17:00:00Z'
    },
    {
      id: 'txn5',
      transactionNumber: 'TXN-20241217-000005',
      customer: {
        fullName: 'Laura Fernández',
        email: 'laura.fernandez@email.com'
      },
      items: [
        { name: 'Paella Valenciana', quantity: 1, price: 18.50 }
      ],
      subtotal: 18.50,
      taxAmount: 1.85,
      discountAmount: 0,
      totalAmount: 20.35,
      paymentMethod: 'card',
      status: 'cancelled',
      pointsEarned: 0,
      createdAt: '2024-12-17T17:30:00Z'
    }
  ];

  // Filter transactions
  const filteredTransactions = mockTransactions?.filter(txn => {
    const matchesSearch = txn?.transactionNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         txn?.customer?.fullName?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = filterStatus === 'all' || txn?.status === filterStatus;
    const matchesPayment = filterPaymentMethod === 'all' || txn?.paymentMethod === filterPaymentMethod;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-success bg-success/10',
      pending: 'text-warning bg-warning/10',
      cancelled: 'text-destructive bg-destructive/10',
      refunded: 'text-muted-foreground bg-muted'
    };
    return colors?.[status] || 'text-muted-foreground bg-muted';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: 'Banknote',
      card: 'CreditCard',
      transfer: 'ArrowRightLeft',
      mixed: 'Split'
    };
    return icons?.[method] || 'DollarSign';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      mixed: 'Mixto'
    };
    return labels?.[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e?.target?.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">Todos los métodos</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="mixed">Mixto</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Número</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Método</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions?.map(txn => (
                <tr key={txn?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-sm text-foreground">{txn?.transactionNumber}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground text-sm">{txn?.customer?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{txn?.customer?.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(txn?.createdAt)?.toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Icon name={getPaymentMethodIcon(txn?.paymentMethod)} size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{getPaymentMethodLabel(txn?.paymentMethod)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold text-foreground">€{txn?.totalAmount?.toFixed(2)}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(txn?.status)}`}>
                      {txn?.status === 'completed' ? 'Completada' : txn?.status === 'cancelled' ? 'Cancelada' : txn?.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTransaction(txn)}
                      iconName="Eye"
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Receipt" size={64} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron transacciones</p>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Receipt" size={24} className="text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Detalle de Transacción</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTransaction(null)}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Número de Transacción</span>
                  <span className="font-mono font-medium text-foreground">{selectedTransaction?.transactionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedTransaction?.createdAt)?.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedTransaction?.status)}`}>
                    {selectedTransaction?.status === 'completed' ? 'Completada' : selectedTransaction?.status}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Cliente</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium text-foreground">{selectedTransaction?.customer?.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction?.customer?.email}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Productos</h3>
                <div className="space-y-2">
                  {selectedTransaction?.items?.map((item, index) => (
                    <div key={index} className="flex justify-between bg-muted/50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">{item?.name}</p>
                        <p className="text-xs text-muted-foreground">Cantidad: {item?.quantity}</p>
                      </div>
                      <span className="font-medium text-foreground">€{(item?.price * item?.quantity)?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Información de Pago</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Método de Pago</span>
                    <div className="flex items-center gap-2">
                      <Icon name={getPaymentMethodIcon(selectedTransaction?.paymentMethod)} size={16} />
                      <span className="font-medium text-foreground">{getPaymentMethodLabel(selectedTransaction?.paymentMethod)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">€{selectedTransaction?.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">IVA</span>
                    <span className="font-medium text-foreground">€{selectedTransaction?.taxAmount?.toFixed(2)}</span>
                  </div>
                  {selectedTransaction?.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-success">Descuento</span>
                      <span className="font-medium text-success">-€{selectedTransaction?.discountAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary text-lg">€{selectedTransaction?.totalAmount?.toFixed(2)}</span>
                  </div>
                  {selectedTransaction?.pointsEarned > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Puntos Ganados</span>
                      <span className="font-medium text-primary">+{selectedTransaction?.pointsEarned} pts</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  iconName="Printer"
                  className="flex-1"
                  onClick={() => alert('Imprimir ticket')}
                >
                  Imprimir
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTransaction(null)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;