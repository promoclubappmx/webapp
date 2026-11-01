import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const paymentTermsLabel = {
  immediate: 'Pago inmediato',
  net15: 'Neto 15 días',
  net30: 'Neto 30 días',
  net45: 'Neto 45 días',
  net60: 'Neto 60 días'
};

const SupplierCard = ({ supplier, onEdit, onDelete, onViewProducts }) => {
  const { formatPrice } = useCurrency();
  const rating = supplier?.rating || 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Truck" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{supplier?.name}</h3>
            <p className="text-xs text-muted-foreground">{supplier?.contact_name}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          supplier?.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
        }`}>
          {supplier?.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      <div className="space-y-1.5 mb-4">
        {supplier?.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Mail" size={14} />
            <span>{supplier?.email}</span>
          </div>
        )}
        {supplier?.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Phone" size={14} />
            <span>{supplier?.phone}</span>
          </div>
        )}
        {supplier?.rfc && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="FileText" size={14} />
            <span>RFC: {supplier?.rfc}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <p className="text-xs text-muted-foreground">Términos de pago</p>
          <p className="text-xs font-semibold text-foreground mt-0.5">{paymentTermsLabel?.[supplier?.payment_terms] || supplier?.payment_terms}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <p className="text-xs text-muted-foreground">Entrega</p>
          <p className="text-xs font-semibold text-foreground mt-0.5">{supplier?.delivery_days ? `${supplier?.delivery_days} días` : '—'}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <p className="text-xs text-muted-foreground">Total comprado</p>
          <p className="text-xs font-semibold text-foreground mt-0.5">{formatPrice(supplier?.total_purchased || 0)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <p className="text-xs text-muted-foreground">Pedidos</p>
          <p className="text-xs font-semibold text-foreground mt-0.5">{supplier?.total_orders || 0}</p>
        </div>
      </div>
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[1,2,3,4,5]?.map(star => (
          <Icon key={star} name="Star" size={14} className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating > 0 ? `${rating}/5` : 'Sin calificación'}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewProducts?.(supplier)} iconName="Package" iconPosition="left" className="flex-1">
          Productos
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit?.(supplier)} iconName="Edit" iconSize={14} />
        <Button variant="outline" size="sm" onClick={() => onDelete?.(supplier?.id)} iconName="Trash2" iconSize={14} className="text-destructive hover:text-destructive" />
      </div>
    </div>
  );
};

export default SupplierCard;
