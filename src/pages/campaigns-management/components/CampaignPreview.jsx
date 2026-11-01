import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CampaignPreview = ({ campaign, onClose }) => {
  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return 'Mail';
      case 'social': return 'Share2';
      case 'sms': return 'MessageSquare';
      case 'push': return 'Bell';
      default: return 'Globe';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'seasonal': return 'Estacional';
      case 'event': return 'Evento';
      case 'product_launch': return 'Lanzamiento';
      case 'loyalty': return 'Fidelización';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Vista Previa de Campaña</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Campaign Header */}
          <div className="relative">
            {campaign?.imageUrl && (
              <img
                src={campaign?.imageUrl}
                alt={campaign?.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div className="absolute top-4 right-4">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {getTypeLabel(campaign?.type)}
              </span>
            </div>
          </div>

          {/* Campaign Info */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{campaign?.name}</h3>
            <p className="text-muted-foreground">{campaign?.description}</p>
          </div>

          {/* Campaign Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Calendar" size={16} />
                Período de Campaña
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Inicio:</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(campaign?.startDate)?.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fin:</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(campaign?.endDate)?.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="DollarSign" size={16} />
                Presupuesto
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="text-sm font-medium text-foreground">€{campaign?.budget?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gastado:</span>
                  <span className="text-sm font-medium text-foreground">€{campaign?.spent?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((campaign?.spent / campaign?.budget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="Radio" size={16} />
              Canales de Distribución
            </h4>
            <div className="flex gap-3">
              {campaign?.channels?.map(channel => (
                <div
                  key={channel}
                  className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border"
                >
                  <Icon name={getChannelIcon(channel)} size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground capitalize">{channel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="Users" size={16} />
              Audiencia Objetivo
            </h4>
            <p className="text-sm text-muted-foreground">
              {campaign?.targetAudience === 'all' && 'Todos los clientes'}
              {campaign?.targetAudience === 'new' && 'Clientes nuevos'}
              {campaign?.targetAudience === 'returning' && 'Clientes recurrentes'}
              {campaign?.targetAudience === 'vip' && 'Clientes VIP'}
            </p>
          </div>

          {/* Performance Metrics */}
          {campaign?.status === 'active' && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="BarChart3" size={16} />
                Métricas de Rendimiento
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary mb-1">
                    {campaign?.metrics?.impressions?.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Impresiones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success mb-1">
                    {campaign?.metrics?.clicks?.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Clics</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning mb-1">
                    {campaign?.metrics?.conversions?.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Conversiones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success mb-1">
                    {campaign?.metrics?.roi}x
                  </p>
                  <p className="text-xs text-muted-foreground">ROI</p>
                </div>
              </div>
            </div>
          )}

          {/* Preview Channels */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Vista Previa por Canal</h4>
            
            {campaign?.channels?.includes('email') && (
              <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Mail" size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">Email</span>
                </div>
                <div className="bg-card rounded p-3 text-sm">
                  <p className="font-semibold mb-1">Asunto: {campaign?.name}</p>
                  <p className="text-muted-foreground">{campaign?.description}</p>
                </div>
              </div>
            )}

            {campaign?.channels?.includes('social') && (
              <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-success">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Share2" size={16} className="text-success" />
                  <span className="text-sm font-semibold text-foreground">Redes Sociales</span>
                </div>
                <div className="bg-card rounded p-3 text-sm">
                  <p className="font-semibold mb-1">{campaign?.name}</p>
                  <p className="text-muted-foreground">{campaign?.description}</p>
                  {campaign?.imageUrl && (
                    <img src={campaign?.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded mt-2" />
                  )}
                </div>
              </div>
            )}

            {campaign?.channels?.includes('sms') && (
              <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-warning">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="MessageSquare" size={16} className="text-warning" />
                  <span className="text-sm font-semibold text-foreground">SMS</span>
                </div>
                <div className="bg-card rounded p-3 text-sm">
                  <p className="text-muted-foreground">
                    {campaign?.name}: {campaign?.description?.substring(0, 100)}...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button iconName="Send" iconSize={16}>
            Enviar Campaña de Prueba
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignPreview;