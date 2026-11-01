import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const mockSurveys = [
  {
    id: 1,
    name: 'Encuesta satisfacción post-visita',
    status: 'active',
    triggers: ['Post check-in', 'Post canje'],
    sent: 187,
    responseRate: 42,
    createdAt: '15 Feb 2026',
    updatedAt: '08 Mar 2026',
    questions: 5,
  },
  {
    id: 2,
    name: 'Evaluación Order Ahead',
    status: 'active',
    triggers: ['Post Order Ahead'],
    sent: 94,
    responseRate: 38,
    createdAt: '20 Feb 2026',
    updatedAt: '05 Mar 2026',
    questions: 4,
  },
  {
    id: 3,
    name: 'Feedback experiencia reservación',
    status: 'active',
    triggers: ['Post reservación', 'Manual'],
    sent: 56,
    responseRate: 61,
    createdAt: '01 Mar 2026',
    updatedAt: '10 Mar 2026',
    questions: 6,
  },
  {
    id: 4,
    name: 'Encuesta prueba nueva carta',
    status: 'draft',
    triggers: ['Manual'],
    sent: 0,
    responseRate: 0,
    createdAt: '09 Mar 2026',
    updatedAt: '09 Mar 2026',
    questions: 3,
  },
  {
    id: 5,
    name: 'Encuesta temporada navideña',
    status: 'archived',
    triggers: ['Post check-in'],
    sent: 312,
    responseRate: 29,
    createdAt: '01 Dic 2025',
    updatedAt: '10 Ene 2026',
    questions: 7,
  },
];

const statusConfig = {
  active: { label: 'Activa', className: 'bg-emerald-100 text-emerald-700' },
  draft: { label: 'Borrador', className: 'bg-slate-100 text-slate-600' },
  archived: { label: 'Archivada', className: 'bg-slate-200 text-slate-500' },
};

const SurveysListHeader = ({ onNewSurvey, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'active', label: 'Activas', count: mockSurveys?.filter(s => s?.status === 'active')?.length },
    { id: 'draft', label: 'Borradores', count: mockSurveys?.filter(s => s?.status === 'draft')?.length },
    { id: 'archived', label: 'Archivadas', count: mockSurveys?.filter(s => s?.status === 'archived')?.length },
  ];

  const filteredSurveys = mockSurveys?.filter(s => s?.status === activeTab);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px' }}>
          Mis Encuestas
        </h1>
        <button
          onClick={onNewSurvey}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Icon name="Plus" size={16} />
          Nueva encuesta
        </button>
      </div>
      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-1">
          {tabs?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => onTabChange(tab?.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab?.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              {tab?.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab?.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {tab?.count}
              </span>
            </button>
          ))}
        </nav>
      </div>
      {/* Survey List */}
      {filteredSurveys?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mb-4">
            <Icon name="ClipboardList" size={36} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay encuestas aquí</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Crea tu primera encuesta personalizada para recopilar feedback de tus clientes.
          </p>
          <button
            onClick={onNewSurvey}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Icon name="Plus" size={16} />
            Nueva encuesta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSurveys?.map(survey => (
            <SurveyCard key={survey?.id} survey={survey} onViewResults={() => {}} onEdit={onNewSurvey} />
          ))}
        </div>
      )}
    </div>
  );
};

const SurveyCard = ({ survey, onViewResults, onEdit }) => {
  const status = statusConfig?.[survey?.status];

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-semibold text-foreground">{survey?.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status?.className}`}>
              {status?.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {survey?.triggers?.map((trigger, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {trigger}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="Send" size={12} />
              <span className="font-semibold text-foreground font-mono">{survey?.sent}</span> enviadas
            </span>
            <span className="flex items-center gap-1">
              <Icon name="BarChart2" size={12} />
              <span className="font-semibold text-foreground font-mono">{survey?.responseRate}%</span> tasa de respuesta
            </span>
            <span className="flex items-center gap-1">
              <Icon name="HelpCircle" size={12} />
              <span className="font-semibold text-foreground">{survey?.questions}</span> preguntas
            </span>
            <span>Creada: {survey?.createdAt}</span>
            <span>Modificada: {survey?.updatedAt}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onViewResults}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary border border-primary/20 rounded-lg text-xs font-medium hover:bg-primary/10 transition-colors"
          >
            <Icon name="BarChart3" size={13} />
            Ver resultados
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <Icon name="Pencil" size={13} />
            Editar
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors">
            <Icon name="Copy" size={13} />
            Duplicar
          </button>
          <button className="p-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:bg-muted/30 transition-colors">
            <Icon name="Archive" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { SurveyCard, mockSurveys };
export default SurveysListHeader;
