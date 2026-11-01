import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const CampaignForm = ({ campaign = null, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'seasonal',
    status: 'draft',
    startDate: '',
    endDate: '',
    budget: '',
    channels: [],
    targetAudience: 'all',
    imageUrl: '',
    promotions: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (campaign) {
      setFormData({
        ...campaign,
        startDate: campaign?.startDate ? new Date(campaign.startDate)?.toISOString()?.split('T')?.[0] : '',
        endDate: campaign?.endDate ? new Date(campaign.endDate)?.toISOString()?.split('T')?.[0] : '',
        channels: campaign?.channels || [],
        promotions: campaign?.promotions || []
      });
    }
  }, [campaign]);

  const typeOptions = [
    { value: 'seasonal', label: 'Estacional' },
    { value: 'event', label: 'Evento' },
    { value: 'product_launch', label: 'Lanzamiento de Producto' },
    { value: 'loyalty', label: 'Fidelización' },
    { value: 'promotional', label: 'Promocional' }
  ];

  const targetAudienceOptions = [
    { value: 'all', label: 'Todos los clientes' },
    { value: 'new', label: 'Clientes nuevos' },
    { value: 'returning', label: 'Clientes recurrentes' },
    { value: 'vip', label: 'Clientes VIP' }
  ];

  const channelOptions = [
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'social', label: 'Redes Sociales', icon: 'Share2' },
    { value: 'sms', label: 'SMS', icon: 'MessageSquare' },
    { value: 'push', label: 'Notificaciones Push', icon: 'Bell' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleChannelToggle = (channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev?.channels?.includes(channel)
        ? prev?.channels?.filter(c => c !== channel)
        : [...prev?.channels, channel]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData?.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }

    if (!formData?.endDate) {
      newErrors.endDate = 'La fecha de fin es obligatoria';
    }

    if (formData?.startDate && formData?.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (!formData?.budget || formData?.budget <= 0) {
      newErrors.budget = 'El presupuesto debe ser mayor a 0';
    }

    if (formData?.channels?.length === 0) {
      newErrors.channels = 'Selecciona al menos un canal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {campaign ? 'Editar Campaña' : 'Nueva Campaña'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre de la Campaña *
              </label>
              <Input
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                placeholder="Ej: Campaña Verano 2024"
                error={errors?.name}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Descripción *
              </label>
              <textarea
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                placeholder="Describe el objetivo y detalles de la campaña..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
              {errors?.description && (
                <p className="text-sm text-destructive mt-1">{errors?.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Campaña *
              </label>
              <Select
                options={typeOptions}
                value={formData?.type}
                onChange={(value) => handleInputChange('type', value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Audiencia Objetivo *
              </label>
              <Select
                options={targetAudienceOptions}
                value={formData?.targetAudience}
                onChange={(value) => handleInputChange('targetAudience', value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha de Inicio *
              </label>
              <Input
                type="date"
                value={formData?.startDate}
                onChange={(e) => handleInputChange('startDate', e?.target?.value)}
                error={errors?.startDate}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha de Fin *
              </label>
              <Input
                type="date"
                value={formData?.endDate}
                onChange={(e) => handleInputChange('endDate', e?.target?.value)}
                error={errors?.endDate}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Presupuesto (€) *
              </label>
              <Input
                type="number"
                value={formData?.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e?.target?.value) || '')}
                placeholder="5000"
                error={errors?.budget}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL de Imagen
              </label>
              <Input
                value={formData?.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e?.target?.value)}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-3">
                Canales de Marketing *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {channelOptions?.map(channel => (
                  <div
                    key={channel?.value}
                    onClick={() => handleChannelToggle(channel?.value)}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      formData?.channels?.includes(channel?.value)
                        ? 'border-primary bg-primary/10' :'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={formData?.channels?.includes(channel?.value)}
                      onCheckedChange={() => handleChannelToggle(channel?.value)}
                    />
                    <Icon name={channel?.icon} size={16} />
                    <span className="text-sm font-medium">{channel?.label}</span>
                  </div>
                ))}
              </div>
              {errors?.channels && (
                <p className="text-sm text-destructive mt-2">{errors?.channels}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              iconName={isLoading ? 'Loader' : 'Check'}
              iconSize={16}
            >
              {isLoading ? 'Guardando...' : campaign ? 'Actualizar Campaña' : 'Crear Campaña'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignForm;