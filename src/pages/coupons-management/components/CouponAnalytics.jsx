import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const CouponAnalytics = ({ coupon, onClose }) => {
  // Mock analytics data
  const usageData = [
    { date: '01/10', uses: 12, revenue: 156.50 },
    { date: '02/10', uses: 8, revenue: 104.20 },
    { date: '03/10', uses: 15, revenue: 195.75 },
    { date: '04/10', uses: 22, revenue: 287.30 },
    { date: '05/10', uses: 18, revenue: 234.90 },
    { date: '06/10', uses: 25, revenue: 326.25 },
    { date: '07/10', uses: 19, revenue: 248.35 }
  ];

  const customerSegmentData = [
    { name: 'Nuevos', value: 45, color: '#2563EB' },
    { name: 'Recurrentes', value: 35, color: '#059669' },
    { name: 'VIP', value: 20, color: '#D97706' }
  ];

  const hourlyUsage = [
    { hour: '09:00', uses: 2 },
    { hour: '10:00', uses: 5 },
    { hour: '11:00', uses: 8 },
    { hour: '12:00', uses: 12 },
    { hour: '13:00', uses: 15 },
    { hour: '14:00', uses: 18 },
    { hour: '15:00', uses: 22 },
    { hour: '16:00', uses: 19 },
    { hour: '17:00', uses: 16 },
    { hour: '18:00', uses: 14 },
    { hour: '19:00', uses: 11 },
    { hour: '20:00', uses: 8 }
  ];

  const { formatPrice } = useCurrency();

  const formatCurrency = (value) => formatPrice(value);

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getUsagePercentage = () => {
    if (coupon?.usageLimit === 0) return 0;
    return Math.round((coupon?.usedCount / coupon?.usageLimit) * 100);
  };

  const totalRevenue = usageData?.reduce((sum, item) => sum + item?.revenue, 0);
  const averageOrderValue = totalRevenue / coupon?.usedCount;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Analíticas del Cupón</h2>
          <p className="text-muted-foreground">{coupon?.title} - {coupon?.code}</p>
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
              <p className="text-sm text-muted-foreground">Usos Totales</p>
              <p className="text-2xl font-bold text-primary">{coupon?.usedCount}</p>
              <p className="text-xs text-muted-foreground">
                de {coupon?.usageLimit === 0 ? '∞' : coupon?.usageLimit}
              </p>
            </div>
            <Icon name="Ticket" size={24} className="text-primary" />
          </div>
        </div>

        <div className="bg-success/5 border border-success/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ingresos Generados</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-success">+12% vs mes anterior</p>
            </div>
            <Icon name="TrendingUp" size={24} className="text-success" />
          </div>
        </div>

        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Promedio</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(averageOrderValue)}</p>
              <p className="text-xs text-muted-foreground">por uso</p>
            </div>
            <Icon name="DollarSign" size={24} className="text-warning" />
          </div>
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tasa de Uso</p>
              <p className="text-2xl font-bold text-accent">{getUsagePercentage()}%</p>
              <p className="text-xs text-muted-foreground">del límite</p>
            </div>
            <Icon name="Target" size={24} className="text-accent" />
          </div>
        </div>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Usage Trend */}
        <div className="bg-muted/20 border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-foreground mb-4">Tendencia de Uso</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="uses" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-muted/20 border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-foreground mb-4">Segmentos de Clientes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerSegmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerSegmentData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {customerSegmentData?.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item?.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item?.name} ({item?.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Hourly Usage */}
      <div className="bg-muted/20 border border-border rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Uso por Hora del Día</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="hour" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="uses" 
                fill="var(--color-accent)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Coupon Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Detalles del Cupón</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código:</span>
              <span className="font-mono font-medium text-foreground">{coupon?.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descuento:</span>
              <span className="font-medium text-foreground">
                {coupon?.discountType === 'percentage' ? `${coupon?.discountValue}%` : formatCurrency(coupon?.discountValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Válido desde:</span>
              <span className="font-medium text-foreground">{formatDate(coupon?.validFrom)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Válido hasta:</span>
              <span className="font-medium text-foreground">{formatDate(coupon?.validUntil)}</span>
            </div>
            {coupon?.minPurchaseAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Compra mínima:</span>
                <span className="font-medium text-foreground">{formatCurrency(coupon?.minPurchaseAmount)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Estadísticas de Rendimiento</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tasa de conversión:</span>
              <span className="font-medium text-success">8.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ahorro promedio:</span>
              <span className="font-medium text-foreground">{formatCurrency(12.45)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clientes únicos:</span>
              <span className="font-medium text-foreground">{coupon?.usedCount - 8}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usos repetidos:</span>
              <span className="font-medium text-foreground">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compartido:</span>
              <span className="font-medium text-foreground">23 veces</span>
            </div>
          </div>
        </div>
      </div>
      {/* Export Actions */}
      <div className="flex items-center gap-3 pt-6 border-t border-border">
        <Button
          variant="outline"
          iconName="Download"
          iconPosition="left"
        >
          Exportar Datos
        </Button>
        <Button
          variant="outline"
          iconName="Share2"
          iconPosition="left"
        >
          Compartir Reporte
        </Button>
      </div>
    </div>
  );
};

export default CouponAnalytics;