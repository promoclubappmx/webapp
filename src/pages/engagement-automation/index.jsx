import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import AutomationRuleCard from './components/AutomationRuleCard';
import CreateAutomationModal from './components/CreateAutomationModal';
import ExecutionLogModal from './components/ExecutionLogModal';
import { useAutomationTriggerMonitor } from '../automation-effectiveness-dashboard/components/AutomationExecutionEngine';
import Button from '../../components/ui/Button';


const EngagementAutomation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({ name: 'Usuario', role: 'owner' });
  const [loading, setLoading] = useState(true);
  const [automationRules, setAutomationRules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [showExecutionLog, setShowExecutionLog] = useState(false);
  const [filterTrigger, setFilterTrigger] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Initialize automation monitoring
  const { activeRules: monitoredRules, monitoring, startMonitoring } = useAutomationTriggerMonitor(businessId, userId);

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
      setLoading(true);
      try {
        let query = supabase
          ?.from('engagement_automation_rules')
          ?.select('*')
          ?.eq('user_id', userId)
          ?.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setAutomationRules(data || []);
      } catch (error) {
        console.error('Error fetching automation rules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAutomationRules();
  }, [userId]);

  // Real-time subscription for automation rules
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      ?.channel('automation_rules_changes')
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'engagement_automation_rules',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Automation rule change detected:', payload);
          if (payload?.eventType === 'INSERT') {
            setAutomationRules(prev => [payload?.new, ...prev]);
          } else if (payload?.eventType === 'UPDATE') {
            setAutomationRules(prev =>
              prev?.map(rule => rule?.id === payload?.new?.id ? payload?.new : rule)
            );
          } else if (payload?.eventType === 'DELETE') {
            setAutomationRules(prev => prev?.filter(rule => rule?.id !== payload?.old?.id));
          }
        }
      )
      ?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [userId]);

  const handleCreateRule = async (ruleData) => {
    try {
      const { data, error } = await supabase
        ?.from('engagement_automation_rules')
        ?.insert([{
          ...ruleData,
          business_id: businessId,
          user_id: userId
        }])
        ?.select()
        ?.single();

      if (error) throw error;
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating automation rule:', error);
      alert('Error al crear la regla de automatización');
    }
  };

  const handleUpdateRule = async (ruleId, updates) => {
    try {
      const { error } = await supabase
        ?.from('engagement_automation_rules')
        ?.update(updates)
        ?.eq('id', ruleId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating automation rule:', error);
      alert('Error al actualizar la regla');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta regla de automatización?')) return;

    try {
      const { error } = await supabase
        ?.from('engagement_automation_rules')
        ?.delete()
        ?.eq('id', ruleId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      alert('Error al eliminar la regla');
    }
  };

  const handleToggleActive = async (ruleId, currentStatus) => {
    await handleUpdateRule(ruleId, { is_active: !currentStatus });
  };

  const handleViewExecutionLog = (rule) => {
    setSelectedRule(rule);
    setShowExecutionLog(true);
  };

  const filteredRules = automationRules?.filter(rule => {
    if (filterTrigger !== 'all' && rule?.trigger_type !== filterTrigger) return false;
    if (filterStatus === 'active' && !rule?.is_active) return false;
    if (filterStatus === 'inactive' && rule?.is_active) return false;
    return true;
  });

  const stats = {
    total: automationRules?.length || 0,
    active: automationRules?.filter(r => r?.is_active)?.length || 0,
    inactive: automationRules?.filter(r => !r?.is_active)?.length || 0,
    totalExecutions: automationRules?.reduce((sum, r) => sum + (r?.execution_count || 0), 0)
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Automatización de Engagement</h1>
                <p className="text-gray-600 mt-1">
                  Configura triggers automáticos basados en inventario y transacciones
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate('/automation-effectiveness-dashboard')}
                  variant="outline"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <Icon name="BarChart3" className="w-5 h-5 mr-2" />
                  Ver Métricas
                </Button>
                <Button
                  onClick={startMonitoring}
                  disabled={monitoring}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  {monitoring ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Monitoreando...
                    </>
                  ) : (
                    <>
                      <Icon name="Play" className="w-5 h-5 mr-2" />
                      Ejecutar Monitoreo
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Icon name="Plus" className="w-5 h-5 mr-2" />
                  Nueva Regla
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Reglas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Icon name="Zap" className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reglas Activas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.active}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Icon name="CheckCircle" className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reglas Inactivas</p>
                    <p className="text-2xl font-bold text-gray-600">{stats?.inactive}</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <Icon name="PauseCircle" className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ejecuciones Totales</p>
                    <p className="text-2xl font-bold text-orange-600">{stats?.totalExecutions}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Icon name="Activity" className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Trigger
                  </label>
                  <select
                    value={filterTrigger}
                    onChange={(e) => setFilterTrigger(e?.target?.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Todos los triggers</option>
                    <option value="low_stock">Stock Bajo</option>
                    <option value="high_sales">Ventas Altas</option>
                    <option value="customer_inactive">Cliente Inactivo</option>
                    <option value="customer_birthday">Cumpleaños</option>
                    <option value="milestone_reached">Hito Alcanzado</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e?.target?.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activas</option>
                    <option value="inactive">Inactivas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Automation Rules List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredRules?.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Icon name="Zap" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay reglas de automatización
                </h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primera regla para automatizar acciones de engagement
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Icon name="Plus" className="w-5 h-5 mr-2" />
                  Crear Primera Regla
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredRules?.map(rule => (
                  <AutomationRuleCard
                    key={rule?.id}
                    rule={rule}
                    onToggleActive={handleToggleActive}
                    onEdit={(rule) => {
                      setSelectedRule(rule);
                      setShowCreateModal(true);
                    }}
                    onDelete={handleDeleteRule}
                    onViewLog={handleViewExecutionLog}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateAutomationModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedRule(null);
          }}
          onSave={selectedRule ? 
            (data) => handleUpdateRule(selectedRule?.id, data) : 
            handleCreateRule
          }
          rule={selectedRule}
          businessId={businessId}
        />
      )}

      {/* Execution Log Modal */}
      {showExecutionLog && selectedRule && (
        <ExecutionLogModal
          isOpen={showExecutionLog}
          onClose={() => {
            setShowExecutionLog(false);
            setSelectedRule(null);
          }}
          rule={selectedRule}
        />
      )}
    </div>
  );
};

export default EngagementAutomation;