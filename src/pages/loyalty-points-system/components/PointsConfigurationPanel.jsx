import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import CatalogItemSelector from '../../../components/ui/CatalogItemSelector';

const PointsConfigurationPanel = ({ rules, onSaveRule, onDeleteRule }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'purchase',
    multiplier: 1,
    conditions: {
      minAmount: 0,
      categories: [],
      customerTiers: [],
      dateRange: { start: '', end: '' }
    },
    isActive: true,
    catalogItemIds: []
  });

  const ruleTypes = [
    { value: 'purchase', label: 'Por Compra' },
    { value: 'category', label: 'Por Categoría' },
    { value: 'tier', label: 'Por Nivel de Cliente' },
    { value: 'seasonal', label: 'Promoción Estacional' },
    { value: 'referral', label: 'Por Referido' }
  ];

  const categories = [
    { value: 'food', label: 'Comida' },
    { value: 'beverages', label: 'Bebidas' },
    { value: 'desserts', label: 'Postres' },
    { value: 'specials', label: 'Especiales' }
  ];

  const tiers = [
    { value: 'bronze', label: 'Bronce' },
    { value: 'silver', label: 'Plata' },
    { value: 'gold', label: 'Oro' },
    { value: 'platinum', label: 'Platino' }
  ];

  const handleCreateRule = () => {
    setIsCreating(true);
    setEditingRule(null);
    setFormData({
      name: '',
      type: 'purchase',
      multiplier: 1,
      conditions: {
        minAmount: 0,
        categories: [],
        customerTiers: [],
        dateRange: { start: '', end: '' }
      },
      isActive: true,
      catalogItemIds: []
    });
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule?.id);
    setIsCreating(true);
    setFormData(rule);
  };

  const handleSaveRule = () => {
    const ruleData = {
      ...formData,
      id: editingRule || Date.now(),
      createdAt: editingRule ? formData?.createdAt : new Date()?.toISOString()
    };
    
    onSaveRule(ruleData);
    setIsCreating(false);
    setEditingRule(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingRule(null);
  };

  const updateFormData = (field, value) => {
    if (field?.includes('.')) {
      const [parent, child] = field?.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev?.[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getRuleTypeIcon = (type) => {
    const icons = {
      purchase: 'ShoppingCart',
      category: 'Tag',
      tier: 'Crown',
      seasonal: 'Calendar',
      referral: 'Users'
    };
    return icons?.[type] || 'Settings';
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Configuración de Puntos</h3>
          <Button
            onClick={handleCreateRule}
            iconName="Plus"
            iconPosition="left"
          >
            Nueva Regla
          </Button>
        </div>
      </div>
      {isCreating && (
        <div className="p-6 border-b border-border bg-muted/30">
          <h4 className="text-md font-semibold text-foreground mb-4">
            {editingRule ? 'Editar Regla' : 'Crear Nueva Regla'}
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Input
              label="Nombre de la Regla"
              value={formData?.name}
              onChange={(e) => updateFormData('name', e?.target?.value)}
              placeholder="Ej: Doble puntos en postres"
              required
            />
            
            <Select
              label="Tipo de Regla"
              options={ruleTypes}
              value={formData?.type}
              onChange={(value) => updateFormData('type', value)}
            />
            
            <Input
              label="Multiplicador de Puntos"
              type="number"
              value={formData?.multiplier}
              onChange={(e) => updateFormData('multiplier', parseFloat(e?.target?.value))}
              min="0.1"
              step="0.1"
            />
            
            <Input
              label="Monto Mínimo (€)"
              type="number"
              value={formData?.conditions?.minAmount}
              onChange={(e) => updateFormData('conditions.minAmount', parseFloat(e?.target?.value))}
              min="0"
            />
          </div>

          {formData?.type === 'category' && (
            <div className="mb-4">
              <Select
                label="Categorías Aplicables"
                options={categories}
                value={formData?.conditions?.categories}
                onChange={(value) => updateFormData('conditions.categories', value)}
                multiple
                searchable
              />
            </div>
          )}

          {formData?.type === 'tier' && (
            <div className="mb-4">
              <Select
                label="Niveles de Cliente"
                options={tiers}
                value={formData?.conditions?.customerTiers}
                onChange={(value) => updateFormData('conditions.customerTiers', value)}
                multiple
              />
            </div>
          )}

          {formData?.type === 'seasonal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <Input
                label="Fecha de Inicio"
                type="date"
                value={formData?.conditions?.dateRange?.start}
                onChange={(e) => updateFormData('conditions.dateRange.start', e?.target?.value)}
              />
              <Input
                label="Fecha de Fin"
                type="date"
                value={formData?.conditions?.dateRange?.end}
                onChange={(e) => updateFormData('conditions.dateRange.end', e?.target?.value)}
              />
            </div>
          )}

          <div className="mb-4">
            <CatalogItemSelector
              selectedItems={formData?.catalogItemIds}
              onChange={(items) => updateFormData('catalogItemIds', items)}
              label="Productos/Servicios con Puntos Bonus"
              description="Selecciona productos o servicios que otorgan puntos adicionales (opcional: dejar vacío para aplicar a todos)"
            />
          </div>

          <div className="mb-4">
            <Checkbox
              label="Regla Activa"
              checked={formData?.isActive}
              onChange={(e) => updateFormData('isActive', e?.target?.checked)}
            />
          </div>

          <div className="flex space-x-3">
            <Button onClick={handleSaveRule} iconName="Save">
              {editingRule ? 'Actualizar' : 'Crear'} Regla
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="space-y-4">
          {rules?.map((rule) => (
            <div key={rule?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={getRuleTypeIcon(rule?.type)} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{rule?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Multiplicador: {rule?.multiplier}x | Mínimo: €{rule?.conditions?.minAmount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rule?.isActive 
                      ? 'bg-success/10 text-success' :'bg-muted text-muted-foreground'
                  }`}>
                    {rule?.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRule(rule)}
                    iconName="Edit"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteRule(rule?.id)}
                    iconName="Trash2"
                    className="text-destructive hover:text-destructive"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {rules?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Settings" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay reglas configuradas</p>
            <p className="text-sm text-muted-foreground">Crea tu primera regla para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsConfigurationPanel;