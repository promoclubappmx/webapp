import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, userProfile, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel slides
  const slides = [
    {
      title: 'Gestiona tus promociones',
      subtitle: 'con inteligencia',
      description: 'Optimiza tus campañas de marketing con la tecnología más avanzada y aumenta tus conversiones.'
    },
    {
      title: 'Automatiza tu negocio',
      subtitle: 'ahorra tiempo',
      description: 'Configura reglas automáticas para cupones, recompensas y notificaciones basadas en el comportamiento del cliente.'
    },
    {
      title: 'Analiza y crece',
      subtitle: 'toma decisiones inteligentes',
      description: 'Obtén insights en tiempo real sobre el rendimiento de tus campañas y el engagement de tus clientes.'
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides?.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides?.length]);

  // Validation helpers
  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(email);
  };

  const isPasswordValid = (password) => {
    return password?.length >= 6;
  };

  const logAccess = async ({ userId, email, eventType, errorMessage }) => {
    try {
      await supabase?.from('access_logs')?.insert({
        user_id: userId || null,
        email,
        event_type: eventType,
        user_agent: navigator?.userAgent || null,
        metadata: errorMessage ? { error: errorMessage } : {}
      });
    } catch (err) {
      // Non-blocking: log silently
      console.warn('Access log failed:', err);
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!isEmailValid(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        const msg = signInError?.message || 'Credenciales incorrectas';
        setError(msg);
        await logAccess({ email, eventType: 'login_failed', errorMessage: msg });
      } else {
        await logAccess({ userId: data?.user?.id, email, eventType: 'login_success' });
        // Check account type from user metadata or profile
        const accountType = data?.user?.user_metadata?.account_type || 'owner';
        if (accountType === 'employee') {
          navigate('/dashboard-overview');
        } else {
          navigate('/dashboard-overview');
        }
      }
    } catch (err) {
      const msg = 'Error de red. Por favor intenta de nuevo.';
      setError(msg);
      await logAccess({ email, eventType: 'login_error', errorMessage: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <img 
              src="/assets/images/promoclublogo-1771730627166.png" 
              alt="PromoClub Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bienvenido de nuevo
            </h1>
            <p className="text-muted-foreground">
              Inicia sesión para acceder a tu plataforma de promociones.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e?.target?.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    touched?.email && !isEmailValid(email) && email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : touched?.email && isEmailValid(email)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-100' :'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                  disabled={isLoading}
                />
                {touched?.email && isEmailValid(email) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="CheckCircle2" size={18} className="text-green-500" />
                  </div>
                )}
                {touched?.email && !isEmailValid(email) && email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="AlertCircle" size={18} className="text-red-500" />
                  </div>
                )}
              </div>
              {touched?.email && !isEmailValid(email) && email && (
                <p className="text-xs text-red-600 flex items-center space-x-1">
                  <Icon name="AlertCircle" size={12} />
                  <span>Ingresa un correo electrónico válido</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <a 
                  href="#" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e?.target?.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all pr-10 ${
                    touched?.password && !isPasswordValid(password) && password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : touched?.password && isPasswordValid(password)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-100' :'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
              {touched?.password && !isPasswordValid(password) && password && (
                <p className="text-xs text-red-600 flex items-center space-x-1">
                  <Icon name="AlertCircle" size={12} />
                  <span>La contraseña debe tener al menos 6 caracteres</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e?.target?.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <label 
                htmlFor="remember" 
                className="ml-2 text-sm text-foreground cursor-pointer"
              >
                Recordarme en este dispositivo
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm flex items-start space-x-2">
                <Icon name="AlertCircle" size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm hover:shadow"
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <Icon name="ArrowRight" size={18} />
                </>
              )}
            </button>
          </form>

          {/* Account type info */}
          <div className="mt-4 p-3 bg-muted/40 border border-border rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Icon name="Info" size={13} className="text-primary" />
              Tipos de cuenta en la plataforma
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Icon name="Crown" size={11} />
                Propietario
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Icon name="UserCheck" size={11} />
                Empleado
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Los empleados acceden con los permisos configurados por su empleador.
            </p>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Crear cuenta
              </button>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex justify-center space-x-6 text-sm">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Términos de Servicio
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Carousel Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Carousel Content */}
        <div className="relative z-10 text-center max-w-lg">
          {slides?.map((slide, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                index === currentSlide
                  ? 'opacity-100 transform translate-x-0'
                  : 'opacity-0 absolute inset-0 transform translate-x-8'
              }`}
            >
              <div className="space-y-4 mb-8">
                <h2 className="text-3xl font-bold text-white leading-tight">
                  {slide?.title}
                </h2>
                <h2 className="text-3xl font-bold leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400">
                    {slide?.subtitle}
                  </span>
                </h2>
              </div>

              <p className="text-slate-300 text-lg leading-relaxed mb-12 max-w-md mx-auto">
                {slide?.description}
              </p>
            </div>
          ))}

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2">
            {slides?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white w-8' :'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;