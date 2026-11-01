import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const surveyData = {
  name: 'Encuesta satisfacción post-visita',
  status: 'active',
  sent: 312,
  responded: 118,
  responseRate: 38,
  avgTime: '2m 14s',
  questions: [
    {
      id: 1,
      type: 'nps',
      text: '¿Qué tan probable es que nos recomiendes?',
      avgScore: 7.8,
      distribution: [
        { label: '0', value: 2 }, { label: '1', value: 1 }, { label: '2', value: 3 },
        { label: '3', value: 4 }, { label: '4', value: 5 }, { label: '5', value: 8 },
        { label: '6', value: 7 }, { label: '7', value: 15 }, { label: '8', value: 22 },
        { label: '9', value: 31 }, { label: '10', value: 20 },
      ],
    },
    {
      id: 2,
      type: 'stars',
      text: '¿Cómo calificarías tu experiencia general?',
      avgScore: 4.2,
      distribution: [
        { label: '5★', value: 52 }, { label: '4★', value: 34 }, { label: '3★', value: 18 },
        { label: '2★', value: 9 }, { label: '1★', value: 5 },
      ],
    },
    {
      id: 3,
      type: 'single',
      text: '¿Qué aspecto destacarías?',
      options: [
        { label: 'Calidad del producto', value: 45 },
        { label: 'Atención al cliente', value: 38 },
        { label: 'Precio / valor', value: 22 },
        { label: 'Ambiente', value: 13 },
      ],
    },
    {
      id: 4,
      type: 'yesno',
      text: '¿Volverías a visitarnos?',
      yes: 89,
      no: 29,
    },
    {
      id: 5,
      type: 'open',
      text: '¿Qué podríamos mejorar?',
      responses: [
        'El tiempo de espera podría ser menor',
        'Más opciones vegetarianas en el menú',
        'El estacionamiento es complicado',
        'Excelente servicio, nada que mejorar',
        'Podrían tener más variedad de bebidas',
      ],
    },
  ],
};

const COLORS = ['#1A3FE0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const SurveyResults = ({ surveyId, onBack }) => {
  const [period, setPeriod] = useState('month');

  const trendData = [
    { date: '1 Mar', rate: 32 }, { date: '8 Mar', rate: 35 }, { date: '15 Mar', rate: 38 },
    { date: '22 Mar', rate: 41 }, { date: '29 Mar', rate: 38 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
          <Icon name="ArrowLeft" size={18} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{surveyData?.name}</h2>
            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Activa</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[{ value: '7d', label: '7 días' }, { value: 'month', label: 'Este mes' }, { value: '3m', label: '3 meses' }]?.map(p => (
              <button
                key={p?.value}
                onClick={() => setPeriod(p?.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p?.value ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {p?.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-border rounded-lg hover:bg-muted/50 transition-colors text-foreground">
            <Icon name="Download" size={12} />
            Exportar CSV
          </button>
        </div>
      </div>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Enviadas', value: surveyData?.sent, icon: 'Send' },
          { label: 'Respondidas', value: surveyData?.responded, icon: 'CheckCircle' },
          { label: 'Tasa de respuesta', value: `${surveyData?.responseRate}%`, icon: 'TrendingUp' },
          { label: 'Tiempo promedio', value: surveyData?.avgTime, icon: 'Clock' },
        ]?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={kpi?.icon} size={16} className="text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{kpi?.label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>{kpi?.value}</p>
          </div>
        ))}
      </div>
      {/* Questions results */}
      <div className="space-y-4">
        {surveyData?.questions?.map((q, idx) => (
          <div key={q?.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{q?.text}</p>
                <p className="text-xs text-muted-foreground capitalize">{q?.type === 'nps' ? 'NPS · Escala 0-10' : q?.type === 'stars' ? 'Escala de estrellas' : q?.type === 'single' ? 'Opción múltiple' : q?.type === 'yesno' ? 'Sí / No' : 'Pregunta abierta'}</p>
              </div>
            </div>

            {(q?.type === 'nps' || q?.type === 'stars') && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>{q?.avgScore}</span>
                  <span className="text-sm text-muted-foreground">promedio</span>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={q?.distribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1A3FE0" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {q?.type === 'single' && (
              <div className="space-y-2">
                {q?.options?.sort((a, b) => b?.value - a?.value)?.map((opt, i) => {
                  const total = q?.options?.reduce((s, o) => s + o?.value, 0) || 1;
                  const pct = Math.round((opt?.value / total) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground font-medium">{opt?.label}</span>
                        <span className="text-muted-foreground">{opt?.value} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {q?.type === 'yesno' && (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={[{ value: q?.yes }, { value: q?.no }]} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
                      <Cell fill="#1A3FE0" />
                      <Cell fill="#EF4444" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm font-medium text-foreground">Sí: {q?.yes} ({Math.round(q?.yes / (q?.yes + q?.no) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-foreground">No: {q?.no} ({Math.round(q?.no / (q?.yes + q?.no) * 100)}%)</span>
                  </div>
                </div>
              </div>
            )}

            {q?.type === 'open' && (
              <div className="space-y-2">
                {q?.responses?.map((r, i) => (
                  <div key={i} className="p-3 bg-muted/20 rounded-lg text-sm text-foreground border border-border/50">
                    "{r}"
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyResults;
