import React from 'react';


const LoginFooter = () => {
  const currentYear = new Date()?.getFullYear();

  return (
    <div className="mt-8 space-y-6">
      {/* Registration Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <a
            href="/register"
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-150"
          >
            Regístrate aquí
          </a>
        </p>
      </div>

      {/* Support Links */}
      <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
        <a
          href="#"
          className="hover:text-foreground transition-colors duration-150"
        >
          Ayuda
        </a>
        <a
          href="#"
          className="hover:text-foreground transition-colors duration-150"
        >
          Términos
        </a>
        <a
          href="#"
          className="hover:text-foreground transition-colors duration-150"
        >
          Privacidad
        </a>
      </div>

      {/* Copyright */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          © {currentYear} PromoSpot. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginFooter;