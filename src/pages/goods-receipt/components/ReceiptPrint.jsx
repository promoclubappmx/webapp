import React from 'react';
import { useCurrency } from '../../../contexts/CurrencyContext';

const ReceiptPrint = ({ receipt, items }) => {
  const { formatPrice } = useCurrency();

  const totalOrdered = items?.reduce((s, i) => s + (parseFloat(i?.quantity_ordered) || 0) * (parseFloat(i?.unit_cost) || 0), 0) || 0;
  const totalReceived = items?.reduce((s, i) => s + (parseFloat(i?.quantity_received) || 0) * (parseFloat(i?.unit_cost) || 0), 0) || 0;
  const totalRejected = items?.reduce((s, i) => s + (parseFloat(i?.quantity_rejected) || 0) * (parseFloat(i?.unit_cost) || 0), 0) || 0;

  return (
    <div className="p-8 bg-white text-black font-sans max-w-4xl mx-auto" id="receipt-print">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">REPORTE DE RECEPCIÓN DE MERCANCÍA</h1>
          <p className="text-gray-600 text-sm mt-1">Folio: {receipt?.receipt_number}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">Fecha: {receipt?.received_date ? new Date(receipt.received_date)?.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
          <p>Estado: {receipt?.status === 'completed' ? 'RECIBIDO COMPLETO' : receipt?.status === 'partial' ? 'RECIBIDO PARCIAL' : receipt?.status?.toUpperCase()}</p>
        </div>
      </div>
      {/* Info grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">Proveedor</h3>
          <p className="font-semibold">{receipt?.supplier_name || '-'}</p>
          {receipt?.supplier_email && <p className="text-sm text-gray-600">{receipt?.supplier_email}</p>}
        </div>
        <div>
          <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">Orden de Compra</h3>
          <p className="font-semibold">{receipt?.purchase_order_number || '-'}</p>
          {receipt?.receiver_name && (
            <p className="text-sm text-gray-600">Receptor: {receipt?.receiver_name}</p>
          )}
        </div>
      </div>
      {/* Items table */}
      <table className="w-full text-sm mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border border-gray-300">#</th>
            <th className="text-left p-2 border border-gray-300">Producto</th>
            <th className="text-left p-2 border border-gray-300">SKU</th>
            <th className="text-center p-2 border border-gray-300">Pedido</th>
            <th className="text-center p-2 border border-gray-300">Recibido</th>
            <th className="text-center p-2 border border-gray-300">Rechazado</th>
            <th className="text-left p-2 border border-gray-300">Lote</th>
            <th className="text-left p-2 border border-gray-300">Caducidad</th>
            <th className="text-right p-2 border border-gray-300">Calidad</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-2 border border-gray-300">{i + 1}</td>
              <td className="p-2 border border-gray-300 font-medium">{item?.product_name}</td>
              <td className="p-2 border border-gray-300 text-gray-600">{item?.sku || '-'}</td>
              <td className="p-2 border border-gray-300 text-center">{item?.quantity_ordered}</td>
              <td className="p-2 border border-gray-300 text-center font-semibold text-green-700">{item?.quantity_received}</td>
              <td className="p-2 border border-gray-300 text-center text-red-600">{item?.quantity_rejected || 0}</td>
              <td className="p-2 border border-gray-300 text-xs">{item?.batch_number || '-'}</td>
              <td className="p-2 border border-gray-300 text-xs">{item?.expiry_date ? new Date(item.expiry_date + 'T00:00:00')?.toLocaleDateString('es-MX') : '-'}</td>
              <td className="p-2 border border-gray-300 text-right text-xs">
                {item?.quality_status === 'approved' ? '✓ Aprobado' :
                 item?.quality_status === 'rejected' ? '✗ Rechazado' :
                 item?.quality_status === 'partial' ? '~ Parcial' : 'Pendiente'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-sm text-gray-600">Total Pedido:</span>
            <span className="font-medium">{formatPrice(totalOrdered)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-sm text-green-700">Total Recibido:</span>
            <span className="font-bold text-green-700">{formatPrice(totalReceived)}</span>
          </div>
          {totalRejected > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-sm text-red-600">Total Rechazado:</span>
              <span className="font-bold text-red-600">{formatPrice(totalRejected)}</span>
            </div>
          )}
        </div>
      </div>
      {/* Notes & Signature */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          {receipt?.quality_notes && (
            <div className="mb-4">
              <h3 className="font-bold text-sm uppercase text-gray-500 mb-1">Notas de Calidad</h3>
              <p className="text-sm text-gray-700 border border-gray-200 rounded p-2">{receipt?.quality_notes}</p>
            </div>
          )}
          {receipt?.notes && (
            <div>
              <h3 className="font-bold text-sm uppercase text-gray-500 mb-1">Observaciones</h3>
              <p className="text-sm text-gray-700 border border-gray-200 rounded p-2">{receipt?.notes}</p>
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="font-bold text-sm uppercase text-gray-500 mb-4">Firma del Receptor</h3>
          {receipt?.receiver_signature ? (
            <img src={receipt?.receiver_signature} alt="Firma del receptor" className="max-h-20 mx-auto border border-gray-200 rounded" />
          ) : (
            <div className="h-16 border-b-2 border-gray-400 mx-8 mb-2" />
          )}
          <p className="text-sm font-medium">{receipt?.receiver_name || '___________________________'}</p>
          <p className="text-xs text-gray-500">Nombre y firma del receptor</p>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        Generado el {new Date()?.toLocaleString('es-MX')} — Sistema de Gestión PromoClub
      </div>
    </div>
  );
};

export default ReceiptPrint;
