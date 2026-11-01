import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GiftCardAnalytics = ({ card, onClose }) => {
  // Mock analytics data
  const usageData = [
    { date: '01/12', amount: 0, balance: 100 },
    { date: '06/12', amount: 30, balance: 70 },
    { date: '11/12', amount: 34.50, balance: 35.50 },
    { date: '16/12', amount: 0, balance: 35.50 }
  ];

  const comparisonData = [
    { name: 'Esta tarjeta', value: card?.initialValue - card?.currentBalance, color: '#2563EB' },
    { name: 'Promedio', value: 45, color: '#059669' }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(value);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getUsagePercentage = () => {
    if (card?.initialValue === 0) return 0;
    return Math.round(((card?.initialValue - card?.currentBalance) / card?.initialValue) * 100);
  };

  const getDaysUntilExpiry = () => {
    if (!card?.expiryDate) return null;
    return Math.ceil((new Date(card?.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Analíticas de Tarjeta</h2>
          <p className="text-muted-foreground">{card?.code} - {card?.recipientName}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={20} />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Inicial</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(card?.initialValue)}</p>
            </div>
            <Icon name="DollarSign" size={24} className="text-primary" />
          </div>
        </div>

        <div className="bg-success/5 border border-success/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Balance Actual</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(card?.currentBalance)}</p>
            </div>
            <Icon name="Wallet" size={24} className="text-success" />
          </div>
        </div>

        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monto Usado</p>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(card?.initialValue - card?.currentBalance)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getUsagePercentage()}% usado
              </p>
            </div>
            <Icon name="TrendingUp" size={24} className="text-warning" />
          </div>
        </div>

        <div className={`${daysUntilExpiry && daysUntilExpiry <= 30 ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/50 border-border'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Días para Expirar</p>
              <p className={`text-2xl font-bold ${
                daysUntilExpiry && daysUntilExpiry <= 30 ? 'text-destructive' : 'text-foreground'
              }`}>
                {daysUntilExpiry !== null ? daysUntilExpiry : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Expira: {formatDate(card?.expiryDate)}
              </p>
            </div>
            <Icon name="Calendar" size={24} className={daysUntilExpiry && daysUntilExpiry <= 30 ? 'text-destructive' : 'text-muted-foreground'} />
          </div>
        </div>
      </div>

      {/* Usage Timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-foreground mb-4">Historial de Uso</h3>
        <div className="bg-muted/30 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#2563EB"
                strokeWidth={2}
                name="Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-foreground mb-4">Comparación de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={comparisonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {comparisonData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-4">
              {comparisonData?.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry?.color }}
                  />
                  <span className="text-sm text-muted-foreground">{entry?.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Tasa de Uso</p>
              <p className="text-3xl font-bold text-foreground">{getUsagePercentage()}%</p>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getUsagePercentage()}%` }}
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Transacciones</p>
              <p className="text-3xl font-bold text-foreground">
                {card?.transactions?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Canjes realizados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-lg font-medium text-foreground mb-4">Detalles de la Tarjeta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Código</p>
            <p className="font-medium text-foreground font-mono">{card?.code}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estado</p>
            <p className="font-medium text-foreground capitalize">{card?.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Destinatario</p>
            <p className="font-medium text-foreground">{card?.recipientName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{card?.recipientEmail}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Teléfono</p>
            <p className="font-medium text-foreground">{card?.recipientPhone}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha de Emisión</p>
            <p className="font-medium text-foreground">{formatDate(card?.issuedDate)}</p>
          </div>
        </div>
        {card?.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted-foreground mb-1">Notas</p>
            <p className="text-foreground">{card?.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
        <Button variant="outline" iconName="Download" iconPosition="left">
          Exportar Reporte
        </Button>
        <Button variant="outline" iconName="Printer" iconPosition="left">
          Imprimir
        </Button>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default GiftCardAnalytics;