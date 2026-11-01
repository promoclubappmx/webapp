import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CustomerProgressTable = ({ customers, onAdjustProgress, onViewHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('progress');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredCustomers = customers?.filter(customer =>
    customer?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    customer?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const sortedCustomers = [...filteredCustomers]?.sort((a, b) => {
    let aValue = a?.[sortBy];
    let bValue = b?.[sortBy];

    if (sortBy === 'progress') {
      aValue = (a?.currentValue / a?.targetValue) * 100;
      bValue = (b?.currentValue / b?.targetValue) * 100;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-success';
    if (progress >= 75) return 'bg-primary';
    if (progress >= 50) return 'bg-warning';
    return 'bg-muted-foreground';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const estimateCompletion = (customer) => {
    if (customer?.currentValue >= customer?.targetValue) return 'Completado';
    
    const remaining = customer?.targetValue - customer?.currentValue;
    const avgPerVisit = customer?.currentValue / (customer?.visits || 1);
    const estimatedVisits = Math.ceil(remaining / avgPerVisit);
    
    return `~${estimatedVisits} visitas más`;
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground">Progreso de Clientes</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">Cliente</th>
              <th 
                className="text-left p-4 font-medium text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center space-x-1">
                  <span>Progreso</span>
                  <Icon 
                    name={sortBy === 'progress' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                    size={16} 
                  />
                </div>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Valor Actual</th>
              <th className="text-left p-4 font-medium text-foreground">Objetivo</th>
              <th className="text-left p-4 font-medium text-foreground">Estimación</th>
              <th 
                className="text-left p-4 font-medium text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('lastActivity')}
              >
                <div className="flex items-center space-x-1">
                  <span>Última Actividad</span>
                  <Icon 
                    name={sortBy === 'lastActivity' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                    size={16} 
                  />
                </div>
              </th>
              <th className="text-right p-4 font-medium text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers?.map((customer) => {
              const progress = (customer?.currentValue / customer?.targetValue) * 100;
              return (
                <tr key={customer?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer?.name}</p>
                        <p className="text-sm text-muted-foreground">{customer?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {Math.min(progress, 100)?.toFixed(1)}%
                        </span>
                        {progress >= 100 && (
                          <Icon name="CheckCircle" size={16} className="text-success" />
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-foreground font-medium">
                      {customer?.rewardType === 'amount' 
                        ? formatCurrency(customer?.currentValue)
                        : `${customer?.currentValue} visitas`
                      }
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-muted-foreground">
                      {customer?.rewardType === 'amount' 
                        ? formatCurrency(customer?.targetValue)
                        : `${customer?.targetValue} visitas`
                      }
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {estimateCompletion(customer)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(customer.lastActivity)?.toLocaleDateString('es-ES')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewHistory(customer)}
                        iconName="History"
                        iconSize={16}
                      >
                        Historial
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdjustProgress(customer)}
                        iconName="Edit"
                        iconSize={16}
                      >
                        Ajustar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedCustomers?.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes participando'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' :'Los clientes aparecerán aquí cuando comiencen a participar en programas de recompensas'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerProgressTable;