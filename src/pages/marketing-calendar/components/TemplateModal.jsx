import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TemplateModal = ({ onClose, onSave, onApply, savedTemplates = [] }) => {
  const [activeTab, setActiveTab] = useState('save');
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');

  const handleSave = () => {
    if (!templateName?.trim()) return;
    onSave?.({ name: templateName, description: templateDesc });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Plantillas de semana</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { key: 'save', label: 'Guardar semana actual' },
            { key: 'apply', label: 'Aplicar plantilla' },
          ]?.map(tab => (
            <button
              key={tab?.key}
              onClick={() => setActiveTab(tab?.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab?.key
                  ? 'text-indigo-600 border-b-2 border-indigo-600' :'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab?.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'save' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la plantilla</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e?.target?.value)}
                  placeholder="Ej: Mi semana estándar"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <textarea
                  value={templateDesc}
                  onChange={e => setTemplateDesc(e?.target?.value)}
                  placeholder="Describe cuándo usar esta plantilla..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!templateName?.trim()}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Guardar plantilla
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedTemplates?.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <Icon name="BookOpen" size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tienes plantillas guardadas</p>
                  <p className="text-xs mt-1">Guarda la configuración de una semana para reutilizarla</p>
                </div>
              ) : (
                savedTemplates?.map(tmpl => (
                  <div key={tmpl?.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tmpl?.name}</p>
                      {tmpl?.description && <p className="text-xs text-gray-400 mt-0.5">{tmpl?.description}</p>}
                    </div>
                    <button
                      onClick={() => { onApply?.(tmpl); onClose?.(); }}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
