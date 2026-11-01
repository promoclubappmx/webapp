import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const SuggestionPanel = ({ suggestion, date, onClose }) => {
  const navigate = useNavigate();

  if (!suggestion) return null;

  const handleCreatePromo = () => {
    navigate(`/promotions-management/new?date=${date}&type=${suggestion?.suggestedType || 'promo'}`);
    onClose();
  };

  const handleCreateCampaign = () => {
    navigate(`/campaigns-management/new?date=${date}&keyDate=${suggestion?.keyDateName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="Lightbulb" size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{suggestion?.message}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{suggestion?.keyDateName} · {date}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Suggestion detail */}
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-sm text-amber-800">{suggestion?.detail}</p>
          </div>

          {/* Benchmark */}
          {suggestion?.benchmark && (
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-2">
              <Icon name="TrendingUp" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">{suggestion?.benchmark}</p>
            </div>
          )}

          {/* Historical reference */}
          {suggestion?.historical && (
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-800 font-medium mb-2">📊 El año pasado:</p>
              <p className="text-sm text-green-700">{suggestion?.historical}</p>
              <button
                onClick={handleCreatePromo}
                className="mt-3 text-sm font-medium text-green-700 underline"
              >
                Duplicar promo del año pasado →
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCreatePromo}
              className="w-full flex items-center justify-between px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="Tag" size={16} />
                <span className="font-medium">Crear promoción</span>
              </div>
              <div className="text-xs opacity-75">Fecha pre-llenada</div>
            </button>

            <button
              onClick={handleCreateCampaign}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="Zap" size={16} />
                <span className="font-medium">Crear campaña</span>
              </div>
              <div className="text-xs opacity-75">Template pre-armado</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Descartar sugerencia
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionPanel;
