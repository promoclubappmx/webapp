import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCurrency } from '../../contexts/CurrencyContext';
import { supabase } from '../../lib/supabase';
import ConfiguredCardsGrid from './components/ConfiguredCardsGrid';

const MOCK_MONTHLY = [
  { month: 'Mar', ventas: 12400, canjes: 8200 }, { month: 'Abr', ventas: 18600, canjes: 11300 },
  { month: 'May', ventas: 22100, canjes: 15800 }, { month: 'Jun', ventas: 19500, canjes: 14200 },
  { month: 'Jul', ventas: 28300, canjes: 19600 }, { month: 'Ago', ventas: 31200, canjes: 22100 },
  { month: 'Sep', ventas: 26800, canjes: 18900 }, { month: 'Oct', ventas: 34500, canjes: 24300 },
  { month: 'Nov', ventas: 42100, canjes: 29800 }, { month: 'Dic', ventas: 58700, canjes: 38200 },
  { month: 'Ene', ventas: 21300, canjes: 16100 }, { month: 'Feb', ventas: 29400, canjes: 20500 },
];

const MOCK_CARDS = [
  { id: 1, code: 'ABCD-****-WXYZ', purchaseDate: '2025-01-15', amount: 500, remaining: 350, status: 'active', buyer: 'María García', beneficiary: 'Juan López', expiryDate: '2026-01-15' },
  { id: 2, code: 'EFGH-****-MNOP', purchaseDate: '2025-01-20', amount: 250, remaining: 0, status: 'used', buyer: 'Carlos Ruiz', beneficiary: 'Carlos Ruiz', expiryDate: '2026-01-20' },
  { id: 3, code: 'IJKL-****-QRST', purchaseDate: '2025-02-01', amount: 1000, remaining: 1000, status: 'active', buyer: 'Ana Martínez', beneficiary: 'Pedro Sánchez', expiryDate: '2026-02-01' },
  { id: 4, code: 'UVWX-****-ABCD', purchaseDate: '2024-11-10', amount: 100, remaining: 0, status: 'expired', buyer: 'Luis Torres', beneficiary: 'Luis Torres', expiryDate: '2025-02-10' },
  { id: 5, code: 'YZAB-****-CDEF', purchaseDate: '2025-02-10', amount: 500, remaining: 200, status: 'active', buyer: 'Sofia Herrera', beneficiary: 'Daniela Vega', expiryDate: '2026-02-10' },
  { id: 6, code: 'GHIJ-****-KLMN', purchaseDate: '2025-01-05', amount: 250, remaining: 0, status: 'cancelled', buyer: 'Roberto Díaz', beneficiary: 'Roberto Díaz', expiryDate: '2026-01-05' },
];

const statusConfig = {
  active: { label: 'Activa', color: 'bg-success/10 text-success' },
  used: { label: 'Usada', color: 'bg-muted text-muted-foreground' },
  expired: { label: 'Vencida', color: 'bg-destructive/10 text-destructive' },
  cancelled: { label: 'Cancelada', color: 'bg-warning/10 text-warning' },
};

const KPICard = ({ title, value, trend, icon, color }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        <div className={`flex items-center gap-1 mt-1 text-xs ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
          <Icon name={trend >= 0 ? 'TrendingUp' : 'TrendingDown'} size={12} />
          <span>{Math.abs(trend)}% vs mes anterior</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color}`}><Icon name={icon} size={22} /></div>
    </div>
  </div>
);

