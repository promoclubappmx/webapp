import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const VerificadoTab = () => {
  const { user } = useAuth();
  const [reviewedAt, setReviewedAt] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [tipoPersona, setTipoPersona] = useState('fisica');
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [profileRes, businessRes] = await Promise.all([
        supabase?.from('user_profiles')?.select('tipo_persona')?.eq('id', user?.id)?.maybeSingle(),
        supabase?.from('business_settings')?.select('nombre_comercial, verification_reviewed_at, doc_identificacion_oficial_url, doc_identificacion_oficial_name, doc_constancia_sat_url, doc_constancia_sat_name, doc_curp_url, doc_curp_name, doc_comprobante_domicilio_url, doc_comprobante_domicilio_name, doc_acta_constitutiva_url, doc_acta_constitutiva_name, doc_id_representante_url, doc_id_representante_name, doc_foto_fachada_url, doc_foto_fachada_name')?.eq('owner_id', user?.id)?.maybeSingle()
      ]);

      if (profileRes?.data) setTipoPersona(profileRes?.data?.tipo_persona || 'fisica');

      if (businessRes?.data) {
        setBusinessName(businessRes?.data?.nombre_comercial || '');
        setReviewedAt(businessRes?.data?.verification_reviewed_at);
        const tipo = profileRes?.data?.tipo_persona || 'fisica';
        const docList = tipo === 'fisica' ? [
          { label: 'Identificación Oficial', url: businessRes?.data?.doc_identificacion_oficial_url, name: businessRes?.data?.doc_identificacion_oficial_name },
          { label: 'Constancia de Situación Fiscal SAT', url: businessRes?.data?.doc_constancia_sat_url, name: businessRes?.data?.doc_constancia_sat_name },
          { label: 'CURP', url: businessRes?.data?.doc_curp_url, name: businessRes?.data?.doc_curp_name },
          { label: 'Comprobante de Domicilio', url: businessRes?.data?.doc_comprobante_domicilio_url, name: businessRes?.data?.doc_comprobante_domicilio_name },
        ] : [
          { label: 'Acta Constitutiva', url: businessRes?.data?.doc_acta_constitutiva_url, name: businessRes?.data?.doc_acta_constitutiva_name },
          { label: 'ID del Representante Legal', url: businessRes?.data?.doc_id_representante_url, name: businessRes?.data?.doc_id_representante_name },
          { label: 'Constancia de Situación Fiscal SAT', url: businessRes?.data?.doc_constancia_sat_url, name: businessRes?.data?.doc_constancia_sat_name },
          { label: 'Comprobante de Domicilio', url: businessRes?.data?.doc_comprobante_domicilio_url, name: businessRes?.data?.doc_comprobante_domicilio_name },
          { label: 'Foto de Fachada', url: businessRes?.data?.doc_foto_fachada_url, name: businessRes?.data?.doc_foto_fachada_name },
        ];
        setDocs(docList?.filter(d => d?.url));
      }
    } catch (err) {
      console.error('Error loading verified data:', err);
    }
  };

  const formattedDate = reviewedAt
    ? new Date(reviewedAt)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="space-y-6">
      {/* Verified Banner */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="ShieldCheck" size={32} className="text-green-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <Icon name="Check" size={14} className="text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground">¡Negocio Verificado!</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                <Icon name="BadgeCheck" size={12} />
                Verificado
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {businessName ? `"${businessName}"` : 'Tu negocio'} ha sido verificado exitosamente por el equipo de PromoClub.
            </p>
            {formattedDate && (
              <p className="text-xs text-green-700 font-medium">
                <Icon name="Calendar" size={12} className="inline mr-1" />
                Verificado el {formattedDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="border border-border rounded-xl p-5">
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Star" size={16} className="text-amber-500" />
          Beneficios de la verificación
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: 'BadgeCheck', label: 'Insignia de verificado en tu perfil', color: 'text-green-600 bg-green-50' },
            { icon: 'TrendingUp', label: 'Mayor visibilidad en búsquedas', color: 'text-blue-600 bg-blue-50' },
            { icon: 'Shield', label: 'Mayor confianza de los clientes', color: 'text-violet-600 bg-violet-50' },
            { icon: 'Zap', label: 'Acceso a funciones premium', color: 'text-amber-600 bg-amber-50' },
          ]?.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${benefit?.color}`}>
                <Icon name={benefit?.icon} size={16} />
              </div>
              <p className="text-sm text-foreground">{benefit?.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Documents on file */}
      {docs?.length > 0 && (
        <div className="border border-border rounded-xl p-5">
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="FolderOpen" size={16} className="text-primary" />
            Documentos en expediente ({docs?.length})
          </h4>
          <div className="space-y-2">
            {docs?.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2.5">
                  <Icon name="FileCheck" size={16} className="text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc?.label}</p>
                    {doc?.name && <p className="text-xs text-muted-foreground">{doc?.name}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">Aprobado</span>
                  <a href={doc?.url} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors">
                    <Icon name="Eye" size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Mantén tu verificación activa</p>
            <p className="text-xs text-blue-700">
              Si cambias información importante de tu negocio, es posible que necesites actualizar tus documentos para mantener el estado de verificado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificadoTab;
