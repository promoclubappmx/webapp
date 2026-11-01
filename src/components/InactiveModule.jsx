import React from 'react';
import Icon from './AppIcon';

const InactiveModule = ({ moduleName = 'Este módulo' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Icon name="Lock" size={28} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Módulo inactivo</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            <span className="font-medium text-gray-700">{moduleName}</span> no está disponible en este momento. Contacta a tu administrador para activarlo.
          </p>
          <a
            href="/dashboard-overview"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            Volver al Panel
          </a>
        </div>
      </div>
    </div>
  );
};

export default InactiveModule;
