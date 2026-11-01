import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AutomationRuleCard = ({ rule, onToggleActive, onEdit, onDelete, onViewLog }) => {
  const getTriggerIcon = (triggerType) => {
    const icons = {
      low_stock: 'PackageX',
      high_sales: 'TrendingUp',
      customer_inactive: 'UserX',
      customer_birthday: 'Cake',
      milestone_reached: 'Award'
    };
    return icons?.[triggerType] || 'Zap';
  };

  const getTriggerLabel = (triggerType) => {
    const labels = {
      low_stock: 'Stock Bajo',
      high_sales: 'Ventas Altas',
      customer_inactive: 'Cliente Inactivo',
      customer_birthday: 'Cumpleaños',
      milestone_reached: 'Hito Alcanzado'
    };
    return labels?.[triggerType] || triggerType;
  };

  const getActionIcon = (actionType) => {
    const icons = {
      apply_coupon: 'Tag',
      grant_points: 'Star',
      activate_reward: 'Gift',
      send_notification: 'Bell'
    };
    return icons?.[actionType] || 'Zap';
  };

  const getActionLabel = (actionType) => {
    const labels = {
      apply_coupon: 'Aplicar Cupón',
      grant_points: 'Otorgar Puntos',
      activate_reward: 'Activar Recompensa',
      send_notification: 'Enviar Notificación'
    };
    return labels?.[actionType] || actionType;
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      once: 'Una vez',
      daily: 'Diario',
      weekly: 'Semanal',
      real_time: 'Tiempo real'
    };
    return labels?.[frequency] || frequency;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
      rule?.is_active ? 'border-green-500' : 'border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              rule?.is_active ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Icon 
                name={getTriggerIcon(rule?.trigger_type)} 
                className={`w-5 h-5 ${
                  rule?.is_active ? 'text-green-600' : 'text-gray-600'
                }`} 
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{rule?.rule_name}</h3>
              <p className="text-sm text-gray-600">{rule?.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(rule?.id, rule?.is_active)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              rule?.is_active
                ? 'bg-blue-100 text-blue-700' :'bg-gray-100 text-gray-700'
            }`}
          >
            {rule?.is_active ? 'Activa' : 'Inactiva'}
          </button>
        </div>
      </div>

      {/* Trigger and Action Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Zap" className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Trigger</span>
          </div>
          <p className="text-sm text-blue-700 font-medium">
            {getTriggerLabel(rule?.trigger_type)}
          </p>
          {rule?.conditions && (
            <div className="mt-2 text-xs text-blue-600">
              {rule?.conditions?.threshold_quantity && (
                <p>Umbral: {rule?.conditions?.threshold_quantity} unidades</p>
              )}
              {rule?.conditions?.threshold_amount && (
                <p>Umbral: ${rule?.conditions?.threshold_amount}</p>
              )}
              {rule?.conditions?.days_since_visit && (
                <p>Días sin visitar: {rule?.conditions?.days_since_visit}</p>
              )}
              {rule?.conditions?.days_before && (
                <p>Días antes: {rule?.conditions?.days_before}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name={getActionIcon(rule?.action_type)} className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Acción</span>
          </div>
          <p className="text-sm text-orange-700 font-medium">
            {getActionLabel(rule?.action_type)}
          </p>
          {rule?.action_config && (
            <div className="mt-2 text-xs text-orange-600">
              {rule?.action_config?.points_amount && (
                <p>Puntos: {rule?.action_config?.points_amount}</p>
              )}
              {rule?.action_config?.auto_apply !== undefined && (
                <p>Auto-aplicar: {rule?.action_config?.auto_apply ? 'Sí' : 'No'}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Execution Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600">Frecuencia</p>
          <p className="text-sm font-medium text-gray-900">
            {getFrequencyLabel(rule?.execution_frequency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Ejecuciones</p>
          <p className="text-sm font-medium text-gray-900">
            {rule?.execution_count || 0}
            {rule?.max_executions > 0 && ` / ${rule?.max_executions}`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Última ejecución</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(rule?.last_executed_at)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Prioridad</p>
          <p className="text-sm font-medium text-gray-900">
            {rule?.priority || 1}
          </p>
        </div>
      </div>

      {/* Validity Period */}
      {(rule?.valid_from || rule?.valid_until) && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <Icon name="Calendar" className="w-4 h-4" />
            <span>
              Válida desde {formatDate(rule?.valid_from)}
              {rule?.valid_until && ` hasta ${formatDate(rule?.valid_until)}`}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          onClick={() => onViewLog(rule)}
          variant="outline"
          className="text-sm"
        >
          <Icon name="FileText" className="w-4 h-4 mr-1" />
          Ver Log
        </Button>
        <Button
          onClick={() => onEdit(rule)}
          variant="outline"
          className="text-sm"
        >
          <Icon name="Edit" className="w-4 h-4 mr-1" />
          Editar
        </Button>
        <Button
          onClick={() => onDelete(rule?.id)}
          variant="outline"
          className="text-sm text-red-600 hover:bg-red-50"
        >
          <Icon name="Trash2" className="w-4 h-4 mr-1" />
          Eliminar
        </Button>
      </div>
    </div>
  );
};

export default AutomationRuleCard;