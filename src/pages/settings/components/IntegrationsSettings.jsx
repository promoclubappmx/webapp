import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const IntegrationsSettings = () => {
  const [integrations, setIntegrations] = useState({
    whatsapp: {
      enabled: false,
      businessAccountId: '',
      accessToken: '',
      phoneNumber: '',
      verificationStatus: 'pending'
    },
    facebook: {
      enabled: false,
      pageId: '',
      accessToken: '',
      appId: '',
      status: 'disconnected'
    },
    instagram: {
      enabled: false,
      businessAccountId: '',
      accessToken: '',
      status: 'disconnected'
    },
    googleAnalytics: {
      enabled: false,
      trackingId: '',
      propertyId: '',
      status: 'disconnected'
    },
    googleAds: {
      enabled: false,
      customerId: '',
      conversionId: '',
      status: 'disconnected'
    },
    stripe: {
      enabled: false,
      publishableKey: '',
      webhookEndpoint: '',
      status: 'disconnected'
    }
  });

  const [webhooks, setWebhooks] = useState({
    promotionCreated: true,
    couponRedeemed: true,
    customerRegistered: false,
    paymentProcessed: true,
    loyaltyPointsChanged: false
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleIntegrationChange = (service, field, value) => {
    setIntegrations(prev => ({
      ...prev,
      [service]: {
        ...prev?.[service],
        [field]: value
      }
    }));
  };

  const handleWebhookChange = (event, value) => {
    setWebhooks(prev => ({
      ...prev,
      [event]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const IntegrationToggle = ({ checked, onChange, disabled = false }) => (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e?.target?.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
    </label>
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      connected: { color: 'bg-blue-100 text-blue-800', text: 'Conectado' },
      disconnected: { color: 'bg-red-100 text-red-800', text: 'Desconectado' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      error: { color: 'bg-red-100 text-red-800', text: 'Error' }
    };

    const config = statusConfig?.[status] || statusConfig?.disconnected;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.text}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Social Media Integrations */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Redes Sociales</h3>
        
        {/* WhatsApp Business */}
        <div className="border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="MessageCircle" size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">WhatsApp Business</h4>
                <p className="text-sm text-muted-foreground">Envía promociones y cupones por WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={integrations?.whatsapp?.verificationStatus} />
              <IntegrationToggle
                checked={integrations?.whatsapp?.enabled}
                onChange={(value) => handleIntegrationChange('whatsapp', 'enabled', value)}
              />
            </div>
          </div>

          {integrations?.whatsapp?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID de Cuenta de Negocio
                </label>
                <input
                  type="text"
                  value={integrations?.whatsapp?.businessAccountId}
                  onChange={(e) => handleIntegrationChange('whatsapp', 'businessAccountId', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="123456789012345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Número de Teléfono
                </label>
                <input
                  type="text"
                  value={integrations?.whatsapp?.phoneNumber}
                  onChange={(e) => handleIntegrationChange('whatsapp', 'phoneNumber', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>
          )}
        </div>

        {/* Facebook */}
        <div className="border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="Facebook" size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Facebook</h4>
                <p className="text-sm text-muted-foreground">Sincroniza promociones con tu página de Facebook</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={integrations?.facebook?.status} />
              <IntegrationToggle
                checked={integrations?.facebook?.enabled}
                onChange={(value) => handleIntegrationChange('facebook', 'enabled', value)}
              />
            </div>
          </div>

          {integrations?.facebook?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID de Página
                </label>
                <input
                  type="text"
                  value={integrations?.facebook?.pageId}
                  onChange={(e) => handleIntegrationChange('facebook', 'pageId', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="123456789012345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  App ID
                </label>
                <input
                  type="text"
                  value={integrations?.facebook?.appId}
                  onChange={(e) => handleIntegrationChange('facebook', 'appId', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="1234567890123456"
                />
              </div>
            </div>
          )}
        </div>

        {/* Instagram */}
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="Instagram" size={20} className="text-pink-600" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Instagram</h4>
                <p className="text-sm text-muted-foreground">Comparte promociones en Instagram Business</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={integrations?.instagram?.status} />
              <IntegrationToggle
                checked={integrations?.instagram?.enabled}
                onChange={(value) => handleIntegrationChange('instagram', 'enabled', value)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Marketing & Analytics */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Marketing y Analíticas</h3>
        
        {/* Google Analytics */}
        <div className="border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="BarChart3" size={20} className="text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Google Analytics</h4>
                <p className="text-sm text-muted-foreground">Rastrea el comportamiento de los usuarios</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={integrations?.googleAnalytics?.status} />
              <IntegrationToggle
                checked={integrations?.googleAnalytics?.enabled}
                onChange={(value) => handleIntegrationChange('googleAnalytics', 'enabled', value)}
              />
            </div>
          </div>

          {integrations?.googleAnalytics?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID de Seguimiento
                </label>
                <input
                  type="text"
                  value={integrations?.googleAnalytics?.trackingId}
                  onChange={(e) => handleIntegrationChange('googleAnalytics', 'trackingId', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID de Propiedad
                </label>
                <input
                  type="text"
                  value={integrations?.googleAnalytics?.propertyId}
                  onChange={(e) => handleIntegrationChange('googleAnalytics', 'propertyId', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="123456789"
                />
              </div>
            </div>
          )}
        </div>

        {/* Google Ads */}
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="Target" size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Google Ads</h4>
                <p className="text-sm text-muted-foreground">Rastrea conversiones de anuncios</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={integrations?.googleAds?.status} />
              <IntegrationToggle
                checked={integrations?.googleAds?.enabled}
                onChange={(value) => handleIntegrationChange('googleAds', 'enabled', value)}
              />
            </div>
          </div>

          {integrations?.googleAds?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID de Cliente
                </label>
                <input
                  type="text"
                  value={integrations?.googleAds?.customerId}
                  onChange={(e) => handleIntegrationChange('googleAds', 'customerId', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="123-456-7890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID de Conversión
                </label>
                <input
                  type="text"
                  value={integrations?.googleAds?.conversionId}
                  onChange={(e) => handleIntegrationChange('googleAds', 'conversionId', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="AW-123456789/AbCdEfGhIjKlMnOp"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Payment Integration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Pagos</h3>
        
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="CreditCard" size={20} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Stripe</h4>
                <p className="text-sm text-muted-foreground">Procesa pagos de promociones premium</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={integrations?.stripe?.status} />
              <IntegrationToggle
                checked={integrations?.stripe?.enabled}
                onChange={(value) => handleIntegrationChange('stripe', 'enabled', value)}
              />
            </div>
          </div>

          {integrations?.stripe?.enabled && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Clave Pública
                </label>
                <input
                  type="text"
                  value={integrations?.stripe?.publishableKey}
                  onChange={(e) => handleIntegrationChange('stripe', 'publishableKey', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="pk_test_..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Webhooks */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Webhooks</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Configura eventos que activarán notificaciones a sistemas externos
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Promoción Creada</div>
              <div className="text-xs text-muted-foreground">Se activa cuando se publica una nueva promoción</div>
            </div>
            <IntegrationToggle
              checked={webhooks?.promotionCreated}
              onChange={(value) => handleWebhookChange('promotionCreated', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Cupón Canjeado</div>
              <div className="text-xs text-muted-foreground">Se activa cuando un cliente canjea un cupón</div>
            </div>
            <IntegrationToggle
              checked={webhooks?.couponRedeemed}
              onChange={(value) => handleWebhookChange('couponRedeemed', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Pago Procesado</div>
              <div className="text-xs text-muted-foreground">Se activa cuando se procesa un pago exitoso</div>
            </div>
            <IntegrationToggle
              checked={webhooks?.paymentProcessed}
              onChange={(value) => handleWebhookChange('paymentProcessed', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Cliente Registrado</div>
              <div className="text-xs text-muted-foreground">Se activa cuando un nuevo cliente se registra</div>
            </div>
            <IntegrationToggle
              checked={webhooks?.customerRegistered}
              onChange={(value) => handleWebhookChange('customerRegistered', value)}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center">
            <Icon name="Globe" size={16} className="text-muted-foreground mr-2" />
            <span className="text-sm text-foreground">
              URL del Webhook: https://tudominio.com/webhooks/promospot
            </span>
          </div>
        </div>
      </div>
      {/* Save / Cancel */}
      <div className="flex items-center justify-between pt-2">
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800">
            <Icon name="CheckCircle" size={16} />
            Configuración de integraciones guardada
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => {}}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            iconName={saved ? 'Check' : 'Save'}
            iconPosition="left"
            variant={saved ? 'secondary' : 'default'}
          >
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettings;