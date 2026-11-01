import React from 'react';
import Icon from '../../../components/AppIcon';

const statusConfig = {
  paid: { label: 'Pagada', color: 'bg-success/10 text-success' },
  pending: { label: 'Pendiente', color: 'bg-warning/10 text-warning' },
  overdue: { label: 'Vencida', color: 'bg-destructive/10 text-destructive' },
  cancelled: { label: 'Cancelada', color: 'bg-muted text-muted-foreground' },
  refunded: { label: 'Reembolsada', color: 'bg-blue-100 text-blue-700' },
};

const FacturasTab = ({ invoices = [] }) => {
  if (invoices?.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="FileText" size={28} className="text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">Sin facturas aún</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Tus facturas aparecerán aquí una vez que actives un plan de pago.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">Historial de Facturas</h3>
        <span className="text-xs text-muted-foreground">{invoices?.length} facturas</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Factura</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descripción</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices?.map((invoice) => {
              const status = statusConfig?.[invoice?.status] || statusConfig?.pending;
              return (
                <tr key={invoice?.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{invoice?.invoice_number}</td>
                  <td className="px-4 py-3 text-foreground">{invoice?.description || 'Suscripción mensual'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(invoice?.created_at)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    ${invoice?.total_amount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {invoice?.currency}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                      {status?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {invoice?.pdf_url && (
                        <a href={invoice?.pdf_url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Descargar PDF">
                          <Icon name="Download" size={15} />
                        </a>
                      )}
                      {!invoice?.pdf_url && (
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="PDF no disponible" disabled>
                          <Icon name="FileText" size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacturasTab;
