import React from 'react';
import Icon from '../../../components/AppIcon';

const POSMetrics = ({ businessId }) => {
  // Mock metrics data
  const metricsData = {
    today: {
      totalSales: 1250.50,
      transactions: 45,
      averageTicket: 27.79,
      topProducts: [
        { name: 'Paella Valenciana', quantity: 12, revenue: 222.00 },
        { name: 'Sangría de la Casa', quantity: 18, revenue: 153.00 },
        { name: 'Tapas Variadas', quantity: 15, revenue: 180.00 }
      ],
      paymentMethods: [
        { method: 'Tarjeta', count: 25, amount: 750.30 },
        { method: 'Efectivo', count: 15, amount: 380.20 },
        { method: 'Transferencia', count: 5, amount: 120.00 }
      ],
      hourlyData: [
        { hour: '09:00', sales: 45.50 },
        { hour: '10:00', sales: 78.30 },
        { hour: '11:00', sales: 125.80 },
        { hour: '12:00', sales: 210.40 },
        { hour: '13:00', sales: 285.60 },
        { hour: '14:00', sales: 320.90 },
        { hour: '15:00', sales: 184.00 }
      ]
    },
    week: {
      totalSales: 8750.00,
      transactions: 315,
      averageTicket: 27.78
    },
    month: {
      totalSales: 35400.00,
      transactions: 1260,
      averageTicket: 28.10
    }
  };

  const kpiCards = [
    {
      title: 'Ventas de Hoy',
      value: `€${metricsData?.today?.totalSales?.toFixed(2)}`,
      icon: 'TrendingUp',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Transacciones',
      value: metricsData?.today?.transactions,
      icon: 'Receipt',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Ticket Promedio',
      value: `€${metricsData?.today?.averageTicket?.toFixed(2)}`,
      icon: 'ShoppingCart',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Ventas Semanales',
      value: `€${metricsData?.week?.totalSales?.toFixed(2)}`,
      icon: 'Calendar',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards?.map((kpi, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${kpi?.bgColor}`}>
                <Icon name={kpi?.icon} size={24} className={kpi?.color} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{kpi?.title}</p>
            <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="TrendingUp" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Productos Más Vendidos</h3>
          </div>
          <div className="space-y-4">
            {metricsData?.today?.topProducts?.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{product?.name}</p>
                    <p className="text-xs text-muted-foreground">{product?.quantity} unidades</p>
                  </div>
                </div>
                <span className="font-semibold text-foreground">€{product?.revenue?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="CreditCard" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Métodos de Pago</h3>
          </div>
          <div className="space-y-4">
            {metricsData?.today?.paymentMethods?.map((method, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{method?.method}</span>
                  <span className="text-sm font-semibold text-foreground">€{method?.amount?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(method?.amount / metricsData?.today?.totalSales) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{method?.count} txns</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Sales Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Icon name="BarChart3" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Ventas por Hora</h3>
        </div>
        <div className="h-64 flex items-end justify-between gap-2">
          {metricsData?.today?.hourlyData?.map((data, index) => {
            const maxSales = Math.max(...metricsData?.today?.hourlyData?.map(d => d?.sales));
            const height = (data?.sales / maxSales) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full group">
                  <div
                    className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80 cursor-pointer"
                    style={{ height: `${height * 2}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    €{data?.sales?.toFixed(2)}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{data?.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Period Comparison */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Icon name="Calendar" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Comparación de Períodos</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Hoy</p>
            <p className="text-2xl font-bold text-foreground mb-1">€{metricsData?.today?.totalSales?.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{metricsData?.today?.transactions} transacciones</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Esta Semana</p>
            <p className="text-2xl font-bold text-foreground mb-1">€{metricsData?.week?.totalSales?.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{metricsData?.week?.transactions} transacciones</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Este Mes</p>
            <p className="text-2xl font-bold text-foreground mb-1">€{metricsData?.month?.totalSales?.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{metricsData?.month?.transactions} transacciones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSMetrics;