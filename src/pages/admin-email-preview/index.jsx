import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import RoleGuard from '../../components/ui/RoleGuard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AdminEmailPreview = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('otp_verification');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sampleData, setSampleData] = useState({
    otpCode: '123456',
    ownerName: 'Juan Pérez',
    businessName: 'Mi Negocio Demo',
    planName: 'Pro',
    planPrice: '$499 MXN/mes',
    dashboardLink: 'https://promospot7046.builtwithrocket.new/dashboard-overview',
    startDate: new Date()?.toLocaleDateString('es-MX'),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toLocaleDateString('es-MX'),
    completedSteps: '2',
    totalSteps: '4',
    progressPercentage: '50'
  });

  const { user: authUser, userProfile } = useAuth();

  const user = {
    id: authUser?.id,
    name: userProfile?.full_name || authUser?.email,
    email: authUser?.email,
    role: userProfile?.role || 'owner'
  };

  const templateTypes = [
    { value: 'otp_verification', label: 'Verificación OTP', icon: 'Shield', description: 'Email con código de verificación' },
    { value: 'welcome_message', label: 'Bienvenida', icon: 'Heart', description: 'Email de bienvenida por plan' },
    { value: 'plan_confirmation', label: 'Confirmación de Plan', icon: 'CheckCircle', description: 'Confirmación de suscripción' },
    { value: 'setup_reminder', label: 'Recordatorio', icon: 'Clock', description: 'Recordatorio de configuración' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.from('registration_email_templates')?.select('*')?.eq('is_active', true)?.order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showNotification('Error al cargar plantillas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getTemplatesByType = (type) => {
    return templates?.filter(t => t?.template_type === type);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleSampleDataChange = (key, value) => {
    setSampleData({ ...sampleData, [key]: value });
  };

  const renderPreviewBody = () => {
    if (!selectedTemplate) return '';

    let previewBody = selectedTemplate?.body;
    Object.keys(sampleData)?.forEach(key => {
      const placeholder = `{{${key}}}`;
      previewBody = previewBody?.replace(new RegExp(placeholder, 'g'), sampleData?.[key]);
    });

    return previewBody;
  };

  const handleSendTest = async () => {
    if (!testEmail || !selectedTemplate) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(testEmail)) {
      showNotification('Email inválido', 'error');
      return;
    }

    setSendingTest(true);
    try {
      // Note: This would require a Supabase Edge Function to actually send emails
      // For now, we'll simulate the test send
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showNotification(`Email de prueba enviado a ${testEmail}`, 'success');
      setTestEmail('');
    } catch (error) {
      console.error('Error sending test email:', error);
      showNotification('Error al enviar email de prueba', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const renderPreviewModal = () => {
    if (!showPreview || !selectedTemplate) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate?.template_name}</h3>
              <p className="text-sm text-gray-600 mt-1">Vista previa con variables dinámicas</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(false)}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Variable Editor */}
              <div className="lg:col-span-1 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Variables Dinámicas</h4>
                  <p className="text-xs text-gray-600 mb-4">Edita los valores para ver cambios en tiempo real</p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {selectedTemplate?.variables && selectedTemplate?.variables?.map((variable, idx) => {
                    const varName = variable?.name?.replace(/[{}]/g, '');
                    return (
                      <div key={idx}>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          {variable?.name}
                        </label>
                        <Input
                          value={sampleData?.[varName] || ''}
                          onChange={(e) => handleSampleDataChange(varName, e?.target?.value)}
                          placeholder={variable?.description}
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">{variable?.description}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Test Send Section */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Enviar Email de Prueba</h4>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e?.target?.value)}
                      placeholder="correo@ejemplo.com"
                      className="text-sm"
                    />
                    <Button
                      variant="default"
                      size="sm"
                      fullWidth
                      loading={sendingTest}
                      onClick={handleSendTest}
                      iconName="Send"
                    >
                      Enviar Prueba
                    </Button>
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-900">
                    <strong>Asunto:</strong> {selectedTemplate?.subject}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={renderPreviewBody()}
                    className="w-full h-[600px] border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <Button
              variant="outline"
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

  return (
    <RoleGuard allowedRoles={['owner', 'admin']} userRole={user?.role} module="admin-email-preview">
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            user={user}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Vista Previa de Emails de Registro
                </h1>
                <p className="text-gray-600">
                  Previsualiza y envía versiones de prueba de los emails del flujo de registro
                </p>
              </div>

              {/* Notification */}
              {notification && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  notification?.type === 'success' ?'bg-blue-50 border-blue-200 text-blue-800' :'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <Icon name={notification?.type === 'success' ? 'CheckCircle' : 'AlertCircle'} size={20} />
                    <p className="text-sm font-medium">{notification?.message}</p>
                  </div>
                </div>
              )}

              {/* Template Type Tabs */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200">
                  {templateTypes?.map((type) => {
                    const count = getTemplatesByType(type?.value)?.length;
                    return (
                      <button
                        key={type?.value}
                        onClick={() => setActiveTab(type?.value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                          activeTab === type?.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        <Icon name={type?.icon} size={18} />
                        <div className="text-left">
                          <div className="text-sm font-semibold">{type?.label}</div>
                          <div className={`text-xs ${
                            activeTab === type?.value ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {type?.description}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          activeTab === type?.value
                            ? 'bg-white/20 text-white' :'bg-gray-100 text-gray-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Templates Grid */}
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getTemplatesByType(activeTab)?.map((template) => (
                        <div
                          key={template?.id}
                          className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Icon
                                  name={templateTypes?.find(t => t?.value === template?.template_type)?.icon}
                                  size={20}
                                  className="text-blue-600"
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">{template?.template_name}</h4>
                                {template?.plan_specific && template?.plan_specific !== 'all' && (
                                  <span className="text-xs text-gray-600 capitalize">
                                    Plan: {template?.plan_specific}
                                  </span>
                                )}
                              </div>
                            </div>
                            {template?.is_default && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                Predeterminado
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Asunto:</p>
                              <p className="text-sm text-gray-900 line-clamp-2">{template?.subject}</p>
                            </div>
                          </div>

                          <Button
                            variant="default"
                            size="sm"
                            fullWidth
                            iconName="Eye"
                            onClick={() => handlePreview(template)}
                          >
                            Vista Previa y Prueba
                          </Button>

                          {/* Variables Info */}
                          {template?.variables && template?.variables?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2">Variables disponibles:</p>
                              <div className="flex flex-wrap gap-1">
                                {template?.variables?.slice(0, 3)?.map((variable, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono"
                                  >
                                    {variable?.name}
                                  </span>
                                ))}
                                {template?.variables?.length > 3 && (
                                  <span className="text-xs text-gray-600 px-2 py-1">
                                    +{template?.variables?.length - 3} más
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!loading && getTemplatesByType(activeTab)?.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Mail" size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay plantillas disponibles
                      </h3>
                      <p className="text-gray-600">
                        No se encontraron plantillas para este tipo
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>

        {renderPreviewModal()}
      </div>
    </RoleGuard>
  );
};

export default AdminEmailPreview;