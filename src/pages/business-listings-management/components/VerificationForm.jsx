import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const VerificationForm = ({ formData, onChange }) => {
  const [rfcError, setRfcError] = useState('');

  const verificationStatus = formData?.verificationStatus || 'pending'; // pending | in_review | approved | rejected
  const rejectionNote = formData?.rejectionNote || '';

  const validateRFC = (rfc) => {
    const moralRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    const fisicaRegex = /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfc) return '';
    if (moralRegex?.test(rfc) || fisicaRegex?.test(rfc)) return '';
    return 'Formato inválido. Ej: XAXX010101000 (moral) o XAXX010101XXX (física)';
  };

  const handleRFC = (val) => {
    const upper = val?.toUpperCase();
    onChange('rfc', upper);
    setRfcError(validateRFC(upper));
  };

  const handleFileUpload = (field, e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    onChange(field, { name: file?.name, url: URL.createObjectURL(file), file, uploadedAt: new Date()?.toISOString() });
  };

  const docs = [
    {
      key: 'comprobanteDomicilio',
      label: 'Comprobante de domicilio',
      desc: 'Recibo de luz, agua, teléfono o estado de cuenta (menos de 3 meses)',
      accept: '.pdf,.jpg,.jpeg,.png',
      icon: 'FileText'
    },
    {
      key: 'identificacionRepresentante',
      label: 'Identificación del representante legal',
      desc: 'INE/IFE por ambos lados o pasaporte',
      accept: '.pdf,.jpg,.jpeg,.png',
      icon: 'CreditCard'
    },
    {
      key: 'fotoFachada',
      label: 'Foto de la fachada',
      desc: 'Foto del exterior del local mostrando el nombre visible',
      accept: '.jpg,.jpeg,.png,.webp',
      icon: 'Building2'
    }
  ];

  const getDocStatus = (key) => {
    const doc = formData?.[key];
    if (!doc) return 'pending';
    if (verificationStatus === 'approved') return 'approved';
    if (verificationStatus === 'rejected') return 'rejected';
    return 'uploaded';
  };

  const statusConfig = {
    pending: { label: 'Documentos pendientes', color: 'bg-muted text-muted-foreground', step: 0 },
    in_review: { label: 'En revisión', color: 'bg-amber-100 text-amber-700', step: 1 },
    approved: { label: 'Verificado', color: 'bg-green-100 text-green-700', step: 2 },
    rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', step: 0 },
  };

  const currentStatus = statusConfig?.[verificationStatus];
  const allDocsUploaded = docs?.every(d => formData?.[d?.key]);
  const rfcFilled = formData?.rfc && !rfcError;

  return (
    <div className="space-y-6">
      {/* Status stepper */}
      {verificationStatus === 'approved' ? (
        <div className="flex flex-col items-center py-8 bg-green-50 border border-green-200 rounded-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <Icon name="BadgeCheck" size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-green-700 mb-1">✓ Negocio Verificado</h3>
          <p className="text-sm text-green-600">Verificado el {formData?.verifiedAt ? new Date(formData.verifiedAt)?.toLocaleDateString('es-MX') : 'recientemente'}</p>
          <p className="text-xs text-green-600/70 mt-2">Tu ficha muestra el badge "✓ Verificado" y tiene prioridad en resultados de búsqueda.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Estado de verificación</h3>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${currentStatus?.color}`}>
              {currentStatus?.label}
            </span>
          </div>
          {/* Stepper */}
          <div className="flex items-center gap-0">
            {['Documentos', 'En revisión', 'Verificado']?.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < currentStatus?.step ? 'bg-primary text-primary-foreground' :
                    i === currentStatus?.step ? 'bg-primary/20 text-primary border-2 border-primary': 'bg-muted text-muted-foreground'
                  }`}>
                    {i < currentStatus?.step ? <Icon name="Check" size={14} /> : i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 text-center w-20">{step}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mb-5 ${ i < currentStatus?.step ? 'bg-primary' : 'bg-border'}`} />}
              </React.Fragment>
            ))}
          </div>
          {verificationStatus === 'rejected' && rejectionNote && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
              <Icon name="AlertCircle" size={14} className="inline mr-1" />
              <strong>Motivo de rechazo:</strong> {rejectionNote}
            </div>
          )}
          {verificationStatus === 'in_review' && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <Icon name="Clock" size={14} className="inline mr-1" />
              El equipo PromoClub revisará tus documentos en 1-3 días hábiles.
            </div>
          )}
        </div>
      )}
      {/* Nota de privacidad */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Icon name="Shield" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-700 mb-1">Privacidad y seguridad</p>
          <p className="text-xs text-blue-600">Tus documentos están encriptados y solo son accesibles por el equipo de verificación de PromoClub. Nunca se comparten con terceros ni se muestran a los usuarios.</p>
        </div>
      </div>
      {/* RFC */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">RFC</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            RFC del negocio
          </label>
          <input
            type="text"
            maxLength={13}
            value={formData?.rfc || ''}
            onChange={e => handleRFC(e?.target?.value)}
            placeholder="XAXX010101000"
            className={`w-full max-w-xs px-3 py-2 border rounded-lg bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase ${
              rfcError ? 'border-destructive' : formData?.rfc && !rfcError ? 'border-green-400' : 'border-border'
            }`}
          />
          {rfcError && <p className="text-xs text-destructive mt-1">{rfcError}</p>}
          {formData?.rfc && !rfcError && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Icon name="CheckCircle" size={12} /> Formato válido</p>}
          <p className="text-xs text-muted-foreground mt-1">Se usa para facturación y verificación manual por el equipo PromoClub.</p>
        </div>
      </div>
      {/* Documentos */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Documentos requeridos</h3>
        </div>
        <div className="space-y-4">
          {docs?.map(doc => {
            const uploaded = formData?.[doc?.key];
            const docStatus = getDocStatus(doc?.key);
            return (
              <div key={doc?.key} className="border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      docStatus === 'approved' ? 'bg-green-100' :
                      docStatus === 'uploaded' ? 'bg-amber-100' :
                      docStatus === 'rejected' ? 'bg-red-100' : 'bg-muted'
                    }`}>
                      <Icon name={doc?.icon} size={20} className={`${
                        docStatus === 'approved' ? 'text-green-600' :
                        docStatus === 'uploaded' ? 'text-amber-600' :
                        docStatus === 'rejected' ? 'text-red-600' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-foreground">{doc?.label}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          docStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          docStatus === 'uploaded' ? 'bg-amber-100 text-amber-700' :
                          docStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
                        }`}>
                          {docStatus === 'approved' ? '✓ Aprobado' :
                           docStatus === 'uploaded' ? 'Subido' :
                           docStatus === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{doc?.desc}</p>
                      {uploaded && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <Icon name="Paperclip" size={12} /> {uploaded?.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept={doc?.accept}
                      onChange={e => handleFileUpload(doc?.key, e)}
                      className="hidden"
                      id={`upload-${doc?.key}`}
                    />
                    <label htmlFor={`upload-${doc?.key}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <Icon name="Upload" size={14} />
                      {uploaded ? 'Cambiar' : 'Subir'}
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Submit for review */}
      {verificationStatus === 'pending' && allDocsUploaded && rfcFilled && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Todos los documentos listos</p>
            <p className="text-xs text-muted-foreground">El equipo PromoClub revisará en 1-3 días hábiles</p>
          </div>
          <button
            onClick={() => onChange('verificationStatus', 'in_review')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
            <Icon name="Send" size={16} /> Enviar para revisión
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationForm;
