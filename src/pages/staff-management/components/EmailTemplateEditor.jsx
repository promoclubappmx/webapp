import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const EmailTemplateEditor = () => {
  const { userProfile } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    templateName: '',
    templateType: 'staff_invitation',
    subject: '',
    body: '',
    isActive: true,
    isDefault: false
  });
  const [previewData, setPreviewData] = useState({
    fullName: 'Juan Pérez',
    businessName: 'Mi Negocio',
    role: 'Cajero',
    roleDescription: 'Operaciones de caja y ventas',
    confirmationLink: 'https://example.com/confirm',
    loginLink: 'https://example.com/login'
  });
  const [errors, setErrors] = useState({});

  const templateTypes = [
    { value: 'staff_invitation', label: 'Invitación de Personal', icon: 'Mail' },
    { value: 'email_confirmation', label: 'Confirmación de Email', icon: 'CheckCircle' },
    { value: 'welcome', label: 'Bienvenida', icon: 'Heart' },
    { value: 'role_assignment', label: 'Asignación de Rol', icon: 'Shield' }
  ];

  const availableVariables = {
    staff_invitation: [
      { name: '{{fullName}}', description: 'Nombre completo del empleado' },
      { name: '{{businessName}}', description: 'Nombre del negocio' },
      { name: '{{role}}', description: 'Rol asignado' },
      { name: '{{confirmationLink}}', description: 'Enlace de confirmación' }
    ],
    email_confirmation: [
      { name: '{{fullName}}', description: 'Nombre completo del empleado' },
      { name: '{{role}}', description: 'Rol asignado' },
      { name: '{{loginLink}}', description: 'Enlace de inicio de sesión' }
    ],
    welcome: [
      { name: '{{fullName}}', description: 'Nombre completo del empleado' },
      { name: '{{businessName}}', description: 'Nombre del negocio' },
      { name: '{{role}}', description: 'Rol asignado' },
      { name: '{{roleDescription}}', description: 'Descripción del rol' }
    ],
    role_assignment: [
      { name: '{{fullName}}', description: 'Nombre completo del empleado' },
      { name: '{{oldRole}}', description: 'Rol anterior' },
      { name: '{{newRole}}', description: 'Nuevo rol' },
      { name: '{{businessName}}', description: 'Nombre del negocio' }
    ]
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('email_templates')
        ?.select('*')
        ?.eq('business_id', userProfile?.business_name || 'default_business')
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors?.[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-body');
    const start = textarea?.selectionStart;
    const end = textarea?.selectionEnd;
    const text = formData?.body;
    const before = text?.substring(0, start);
    const after = text?.substring(end, text?.length);
    const newText = before + variable + after;
    
    setFormData({ ...formData, body: newText });
    
    setTimeout(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + variable?.length, start + variable?.length);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.templateName?.trim()) newErrors.templateName = 'Nombre es requerido';
    if (!formData?.subject?.trim()) newErrors.subject = 'Asunto es requerido';
    if (!formData?.body?.trim()) newErrors.body = 'Contenido es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const templateData = {
        business_id: userProfile?.business_name || 'default_business',
        template_type: formData?.templateType,
        template_name: formData?.templateName,
        subject: formData?.subject,
        body: formData?.body,
        is_active: formData?.isActive,
        is_default: formData?.isDefault,
        variables: availableVariables?.[formData?.templateType] || [],
        created_by: userProfile?.id
      };

      if (selectedTemplate) {
        const { error } = await supabase
          ?.from('email_templates')
          ?.update(templateData)
          ?.eq('id', selectedTemplate?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          ?.from('email_templates')
          ?.insert(templateData);
        if (error) throw error;
      }

      await fetchTemplates();
      handleCancel();
    } catch (error) {
      console.error('Error saving template:', error);
      setErrors({ submit: error?.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormData({
      templateName: template?.template_name,
      templateType: template?.template_type,
      subject: template?.subject,
      body: template?.body,
      isActive: template?.is_active,
      isDefault: template?.is_default
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;

    try {
      const { error } = await supabase
        ?.from('email_templates')
        ?.delete()
        ?.eq('id', id);
      if (error) throw error;
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setFormData({
      templateName: '',
      templateType: 'staff_invitation',
      subject: '',
      body: '',
      isActive: true,
      isDefault: false
    });
    setErrors({});
  };

  const renderPreview = () => {
    let previewHtml = formData?.body;
    Object.keys(previewData)?.forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewHtml = previewHtml?.replace(regex, previewData?.[key]);
    });
    return previewHtml;
  };

  const getTypeIcon = (type) => {
    const typeConfig = templateTypes?.find(t => t?.value === type);
    return typeConfig?.icon || 'Mail';
  };

  const getTypeLabel = (type) => {
    const typeConfig = templateTypes?.find(t => t?.value === type);
    return typeConfig?.label || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Plantillas de Email</h3>
          <p className="text-sm text-muted-foreground">Personaliza los mensajes enviados al personal</p>
        </div>
        {!selectedTemplate && (
          <Button onClick={() => setSelectedTemplate({})} iconName="Plus">
            Nueva Plantilla
          </Button>
        )}
      </div>

      {/* Template List */}
      {!selectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates?.map((template) => (
            <div
              key={template?.id}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={getTypeIcon(template?.template_type)} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{template?.template_name}</h4>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(template?.template_type)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {template?.is_default && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                      Predeterminada
                    </span>
                  )}
                  {template?.is_active ? (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                      Activa
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 text-xs rounded-full">
                      Inactiva
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Asunto:</strong> {template?.subject}
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(template)} iconName="Edit">
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(template?.id)} iconName="Trash2">
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Editor */}
      {selectedTemplate && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-foreground">
              {selectedTemplate?.id ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </h4>
            <Button variant="ghost" size="sm" onClick={handleCancel} iconName="X">
              Cerrar
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-4">
              <Input
                label="Nombre de la Plantilla"
                value={formData?.templateName}
                onChange={(e) => handleInputChange('templateName', e?.target?.value)}
                error={errors?.templateName}
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Plantilla <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData?.templateType}
                  onChange={(e) => handleInputChange('templateType', e?.target?.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  {templateTypes?.map((type) => (
                    <option key={type?.value} value={type?.value}>
                      {type?.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Asunto del Email"
                value={formData?.subject}
                onChange={(e) => handleInputChange('subject', e?.target?.value)}
                error={errors?.subject}
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contenido del Email <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="template-body"
                  value={formData?.body}
                  onChange={(e) => handleInputChange('body', e?.target?.value)}
                  rows={12}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm"
                  placeholder="Escribe el contenido del email aquí. Puedes usar HTML y variables."
                />
                {errors?.body && (
                  <p className="text-sm text-red-500 mt-1">{errors?.body}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData?.isActive}
                    onChange={(e) => handleInputChange('isActive', e?.target?.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-foreground">Plantilla activa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData?.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e?.target?.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-foreground">Usar como predeterminada</span>
                </label>
              </div>

              {errors?.submit && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors?.submit}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Plantilla'}
                </Button>
                <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </div>

            {/* Variables Sidebar */}
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Icon name="Code" size={16} />
                  Variables Disponibles
                </h5>
                <div className="space-y-2">
                  {availableVariables?.[formData?.templateType]?.map((variable) => (
                    <button
                      key={variable?.name}
                      onClick={() => insertVariable(variable?.name)}
                      className="w-full text-left px-3 py-2 bg-background hover:bg-muted border border-border rounded-lg transition-colors"
                    >
                      <code className="text-xs text-primary font-mono">{variable?.name}</code>
                      <p className="text-xs text-muted-foreground mt-1">{variable?.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-800 dark:text-blue-400">
                      Haz clic en una variable para insertarla en el contenido. Las variables se reemplazarán automáticamente con datos reales al enviar el email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="mt-6 border-t border-border pt-6">
              <h5 className="text-sm font-semibold text-foreground mb-3">Vista Previa</h5>
              <div className="bg-white dark:bg-gray-900 border border-border rounded-lg p-6">
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">Asunto:</p>
                  <p className="text-base font-medium text-foreground">{formData?.subject}</p>
                </div>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderPreview() }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailTemplateEditor;