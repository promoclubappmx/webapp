import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ABTestingResults = ({ campaign, onDeployWinner }) => {
  const [winnerDeployed, setWinnerDeployed] = useState(false);

  const varianteA = {
    letra: 'A',
    color: 'bg-blue-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    apertura: 24.3,
    canje: 8.7,
    visita: 12.1,
    revenue: 4820,
    costoPorConversion: 48,
    audiencia: 210,
  };

  const varianteB = {
    letra: 'B',
    color: 'bg-green-500',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    apertura: 31.8,
    canje: 20.1,
    visita: 18.4,
    revenue: 8940,
    costoPorConversion: 28,
    audiencia: 210,
  };

  const ganadora = varianteB;
  const confianza = 95;

  const MetricRow = ({ label, a, b, format = 'percent' }) => {
    const aWins = a > b;
    const bWins = b > a;
    return (
      <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50 last:border-0">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`text-sm font-semibold text-center ${ aWins ? 'text-success' : 'text-foreground' }`}>
          {format === 'percent' ? `${a}%` : format === 'currency' ? `$${a?.toLocaleString()}` : a}
          {aWins && <Icon name="TrendingUp" size={12} className="inline ml-1 text-success" />}
        </div>
        <div className={`text-sm font-semibold text-center ${ bWins ? 'text-success' : 'text-foreground' }`}>
          {format === 'percent' ? `${b}%` : format === 'currency' ? `$${b?.toLocaleString()}` : b}
          {bWins && <Icon name="TrendingUp" size={12} className="inline ml-1 text-success" />}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon name="FlaskConical" size={18} className="text-primary" />
          Resultados A/B Testing
        </h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {confianza}% confianza estadística
        </span>
      </div>
      {/* Ganadora */}
      {!winnerDeployed && (
        <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-success flex items-center gap-1">
                <Icon name="Trophy" size={14} />
                Variante B ganando
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                La Variante B tuvo {(varianteB?.canje / varianteA?.canje)?.toFixed(1)}x más canjes que la A. ¿Quieres enviarla al resto de la audiencia?
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => { setWinnerDeployed(true); onDeployWinner?.('B'); }}
              className="flex-shrink-0 ml-3"
            >
              Enviar Variante B
            </Button>
          </div>
        </div>
      )}
      {winnerDeployed && (
        <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-xl">
          <p className="text-sm font-semibold text-success flex items-center gap-2">
            <Icon name="CheckCircle2" size={14} />
            Variante B desplegada al resto de la audiencia
          </p>
        </div>
      )}
      {/* Comparativa */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div />
        <div className={`text-center py-1.5 rounded-lg ${varianteA?.bgColor} border ${varianteA?.borderColor}`}>
          <span className={`text-sm font-bold ${varianteA?.textColor}`}>Variante A</span>
          <p className="text-xs text-muted-foreground">{varianteA?.audiencia} usuarios</p>
        </div>
        <div className={`text-center py-1.5 rounded-lg ${varianteB?.bgColor} border ${varianteB?.borderColor}`}>
          <span className={`text-sm font-bold ${varianteB?.textColor}`}>Variante B ✓</span>
          <p className="text-xs text-muted-foreground">{varianteB?.audiencia} usuarios</p>
        </div>
      </div>
      <MetricRow label="Tasa apertura" a={varianteA?.apertura} b={varianteB?.apertura} />
      <MetricRow label="Tasa de canje" a={varianteA?.canje} b={varianteB?.canje} />
      <MetricRow label="Tasa de visita" a={varianteA?.visita} b={varianteB?.visita} />
      <MetricRow label="Revenue" a={varianteA?.revenue} b={varianteB?.revenue} format="currency" />
      <MetricRow label="Costo/conversión" a={varianteA?.costoPorConversion} b={varianteB?.costoPorConversion} format="currency" />
    </div>
  );
};

export default ABTestingResults;
