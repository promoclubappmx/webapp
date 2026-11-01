import React from 'react';


const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/images/promoclublogo-1771625068689.png" 
            alt="PromoClub Logo" 
            className="w-12 h-12 object-contain"
          />
          <div className="text-left">
            <h1 className="text-2xl font-bold text-foreground">PromoClub</h1>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Bienvenido de vuelta
        </h2>
        <p className="text-muted-foreground">
          Inicia sesión para acceder a tu panel de administración
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;