import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import { supabase } from '../../../lib/supabase';

const RegistrationEmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('otp_verification');

  const templateTypes = [
    { value: 'otp_verification', label: 'Verificación OTP', icon: 'Shield' },
    { value: 'welcome_message', label: 'Mensaje de Bienvenida', icon: 'Heart' },
    { value: 'plan_confirmation', label: 'Confirmación de Plan', icon: 'CheckCircle' },
    { value: 'setup_reminder', label: 'Recordatorio de Configuración', icon: 'Clock' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('registration_email_templates')
        ?.select('*')
        ?.eq('is_active', true)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplatesByType = (type) => {
    return templates?.filter(t => t?.template_type === type);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const renderPreview = () => {
    if (!selectedTemplate) return null;

    // Replace variables with sample data for preview
    let previewBody = selectedTemplate?.body;
    const sampleData = {
      '{{otpCode}}': '123456',
      '{{ownerName}}': 'Juan Pérez',
      '{{businessName}}': 'Mi Negocio',
      '{{planName}}': 'Pro',
      '{{planPrice}}': '$499 MXN/mes',
      '{{dashboardLink}}': 'https://promospot7046.builtwithrocket.new/dashboard-overview',
      '{{startDate}}': new Date()?.toLocaleDateString('es-MX'),
      '{{nextBillingDate}}': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toLocaleDateString('es-MX'),
      '{{completedSteps}}': '2',
      '{{totalSteps}}': '4',
      '{{progressPercentage}}': '50',
      '{{step1Status}}': 'completed',
      '{{step1Icon}}': '✅',
      '{{step2Status}}': 'completed',
      '{{step2Icon}}': '✅',
      '{{step3Status}}': '',
      '{{step3Icon}}': '⬜',
      '{{step4Status}}': '',
      '{{step4Icon}}': '⬜'
    };

    Object.keys(sampleData)?.forEach(key => {
      previewBody = previewBody?.replace(new RegExp(key, 'g'), sampleData?.[key]);
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{selectedTemplate?.template_name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Vista previa del email</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(false)}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-foreground mb-2">
                <strong>Asunto:</strong> {selectedTemplate?.subject}
              </p>
            </div>

            <div className="bg-white border border-border rounded-lg">
              <iframe
                srcDoc={previewBody}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            </div>
          </div>

          <div className="p-6 border-t border-border">
            <Button
              variant="default"
              onClick={() => setShowPreview(false)}
              fullWidth
            >
              Cerrar Vista Previa
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Plantillas de Email de Registro</h3>
        <p className="text-sm text-muted-foreground">
          Plantillas de email con branding de PromoClub para el flujo de registro
        </p>
      </div>

      {/* Template Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {templateTypes?.map((type) => {
          const count = getTemplatesByType(type?.value)?.length;
          return (
            <button
              key={type?.value}
              onClick={() => setActiveTab(type?.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                activeTab === type?.value
                  ? 'bg-primary text-white border-primary' :'bg-white text-foreground border-border hover:border-primary/50'
              }`}
            >
              <Icon name={type?.icon} size={16} />
              <span className="text-sm font-medium">{type?.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === type?.value
                  ? 'bg-white/20 text-white' :'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getTemplatesByType(activeTab)?.map((template) => (
          <div
            key={template?.id}
            className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon 
                    name={templateTypes?.find(t => t?.value === template?.template_type)?.icon} 
                    size={20} 
                    className="text-primary" 
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{template?.template_name}</h4>
                  {template?.plan_specific && template?.plan_specific !== 'all' && (
                    <span className="text-xs text-muted-foreground capitalize">
                      Plan: {template?.plan_specific}
                    </span>
                  )}
                </div>
              </div>
              {template?.is_default && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                  Por defecto
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Asunto:</p>
                <p className="text-sm text-foreground line-clamp-2">{template?.subject}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                iconName="Eye"
                onClick={() => handlePreview(template)}
              >
                Vista Previa
              </Button>
            </div>

            {/* Variables Info */}
            {template?.variables && template?.variables?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Variables disponibles:</p>
                <div className="flex flex-wrap gap-1">
                  {template?.variables?.slice(0, 3)?.map((variable, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-mono"
                    >
                      {variable?.name}
                    </span>
                  ))}
                  {template?.variables?.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{template?.variables?.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {getTemplatesByType(activeTab)?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Mail" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No hay plantillas disponibles
          </h3>
          <p className="text-sm text-muted-foreground">
            No se encontraron plantillas para este tipo
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && renderPreview()}

      {/* Info Card */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Plantillas de Email de Registro
            </p>
            <p className="text-xs text-muted-foreground">
              Estas plantillas se utilizan automáticamente durante el proceso de registro. 
              Incluyen verificación OTP, mensajes de bienvenida personalizados por plan, 
              confirmación de suscripción y recordatorios de configuración.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationEmailTemplates;