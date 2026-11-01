import React from 'react';
import Icon from '../../../components/AppIcon';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Borrador',
          icon: 'FileText',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'pending':
        return {
          label: 'Pendiente',
          icon: 'Clock',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'published':
        return {
          label: 'Publicado',
          icon: 'CheckCircle',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'suspended':
        return {
          label: 'Suspendido',
          icon: 'XCircle',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          label: 'Desconocido',
          icon: 'HelpCircle',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config?.className}`}>
      <Icon name={config?.icon} size={12} className="mr-1" />
      {config?.label}
    </span>
  );
};

export default StatusBadge;