const GiftCardsDashboard = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [cards, setCards] = useState(MOCK_CARDS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const user = { name: 'Admin', email: 'admin@promospot.mx', role: 'owner' };

  useEffect(() => { loadCards(); }, []);

  const loadCards = async () => {
    try {
      const { data } = await supabase?.from('gift_cards')?.select('*')?.order('created_at', { ascending: false });
      if (data && data?.length > 0) {
        setCards(data?.map(c => ({
          id: c?.id,
          code: c?.code ? c?.code?.replace(/^(.{4})(.{4})(.{4})$/, '$1-****-$3') : 'XXXX-****-XXXX',
          purchaseDate: c?.issued_date?.split('T')?.[0] || '',
          amount: Number(c?.initial_value), remaining: Number(c?.current_balance),
          status: c?.status, buyer: c?.recipient_name || 'N/A', beneficiary: c?.recipient_name || 'N/A',
          expiryDate: c?.expiry_date?.split('T')?.[0] || '',
        })));
      }
    } catch (e) { console.error(e); }
  };

  const filtered = cards?.filter(c => {
    const matchStatus = statusFilter === 'all' || c?.status === statusFilter;
    const matchSearch = !search || c?.code?.toLowerCase()?.includes(search?.toLowerCase()) || c?.buyer?.toLowerCase()?.includes(search?.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalSold = cards?.length;
  const totalValue = cards?.reduce((s, c) => s + c?.amount, 0);
  const totalRedeemed = cards?.reduce((s, c) => s + (c?.amount - c?.remaining), 0);
  const pendingBalance = cards?.reduce((s, c) => s + c?.remaining, 0);

  const exportToCSV = () => {
    const rows = [['Código', 'Fecha Compra', 'Monto', 'Saldo Restante', 'Estado', 'Comprador', 'Beneficiario', 'Vencimiento']];
    filtered?.forEach(c => rows?.push([c?.code, c?.purchaseDate, c?.amount, c?.remaining, c?.status, c?.buyer, c?.beneficiary, c?.expiryDate]));
    const csv = rows?.map(r => r?.join(','))?.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'gift-cards.csv'; a?.click();
  };

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
                <h1 className="text-2xl font-bold text-foreground">Dashboard Gift Cards</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Métricas y seguimiento de tarjetas de regalo</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/gift-cards-management')} iconName="ArrowLeft" iconPosition="left">Volver</Button>
                <Button onClick={exportToCSV} iconName="Download" iconPosition="left">Exportar Excel</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Gift Cards Vendidas" value={totalSold} trend={12} icon="CreditCard" color="bg-primary/10 text-primary" />
              <KPICard title="Valor Total Vendido" value={formatPrice(totalValue)} trend={18} icon="TrendingUp" color="bg-success/10 text-success" />
              <KPICard title="Valor Canjeado" value={formatPrice(totalRedeemed)} trend={8} icon="CheckCircle" color="bg-blue-100 text-blue-600" />
              <KPICard title="Saldo Pendiente" value={formatPrice(pendingBalance)} trend={-3} icon="Wallet" color="bg-warning/10 text-warning" />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Ventas vs Canjes — Últimos 12 meses</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_MONTHLY} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
                  <Tooltip formatter={v => formatPrice(v)} />
                  <Legend />
                  <Bar dataKey="ventas" name="Ventas" fill="#6366f1" radius={[4,4,0,0]} />
                  <Bar dataKey="canjes" name="Canjes" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Configured Cards Grid */}
            <ConfiguredCardsGrid />

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Tarjetas individuales</h2>
                <div className="flex gap-2 flex-wrap">
                  <input type="search" placeholder="Buscar código o comprador..." value={search} onChange={e => setSearch(e?.target?.value)}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52" />
                  {['all','active','used','expired','cancelled']?.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {s === 'all' ? 'Todas' : statusConfig?.[s]?.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>{['Código','Fecha compra','Monto','Saldo restante','Estado','Comprador','Beneficiario','Vencimiento']?.map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered?.map(card => (
                      <tr key={card?.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{card?.code}</td>
                        <td className="px-4 py-3 text-muted-foreground">{card?.purchaseDate}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{formatPrice(card?.amount)}</td>
                        <td className="px-4 py-3"><span className={card?.remaining > 0 ? 'text-success font-medium' : 'text-muted-foreground'}>{formatPrice(card?.remaining)}</span></td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig?.[card?.status]?.color}`}>{statusConfig?.[card?.status]?.label}</span></td>
                        <td className="px-4 py-3 text-muted-foreground">{card?.buyer}</td>
                        <td className="px-4 py-3 text-muted-foreground">{card?.beneficiary}</td>
                        <td className="px-4 py-3 text-muted-foreground">{card?.expiryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered?.length === 0 && (
                  <div className="text-center py-12"><Icon name="CreditCard" size={40} className="mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No se encontraron tarjetas</p></div>
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
