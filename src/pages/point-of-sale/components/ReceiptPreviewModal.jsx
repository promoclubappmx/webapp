import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

const ReceiptPreviewModal = ({ transaction, onClose, onPrint }) => {
  const [receiptSettings, setReceiptSettings] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch system preferences for receipt template
        const { data: preferences } = await supabase
          ?.from('system_preferences')
          ?.select('*')
          ?.eq('business_id', transaction?.business_id)
          ?.single();

        // Fetch business settings for business info
        const { data: business } = await supabase
          ?.from('business_settings')
          ?.select('*')
          ?.eq('business_id', transaction?.business_id)
          ?.single();

        setReceiptSettings(preferences);
        setBusinessSettings(business);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (transaction?.business_id) {
      fetchSettings();
    }
  }, [transaction]);

  const handlePrint = () => {
    const printWindow = window?.open('', '_blank');
    const receiptHtml = generateReceiptHTML();
    
    printWindow?.document?.write(receiptHtml);
    printWindow?.document?.close();
    printWindow?.focus();
    printWindow?.print();
    printWindow?.close();

    if (onPrint) {
      onPrint();
    }
  };

  const generateReceiptHTML = () => {
    const template = receiptSettings?.receipt_template || 'standard';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo - ${transaction?.transaction_number}</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            margin: 0 auto;
            padding: 10mm;
            background: white;
          }
          
          .receipt-header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          
          .business-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .business-info {
            font-size: 10px;
            margin: 2px 0;
          }
          
          .transaction-info {
            margin: 10px 0;
            font-size: 11px;
          }
          
          .items-table {
            width: 100%;
            margin: 10px 0;
            border-collapse: collapse;
          }
          
          .items-table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 5px 0;
            font-size: 11px;
          }
          
          .items-table td {
            padding: 5px 0;
            font-size: 11px;
          }
          
          .item-name {
            width: 50%;
          }
          
          .item-qty {
            width: 15%;
            text-align: center;
          }
          
          .item-price {
            width: 20%;
            text-align: right;
          }
          
          .item-total {
            width: 15%;
            text-align: right;
          }
          
          .totals-section {
            margin-top: 10px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 11px;
          }
          
          .total-row.grand-total {
            font-size: 14px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 5px;
            margin-top: 10px;
          }
          
          .payment-info {
            margin: 15px 0;
            padding: 10px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
          }
          
          .receipt-footer {
            text-align: center;
            margin-top: 15px;
            font-size: 10px;
          }
          
          .barcode {
            text-align: center;
            margin: 10px 0;
            font-family: 'Libre Barcode 128', cursive;
            font-size: 40px;
            letter-spacing: 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <div class="business-name">${businessSettings?.business_name || 'Mi Negocio'}</div>
          <div class="business-info">${businessSettings?.business_address || ''}</div>
          <div class="business-info">${businessSettings?.business_phone || ''}</div>
          <div class="business-info">${businessSettings?.business_email || ''}</div>
        </div>
        
        <div class="transaction-info">
          <div><strong>Recibo:</strong> ${transaction?.transaction_number}</div>
          <div><strong>Fecha:</strong> ${new Date(transaction?.created_at)?.toLocaleString('es-ES')}</div>
          <div><strong>Cajero:</strong> ${transaction?.created_by || 'Sistema'}</div>
          ${transaction?.customer ? `<div><strong>Cliente:</strong> ${transaction?.customer?.full_name}</div>` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-name">Producto</th>
              <th class="item-qty">Cant.</th>
              <th class="item-price">Precio</th>
              <th class="item-total">Total</th>
            </tr>
          </thead>
          <tbody>
            ${transaction?.items?.map(item => `
              <tr>
                <td class="item-name">${item?.item_name}</td>
                <td class="item-qty">${item?.quantity}</td>
                <td class="item-price">€${item?.unit_price?.toFixed(2)}</td>
                <td class="item-total">€${item?.total?.toFixed(2)}</td>
              </tr>
            `)?.join('') || ''}
          </tbody>
        </table>
        
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>€${transaction?.subtotal?.toFixed(2)}</span>
          </div>
          ${transaction?.discount_amount > 0 ? `
            <div class="total-row">
              <span>Descuento:</span>
              <span>-€${transaction?.discount_amount?.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-row">
            <span>IVA (${((transaction?.tax_amount / transaction?.subtotal) * 100)?.toFixed(0)}%):</span>
            <span>€${transaction?.tax_amount?.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>€${transaction?.total_amount?.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="payment-info">
          <div class="total-row">
            <span>Método de Pago:</span>
            <span>${getPaymentMethodLabel(transaction?.payment_method)}</span>
          </div>
          ${transaction?.points_earned > 0 ? `
            <div class="total-row">
              <span>Puntos Ganados:</span>
              <span>${transaction?.points_earned} pts</span>
            </div>
          ` : ''}
          ${transaction?.points_redeemed > 0 ? `
            <div class="total-row">
              <span>Puntos Canjeados:</span>
              <span>${transaction?.points_redeemed} pts</span>
            </div>
          ` : ''}
        </div>
        
        <div class="barcode">${transaction?.transaction_number}</div>
        
        <div class="receipt-footer">
          <div>¡Gracias por su compra!</div>
          <div>Conserve este recibo para cambios o devoluciones</div>
        </div>
      </body>
      </html>
    `;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      mixed: 'Mixto',
      points: 'Puntos',
      coupon: 'Cupón',
      gift_card: 'Tarjeta Regalo'
    };
    return labels?.[method] || method;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Icon name="Receipt" size={24} className="text-primary" />
            Vista Previa del Recibo
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
          />
        </div>

        {/* Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
          <div className="max-w-[80mm] mx-auto bg-white shadow-lg" style={{ fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
            <div className="p-4">
              {/* Business Header */}
              <div className="text-center mb-4 pb-3 border-b-2 border-dashed border-gray-800">
                <div className="text-base font-bold mb-1">
                  {businessSettings?.business_name || 'Mi Negocio'}
                </div>
                <div className="text-xs">{businessSettings?.business_address || ''}</div>
                <div className="text-xs">{businessSettings?.business_phone || ''}</div>
                <div className="text-xs">{businessSettings?.business_email || ''}</div>
              </div>

              {/* Transaction Info */}
              <div className="mb-3 text-xs">
                <div><strong>Recibo:</strong> {transaction?.transaction_number}</div>
                <div><strong>Fecha:</strong> {new Date(transaction?.created_at)?.toLocaleString('es-ES')}</div>
                {transaction?.customer && (
                  <div><strong>Cliente:</strong> {transaction?.customer?.full_name}</div>
                )}
              </div>

              {/* Items */}
              <table className="w-full mb-3 text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-1">Producto</th>
                    <th className="text-center py-1">Cant</th>
                    <th className="text-right py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction?.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="py-1">{item?.item_name}</td>
                      <td className="text-center py-1">{item?.quantity}</td>
                      <td className="text-right py-1">€{item?.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-gray-800 pt-2 mb-3 text-xs">
                <div className="flex justify-between mb-1">
                  <span>Subtotal:</span>
                  <span>€{transaction?.subtotal?.toFixed(2)}</span>
                </div>
                {transaction?.discount_amount > 0 && (
                  <div className="flex justify-between mb-1">
                    <span>Descuento:</span>
                    <span>-€{transaction?.discount_amount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-1">
                  <span>IVA:</span>
                  <span>€{transaction?.tax_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-gray-800 pt-2 mt-2">
                  <span>TOTAL:</span>
                  <span>€{transaction?.total_amount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t border-dashed border-gray-800 pt-2 mb-3 text-xs">
                <div className="flex justify-between">
                  <span>Método de Pago:</span>
                  <span>{getPaymentMethodLabel(transaction?.payment_method)}</span>
                </div>
                {transaction?.points_earned > 0 && (
                  <div className="flex justify-between">
                    <span>Puntos Ganados:</span>
                    <span>{transaction?.points_earned} pts</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-xs border-t border-dashed border-gray-800 pt-3">
                <div className="mb-1">¡Gracias por su compra!</div>
                <div>Conserve este recibo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <Icon name="Info" size={16} className="inline mr-2" />
            Formato optimizado para impresoras térmicas de 80mm
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cerrar
            </Button>
            <Button
              onClick={handlePrint}
              iconName="Printer"
            >
              Imprimir Recibo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreviewModal;