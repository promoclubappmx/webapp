import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import RulesTable from '../../ifttt-rule-builder/components/RulesTable';
import FlowTestInterface from '../../ifttt-rule-builder/components/FlowTestInterface';
import RuleEditor from '../../ifttt-rule-builder/components/RuleEditor';

const builderTabs = [
  { id: 'rules', label: 'Reglas IFTTT', icon: 'List' },
  { id: 'editor', label: 'Nueva Regla', icon: 'Plus' },
  { id: 'test', label: 'Probar Flow', icon: 'Play' },
];

const IFTTTBuilderTab = () => {
  const [activeBuilderTab, setActiveBuilderTab] = useState('rules');
  const [editingRule, setEditingRule] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setActiveBuilderTab('editor');
  };

  const handleSave = () => {
    setEditingRule(null);
    setActiveBuilderTab('rules');
  };

  const handleNewRule = () => {
    setEditingRule(null);
    setActiveBuilderTab('editor');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Constructor IFTTT</h2>
          <p className="text-sm text-muted-foreground">Automatizaciones simples de trigger y acción en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            <Icon name="Play" size={16} />
            Probar flow
          </button>
          <button onClick={handleNewRule}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <Icon name="Plus" size={16} />
            Nueva regla
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Reglas activas', value: '6', icon: 'Zap', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Disparos hoy', value: '14', icon: 'Activity', color: 'text-blue-600 bg-blue-50' },
          { label: 'Disparos este mes', value: '216', icon: 'TrendingUp', color: 'text-violet-600 bg-violet-50' },
          { label: 'Reglas pausadas', value: '2', icon: 'Pause', color: 'text-amber-600 bg-amber-50' },
        ]?.map(stat => (
          <div key={stat?.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat?.color}`}>
              <Icon name={stat?.icon} size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stat?.value}</p>
              <p className="text-xs text-muted-foreground">{stat?.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Inner Tabs */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl mb-6 w-fit">
        {builderTabs?.map(tab => (
          <button key={tab?.id}
            onClick={() => { setActiveBuilderTab(tab?.id); if (tab?.id !== 'editor') setEditingRule(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeBuilderTab === tab?.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Icon name={tab?.icon} size={15} />
            {tab?.label}
            {tab?.id === 'editor' && editingRule && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeBuilderTab === 'rules' && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Todas las reglas</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Gestiona, activa y edita tus automatizaciones IFTTT</p>
            </div>
          </div>
          <RulesTable onEdit={handleEdit} onNew={handleNewRule} />
        </div>
      )}

      {activeBuilderTab === 'editor' && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Icon name={editingRule ? 'Pencil' : 'Plus'} size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {editingRule ? `Editar: ${editingRule?.name}` : 'Nueva regla IFTTT'}
              </h2>
              <p className="text-xs text-muted-foreground">Configura el trigger y la acción de tu automatización</p>
            </div>
          </div>
          <RuleEditor
            initialRule={editingRule}
            onSave={handleSave}
            onCancel={() => { setEditingRule(null); setActiveBuilderTab('rules'); }}
          />
        </div>
      )}

      {activeBuilderTab === 'test' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden" style={{ minHeight: '600px' }}>
            <FlowTestInterface onClose={() => setActiveBuilderTab('rules')} />
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Icon name="Info" size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Cómo funciona la simulación</h3>
                <p className="text-xs text-muted-foreground">Guía de uso del simulador</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Elige un perfil', desc: 'Selecciona el tipo de usuario que quieres simular: nuevo cliente, dormido, VIP o cumpleañero.', icon: 'User' },
                { step: '2', title: 'Inicia la simulación', desc: 'Presiona "Iniciar simulación" para comenzar el recorrido paso a paso del flow.', icon: 'Play' },
                { step: '3', title: 'Avanza manualmente', desc: 'Usa "Siguiente paso" para ver cada acción que recibiría el usuario, con preview real del mensaje.', icon: 'ChevronRight' },
                { step: '4', title: 'Simula bifurcaciones', desc: 'En los nodos de condición, elige si el usuario realizó la acción esperada para ver qué rama toma.', icon: 'GitBranch' },
                { step: '5', title: 'Revisa el resumen', desc: 'Al final verás todos los mensajes que recibiría el usuario en este flow.', icon: 'CheckCircle' },
              ]?.map(item => (
                <div key={item?.step} className="flex gap-3">
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{item?.step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item?.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item?.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Lightbulb" size={14} className="text-amber-600" />
                <p className="text-xs font-semibold text-amber-800">Tip</p>
              </div>
              <p className="text-xs text-amber-700">Prueba el flow antes de activarlo para asegurarte de que los mensajes y condiciones son correctos.</p>
            </div>
          </div>
        </div>
      )}

      {showTestModal && (
        <FlowTestInterface isModal onClose={() => setShowTestModal(false)} />
      )}
    </div>
  );
};

export default IFTTTBuilderTab;
