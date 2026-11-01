import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import KPICard from '../dashboard-overview/components/KPICard';
import AnalyticsChart from '../dashboard-overview/components/AnalyticsChart';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../contexts/CurrencyContext';

const AutomationEffectivenessDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({ name: 'Usuario', role: 'owner' });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedAutomationType, setSelectedAutomationType] = useState('all');
  const [automationRules, setAutomationRules] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalRulesTriggered: 0,
    totalRevenue: 0,
    avgEngagementUplift: 0,
    avgCostPerConversion: 0,
    totalConversions: 0,
    avgROI: 0
  });
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Get business ID and user
  useEffect(() => {
    const fetchBusinessId = async () => {
      const { data: { session } } = await supabase?.auth?.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        ?.from('user_profiles')
        ?.select('user_id, id, full_name, role')
        ?.eq('id', session?.user?.id)
        ?.single();

      if (profile?.user_id) {
        setBusinessId(profile?.user_id);
        setUserId(profile?.id);
        setUser({
          name: profile?.full_name || session?.user?.email || 'Usuario',
          role: profile?.role || 'owner'
        });
      }
    };

    fetchBusinessId();
  }, [navigate]);

  // Fetch automation rules
  useEffect(() => {
    if (!userId) return;

    const fetchAutomationRules = async () => {
      try {
        const { data, error } = await supabase
          ?.from('engagement_automation_rules')
          ?.select('*')
          ?.eq('user_id', userId)
          ?.eq('is_active', true);

        if (error) throw error;
        setAutomationRules(data || []);
      } catch (error) {
        console.error('Error fetching automation rules:', error);
      }
    };

    fetchAutomationRules();
  }, [userId]);

  // Fetch metrics and calculate stats
  useEffect(() => {
    if (!userId || automationRules?.length === 0) return;

    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
        const days = daysMap?.[dateRange] || 30;
        const startDate = new Date();
        startDate?.setDate(startDate?.getDate() - days);

        // Fetch metrics for all rules
        const ruleIds = automationRules?.map(r => r?.id);
        const { data: metricsData, error } = await supabase
          ?.from('automation_effectiveness_metrics')
          ?.select('*')
          ?.in('automation_rule_id', ruleIds)
          ?.gte('metric_date', startDate?.toISOString()?.split('T')?.[0])
          ?.order('metric_date', { ascending: true });

        if (error) throw error;

        // Filter by automation type if selected
        let filteredMetrics = metricsData || [];
        if (selectedAutomationType !== 'all') {
          const filteredRuleIds = automationRules
            ?.filter(r => r?.action_type === selectedAutomationType)
            ?.map(r => r?.id);
          filteredMetrics = filteredMetrics?.filter(m => 
            filteredRuleIds?.includes(m?.automation_rule_id)
          );
        }

        setMetrics(filteredMetrics);

        // Calculate overall stats
        if (filteredMetrics?.length > 0) {
          const totalRulesTriggered = filteredMetrics?.reduce((sum, m) => sum + (m?.rules_triggered_count || 0), 0);
          const totalRevenue = filteredMetrics?.reduce((sum, m) => sum + parseFloat(m?.revenue_generated || 0), 0);
          const totalConversions = filteredMetrics?.reduce((sum, m) => sum + (m?.conversion_count || 0), 0);
          const avgEngagementUplift = filteredMetrics?.reduce((sum, m) => sum + parseFloat(m?.engagement_uplift || 0), 0) / filteredMetrics?.length;
          const avgCostPerConversion = totalConversions > 0 
            ? filteredMetrics?.reduce((sum, m) => sum + parseFloat(m?.cost_per_conversion || 0), 0) / filteredMetrics?.length
            : 0;
          const avgROI = filteredMetrics?.reduce((sum, m) => sum + parseFloat(m?.roi || 0), 0) / filteredMetrics?.length;

          setOverallStats({
            totalRulesTriggered,
            totalRevenue,
            avgEngagementUplift,
            avgCostPerConversion,
            totalConversions,
            avgROI
          });

          // Prepare chart data (aggregate by date)
          const chartDataMap = {};
          filteredMetrics?.forEach(m => {
            const date = new Date(m?.metric_date)?.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
            if (!chartDataMap?.[date]) {
              chartDataMap[date] = { date, revenue: 0, conversions: 0, rulesTriggered: 0 };
            }
            chartDataMap[date].revenue += parseFloat(m?.revenue_generated || 0);
            chartDataMap[date].conversions += m?.conversion_count || 0;
            chartDataMap[date].rulesTriggered += m?.rules_triggered_count || 0;
          });

          setChartData(Object.values(chartDataMap));
        } else {
          setOverallStats({
            totalRulesTriggered: 0,
            totalRevenue: 0,
            avgEngagementUplift: 0,
            avgCostPerConversion: 0,
            totalConversions: 0,
            avgROI: 0
          });
          setChartData([]);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [userId, automationRules, dateRange, selectedAutomationType]);

  const automationTypes = [
    { value: 'all', label: 'Todos los Tipos' },
    { value: 'apply_coupon', label: 'Aplicar Cupón' },
    { value: 'grant_points', label: 'Otorgar Puntos' },
    { value: 'activate_reward', label: 'Activar Recompensa' },
    { value: 'send_notification', label: 'Enviar Notificación' }
  ];

  const dateRanges = [
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
          }`}
        >
          <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Efectividad de Automatización</h1>
                <p className="text-gray-600 mt-1">
                  Métricas de rendimiento de reglas de automatización
                </p>
              </div>
              <Button
                onClick={() => navigate('/engagement-automation')}
                variant="outline"
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <Icon name="Settings" className="w-5 h-5 mr-2" />
                Gestionar Reglas
              </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Icon name="Filter" className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filtros:</span>
                </div>
                
                <select
                  value={selectedAutomationType}
                  onChange={(e) => setSelectedAutomationType(e?.target?.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  {automationTypes?.map(type => (
                    <option key={type?.value} value={type?.value}>
                      {type?.label}
                    </option>
                  ))}
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e?.target?.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  {dateRanges?.map(range => (
                    <option key={range?.value} value={range?.value}>
                      {range?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <KPICard
                    title="Reglas Disparadas"
                    value={overallStats?.totalRulesTriggered?.toLocaleString()}
                    icon="Zap"
                    color="primary"
                    change={undefined}
                    changeType="neutral"
                  />
                  <KPICard
                    title="Ingresos Generados"
                    value={formatPrice(overallStats?.totalRevenue)}
                    icon="DollarSign"
                    color="success"
                    change={undefined}
                    changeType="neutral"
                  />
                  <KPICard
                    title="Aumento de Engagement"
                    value={`${overallStats?.avgEngagementUplift?.toFixed(1)}%`}
                    change={overallStats?.avgEngagementUplift > 0 ? `+${overallStats?.avgEngagementUplift?.toFixed(1)}%` : undefined}
                    changeType={overallStats?.avgEngagementUplift > 0 ? 'positive' : 'neutral'}
                    icon="TrendingUp"
                    color="warning"
                  />
                  <KPICard
                    title="Costo por Conversión"
                    value={formatPrice(overallStats?.avgCostPerConversion)}
                    icon="Target"
                    color="primary"
                    change={undefined}
                    changeType="neutral"
                  />
                </div>

                {/* Additional Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Icon name="ShoppingCart" className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total de Conversiones</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {overallStats?.totalConversions?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <Icon name="TrendingUp" className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ROI Promedio</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {overallStats?.avgROI?.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <AnalyticsChart
                    data={chartData?.map(d => ({ date: d?.date, value: d?.revenue }))}
                    title="Ingresos Generados por Automatización"
                  />
                  <AnalyticsChart
                    data={chartData?.map(d => ({ date: d?.date, value: d?.conversions }))}
                    title="Conversiones por Día"
                  />
                </div>

                {/* Automation Type Breakdown */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="BarChart3" className="w-5 h-5 text-orange-600" />
                    Desglose por Tipo de Automatización
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['apply_coupon', 'grant_points', 'activate_reward', 'send_notification']?.map(type => {
                      const typeRules = automationRules?.filter(r => r?.action_type === type);
                      const typeMetrics = metrics?.filter(m => 
                        typeRules?.map(r => r?.id)?.includes(m?.automation_rule_id)
                      );
                      const typeRevenue = typeMetrics?.reduce((sum, m) => sum + parseFloat(m?.revenue_generated || 0), 0);
                      const typeConversions = typeMetrics?.reduce((sum, m) => sum + (m?.conversion_count || 0), 0);
                      const typeCost = typeMetrics?.reduce((sum, m) => sum + parseFloat(m?.cost_per_conversion || 0) * (m?.conversion_count || 0), 0);
                      const typeROI = typeCost > 0 ? ((typeRevenue - typeCost) / typeCost * 100) : 0;

                      const typeLabels = {
                        apply_coupon: { label: 'Cupones', icon: 'Tag', color: 'blue' },
                        grant_points: { label: 'Puntos', icon: 'Star', color: 'yellow' },
                        activate_reward: { label: 'Recompensas', icon: 'Gift', color: 'green' },
                        send_notification: { label: 'Notificaciones', icon: 'Bell', color: 'purple' }
                      };

                      const typeInfo = typeLabels?.[type];

                      return (
                        <div key={type} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className={`bg-${typeInfo?.color}-100 p-2 rounded-lg w-fit mb-3`}>
                            <Icon name={typeInfo?.icon} className={`w-5 h-5 text-${typeInfo?.color}-600`} />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">{typeInfo?.label}</h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p>Ingresos: <span className="font-medium text-gray-900">{formatPrice(typeRevenue)}</span></p>
                            <p>Conversiones: <span className="font-medium text-gray-900">{typeConversions}</span></p>
                            <p>ROI: <span className="font-medium text-gray-900">{typeROI?.toFixed(1)}%</span></p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Empty State */}
                {metrics?.length === 0 && (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Icon name="BarChart3" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay datos de métricas disponibles
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Las métricas se generarán automáticamente cuando las reglas de automatización se ejecuten
                    </p>
                    <Button
                      onClick={() => navigate('/engagement-automation')}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Icon name="Plus" className="w-5 h-5 mr-2" />
                      Crear Regla de Automatización
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AutomationEffectivenessDashboard;