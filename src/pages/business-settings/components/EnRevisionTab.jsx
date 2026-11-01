import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const EnRevisionTab = ({ onRefresh }) => {
  const { user } = useAuth();
  const [submittedAt, setSubmittedAt] = useState(null);
  const [docs, setDocs] = useState([]);
  const [tipoPersona, setTipoPersona] = useState('fisica');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [profileRes, businessRes] = await Promise.all([
        supabase?.from('user_profiles')?.select('tipo_persona')?.eq('id', user?.id)?.maybeSingle(),
        supabase?.from('business_settings')?.select('verification_submitted_at, doc_identificacion_oficial_url, doc_identificacion_oficial_name, doc_constancia_sat_url, doc_constancia_sat_name, doc_curp_url, doc_curp_name, doc_comprobante_domicilio_url, doc_comprobante_domicilio_name, doc_acta_constitutiva_url, doc_acta_constitutiva_name, doc_id_representante_url, doc_id_representante_name, doc_foto_fachada_url, doc_foto_fachada_name')?.eq('owner_id', user?.id)?.maybeSingle()
      ]);

      if (profileRes?.data) setTipoPersona(profileRes?.data?.tipo_persona || 'fisica');

      if (businessRes?.data) {
        setSubmittedAt(businessRes?.data?.verification_submitted_at);
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
      console.error('Error loading review data:', err);
    }
  };

  const formattedDate = submittedAt
    ? new Date(submittedAt)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="Clock" size={28} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Documentos en Revisión</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Tu solicitud de verificación ha sido enviada y está siendo revisada por nuestro equipo.
            </p>
            {formattedDate && (
              <p className="text-xs text-amber-700 font-medium">
                <Icon name="Calendar" size={12} className="inline mr-1" />
                Enviado el {formattedDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border border-border rounded-xl p-5">
        <h4 className="text-sm font-semibold text-foreground mb-4">Estado del proceso</h4>
        <div className="space-y-3">
          {[
            { label: 'Documentos enviados', done: true, active: false, icon: 'CheckCircle' },
            { label: 'En revisión por el equipo PromoClub', done: false, active: true, icon: 'Search' },
            { label: 'Verificación completada', done: false, active: false, icon: 'ShieldCheck' },
          ]?.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step?.done ? 'bg-green-500' : step?.active ? 'bg-amber-500 animate-pulse' : 'bg-muted'
              }`}>
                <Icon name={step?.icon} size={16} className={step?.done || step?.active ? 'text-white' : 'text-muted-foreground'} />
              </div>
              <span className={`text-sm ${step?.done ? 'text-green-700 font-medium' : step?.active ? 'text-amber-700 font-medium' : 'text-muted-foreground'}`}>
                {step?.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Submitted */}
      {docs?.length > 0 && (
        <div className="border border-border rounded-xl p-5">
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="FolderOpen" size={16} className="text-primary" />
            Documentos enviados ({docs?.length})
          </h4>
          <div className="space-y-2">
            {docs?.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <Icon name="FileCheck" size={16} className="text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc?.label}</p>
                    {doc?.name && <p className="text-xs text-muted-foreground">{doc?.name}</p>}
                  </div>
                </div>
                <a href={doc?.url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-muted text-primary transition-colors">
                  <Icon name="Eye" size={15} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">¿Qué sigue?</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• El proceso de revisión toma entre 1 y 3 días hábiles</li>
              <li>• Recibirás una notificación por correo cuando sea aprobado</li>
              <li>• Si hay algún problema con tus documentos, te contactaremos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnRevisionTab;
