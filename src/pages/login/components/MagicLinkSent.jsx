import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MagicLinkSent = ({ email, onBack, onResend }) => {
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResend = () => {
    setTimeLeft(60);
    setCanResend(false);
    onResend();
  };

  const handleOpenEmail = () => {
    // Detect email provider and open appropriate client
    const domain = email?.split('@')?.[1];
    let emailUrl = 'mailto:';
    
    if (domain?.includes('gmail')) {
      emailUrl = 'https://mail.google.com';
    } else if (domain?.includes('outlook') || domain?.includes('hotmail')) {
      emailUrl = 'https://outlook.live.com';
    } else if (domain?.includes('yahoo')) {
      emailUrl = 'https://mail.yahoo.com';
    }
    
    window.open(emailUrl, '_blank');
  };

  return (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <Icon name="Mail" size={32} className="text-success" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          ¡Enlace Enviado!
        </h3>
        <p className="text-muted-foreground">
          Hemos enviado un enlace mágico a
        </p>
        <p className="text-foreground font-medium">{email}</p>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 border border-border rounded-lg p-6 text-left">
        <h4 className="font-medium text-foreground mb-3">
          Pasos para continuar:
        </h4>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
              1
            </span>
            <span>Revisa tu bandeja de entrada</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
              2
            </span>
            <span>Busca el email de PromoSpot</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
              3
            </span>
            <span>Haz clic en "Iniciar Sesión"</span>
          </li>
        </ol>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Button
          type="button"
          variant="default"
          size="lg"
          fullWidth
          onClick={handleOpenEmail}
          iconName="ExternalLink"
          iconPosition="right"
        >
          Abrir Email
        </Button>

        <div className="flex flex-col space-y-3">
          {!canResend ? (
            <p className="text-sm text-muted-foreground">
              Reenviar enlace en {timeLeft}s
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleResend}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Reenviar Enlace
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Volver al inicio de sesión
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        <p>¿No encuentras el email? Revisa tu carpeta de spam</p>
      </div>
    </div>
  );
};

export default MagicLinkSent;