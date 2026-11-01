import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCurrency } from '../../contexts/CurrencyContext';


const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const mockChartData = MONTHS?.map((m, i) => ({
  mes: m,
  vendidas: Math.floor(Math.random() * 80 + 20) * 500,
  canjeadas: Math.floor(Math.random() * 60 + 10) * 500,
}));

const mockCards = [
  { code: 'ABCD-****-1234', purchaseDate: '2025-01-15', amount: 500, balance: 350, status: 'active', buyer: 'María García', beneficiary: 'Juan López', expiryDate: '2026-01-15' },
  { code: 'EFGH-****-5678', purchaseDate: '2025-02-01', amount: 250, balance: 0, status: 'used', buyer: 'Carlos Ruiz', beneficiary: 'Carlos Ruiz', expiryDate: '2026-02-01' },
  { code: 'IJKL-****-9012', purchaseDate: '2024-11-20', amount: 1000, balance: 1000, status: 'expired', buyer: 'Ana Torres', beneficiary: 'Pedro Sánchez', expiryDate: '2025-02-20' },
  { code: 'MNOP-****-3456', purchaseDate: '2025-03-01', amount: 100, balance: 75, status: 'active', buyer: 'Luis Martínez', beneficiary: 'Luis Martínez', expiryDate: '2026-03-01' },
];

const STATUS_LABELS = { active: 'Activa', used: 'Usada', expired: 'Vencida', cancelled: 'Cancelada' };
const STATUS_COLORS = { active: 'bg-success/10 text-success', used: 'bg-muted text-muted-foreground', expired: 'bg-destructive/10 text-destructive', cancelled: 'bg-warning/10 text-warning' };

const GiftCardsDashboard = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cards, setCards] = useState(mockCards);
  const [isLoading, setIsLoading] = useState(false);

  const user = { name: 'Carlos Mendoza', email: 'carlos@promospot.mx', role: 'owner' };

  const kpis = [
    { label: 'Gift Cards Vendidas', value: '247', trend: '+12%', up: true, icon: 'CreditCard', color: 'primary' },
    { label: 'Valor Total Vendido', value: formatPrice(123500), trend: '+18%', up: true, icon: 'TrendingUp', color: 'success' },
    { label: 'Valor Canjeado', value: formatPrice(89200), trend: '+8%', up: true, icon: 'CheckCircle', color: 'warning' },
    { label: 'Saldo Pendiente', value: formatPrice(34300), trend: '-3%', up: false, icon: 'Wallet', color: 'destructive', note: 'liability actual' },
  ];

  const filtered = statusFilter === 'all' ? cards : cards?.filter(c => c?.status === statusFilter);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userRole={user?.role}
        isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard — Gift Cards</h1>
                <p className="text-muted-foreground text-sm mt-1">Métricas y seguimiento de gift cards digitales</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" iconName="ArrowLeft" iconPosition="left" onClick={() => navigate('/gift-cards-management')}>Volver</Button>
                <Button variant="outline" iconName="Download" iconPosition="left">Exportar Excel</Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis?.map((kpi, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{kpi?.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{kpi?.value}</p>
                      {kpi?.note && <p className="text-xs text-muted-foreground mt-0.5">{kpi?.note}</p>}
                    </div>
                    <div className={`p-2.5 bg-${kpi?.color}/10 rounded-lg`}>
                      <Icon name={kpi?.icon} size={20} className={`text-${kpi?.color}`} />
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${kpi?.up ? 'text-success' : 'text-destructive'}`}>
                    <Icon name={kpi?.up ? 'TrendingUp' : 'TrendingDown'} size={12} />
                    <span>{kpi?.trend} vs mes anterior</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly Chart */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">Ventas vs Canjes — Últimos 12 meses</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mockChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatPrice(v)} />
                  <Legend />
                  <Bar dataKey="vendidas" name="Vendidas" fill="#2563eb" radius={[4,4,0,0]} />
                  <Bar dataKey="canjeadas" name="Canjeadas" fill="#16a34a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Gift Cards Individuales</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e?.target?.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activas</option>
                    <option value="used">Usadas</option>
                    <option value="expired">Vencidas</option>
                    <option value="cancelled">Canceladas</option>
                  </select>
                  <Button variant="outline" size="sm" iconName="Download" iconPosition="left">Excel</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {['Código','Fecha Compra','Monto','Saldo','Estado','Comprador','Beneficiario','Vencimiento']?.map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered?.map((card, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{card?.code}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{card?.purchaseDate}</td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground">{formatPrice(card?.amount)}</td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground">{formatPrice(card?.balance)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS?.[card?.status]}`}>
                            {STATUS_LABELS?.[card?.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">{card?.buyer}</td>
                        <td className="px-4 py-3 text-xs text-foreground">{card?.beneficiary}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{card?.expiryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered?.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">No hay gift cards con ese filtro</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GiftCardsDashboard;
