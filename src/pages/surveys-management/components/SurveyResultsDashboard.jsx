import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const mockSurveyResults = {
  name: 'Encuesta satisfacción post-visita',
  status: 'active',
  sent: 187,
  responded: 79,
  responseRate: 42,
  avgTime: '2:34',
  questions: [
    {
      id: 1,
      type: 'nps',
      text: '¿Qué tan probable es que nos recomiendes a un amigo?',
      avgScore: 7.8,
      distribution: [
        { label: '0', count: 1 }, { label: '1', count: 0 }, { label: '2', count: 1 },
        { label: '3', count: 2 }, { label: '4', count: 1 }, { label: '5', count: 3 },
        { label: '6', count: 5 }, { label: '7', count: 12 }, { label: '8', count: 18 },
        { label: '9', count: 22 }, { label: '10', count: 14 },
      ],
    },
    {
      id: 2,
      type: 'stars',
      text: '¿Cómo calificarías tu experiencia general?',
      avgScore: 4.2,
      distribution: [
        { label: '5★', count: 38 }, { label: '4★', count: 24 }, { label: '3★', count: 10 },
        { label: '2★', count: 5 }, { label: '1★', count: 2 },
      ],
    },
    {
      id: 3,
      type: 'single',
      text: '¿Qué aspecto valoras más de nuestra cafetería?',
      options: [
        { label: 'Calidad del café', count: 35, pct: 44 },
        { label: 'Atención al cliente', count: 22, pct: 28 },
        { label: 'Ambiente', count: 14, pct: 18 },
        { label: 'Precio', count: 8, pct: 10 },
      ],
    },
    {
      id: 4,
      type: 'yesno',
      text: '¿Volverías a visitarnos?',
      yes: 71,
      no: 8,
    },
    {
      id: 5,
      type: 'open',
      text: '¿Qué podríamos mejorar?',
      responses: [
        'El tiempo de espera podría ser menor en horas pico',
        'Me gustaría más opciones de leche vegetal',
        'El WiFi a veces falla',
        'Excelente servicio, nada que mejorar',
        'Más variedad en los pasteles',
      ],
    },
  ],
};

const SurveyResultsDashboard = ({ onBack }) => {
  const [period, setPeriod] = useState('month');
  const [showManualSend, setShowManualSend] = useState(false);

  const COLORS = ['#1A3FE0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const renderQuestionResults = (q) => {
    switch (q?.type) {
      case 'nps':
        return (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>{q?.avgScore}</span>
              <div>
                <p className="text-sm font-medium text-foreground">Score promedio</p>
                <p className="text-xs text-muted-foreground">de 79 respuestas</p>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={q?.distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#1A3FE0" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'stars':
        return (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>{q?.avgScore}</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5]?.map(i => (
                  <Icon key={i} name="Star" size={20} className={i <= Math.round(q?.avgScore) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {q?.distribution?.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-8">{d?.label}</span>
                  <div className="flex-1 h-4 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${(d?.count / 79) * 100}%` }} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right">{d?.count}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{Math.round((d?.count / 79) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'single':
        return (
          <div className="space-y-2">
            {q?.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex-1 truncate">{opt?.label}</span>
                <div className="w-32 h-4 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${opt?.pct}%` }} />
                </div>
                <span className="text-xs font-mono text-foreground w-8 text-right">{opt?.count}</span>
                <span className="text-xs text-muted-foreground w-10 text-right">{opt?.pct}%</span>
              </div>
            ))}
          </div>
        );
      case 'yesno':
        const total = q?.yes + q?.no;
        return (
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ value: q?.yes }, { value: q?.no }]} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value">
                    <Cell fill="#1A3FE0" />
                    <Cell fill="#EF4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-sm font-medium text-foreground">Sí: {q?.yes} ({Math.round((q?.yes/total)*100)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm font-medium text-foreground">No: {q?.no} ({Math.round((q?.no/total)*100)}%)</span>
              </div>
            </div>
          </div>
        );
      case 'open':
        return (
          <div className="space-y-2">
            {q?.responses?.map((r, i) => (
              <div key={i} className="p-3 bg-muted/20 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">{r}</p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg border border-border hover:bg-muted/30 transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{mockSurveyResults?.name}</h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Activa</span>
          </div>
        </div>
        <button
          onClick={() => setShowManualSend(true)}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <Icon name="Send" size={14} />
          Enviar manualmente
        </button>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors">
          <Icon name="Download" size={14} />
          Exportar CSV
        </button>
      </div>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Enviadas', value: mockSurveyResults?.sent, icon: 'Send', color: 'text-blue-600' },
          { label: 'Respondidas', value: mockSurveyResults?.responded, icon: 'CheckCircle', color: 'text-emerald-600' },
          { label: 'Tasa de respuesta', value: `${mockSurveyResults?.responseRate}%`, icon: 'BarChart2', color: 'text-primary' },
          { label: 'Tiempo promedio', value: mockSurveyResults?.avgTime, icon: 'Clock', color: 'text-purple-600' },
        ]?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={kpi?.icon} size={16} className={kpi?.color} />
              <p className="text-xs font-medium text-muted-foreground">{kpi?.label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>{kpi?.value}</p>
          </div>
        ))}
      </div>
      {/* Questions Results */}
      <div className="space-y-4">
        {mockSurveyResults?.questions?.map((q, i) => (
          <div key={q?.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <p className="text-sm font-semibold text-foreground">{q?.text}</p>
            </div>
            {renderQuestionResults(q)}
          </div>
        ))}
      </div>
      {/* Manual Send Modal */}
      {showManualSend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Enviar encuesta manualmente</h3>
              <button onClick={() => setShowManualSend(false)} className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Encuesta</label>
                <div className="px-3 py-2 bg-muted/20 rounded-lg text-sm text-foreground">{mockSurveyResults?.name}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Destinatarios</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Todos mis clientes', sub: 'Se enviará a 234 clientes' },
                    { value: 'segment', label: 'Segmento del CRM', sub: 'Selecciona un segmento' },
                    { value: 'specific', label: 'Clientes específicos', sub: 'Busca por nombre o teléfono' },
                  ]?.map(opt => (
                    <label key={opt?.value} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors">
                      <input type="radio" name="recipients" value={opt?.value} className="text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                        <p className="text-xs text-muted-foreground">{opt?.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Canal de envío</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted/20">
                    <input type="checkbox" defaultChecked className="text-primary" />
                    <span className="text-sm text-foreground">Push notification</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted/20">
                    <input type="checkbox" className="text-primary" />
                    <span className="text-sm text-foreground">WhatsApp</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Mensaje personalizado</label>
                <textarea rows={3} placeholder="Escribe el mensaje que acompañará la solicitud..." maxLength={160}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                <p className="text-xs text-muted-foreground mt-1">Máximo 160 caracteres</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Envíos manuales este mes</span>
                <span className="text-xs font-semibold text-foreground font-mono">120 / 500</span>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors">
                  Enviar ahora
                </button>
                <button onClick={() => setShowManualSend(false)} className="flex-1 py-2.5 border border-border rounded-xl font-medium text-sm hover:bg-muted/30 transition-colors text-foreground">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyResultsDashboard;
