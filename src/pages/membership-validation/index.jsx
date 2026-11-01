import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import ConsumptionValidator from './components/ConsumptionValidator';

const user = {
  name: 'Carlos Mendoza',
  email: 'carlos@promospot.com',
  role: 'owner',
};

const MembershipValidation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      {/* Sidebar hidden on mobile for POS-style layout */}
      <div className="hidden lg:block">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <main className={`pt-16 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>Validar Consumo</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Escanea el QR o ingresa el código del cliente</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Club Café Premium · Activa
            </div>
          </div>

          {/* Validator */}
          <ConsumptionValidator />

          {/* Help text */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">¿Cómo funciona?</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• El cliente muestra su QR o código de 6 dígitos desde la app</li>
                    <li>• Escanea o ingresa el código para verificar su membresía</li>
                    <li>• Registra el consumo del beneficio con un toque</li>
                    <li>• El sistema regresa automáticamente al escáner en 3 segundos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CSS for scan line animation */}
      <style>{`
        @keyframes scan-line {
          0% { top: 10%; }
          50% { top: 85%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};

export default MembershipValidation;
