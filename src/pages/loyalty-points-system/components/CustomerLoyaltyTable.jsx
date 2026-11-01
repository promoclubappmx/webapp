import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CustomerLoyaltyTable = ({ customers, onAdjustBalance, onViewHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('points');
  const [sortDirection, setSortDirection] = useState('desc');
  const [tierFilter, setTierFilter] = useState('all');

  const tierOptions = [
    { value: 'all', label: 'Todos los Niveles' },
    { value: 'bronze', label: 'Bronce' },
    { value: 'silver', label: 'Plata' },
    { value: 'gold', label: 'Oro' },
    { value: 'platinum', label: 'Platino' }
  ];

  const filteredCustomers = customers?.filter(customer => {
      const matchesSearch = customer?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           customer?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesTier = tierFilter === 'all' || customer?.tier === tierFilter;
      return matchesSearch && matchesTier;
    })?.sort((a, b) => {
      const aValue = a?.[sortField];
      const bValue = b?.[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string') {
        return aValue?.localeCompare(bValue) * direction;
      }
      return (aValue - bValue) * direction;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'text-amber-600 bg-amber-50',
      silver: 'text-gray-600 bg-gray-50',
      gold: 'text-yellow-600 bg-yellow-50',
      platinum: 'text-purple-600 bg-purple-50'
    };
    return colors?.[tier] || 'text-gray-600 bg-gray-50';
  };

  const getTierLabel = (tier) => {
    const labels = {
      bronze: 'Bronce',
      silver: 'Plata',
      gold: 'Oro',
      platinum: 'Platino'
    };
    return labels?.[tier] || tier;
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <h3 className="text-lg font-semibold text-foreground">Gestión de Clientes</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Input
              type="search"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full sm:w-64"
            />
            <Select
              options={tierOptions}
              value={tierFilter}
              onChange={setTierFilter}
              placeholder="Filtrar por nivel"
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Cliente</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('tier')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Nivel</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('points')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Puntos</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('totalEarned')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Total Ganado</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('lastActivity')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Última Actividad</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers?.map((customer) => (
              <tr key={customer?.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {customer?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{customer?.name}</p>
                      <p className="text-sm text-muted-foreground">{customer?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(customer?.tier)}`}>
                    {getTierLabel(customer?.tier)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-foreground">{customer?.points?.toLocaleString()}</span>
                </td>
                <td className="p-4">
                  <span className="text-muted-foreground">{customer?.totalEarned?.toLocaleString()}</span>
                </td>
                <td className="p-4">
                  <span className="text-muted-foreground">{customer?.lastActivity}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewHistory(customer?.id)}
                      iconName="History"
                    >
                      Historial
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdjustBalance(customer?.id)}
                      iconName="Edit"
                    >
                      Ajustar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredCustomers?.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron clientes</p>
        </div>
      )}
    </div>
  );
};

export default CustomerLoyaltyTable;