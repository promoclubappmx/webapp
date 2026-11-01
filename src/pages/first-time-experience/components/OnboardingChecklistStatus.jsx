import React from 'react';
import Icon from '../../../components/AppIcon';

const OnboardingChecklistStatus = ({ checklist = [], completedItems = [], onToggleItem }) => {
  const progressPercentage = checklist?.length > 0 
    ? Math.round((completedItems?.length / checklist?.length) * 100) 
    : 0;

  const getPriorityConfig = (priority) => {
    const configs = {
      high: { label: 'Alta Prioridad', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-300' },
      medium: { label: 'Prioridad Media', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-300' },
      low: { label: 'Prioridad Baja', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-300' }
    };
    return configs?.[priority] || configs?.medium;
  };

  const getStatusIcon = (completed) => {
    if (completed) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
          <Icon name="CheckCircle" size={20} className="text-white" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center bg-white">
        <Icon name="Circle" size={16} className="text-gray-400" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border-2 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Icon name="ListChecks" size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Estado del Onboarding</h2>
              <p className="text-sm text-gray-600">Completa estas tareas para activar tu negocio</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{progressPercentage}%</div>
            <p className="text-xs text-gray-600">{completedItems?.length}/{checklist?.length} completadas</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <span className="text-xs font-bold text-white">{progressPercentage}%</span>
              )}
            </div>
          </div>
          {/* Milestone Markers */}
          <div className="absolute top-0 left-0 w-full h-4 flex justify-between px-1">
            {[25, 50, 75]?.map((milestone) => (
              <div 
                key={milestone}
                className={`w-0.5 h-4 ${
                  progressPercentage >= milestone ? 'bg-white' : 'bg-gray-400'
                }`}
                style={{ marginLeft: `${milestone}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Checklist Items */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Icon name="ClipboardList" size={20} className="text-primary" />
          <span>Tareas de Configuración</span>
        </h3>
        
        {checklist?.map((item, index) => {
          const priorityConfig = getPriorityConfig(item?.priority);
          const isCompleted = item?.completed;
          
          return (
            <div
              key={item?.id}
              className={`group relative flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                isCompleted
                  ? 'bg-blue-50 border-blue-300 opacity-75'
                  : `bg-white border-gray-200 hover:border-primary hover:shadow-lg cursor-pointer`
              }`}
              onClick={() => !isCompleted && onToggleItem?.(item?.id)}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(isCompleted)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`text-sm font-semibold ${
                    isCompleted ? 'text-green-700 line-through' : 'text-gray-900'
                  }`}>
                    {item?.title}
                  </h4>
                  {!isCompleted && item?.priority && (
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      priorityConfig?.bgColor
                    } ${
                      priorityConfig?.textColor
                    } flex-shrink-0`}>
                      {priorityConfig?.label}
                    </span>
                  )}
                </div>
                <p className={`text-xs mb-2 ${
                  isCompleted ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {item?.description}
                </p>
                
                {/* Estimated Time */}
                {!isCompleted && item?.estimated_time && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Icon name="Clock" size={12} />
                    <span>Tiempo estimado: {item?.estimated_time}</span>
                  </div>
                )}

                {/* Completion Timestamp */}
                {isCompleted && item?.completed_at && (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <Icon name="CheckCircle" size={12} />
                    <span>Completado: {new Date(item?.completed_at)?.toLocaleDateString('es-MX')}</span>
                  </div>
                )}
              </div>

              {/* Action Indicator */}
              {!isCompleted && (
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="ChevronRight" size={20} className="text-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Completion Message */}
      {progressPercentage === 100 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Trophy" size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            ¡Felicidades! Onboarding Completado
          </h3>
          <p className="text-sm text-blue-700">
            Has completado todas las tareas de configuración inicial. Tu negocio está listo para comenzar.
          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklistStatus;