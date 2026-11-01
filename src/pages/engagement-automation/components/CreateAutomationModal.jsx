import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import CatalogItemSelector from '../../../components/ui/CatalogItemSelector';
import { supabase } from '../../../lib/supabase';

const CreateAutomationModal = ({ isOpen, onClose, onSave, rule = null, businessId }) => {
  const [formData, setFormData] = useState({
    rule_name: '',
    description: '',
    trigger_type: 'low_stock',
    action_type: 'apply_coupon',
    execution_frequency: 'once',
    is_active: true,
    priority: 1,
    max_executions: 0,
    target_audience: 'all',
    // Condition fields
    threshold_quantity: '',
    threshold_amount: '',
    days_since_visit: '',
    days_before: '',
    total_purchases: '',
    comparison: 'less_than',
    time_period: 'daily',
    catalog_item_id: null,
    // Action fields
    coupon_id: null,
    loyalty_program_id: null,
    reward_id: null,
    points_amount: '',
    auto_apply: true,
    auto_activate: true,
    notification_type: 'email',
    notification_message: ''
  });

  const [errors, setErrors] = useState({});
  const [coupons, setCoupons] = useState([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (rule) {
      setFormData({
        rule_name: rule?.rule_name || '',
        description: rule?.description || '',
        trigger_type: rule?.trigger_type || 'low_stock',
        action_type: rule?.action_type || 'apply_coupon',
        execution_frequency: rule?.execution_frequency || 'once',
        is_active: rule?.is_active ?? true,
        priority: rule?.priority || 1,
        max_executions: rule?.max_executions || 0,
        target_audience: rule?.target_audience || 'all',
        // Extract conditions
        threshold_quantity: rule?.conditions?.threshold_quantity || '',
        threshold_amount: rule?.conditions?.threshold_amount || '',
        days_since_visit: rule?.conditions?.days_since_visit || '',
        days_before: rule?.conditions?.days_before || '',
        total_purchases: rule?.conditions?.total_purchases || '',
        comparison: rule?.conditions?.comparison || 'less_than',
        time_period: rule?.conditions?.time_period || 'daily',
        catalog_item_id: rule?.conditions?.catalog_item_id || null,
        // Extract action config
        coupon_id: rule?.action_config?.coupon_id || null,
        loyalty_program_id: rule?.action_config?.loyalty_program_id || null,
        reward_id: rule?.action_config?.reward_id || null,
        points_amount: rule?.action_config?.points_amount || '',
        auto_apply: rule?.action_config?.auto_apply ?? true,
        auto_activate: rule?.action_config?.auto_activate ?? true,
        notification_type: rule?.action_config?.notification_type || 'email',
        notification_message: rule?.action_config?.message || ''
      });
    }
  }, [rule]);

  // Fetch engagement options
  useEffect(() => {
    const fetchOptions = async () => {
      if (!businessId) return;
      setLoadingOptions(true);
      try {
        const [couponsRes, loyaltyRes, rewardsRes] = await Promise.all([
          supabase?.from('coupons')?.select('id, code, title')?.eq('business_id', businessId)?.eq('is_active', true),
          supabase?.from('loyalty_points')?.select('id, name')?.eq('business_id', businessId)?.eq('is_active', true),
          supabase?.from('rewards')?.select('id, name')?.eq('business_id', businessId)?.eq('is_active', true)
        ]);

        setCoupons(couponsRes?.data || []);
        setLoyaltyPrograms(loyaltyRes?.data || []);
        setRewards(rewardsRes?.data || []);
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [businessId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.rule_name?.trim()) {
      newErrors.rule_name = 'El nombre es obligatorio';
    }

    // Validate trigger-specific conditions
    if (formData?.trigger_type === 'low_stock' && !formData?.threshold_quantity) {
      newErrors.threshold_quantity = 'El umbral de cantidad es obligatorio';
    }
    if (formData?.trigger_type === 'high_sales' && !formData?.threshold_amount) {
      newErrors.threshold_amount = 'El umbral de monto es obligatorio';
    }
    if (formData?.trigger_type === 'customer_inactive' && !formData?.days_since_visit) {
      newErrors.days_since_visit = 'Los días sin visitar son obligatorios';
    }
    if (formData?.trigger_type === 'customer_birthday' && !formData?.days_before) {
      newErrors.days_before = 'Los días antes son obligatorios';
    }
    if (formData?.trigger_type === 'milestone_reached' && !formData?.total_purchases) {
      newErrors.total_purchases = 'El total de compras es obligatorio';
    }

    // Validate action-specific config
    if (formData?.action_type === 'apply_coupon' && !formData?.coupon_id) {
      newErrors.coupon_id = 'Selecciona un cupón';
    }
    if (formData?.action_type === 'grant_points') {
      if (!formData?.loyalty_program_id) {
        newErrors.loyalty_program_id = 'Selecciona un programa de lealtad';
      }
      if (!formData?.points_amount) {
        newErrors.points_amount = 'La cantidad de puntos es obligatoria';
      }
    }
    if (formData?.action_type === 'activate_reward' && !formData?.reward_id) {
      newErrors.reward_id = 'Selecciona una recompensa';
    }
    if (formData?.action_type === 'send_notification' && !formData?.notification_message?.trim()) {
      newErrors.notification_message = 'El mensaje es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    // Build conditions object based on trigger type
    const conditions = {};
    if (formData?.trigger_type === 'low_stock') {
      conditions.threshold_quantity = parseInt(formData?.threshold_quantity);
      conditions.comparison = formData?.comparison;
      if (formData?.catalog_item_id) {
        conditions.catalog_item_id = formData?.catalog_item_id;
      }
    } else if (formData?.trigger_type === 'high_sales') {
      conditions.threshold_amount = parseFloat(formData?.threshold_amount);
      conditions.time_period = formData?.time_period;
      conditions.comparison = formData?.comparison;
      if (formData?.catalog_item_id) {
        conditions.catalog_item_id = formData?.catalog_item_id;
      }
    } else if (formData?.trigger_type === 'customer_inactive') {
      conditions.days_since_visit = parseInt(formData?.days_since_visit);
      conditions.comparison = 'greater_than';
    } else if (formData?.trigger_type === 'customer_birthday') {
      conditions.days_before = parseInt(formData?.days_before);
    } else if (formData?.trigger_type === 'milestone_reached') {
      conditions.total_purchases = parseInt(formData?.total_purchases);
      conditions.comparison = formData?.comparison;
    }

    // Build action_config object based on action type
    const action_config = {};
    if (formData?.action_type === 'apply_coupon') {
      action_config.coupon_id = formData?.coupon_id;
      action_config.auto_apply = formData?.auto_apply;
    } else if (formData?.action_type === 'grant_points') {
      action_config.loyalty_program_id = formData?.loyalty_program_id;
      action_config.points_amount = parseInt(formData?.points_amount);
    } else if (formData?.action_type === 'activate_reward') {
      action_config.reward_id = formData?.reward_id;
      action_config.auto_activate = formData?.auto_activate;
    } else if (formData?.action_type === 'send_notification') {
      action_config.notification_type = formData?.notification_type;
      action_config.message = formData?.notification_message;
    }

    const ruleData = {
      rule_name: formData?.rule_name,
      description: formData?.description,
      trigger_type: formData?.trigger_type,
      action_type: formData?.action_type,
      conditions,
      action_config,
      execution_frequency: formData?.execution_frequency,
      is_active: formData?.is_active,
      priority: parseInt(formData?.priority),
      max_executions: parseInt(formData?.max_executions),
      target_audience: formData?.target_audience
    };

    onSave(ruleData);
    onClose();
  };

  if (!isOpen) return null;

  const triggerOptions = [
    { value: 'low_stock', label: 'Stock Bajo' },
    { value: 'high_sales', label: 'Ventas Altas' },
    { value: 'customer_inactive', label: 'Cliente Inactivo' },
    { value: 'customer_birthday', label: 'Cumpleaños de Cliente' },
    { value: 'milestone_reached', label: 'Hito Alcanzado' }
  ];

  const actionOptions = [
    { value: 'apply_coupon', label: 'Aplicar Cupón' },
    { value: 'grant_points', label: 'Otorgar Puntos' },
    { value: 'activate_reward', label: 'Activar Recompensa' },
    { value: 'send_notification', label: 'Enviar Notificación' }
  ];

  const frequencyOptions = [
    { value: 'once', label: 'Una vez' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'real_time', label: 'Tiempo real' }
  ];

  const comparisonOptions = [
    { value: 'less_than', label: 'Menor que' },
    { value: 'less_than_or_equal', label: 'Menor o igual que' },
    { value: 'greater_than', label: 'Mayor que' },
    { value: 'greater_than_or_equal', label: 'Mayor o igual que' },
    { value: 'equals', label: 'Igual a' }
  ];

  const timePeriodOptions = [
    { value: 'hourly', label: 'Por hora' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {rule ? 'Editar Regla de Automatización' : 'Nueva Regla de Automatización'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
            
            <Input
              label="Nombre de la Regla"
              value={formData?.rule_name}
              onChange={(e) => handleInputChange('rule_name', e?.target?.value)}
              error={errors?.rule_name}
              placeholder="Ej: Auto-cupón por stock bajo"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Describe cuándo y cómo se ejecutará esta regla"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData?.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <label className="text-sm font-medium text-gray-700">
                Activar regla inmediatamente
              </label>
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuración del Trigger</h3>
            
            <Select
              label="Tipo de Trigger"
              value={formData?.trigger_type}
              onChange={(e) => handleInputChange('trigger_type', e?.target?.value)}
              options={triggerOptions}
              required
            />

            {/* Low Stock Conditions */}
            {formData?.trigger_type === 'low_stock' && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Comparación"
                    value={formData?.comparison}
                    onChange={(e) => handleInputChange('comparison', e?.target?.value)}
                    options={comparisonOptions}
                  />
                  <Input
                    label="Umbral de Cantidad"
                    type="number"
                    value={formData?.threshold_quantity}
                    onChange={(e) => handleInputChange('threshold_quantity', e?.target?.value)}
                    error={errors?.threshold_quantity}
                    placeholder="10"
                    required
                  />
                </div>
                <CatalogItemSelector
                  businessId={businessId}
                  selectedItems={formData?.catalog_item_id ? [formData?.catalog_item_id] : []}
                  onChange={(items) => handleInputChange('catalog_item_id', items?.[0] || null)}
                  label="Producto/Servicio (opcional)"
                  helperText="Deja vacío para aplicar a todos los productos"
                  multiSelect={false}
                />
              </div>
            )}

            {/* High Sales Conditions */}
            {formData?.trigger_type === 'high_sales' && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Umbral de Monto ($)"
                    type="number"
                    step="0.01"
                    value={formData?.threshold_amount}
                    onChange={(e) => handleInputChange('threshold_amount', e?.target?.value)}
                    error={errors?.threshold_amount}
                    placeholder="1000"
                    required
                  />
                  <Select
                    label="Período de Tiempo"
                    value={formData?.time_period}
                    onChange={(e) => handleInputChange('time_period', e?.target?.value)}
                    options={timePeriodOptions}
                  />
                </div>
                <Select
                  label="Comparación"
                  value={formData?.comparison}
                  onChange={(e) => handleInputChange('comparison', e?.target?.value)}
                  options={comparisonOptions}
                />
                <CatalogItemSelector
                  businessId={businessId}
                  selectedItems={formData?.catalog_item_id ? [formData?.catalog_item_id] : []}
                  onChange={(items) => handleInputChange('catalog_item_id', items?.[0] || null)}
                  label="Producto/Servicio (opcional)"
                  helperText="Deja vacío para aplicar a todas las ventas"
                  multiSelect={false}
                />
              </div>
            )}

            {/* Customer Inactive Conditions */}
            {formData?.trigger_type === 'customer_inactive' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <Input
                  label="Días sin Visitar"
                  type="number"
                  value={formData?.days_since_visit}
                  onChange={(e) => handleInputChange('days_since_visit', e?.target?.value)}
                  error={errors?.days_since_visit}
                  placeholder="30"
                  helperText="Número de días desde la última visita"
                  required
                />
              </div>
            )}

            {/* Customer Birthday Conditions */}
            {formData?.trigger_type === 'customer_birthday' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <Input
                  label="Días Antes del Cumpleaños"
                  type="number"
                  value={formData?.days_before}
                  onChange={(e) => handleInputChange('days_before', e?.target?.value)}
                  error={errors?.days_before}
                  placeholder="7"
                  helperText="Enviar notificación X días antes del cumpleaños"
                  required
                />
              </div>
            )}

            {/* Milestone Reached Conditions */}
            {formData?.trigger_type === 'milestone_reached' && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Comparación"
                    value={formData?.comparison}
                    onChange={(e) => handleInputChange('comparison', e?.target?.value)}
                    options={comparisonOptions}
                  />
                  <Input
                    label="Total de Compras"
                    type="number"
                    value={formData?.total_purchases}
                    onChange={(e) => handleInputChange('total_purchases', e?.target?.value)}
                    error={errors?.total_purchases}
                    placeholder="10"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Configuration */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuración de la Acción</h3>
            
            <Select
              label="Tipo de Acción"
              value={formData?.action_type}
              onChange={(e) => handleInputChange('action_type', e?.target?.value)}
              options={actionOptions}
              required
            />

            {/* Apply Coupon Action */}
            {formData?.action_type === 'apply_coupon' && (
              <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
                <Select
                  label="Cupón"
                  value={formData?.coupon_id || ''}
                  onChange={(e) => handleInputChange('coupon_id', e?.target?.value)}
                  options={[
                    { value: '', label: 'Selecciona un cupón' },
                    ...coupons?.map(c => ({ value: c?.id, label: `${c?.code} - ${c?.title}` }))
                  ]}
                  error={errors?.coupon_id}
                  required
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData?.auto_apply}
                    onCheckedChange={(checked) => handleInputChange('auto_apply', checked)}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Aplicar automáticamente al cliente
                  </label>
                </div>
              </div>
            )}

            {/* Grant Points Action */}
            {formData?.action_type === 'grant_points' && (
              <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
                <Select
                  label="Programa de Lealtad"
                  value={formData?.loyalty_program_id || ''}
                  onChange={(e) => handleInputChange('loyalty_program_id', e?.target?.value)}
                  options={[
                    { value: '', label: 'Selecciona un programa' },
                    ...loyaltyPrograms?.map(l => ({ value: l?.id, label: l?.name }))
                  ]}
                  error={errors?.loyalty_program_id}
                  required
                />
                <Input
                  label="Cantidad de Puntos"
                  type="number"
                  value={formData?.points_amount}
                  onChange={(e) => handleInputChange('points_amount', e?.target?.value)}
                  error={errors?.points_amount}
                  placeholder="100"
                  required
                />
              </div>
            )}

            {/* Activate Reward Action */}
            {formData?.action_type === 'activate_reward' && (
              <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
                <Select
                  label="Recompensa"
                  value={formData?.reward_id || ''}
                  onChange={(e) => handleInputChange('reward_id', e?.target?.value)}
                  options={[
                    { value: '', label: 'Selecciona una recompensa' },
                    ...rewards?.map(r => ({ value: r?.id, label: r?.name }))
                  ]}
                  error={errors?.reward_id}
                  required
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData?.auto_activate}
                    onCheckedChange={(checked) => handleInputChange('auto_activate', checked)}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Activar automáticamente para el cliente
                  </label>
                </div>
              </div>
            )}

            {/* Send Notification Action */}
            {formData?.action_type === 'send_notification' && (
              <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
                <Select
                  label="Tipo de Notificación"
                  value={formData?.notification_type}
                  onChange={(e) => handleInputChange('notification_type', e?.target?.value)}
                  options={[
                    { value: 'email', label: 'Email' },
                    { value: 'push', label: 'Push' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'in_app', label: 'En la app' }
                  ]}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    value={formData?.notification_message}
                    onChange={(e) => handleInputChange('notification_message', e?.target?.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Escribe el mensaje de la notificación"
                  />
                  {errors?.notification_message && (
                    <p className="text-sm text-red-600 mt-1">{errors?.notification_message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Execution Settings */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Ejecución</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Frecuencia de Ejecución"
                value={formData?.execution_frequency}
                onChange={(e) => handleInputChange('execution_frequency', e?.target?.value)}
                options={frequencyOptions}
              />
              <Input
                label="Máximo de Ejecuciones"
                type="number"
                value={formData?.max_executions}
                onChange={(e) => handleInputChange('max_executions', e?.target?.value)}
                placeholder="0"
                helperText="0 = ilimitado"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prioridad"
                type="number"
                value={formData?.priority}
                onChange={(e) => handleInputChange('priority', e?.target?.value)}
                placeholder="1"
                helperText="Mayor número = mayor prioridad"
              />
              <Select
                label="Audiencia Objetivo"
                value={formData?.target_audience}
                onChange={(e) => handleInputChange('target_audience', e?.target?.value)}
                options={[
                  { value: 'all', label: 'Todos los clientes' },
                  { value: 'segment', label: 'Segmento específico' },
                  { value: 'individual', label: 'Clientes individuales' }
                ]}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {rule ? 'Actualizar Regla' : 'Crear Regla'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAutomationModal;