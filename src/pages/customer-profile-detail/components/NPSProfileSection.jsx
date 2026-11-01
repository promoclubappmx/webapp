import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const NPSProfileSection = ({ client }) => {
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [surveyQuestion, setSurveyQuestion] = useState('');
  const [surveySent, setSurveySent] = useState(false);

  const npsHistory = [
    { date: '2026-01-15', score: 9, label: 'Promotor' },
    { date: '2025-10-20', score: 7, label: 'Pasivo' },
    { date: '2025-07-08', score: 8, label: 'Pasivo' },
  ];

  const current = npsHistory?.[0];
  const previous = npsHistory?.[1];
  const trend = current?.score - previous?.score;

  const getNPSColor = (score) => {
    if (score >= 9) return { text: 'text-green-600', bg: 'bg-green-100', label: 'Promotor' };
    if (score >= 7) return { text: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pasivo' };
    return { text: 'text-red-600', bg: 'bg-red-100', label: 'Detractor' };
  };

  const currentStyle = getNPSColor(current?.score);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="Star" size={16} className="text-yellow-500" />
          <span className="text-sm font-semibold">NPS del Cliente</span>
        </div>
        <button onClick={() => setShowSurveyForm(!showSurveyForm)}
          className="text-xs text-primary hover:underline flex items-center gap-1">
          <Icon name="Send" size={12} />Enviar encuesta
        </button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-14 h-14 rounded-xl ${currentStyle?.bg} flex items-center justify-center`}>
          <span className={`text-2xl font-bold ${currentStyle?.text}`}>{current?.score}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${currentStyle?.text}`}>{currentStyle?.label}</span>
            <span className={`text-xs flex items-center gap-0.5 font-medium ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              <Icon name={trend > 0 ? 'TrendingUp' : trend < 0 ? 'TrendingDown' : 'Minus'} size={12} />
              {trend > 0 ? '+' : ''}{trend !== 0 ? trend : '—'} vs anterior
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Anterior: {previous?.score} ({previous?.label}) · {previous?.date}</p>
        </div>
      </div>
      {/* NPS history mini timeline */}
      <div className="flex items-end gap-1.5 h-10 mb-2">
        {npsHistory?.slice()?.reverse()?.map((h, i) => {
          const style = getNPSColor(h?.score);
          const height = `${(h?.score / 10) * 100}%`;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full rounded-t-sm ${style?.bg}`} style={{ height: `${h?.score * 4}px` }} />
              <span className="text-xs text-muted-foreground">{h?.score}</span>
            </div>
          );
        })}
      </div>
      {showSurveyForm && !surveySent && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs font-medium mb-2">Micro-encuesta contextual</p>
          <div className="space-y-2">
            {['¿Cómo fue tu experiencia hoy?', '¿Recomendarías nuestro negocio?', '¿Qué podemos mejorar?']?.map(q => (
              <button key={q} onClick={() => setSurveyQuestion(q)}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                  surveyQuestion === q ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'
                }`}>{q}</button>
            ))}
          </div>
          <button
            onClick={() => { if (surveyQuestion) setSurveySent(true); }}
            disabled={!surveyQuestion}
            className="mt-2 w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
            Enviar encuesta
          </button>
        </div>
      )}
      {surveySent && (
        <div className="mt-3 border-t border-border pt-3 flex items-center gap-2 text-xs text-green-600">
          <Icon name="CheckCircle" size={14} />
          Encuesta enviada al cliente
        </div>
      )}
    </div>
  );
};

export default NPSProfileSection;
