import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import StatusBadge from './StatusBadge';

const BusinessDataTable = ({ 
  businesses = [], 
  onEdit, 
  onDelete, 
  onCreate, 
  onBulkDelete,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('businessName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedBusinesses, setSelectedBusinesses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'published', label: 'Publicado' },
    { value: 'draft', label: 'Borrador' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'suspended', label: 'Suspendido' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Todas las Categorías' },
    { value: 'spanish-cuisine', label: 'Cocina Española' },
    { value: 'italian-cuisine', label: 'Cocina Italiana' },
    { value: 'mexican-cuisine', label: 'Cocina Mexicana' },
    { value: 'asian-cuisine', label: 'Cocina Asiática' },
    { value: 'fast-food', label: 'Comida Rápida' },
    { value: 'cafe-bakery', label: 'Cafetería y Panadería' }
  ];

  const itemsPerPageOptions = [
    { value: 5, label: '5 por página' },
    { value: 10, label: '10 por página' },
    { value: 25, label: '25 por página' },
    { value: 50, label: '50 por página' }
  ];

  // Filter and sort businesses
  const filteredBusinesses = businesses
    ?.filter(business => {
      const matchesSearch = business?.businessName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                          business?.city?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                          business?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesStatus = statusFilter === 'all' || business?.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || business?.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    ?.sort((a, b) => {
      const aVal = a?.[sortBy]?.toString()?.toLowerCase() || '';
      const bVal = b?.[sortBy]?.toString()?.toLowerCase() || '';
      
      if (sortOrder === 'asc') {
        return aVal?.localeCompare(bVal);
      }
      return bVal?.localeCompare(aVal);
    });

  // Pagination
  const totalItems = filteredBusinesses?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBusinesses = filteredBusinesses?.slice(startIndex, endIndex) || [];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBusinesses(currentBusinesses?.map(b => b?.id) || []);
    } else {
      setSelectedBusinesses([]);
    }
  };

  const handleSelectBusiness = (businessId, checked) => {
    if (checked) {
      setSelectedBusinesses(prev => [...prev, businessId]);
    } else {
      setSelectedBusinesses(prev => prev?.filter(id => id !== businessId));
    }
  };

  const handleBulkAction = (action) => {
    if (action === 'delete' && selectedBusinesses?.length > 0) {
      onBulkDelete?.(selectedBusinesses);
      setSelectedBusinesses([]);
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <Icon name="ChevronsUpDown" size={14} className="text-muted-foreground" />;
    }
    return (
      <Icon 
        name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
        size={14} 
        className="text-primary" 
      />
    );
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  // Reset selection when businesses change
  useEffect(() => {
    setSelectedBusinesses([]);
  }, [businesses]);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Buscar negocios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              leftIcon="Search"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={statusOptions}
              placeholder="Estado"
              className="w-40"
            />
            <Select
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              options={categoryOptions}
              placeholder="Categoría"
              className="w-44"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedBusinesses?.length > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-muted-foreground">
                {selectedBusinesses?.length} seleccionado(s)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                iconName="Trash2"
                iconPosition="left"
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                Eliminar
              </Button>
            </div>
          )}
          
          <Button
            variant="default"
            onClick={onCreate}
            iconName="Plus"
            iconPosition="left"
          >
            Nuevo Negocio
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedBusinesses?.length === currentBusinesses?.length && currentBusinesses?.length > 0}
                    onChange={(e) => handleSelectAll(e?.target?.checked)}
                    indeterminate={selectedBusinesses?.length > 0 && selectedBusinesses?.length < currentBusinesses?.length}
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort('businessName')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Nombre del Negocio</span>
                    {renderSortIcon('businessName')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Categoría</span>
                    {renderSortIcon('category')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Ciudad</span>
                    {renderSortIcon('city')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Estado</span>
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Última Actualización</span>
                    {renderSortIcon('updatedAt')}
                  </div>
                </th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <Icon name="Loader" size={16} className="animate-spin" />
                      <span>Cargando negocios...</span>
                    </div>
                  </td>
                </tr>
              ) : currentBusinesses?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3 text-muted-foreground">
                      <Icon name="Building2" size={32} />
                      <div>
                        <p className="font-medium">No se encontraron negocios</p>
                        <p className="text-sm">
                          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ?'Intenta ajustar los filtros de búsqueda' :'Crea tu primer negocio para comenzar'
                          }
                        </p>
                      </div>
                      {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                        <Button
                          variant="outline"
                          onClick={onCreate}
                          iconName="Plus"
                          iconPosition="left"
                        >
                          Crear Negocio
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentBusinesses?.map((business) => (
                  <tr 
                    key={business?.id} 
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedBusinesses?.includes(business?.id)}
                        onChange={(e) => handleSelectBusiness(business?.id, e?.target?.checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon name="Building2" size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{business?.businessName}</p>
                          <p className="text-sm text-muted-foreground">{business?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {categoryOptions?.find(cat => cat?.value === business?.category)?.label || business?.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Icon name="MapPin" size={14} className="text-muted-foreground" />
                        <span className="text-sm">{business?.city}, {business?.state}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={business?.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(business?.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit?.(business)}
                          iconName="Edit"
                          className="w-8 h-8 p-0"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete?.(business?.id)}
                          iconName="Trash2"
                          className="w-8 h-8 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <Select
                value={itemsPerPage}
                onChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
                options={itemsPerPageOptions}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} negocios
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                iconName="ChevronLeft"
                className="w-8 h-8 p-0"
              />
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  ?.slice(
                    Math.max(0, currentPage - 3),
                    Math.min(totalPages, currentPage + 2)
                  )
                  ?.map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                iconName="ChevronRight"
                className="w-8 h-8 p-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDataTable;