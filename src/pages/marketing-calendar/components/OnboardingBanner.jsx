import React from 'react';
import Icon from '../../../components/AppIcon';

const OnboardingBanner = ({ onDismiss }) => (
  <div className="mx-6 mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-4">
    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon name="Map" size={20} className="text-indigo-600" />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-indigo-900">Este es tu mapa de marketing</h4>
      <p className="text-sm text-indigo-700 mt-0.5">
        Aquí verás todo lo que tienes planeado. Las fechas doradas son oportunidades clave del mercado mexicano.
        Haz click en cualquier día vacío para crear una acción, o arrastra bloques para reprogramarlos.
      </p>
    </div>
    <button
      onClick={onDismiss}
      className="text-indigo-400 hover:text-indigo-600 p-1 flex-shrink-0"
    >
      <Icon name="X" size={16} />
    </button>
  </div>
);

export default OnboardingBanner;
