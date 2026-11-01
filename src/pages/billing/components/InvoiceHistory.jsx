import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useCurrency } from '../../../contexts/CurrencyContext';

const InvoiceHistory = () => {
  const [invoices] = useState([
    {
      id: 'INV-2024-003',
      date: '2024-03-15',
      amount: 499,
      status: 'paid',
      plan: 'Pro',
      period: 'Marzo 2024'
    },
    {
      id: 'INV-2024-002',
      date: '2024-02-15',
      amount: 499,
      status: 'paid',
      plan: 'Pro',
      period: 'Febrero 2024'
    },
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 499,
      status: 'paid',
      plan: 'Pro',
      period: 'Enero 2024'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 499,
      status: 'paid',
      plan: 'Pro',
      period: 'Diciembre 2023'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      amount: 499,
      status: 'paid',
      plan: 'Pro',
      period: 'Noviembre 2023'
    },
    {
      id: 'INV-2023-010',
      date: '2023-10-15',
      amount: 0,
      status: 'paid',
      plan: 'Free',
      period: 'Octubre 2023'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const statusConfig = {
    paid: {
      label: 'Pagada',
      color: 'bg-blue-100 text-blue-800',
      icon: 'CheckCircle'
    },
    pending: {
      label: 'Pendiente',
      color: 'bg-yellow-100 text-yellow-800',
      icon: 'Clock'
    },
    failed: {
      label: 'Fallida',
      color: 'bg-red-100 text-red-800',
      icon: 'XCircle'
    }
  };

  const handleDownloadInvoice = (invoiceId) => {
    console.log('Descargando factura:', invoiceId);
    // Simulación de descarga
    alert(`Descargando factura ${invoiceId}\n\nEsta es una funcionalidad de prueba. En producción, aquí se generaría y descargaría el PDF de la factura.`);
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices?.filter(inv => inv?.status === filter);

  const { formatPrice } = useCurrency();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Historial de Facturas</h3>
          <p className="text-gray-600 text-sm mt-1">Consulta y descarga tus facturas</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e?.target?.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas</option>
            <option value="paid">Pagadas</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidas</option>
          </select>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pagado (2024)</p>
              <p className="text-2xl font-bold text-gray-900">$1,497</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Facturas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{invoices?.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Próximo Pago</p>
              <p className="text-2xl font-bold text-gray-900">15 Abr 2024</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Invoices Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Icon name="FileText" size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No se encontraron facturas</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices?.map((invoice) => {
                  const status = statusConfig?.[invoice?.status];
                  return (
                    <tr key={invoice?.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon name="FileText" size={18} className="text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{invoice?.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(invoice?.date)?.toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {invoice?.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invoice?.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatPrice(invoice?.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                          <Icon name={status?.icon} size={14} />
                          <span>{status?.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice?.id)}
                        >
                          <Icon name="Download" size={16} className="mr-1" />
                          Descargar
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHistory;