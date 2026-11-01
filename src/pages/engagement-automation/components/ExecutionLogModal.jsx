import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

const ExecutionLogModal = ({ isOpen, onClose, rule }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!rule?.id) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        let query = supabase
          ?.from('automation_execution_log')
          ?.select('*')
          ?.eq('automation_rule_id', rule?.id)
          ?.order('executed_at', { ascending: false });

        if (filterStatus !== 'all') {
          query = query?.eq('execution_status', filterStatus);
        }

        const { data, error } = await query;

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching execution logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [rule?.id, filterStatus]);

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    const colors = {
      success: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      success: 'CheckCircle',
      failed: 'XCircle',
      partial: 'AlertCircle'
    };
    return icons?.[status] || 'Circle';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Historial de Ejecuciones</h2>
            <p className="text-sm text-gray-600 mt-1">{rule?.rule_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>

        {/* Filter */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Estado:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="all">Todos</option>
              <option value="success">Exitoso</option>
              <option value="failed">Fallido</option>
              <option value="partial">Parcial</option>
            </select>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : logs?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="FileText" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay ejecuciones registradas
              </h3>
              <p className="text-gray-600">
                Esta regla aún no se ha ejecutado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs?.map(log => (
                <div key={log?.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        getStatusColor(log?.execution_status)
                      }`}>
                        <Icon name={getStatusIcon(log?.execution_status)} className="w-4 h-4" />
                        {log?.execution_status === 'success' ? 'Exitoso' : 
                         log?.execution_status === 'failed' ? 'Fallido' : 'Parcial'}
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDate(log?.executed_at)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{log?.affected_count || 0}</span> clientes afectados
                    </div>
                  </div>

                  {/* Trigger Context */}
                  {log?.trigger_context && Object.keys(log?.trigger_context)?.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Icon name="Zap" className="w-4 h-4" />
                        Contexto del Trigger
                      </h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        {log?.trigger_context?.catalog_item_id && (
                          <p>Producto ID: {log?.trigger_context?.catalog_item_id}</p>
                        )}
                        {log?.trigger_context?.current_quantity !== undefined && (
                          <p>Cantidad actual: {log?.trigger_context?.current_quantity}</p>
                        )}
                        {log?.trigger_context?.threshold_quantity !== undefined && (
                          <p>Umbral: {log?.trigger_context?.threshold_quantity}</p>
                        )}
                        {log?.trigger_context?.sales_amount !== undefined && (
                          <p>Monto de ventas: ${log?.trigger_context?.sales_amount}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions Taken */}
                  {log?.actions_taken && log?.actions_taken?.length > 0 && (
                    <div className="mb-3 p-3 bg-orange-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <Icon name="Activity" className="w-4 h-4" />
                        Acciones Ejecutadas
                      </h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        {log?.actions_taken?.map((action, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Icon name="CheckCircle" className="w-3 h-3" />
                            {action?.action_type} - {new Date(action?.triggered_at)?.toLocaleTimeString('es-ES')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Error Message */}
                  {log?.error_message && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-red-900 mb-1 flex items-center gap-2">
                        <Icon name="AlertCircle" className="w-4 h-4" />
                        Error
                      </h4>
                      <p className="text-sm text-red-700">{log?.error_message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Total de ejecuciones: <span className="font-semibold">{logs?.length}</span>
            </p>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionLogModal;