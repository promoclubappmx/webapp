import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const GLOBAL_ACUM_GLOBAL_MIN = 5.0;
const GLOBAL_POINT_VALUE = 0.15;
const DEFAULT_AVG_TICKET = 200;
const DEFAULT_MONTHLY_VISITS = 450;
const DEFAULT_MARGIN = 40;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const calcPoints = (purchase, threshold) => Math.floor(purchase / threshold);
const calcDiscount = (points, value) => (points * value)?.toFixed(2);
const calcVisitsForDiscount = (threshold, pointValue, ticket, targetDiscount = 20) => {
  const pointsPerVisit = Math.floor(ticket / threshold);
  if (pointsPerVisit <= 0) return '∞';
  const pointsNeeded = Math.ceil(targetDiscount / pointValue);
  return Math.ceil(pointsNeeded / pointsPerVisit);
};

// ─── SHAKE ANIMATION STYLE ───────────────────────────────────────────────────
const shakeStyle = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  .shake { animation: shake 0.4s ease-in-out; }
`;

// ─── GLOBAL RULE BANNER ───────────────────────────────────────────────────────
const GlobalRuleBanner = () => (
  <>
    <style>{shakeStyle}</style>
    <div className="bg-blue-50/70 border border-blue-200 border-l-4 border-l-blue-500 rounded-r-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name="Shield" size={16} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900">Regla global PromoClub (referencia)</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Los valores globales del programa son: <strong>$5.00 MXN de compra = 1 punto</strong> y <strong>1 punto = $0.15 MXN</strong>. Este planificador te ayuda a proyectar el costo del programa con base en esos parámetros y tu ticket promedio.
          </p>
        </div>
      </div>
    </div>
  </>
);

// ─── TICKET PROMEDIO SECTION ──────────────────────────────────────────────────
const TicketPromedioSection = ({ avgTicket, setAvgTicket, monthlyVisits, setMonthlyVisits }) => {
  const [shaking, setShaking] = useState(false);

  const handleTicket = (val) => {
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      return;
    }
    setAvgTicket(n);
  };

  const handleVisits = (val) => {
    const n = parseInt(val);
    if (isNaN(n) || n <= 0) return;
    setMonthlyVisits(n);
  };

  const estimatedRevenue = avgTicket * monthlyVisits;
  const ptsPerVisit = Math.floor(avgTicket / GLOBAL_ACUM_GLOBAL_MIN);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
          <Icon name="Receipt" size={20} className="text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Ticket promedio y volumen</h3>
          <p className="text-xs text-muted-foreground">Define el ticket promedio de tu negocio y el volumen mensual de visitas. Estos valores se usan en el análisis económico y el simulador.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Ticket promedio por visita</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">$</span>
            <input
              type="number"
              min={1}
              step={10}
              value={avgTicket}
              onChange={e => handleTicket(e?.target?.value)}
              className={`w-full pl-8 pr-12 py-3 border-2 border-primary/40 rounded-xl text-lg font-bold bg-background text-foreground focus:outline-none focus:border-primary ${shaking ? 'shake border-destructive' : ''}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MXN</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Con este ticket: <strong className="text-foreground">{ptsPerVisit} puntos/visita</strong> (regla global $5 = 1 pto)
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Visitas mensuales estimadas</label>
          <div className="relative">
            <input
              type="number"
              min={1}
              step={10}
              value={monthlyVisits}
              onChange={e => handleVisits(e?.target?.value)}
              className="w-full px-4 pr-20 py-3 border-2 border-primary/40 rounded-xl text-lg font-bold bg-background text-foreground focus:outline-none focus:border-primary"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">visitas/mes</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Revenue estimado: <strong className="text-foreground">${estimatedRevenue?.toLocaleString()} MXN/mes</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-violet-700">${avgTicket}</p>
          <p className="text-xs text-violet-600">Ticket promedio</p>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-violet-700">{monthlyVisits?.toLocaleString()}</p>
          <p className="text-xs text-violet-600">Visitas/mes</p>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-violet-700">${estimatedRevenue?.toLocaleString()}</p>
          <p className="text-xs text-violet-600">Revenue/mes</p>
        </div>
      </div>
    </div>
  );
};

// ─── DISCOUNT VALUE SECTION ───────────────────────────────────────────────────
const DiscountValueSection = ({ avgTicket }) => {
  const examples = [50, 200, 500];
  const pointValue = GLOBAL_POINT_VALUE;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Icon name="Banknote" size={20} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Valor en descuento</h3>
          <p className="text-xs text-muted-foreground">Referencia de cuánto vale cada punto como descuento al pagar (valor global PromoClub: $0.15 MXN/punto).</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 py-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
        <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-emerald-200">
          <span className="text-xl font-bold text-foreground">1</span>
          <span className="text-sm text-muted-foreground font-medium">punto</span>
        </div>
        <Icon name="ArrowRight" size={16} className="text-emerald-600" />
        <div className="flex items-center gap-1 px-4 py-3 bg-emerald-100 rounded-xl">
          <span className="text-xl font-bold text-emerald-700">$0.15</span>
          <span className="text-sm text-emerald-600 font-medium">MXN</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Valor en descuento por cantidad de puntos</p>
        <div className="grid grid-cols-3 gap-3">
          {examples?.map(pts => (
            <div key={pts} className="bg-muted/30 border border-border rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Icon name="Star" size={16} className="text-emerald-600" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{pts} puntos</p>
              <Icon name="ArrowDown" size={12} className="text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-600">${calcDiscount(pts, pointValue)}</p>
              <p className="text-xs text-muted-foreground">MXN desc.</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-xs text-foreground">
          Con ticket promedio de <strong>${avgTicket} MXN</strong>: el cliente gana <strong>{calcPoints(avgTicket, GLOBAL_ACUM_GLOBAL_MIN)} puntos/visita</strong> = <strong>${calcDiscount(calcPoints(avgTicket, GLOBAL_ACUM_GLOBAL_MIN), pointValue)} MXN</strong> de descuento futuro por visita.
        </p>
      </div>
    </div>
  );
};

// ─── ECONOMIC ANALYSIS ────────────────────────────────────────────────────────
const EconomicAnalysis = ({ avgTicket, monthlyVisits, additionalRulesActive, margin, setMargin }) => {
  const redemptionRate = 35;
  const threshold = GLOBAL_ACUM_GLOBAL_MIN;
  const pointValue = GLOBAL_POINT_VALUE;

  const basePtsPerVisit = Math.floor(avgTicket / threshold);

  const bonusEstimates = {
    bonusStreak: 12, bonusMilestone: 3, bonusBirthday: 1, bonusReferral: 2,
    bonusReview: 2, bonusReservation: 5, bonusProfile: 0.5, bonusNewProduct: 1,
    bonusPrepaidReload: 2, bonusFirstVisitMonth: 3, bonusGroupVisit: 3,
  };

  const additionalPtsPerVisit = (additionalRulesActive || [])?.reduce((acc, ruleId) => {
    return acc + (bonusEstimates?.[ruleId] || 0);
  }, 0);

  const totalPtsPerVisit = basePtsPerVisit + additionalPtsPerVisit;
  const discountPerVisit = totalPtsPerVisit * pointValue;
  const returnPct = parseFloat(((discountPerVisit / avgTicket) * 100)?.toFixed(2));
  const visitsForDiscount = calcVisitsForDiscount(threshold, pointValue, avgTicket, 20);

  const totalPointsMonth = totalPtsPerVisit * monthlyVisits;
  const grossCost = totalPointsMonth * pointValue;
  const realCost = grossCost * (redemptionRate / 100);
  const estimatedRevenue = avgTicket * monthlyVisits;
  const marginRevenue = estimatedRevenue * (margin / 100);
  const programCostPct = (realCost / (marginRevenue || 1)) * 100;

  const returnColor = returnPct < 2 ? 'text-blue-600' : returnPct <= 5 ? 'text-emerald-600' : returnPct <= 8 ? 'text-amber-600' : 'text-destructive';
  const returnBg = returnPct < 2 ? 'bg-blue-50 border-blue-200' : returnPct <= 5 ? 'bg-emerald-50 border-emerald-200' : returnPct <= 8 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const returnBenchmark = returnPct < 2 ? 'Por debajo del rango recomendado (2-5%). Considera activar más reglas bonus.' : returnPct <= 5 ? 'Dentro del rango óptimo (2-5%). ¡Excelente balance!' : returnPct <= 8 ? 'Por encima del rango recomendado. Vigila el costo.' : 'Muy generoso. Revisa tu margen antes de activar.';

  const sustainColor = programCostPct < 15 ? 'text-emerald-700' : programCostPct <= 25 ? 'text-amber-700' : 'text-destructive';
  const sustainBg = programCostPct < 15 ? 'bg-emerald-50 border-emerald-200' : programCostPct <= 25 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const sustainLabel = programCostPct < 15 ? '✅ Sostenible — el programa cuesta menos del 15% de tu margen' : programCostPct <= 25 ? '⚠️ Vigilar — el programa cuesta entre 15-25% de tu margen' : '❌ Revisar — el programa cuesta más del 25% de tu margen';

  const timelineNodes = [];
  if (basePtsPerVisit > 0 && typeof visitsForDiscount === 'number') {
    for (let i = 1; i <= Math.min(visitsForDiscount, 12); i++) {
      timelineNodes?.push({ visit: i, pts: i * basePtsPerVisit, isTarget: i === visitsForDiscount });
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Icon name="Calculator" size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Análisis económico</h3>
          <p className="text-xs text-muted-foreground">Proyección del impacto real del programa considerando reglas ordinarias y reglas adicionales activas.</p>
        </div>
      </div>

      {(additionalRulesActive?.length || 0) > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <Icon name="Zap" size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <strong>{additionalRulesActive?.length} regla(s) adicional(es) activa(s)</strong> contribuyen con ~<strong>{additionalPtsPerVisit} pts extra/visita</strong> en promedio. El análisis incluye este impacto.
          </p>
        </div>
      )}

      <div className={`p-5 rounded-xl border ${returnBg}`}>
        <p className="text-sm font-semibold text-foreground mb-3">Por cada visita promedio de tu cliente:</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="ShoppingCart" size={14} />
            <span>Compra promedio: <strong className="text-foreground">${avgTicket} MXN</strong> ÷ <strong className="text-foreground">$5.00 MXN</strong> = <strong className="text-foreground">{basePtsPerVisit} pts base</strong></span>
          </div>
          {additionalPtsPerVisit > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Zap" size={14} />
              <span>Reglas adicionales activas: <strong className="text-foreground">+{additionalPtsPerVisit} pts/visita</strong> (estimado)</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Star" size={14} />
            <span><strong className="text-foreground">{totalPtsPerVisit} pts totales</strong> × <strong className="text-foreground">$0.15 MXN</strong> = <strong className="text-foreground">${discountPerVisit?.toFixed(2)} MXN</strong> de descuento futuro</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-3xl font-bold ${returnColor}`}>{returnPct}%</span>
          <div>
            <p className="text-xs font-medium text-foreground">de retorno para el cliente</p>
            <p className={`text-xs mt-0.5 ${returnColor}`}>{returnBenchmark}</p>
          </div>
        </div>
      </div>

      {/* ─── COSTO MENSUAL ESTIMADO — EMPHASIZED ─── */}
      <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <Icon name="TrendingUp" size={16} className="text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Costo mensual estimado del programa</p>
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Para el owner</span>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <p><strong className="text-foreground">{monthlyVisits}</strong> visitas × <strong className="text-foreground">{totalPtsPerVisit}</strong> pts/visita = <strong className="text-foreground">{totalPointsMonth?.toLocaleString()}</strong> pts/mes</p>
          <p><strong className="text-foreground">{totalPointsMonth?.toLocaleString()}</strong> pts × <strong className="text-foreground">$0.15</strong> = <strong className="text-foreground">${grossCost?.toFixed(0)}</strong> MXN en descuentos potenciales</p>
          <p>× <strong className="text-foreground">{redemptionRate}%</strong> de canje estimado = costo real mensual:</p>
        </div>
        <div className="flex items-center justify-center py-4 bg-white/70 rounded-xl border border-primary/20">
          <div className="text-center">
            <p className={`text-4xl font-extrabold ${realCost > estimatedRevenue * 0.03 ? 'text-amber-600' : 'text-primary'}`}>
              ${realCost?.toFixed(0)} <span className="text-lg font-semibold text-muted-foreground">MXN/mes</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Costo real estimado del programa de lealtad</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-3">Usando tasa estimada de {redemptionRate}% (promedio PromoClub)</p>
      </div>

      <div className="p-5 bg-muted/20 border border-border rounded-xl">
        <p className="text-sm font-semibold text-foreground mb-3">Margen requerido:</p>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Tu margen promedio:</label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={1} max={100} value={margin}
              onChange={e => setMargin(parseInt(e?.target?.value) || 40)}
              className="w-20 border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground text-center"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <span className="text-xs text-muted-foreground">(privado, solo para análisis)</span>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground mb-3">
          <p>Costo real del programa: <strong className="text-foreground">${realCost?.toFixed(0)} MXN/mes</strong></p>
          <p>Tu margen sobre revenue estimado: <strong className="text-foreground">${marginRevenue?.toFixed(0)} MXN/mes</strong></p>
          <p>El programa representa el <strong className="text-foreground">{programCostPct?.toFixed(1)}%</strong> de tu margen</p>
        </div>
        <div className={`p-3 rounded-lg border text-sm font-medium ${sustainBg} ${sustainColor}`}>
          {sustainLabel}
        </div>
      </div>

      <div className="p-5 bg-muted/20 border border-border rounded-xl">
        <p className="text-sm font-semibold text-foreground mb-3">Impacto en el cliente:</p>
        <p className="text-sm text-muted-foreground mb-4">
          Con ticket promedio de <strong className="text-foreground">${avgTicket} MXN</strong>, un cliente necesita{' '}
          <strong className="text-foreground">{visitsForDiscount} visitas</strong> (solo reglas base) para acumular suficientes puntos para un descuento de{' '}
          <strong className="text-foreground">$20 MXN</strong>.
        </p>
        {timelineNodes?.length > 0 && (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-end gap-2 min-w-max">
              {timelineNodes?.map((node, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{node?.pts}pts</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    node?.isTarget ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-muted border-border text-muted-foreground'
                  }`}>
                    {node?.isTarget ? '🎉' : node?.visit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3 italic">
          {typeof visitsForDiscount === 'number' && visitsForDiscount <= 5
            ? `✅ Excelente — ${visitsForDiscount} visitas es muy accesible.`
            : typeof visitsForDiscount === 'number' && visitsForDiscount <= 10
            ? `✅ Bien — ${visitsForDiscount} visitas está dentro del rango óptimo.`
            : typeof visitsForDiscount === 'number'
            ? `⚠️ ${visitsForDiscount} visitas puede ser mucho. Considera activar más reglas bonus.`
            : 'Ajusta los parámetros para ver el análisis.'}
        </p>
      </div>
    </div>
  );
};

// ─── SCENARIO SIMULATOR ───────────────────────────────────────────────────────
const ScenarioSimulator = ({ avgTicket, monthlyVisits, additionalRulesActive }) => {
  const threshold = GLOBAL_ACUM_GLOBAL_MIN;
  const pointValue = GLOBAL_POINT_VALUE;

  const bonusEstimates = {
    bonusStreak: 12, bonusMilestone: 3, bonusBirthday: 1, bonusReferral: 2,
    bonusReview: 2, bonusReservation: 5, bonusProfile: 0.5, bonusNewProduct: 1,
    bonusPrepaidReload: 2, bonusFirstVisitMonth: 3, bonusGroupVisit: 3,
  };

  const additionalPtsPerVisit = (additionalRulesActive || [])?.reduce((acc, ruleId) => {
    return acc + (bonusEstimates?.[ruleId] || 0);
  }, 0);

  const basePtsPerVisit = Math.floor(avgTicket / threshold);
  const totalPtsPerVisit = basePtsPerVisit + additionalPtsPerVisit;
  const returnPct = parseFloat(((totalPtsPerVisit * pointValue / avgTicket) * 100)?.toFixed(2));
  const totalPts = totalPtsPerVisit * monthlyVisits;
  const monthlyCost = totalPts * pointValue * 0.35;
  const visits = calcVisitsForDiscount(threshold, pointValue, avgTicket, 20);
  const sustain = monthlyCost < (avgTicket * monthlyVisits * 0.4 * 0.15) ? 'green' : monthlyCost < (avgTicket * monthlyVisits * 0.4 * 0.25) ? 'amber' : 'red';
  const sustainIcon = sustain === 'green' ? '🟢' : sustain === 'amber' ? '🟡' : '🔴';

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <Icon name="BarChart3" size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Simulador de escenarios</h3>
          <p className="text-xs text-muted-foreground">Proyección del programa con los valores parametrizados (ticket promedio, visitas y reglas activas).</p>
        </div>
      </div>

      <div className="border border-primary/40 bg-primary/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">Tu programa configurado</p>
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">Valores actuales</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/60 rounded-lg p-3 border border-border/50">
            <p className="text-muted-foreground mb-1">Umbral global</p>
            <p className="font-bold text-foreground">$5.00 MXN = 1 pto</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-border/50">
            <p className="text-muted-foreground mb-1">Valor del punto</p>
            <p className="font-bold text-foreground">$0.15 MXN/pto</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-border/50">
            <p className="text-muted-foreground mb-1">Ticket promedio</p>
            <p className="font-bold text-foreground">${avgTicket} MXN</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-border/50">
            <p className="text-muted-foreground mb-1">Visitas/mes</p>
            <p className="font-bold text-foreground">{monthlyVisits?.toLocaleString()}</p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resultados proyectados</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Pts base/visita</p>
              <p className="text-xl font-bold text-foreground">{basePtsPerVisit}</p>
            </div>
            {additionalPtsPerVisit > 0 && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Pts bonus/visita</p>
                <p className="text-xl font-bold text-amber-600">+{additionalPtsPerVisit}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Pts totales/visita</p>
              <p className="text-xl font-bold text-primary">{totalPtsPerVisit}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Retorno %</p>
              <p className={`text-xl font-bold ${returnPct <= 5 ? 'text-emerald-600' : returnPct <= 8 ? 'text-amber-600' : 'text-destructive'}`}>{returnPct}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Costo/mes</p>
              <p className="text-xl font-bold text-foreground">${monthlyCost?.toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Visitas 1er desc.</p>
              <p className="text-xl font-bold text-foreground">{visits}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Sostenibilidad</p>
              <p className="text-2xl">{sustainIcon}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-muted/30 border border-border rounded-lg">
        <p className="text-xs text-muted-foreground">
          <Icon name="Info" size={11} className="inline mr-1 text-blue-500" />
          La simulación usa el <strong className="text-foreground">ticket promedio de ${avgTicket} MXN</strong>, <strong className="text-foreground">{monthlyVisits} visitas/mes</strong>
          {(additionalRulesActive?.length || 0) > 0 && <> y <strong className="text-foreground">{additionalRulesActive?.length} regla(s) adicional(es) activa(s)</strong></>} como base de cálculo. Tasa de canje estimada: 35%.
        </p>
      </div>
    </div>
  );
};

// ─── PDF GENERATOR ────────────────────────────────────────────────────────────
const generatePDF = ({ avgTicket, monthlyVisits, margin }) => {
  const threshold = GLOBAL_ACUM_GLOBAL_MIN;
  const pointValue = GLOBAL_POINT_VALUE;
  const redemptionRate = 35;
  const basePtsPerVisit = Math.floor(avgTicket / threshold);
  const totalPtsPerVisit = basePtsPerVisit;
  const discountPerVisit = totalPtsPerVisit * pointValue;
  const returnPct = parseFloat(((discountPerVisit / avgTicket) * 100)?.toFixed(2));
  const totalPointsMonth = totalPtsPerVisit * monthlyVisits;
  const grossCost = totalPointsMonth * pointValue;
  const realCost = grossCost * (redemptionRate / 100);
  const estimatedRevenue = avgTicket * monthlyVisits;
  const marginRevenue = estimatedRevenue * (margin / 100);
  const programCostPct = (realCost / (marginRevenue || 1)) * 100;
  const visitsForDiscount = calcVisitsForDiscount(threshold, pointValue, avgTicket, 20);
  const sustainLabel = programCostPct < 15 ? 'Sostenible' : programCostPct <= 25 ? 'Vigilar' : 'Revisar';

  const now = new Date();
  const dateStr = now?.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Planificador de Costos - PromoClub</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #1a1a2e; background: #fff; padding: 32px; font-size: 13px; }
  h1 { font-size: 22px; font-weight: 800; color: #2563eb; margin-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 12px; margin-bottom: 24px; }
  .section { margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
  .section-header { background: #f8fafc; padding: 10px 16px; font-weight: 700; font-size: 13px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }
  .section-body { padding: 14px 16px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
  .card-value { font-size: 20px; font-weight: 800; color: #2563eb; }
  .card-label { font-size: 11px; color: #64748b; margin-top: 2px; }
  .highlight { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #93c5fd; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px; }
  .highlight-value { font-size: 36px; font-weight: 900; color: #1d4ed8; }
  .highlight-label { font-size: 12px; color: #3b82f6; margin-top: 4px; }
  .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; }
  .row:last-child { border-bottom: none; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-amber { background: #fef9c3; color: #854d0e; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-align: center; }
  .blue-banner { background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 10px 14px; margin-bottom: 16px; }
  .blue-banner p { color: #1e40af; font-size: 12px; }
</style>
</head>
<body>
<h1>&#128202; Planificador de Costos</h1>
<p class="subtitle">PromoClub &middot; Generado el ${dateStr}</p>

<div class="blue-banner">
  <p><strong>Regla global PromoClub:</strong> $5.00 MXN de compra = 1 punto &middot; 1 punto = $0.15 MXN</p>
</div>

<div class="section">
  <div class="section-header">&#127915; Par&aacute;metros configurados</div>
  <div class="section-body">
    <div class="grid3">
      <div class="card"><div class="card-value">$${avgTicket}</div><div class="card-label">Ticket promedio (MXN)</div></div>
      <div class="card"><div class="card-value">${monthlyVisits?.toLocaleString()}</div><div class="card-label">Visitas mensuales</div></div>
      <div class="card"><div class="card-value">${margin}%</div><div class="card-label">Margen del negocio</div></div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-header">&#128176; Valor en descuento</div>
  <div class="section-body">
    <div class="row"><span>Puntos por visita (regla base)</span><strong>${basePtsPerVisit} pts</strong></div>
    <div class="row"><span>Descuento por visita</span><strong>$${discountPerVisit?.toFixed(2)} MXN</strong></div>
    <div class="row"><span>Retorno para el cliente</span><strong>${returnPct}%</strong></div>
    <div class="row"><span>Visitas para primer descuento ($20)</span><strong>${visitsForDiscount}</strong></div>
  </div>
</div>

<div class="highlight">
  <div class="highlight-label">&#128161; Costo mensual estimado del programa (para el owner)</div>
  <div class="highlight-value">$${realCost?.toFixed(0)} MXN/mes</div>
  <div class="highlight-label">Tasa de canje estimada: ${redemptionRate}% &middot; ${totalPointsMonth?.toLocaleString()} pts/mes generados</div>
</div>

<div class="section">
  <div class="section-header">&#128200; An&aacute;lisis econ&oacute;mico</div>
  <div class="section-body">
    <div class="row"><span>Revenue mensual estimado</span><strong>$${estimatedRevenue?.toLocaleString()} MXN</strong></div>
    <div class="row"><span>Puntos generados/mes</span><strong>${totalPointsMonth?.toLocaleString()} pts</strong></div>
    <div class="row"><span>Descuentos potenciales (100% canje)</span><strong>$${grossCost?.toFixed(0)} MXN</strong></div>
    <div class="row"><span>Costo real (${redemptionRate}% canje)</span><strong>$${realCost?.toFixed(0)} MXN</strong></div>
    <div class="row"><span>Margen del negocio</span><strong>$${marginRevenue?.toFixed(0)} MXN/mes</strong></div>
    <div class="row"><span>Programa como % del margen</span><strong>${programCostPct?.toFixed(1)}%</strong></div>
    <div class="row"><span>Sostenibilidad</span>
      <span class="badge ${programCostPct < 15 ? 'badge-green' : programCostPct <= 25 ? 'badge-amber' : 'badge-red'}">${sustainLabel}</span>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-header">&#127919; Simulador &mdash; Tu programa configurado</div>
  <div class="section-body">
    <div class="grid2">
      <div class="card"><div class="card-value">${basePtsPerVisit}</div><div class="card-label">Pts base/visita</div></div>
      <div class="card"><div class="card-value">${returnPct}%</div><div class="card-label">Retorno cliente</div></div>
      <div class="card"><div class="card-value">$${realCost?.toFixed(0)}</div><div class="card-label">Costo/mes (MXN)</div></div>
      <div class="card"><div class="card-value">${visitsForDiscount}</div><div class="card-label">Visitas 1er descuento</div></div>
    </div>
  </div>
</div>

<div class="footer">
  Documento generado por PromoClub &middot; Planificador de Costos &middot; ${dateStr}<br/>
  Los valores son estimados basados en los par&aacute;metros configurados. Tasa de canje promedio PromoClub: ${redemptionRate}%.
</div>
</body>
</html>`;

  // Download PDF directly as HTML file (triggers browser print-to-PDF)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `planificador-costos-promoclub-${now?.getFullYear()}${String(now?.getMonth() + 1)?.padStart(2, '0')}${String(now?.getDate())?.padStart(2, '0')}.html`;
  document.body?.appendChild(link);
  link?.click();
  document.body?.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const PlanificadorCostos = ({ onSave }) => {
  const { user } = useAuth();
  const [avgTicket, setAvgTicket] = useState(DEFAULT_AVG_TICKET);
  const [monthlyVisits, setMonthlyVisits] = useState(DEFAULT_MONTHLY_VISITS);
  const [margin, setMargin] = useState(DEFAULT_MARGIN);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active additional rules (in a real app these would come from ConfiguracionTab state)
  const additionalRulesActive = ['bonusStreak', 'bonusBirthday'];

  // Load saved config for authenticated user
  useEffect(() => {
    if (!user?.id) return;
    const loadConfig = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('loyalty_planner_config')
          ?.select('avg_ticket, monthly_visits, margin_pct')
          ?.eq('user_id', user?.id)
          ?.single();
        if (!error && data) {
          setAvgTicket(parseFloat(data?.avg_ticket) || DEFAULT_AVG_TICKET);
          setMonthlyVisits(parseInt(data?.monthly_visits) || DEFAULT_MONTHLY_VISITS);
          setMargin(parseInt(data?.margin_pct) || DEFAULT_MARGIN);
        }
        // If no record found, keep defaults
      } catch (err) {
        // Keep defaults on error
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.id) {
        const { error } = await supabase
          ?.from('loyalty_planner_config')
          ?.upsert({
            user_id: user?.id,
            avg_ticket: avgTicket,
            monthly_visits: monthlyVisits,
            margin_pct: margin,
          }, { onConflict: 'user_id' });
        if (!error) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }
      } else {
        // Not authenticated — just show saved feedback
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
      onSave?.({ avgTicket, monthlyVisits, margin });
    } catch (err) {
      // Silent fail
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = () => {
    generatePDF({ avgTicket, monthlyVisits, margin });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span className="text-sm">Cargando planificación...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlobalRuleBanner />
      <TicketPromedioSection
        avgTicket={avgTicket}
        setAvgTicket={setAvgTicket}
        monthlyVisits={monthlyVisits}
        setMonthlyVisits={setMonthlyVisits}
      />
      <DiscountValueSection avgTicket={avgTicket} />
      <EconomicAnalysis
        avgTicket={avgTicket}
        monthlyVisits={monthlyVisits}
        additionalRulesActive={additionalRulesActive}
        margin={margin}
        setMargin={setMargin}
      />
      <ScenarioSimulator
        avgTicket={avgTicket}
        monthlyVisits={monthlyVisits}
        additionalRulesActive={additionalRulesActive}
      />
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleGeneratePDF}
          className="flex items-center gap-2 px-5 py-2.5 border border-border bg-card text-foreground rounded-xl font-semibold text-sm hover:bg-muted/50 transition-colors"
        >
          <Icon name="FileDown" size={16} className="text-muted-foreground" />
          Generar PDF
        </button>
        <Button
          onClick={handleSave}
          iconName={saved ? 'Check' : saving ? 'Loader2' : 'Save'}
          disabled={saving}
        >
          {saved ? 'Planificación guardada' : saving ? 'Guardando...' : 'Guardar planificación'}
        </Button>
      </div>
    </div>
  );
};

export default PlanificadorCostos;
