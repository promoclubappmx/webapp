import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SuccessMessage = ({ email, onContinue }) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <Icon name="CheckCircle" size={32} className="text-success" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">¡Cuenta Creada Exitosamente!</h2>
        <p className="text-muted-foreground">
          Hemos enviado un enlace de verificación a <strong>{email}</strong>
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="flex items-start space-x-3">
          <Icon name="Mail" size={20} className="text-primary mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Verifica tu email</p>
            <p className="text-xs text-muted-foreground">
              Revisa tu bandeja de entrada y haz clic en el enlace de verificación
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} className="text-primary mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Cuenta segura</p>
            <p className="text-xs text-muted-foreground">
              Tu información está protegida con encriptación de nivel empresarial
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Icon name="Zap" size={20} className="text-primary mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Acceso inmediato</p>
            <p className="text-xs text-muted-foreground">
              Una vez verificado, podrás acceder a todas las funciones
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={onContinue}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continuar al Dashboard
        </Button>

        <p className="text-xs text-muted-foreground">
          ¿No recibiste el email? 
          <button className="text-primary hover:underline ml-1">
            Reenviar verificación
          </button>
        </p>
      </div>
    </div>
  );
};

export default SuccessMessage;