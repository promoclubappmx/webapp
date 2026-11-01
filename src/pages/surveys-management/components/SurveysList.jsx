import React from 'react';
import Icon from '../../../components/AppIcon';

const mockSurveys = [
  {
    id: 1,
    name: 'Encuesta satisfacción post-visita',
    status: 'active',
    triggers: ['Post check-in', 'Post reservación'],
    sent: 312,
    responseRate: 38,
    createdAt: '15 Feb 2026',
    updatedAt: '10 Mar 2026',
  },
  {
    id: 2,
    name: 'Feedback Order Ahead',
    status: 'active',
    triggers: ['Post Order Ahead'],
    sent: 145,
    responseRate: 52,
    createdAt: '1 Mar 2026',
    updatedAt: '8 Mar 2026',
  },
  {
    id: 3,
    name: 'Encuesta cupones y promociones',
    status: 'draft',
    triggers: ['Post canje cupón'],
    sent: 0,
    responseRate: 0,
    createdAt: '5 Mar 2026',
    updatedAt: '5 Mar 2026',
  },
  {
    id: 4,
    name: 'Encuesta experiencia general Q1',
    status: 'archived',
    triggers: ['Manual'],
    sent: 89,
    responseRate: 61,
    createdAt: '1 Ene 2026',
    updatedAt: '28 Feb 2026',
  },
];

const statusConfig = {
  active: { label: 'Activa', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  draft: { label: 'Borrador', bg: 'bg-gray-100', text: 'text-gray-600' },
  archived: { label: 'Archivada', bg: 'bg-slate-100', text: 'text-slate-600' },
};

const SurveysList = ({ activeTab, onEdit, onViewResults, onNew }) => {
  const filtered = mockSurveys?.filter(s => {
    if (activeTab === 'active') return s?.status === 'active';
    if (activeTab === 'draft') return s?.status === 'draft';
    if (activeTab === 'archived') return s?.status === 'archived';
    return true;
  });

  if (filtered?.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="ClipboardList" size={36} className="text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">No hay encuestas aquí</h3>
        <p className="text-sm text-muted-foreground mb-4">Crea tu primera encuesta personalizada</p>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Nueva encuesta
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered?.map(survey => {
        const sc = statusConfig?.[survey?.status];
        return (
          <div key={survey?.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-foreground">{survey?.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc?.bg} ${sc?.text}`}>
                    {sc?.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {survey?.triggers?.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span><strong className="text-foreground font-mono">{survey?.sent}</strong> enviadas</span>
                  <span><strong className="text-foreground font-mono">{survey?.responseRate}%</strong> tasa de respuesta</span>
                  <span>Creada: {survey?.createdAt}</span>
                  <span>Modificada: {survey?.updatedAt}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onViewResults(survey?.id)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Icon name="BarChart3" size={12} />
                  Ver resultados
                </button>
                <button
                  onClick={() => onEdit(survey)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-border rounded-lg hover:bg-muted/50 transition-colors text-foreground"
                >
                  <Icon name="Pencil" size={12} />
                  Editar
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-border rounded-lg hover:bg-muted/50 transition-colors text-foreground">
                  <Icon name="Copy" size={12} />
                  Duplicar
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-border rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground">
                  <Icon name="Archive" size={12} />
                  Archivar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SurveysList;
