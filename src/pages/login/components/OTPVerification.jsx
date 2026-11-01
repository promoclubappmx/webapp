import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const OTPVerification = ({ email, onVerify, onBack, isLoading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value?.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !otp?.[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput?.focus();
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const otpCode = otp?.join('');
    if (otpCode?.length === 6) {
      onVerify(otpCode);
    }
  };

  const handleResend = () => {
    setTimeLeft(300);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    console.log('Resending OTP...');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Smartphone" size={24} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Verificar Código OTP
        </h3>
        <p className="text-muted-foreground">
          Hemos enviado un código de 6 dígitos a
        </p>
        <p className="text-foreground font-medium">{email}</p>
      </div>
      {/* OTP Input */}
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center space-x-3 mb-6">
          {otp?.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e?.target?.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-150"
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Demo OTP Info */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                Código de Demostración
              </p>
              <p className="text-xs text-muted-foreground">
                Usa el código <strong>123456</strong> para acceder
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={otp?.join('')?.length !== 6}
        >
          Verificar Código
        </Button>
      </form>
      {/* Timer and Resend */}
      <div className="text-center space-y-3">
        {!canResend ? (
          <p className="text-sm text-muted-foreground">
            Reenviar código en {formatTime(timeLeft)}
          </p>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
          >
            Reenviar código
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
  );
};

export default OTPVerification;