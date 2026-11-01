import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const aiClusters = [
  {
    id: 'oficinistas', name: 'Oficinistas entre semana', icon: 'Briefcase', color: 'blue',
    count: 8, behavior: 'Vienen lun-vie, hora comida (12-2 PM)', avgTicket: '$185', frequency: '2.3x/sem',
    suggestion: 'Menú ejecutivo con puntos dobles de lunes a viernes'
  },
  {
    id: 'familias', name: 'Familias de fin de semana', icon: 'Users', color: 'green',
    count: 5, behavior: 'Sábados y domingos, tickets más altos', avgTicket: '$340', frequency: '1.1x/sem',
    suggestion: 'Promo familiar: 4to producto gratis los fines de semana'
  },
  {
    id: 'nocturnos', name: 'Nocturnos', icon: 'Moon', color: 'indigo',
    count: 3, behavior: 'Visitas después de 8 PM', avgTicket: '$210', frequency: '1.8x/sem',
    suggestion: 'Happy hour nocturno con descuento en bebidas calientes'
  },
  {
    id: 'cazadores', name: 'Cazadores de ofertas', icon: 'Tag', color: 'orange',
    count: 6, behavior: 'Solo vienen cuando hay promo activa', avgTicket: '$95', frequency: '0.5x/sem',
    suggestion: 'Cupón de visita sin promo para romper el patrón'
  },
  {
    id: 'leales', name: 'Leales silenciosos', icon: 'Heart', color: 'rose',
    count: 4, behavior: 'Vienen seguido, nunca canjean cupones', avgTicket: '$220', frequency: '3.1x/sem',
    suggestion: 'Reconocimiento personalizado — son tus mejores clientes'
  },
];

const predictiveSegments = [
  {
    id: 'upgrade', name: 'Próximos a subir a Oro', icon: 'TrendingUp', color: 'yellow',
    count: 4, description: 'Están cerca del umbral + tendencia de frecuencia creciente',
    clients: ['Sofía Martínez', 'Fernanda López', 'Valeria Núñez', 'Daniela Fuentes'],
    action: 'Campaña de nurturing para acelerar el upgrade'
  },
  {
    id: 'sleep', name: 'En riesgo de dormirse (2 semanas)', icon: 'AlertTriangle', color: 'orange',
    count: 5, description: 'Frecuencia decreciente pero aún activos — ventana de 14 días',
    clients: ['Miguel Ángel Sánchez', 'Camila Ortiz', 'Héctor Moreno', 'Emilio Castillo', 'Gabriela Reyes'],
    action: 'Activar flow de reactivación preventiva'
  },
];

const lookalikeData = {
  vips: ['María García', 'Isabella Vargas', 'Paola Guerrero'],
  similar: [
    { name: 'Sofía Martínez', visits: 20, similarity: 87 },
    { name: 'Fernanda López', visits: 18, similarity: 82 },
    { name: 'Natalia Romero', visits: 38, similarity: 79 },
    { name: 'Valeria Núñez', visits: 20, similarity: 76 },
  ]
};

const colorMap = {
  blue: { border: 'border-l-blue-500', bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  green: { border: 'border-l-green-500', bg: 'bg-green-50', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-50', icon: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
  orange: { border: 'border-l-orange-500', bg: 'bg-orange-50', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  rose: { border: 'border-l-rose-500', bg: 'bg-rose-50', icon: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
  yellow: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
};

const AISegmentsSection = () => {
  const [subTab, setSubTab] = useState('clusters');
  const [expandedCluster, setExpandedCluster] = useState(null);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" size={18} className="text-purple-600" />
          <h3 className="text-base font-semibold">Segmentación Avanzada por IA</h3>
        </div>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">IA</span>
      </div>
      <div className="flex gap-1 mb-4 border-b border-border">
        {[['clusters', 'Cpu', 'Clusters automáticos'], ['predictive', 'TrendingUp', 'Predictivos'], ['lookalike', 'Copy', 'Lookalike']]?.map(([id, icon, label]) => (
          <button key={id} onClick={() => setSubTab(id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-all ${
              subTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            <Icon name={icon} size={13} />{label}
          </button>
        ))}
      </div>
      {subTab === 'clusters' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Grupos generados automáticamente por patrones de comportamiento. Sin configuración manual.</p>
          {aiClusters?.map(cluster => {
            const colors = colorMap?.[cluster?.color] || colorMap?.blue;
            return (
              <div key={cluster?.id} className={`bg-card rounded-xl border border-border border-l-4 ${colors?.border} p-4`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${colors?.bg} flex items-center justify-center`}>
                      <Icon name={cluster?.icon} size={18} className={colors?.icon} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{cluster?.name}</h4>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors?.badge}`}>{cluster?.count} clientes</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{cluster?.behavior}</p>
                    </div>
                  </div>
                  <button onClick={() => setExpandedCluster(expandedCluster === cluster?.id ? null : cluster?.id)}
                    className="p-1 hover:bg-muted rounded transition-colors">
                    <Icon name={expandedCluster === cluster?.id ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
                  </button>
                </div>
                {expandedCluster === cluster?.id && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <div className="flex gap-4 text-xs">
                      <span className="text-muted-foreground">Ticket prom: <span className="font-semibold text-foreground">{cluster?.avgTicket}</span></span>
                      <span className="text-muted-foreground">Frecuencia: <span className="font-semibold text-foreground">{cluster?.frequency}</span></span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                      <p className="text-xs text-amber-800"><Icon name="Lightbulb" size={12} className="inline mr-1" /><strong>Sugerencia:</strong> {cluster?.suggestion}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">Ver clientes</button>
                      <button className="flex-1 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium">Crear campaña</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {subTab === 'predictive' && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Segmentos basados en tendencias de comportamiento para actuar preventivamente.</p>
          {predictiveSegments?.map(seg => {
            const colors = colorMap?.[seg?.color] || colorMap?.blue;
            return (
              <div key={seg?.id} className={`bg-card rounded-xl border border-border border-l-4 ${colors?.border} p-4`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${colors?.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={seg?.icon} size={18} className={colors?.icon} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold">{seg?.name}</h4>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors?.badge}`}>{seg?.count} clientes</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{seg?.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {seg?.clients?.map(c => (
                        <span key={c} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-xs text-blue-800"><Icon name="Zap" size={11} className="inline mr-1" />{seg?.action}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button className="flex-1 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">Ver clientes</button>
                      <button className="flex-1 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium">Actuar ahora</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {subTab === 'lookalike' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Icon name="Copy" size={16} className="text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-800">Clientes similares a tus VIPs</p>
                <p className="text-xs text-purple-700 mt-1">Basado en: {lookalikeData?.vips?.join(', ')}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{lookalikeData?.similar?.length} clientes se parecen a tus VIPs pero aún no están tan comprometidos. Una campaña de nurturing podría convertirlos.</p>
          <div className="space-y-2">
            {lookalikeData?.similar?.map(client => (
              <div key={client?.name} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
                  {client?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{client?.name}</p>
                  <p className="text-xs text-muted-foreground">{client?.visits} visitas</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-purple-600">{client?.similarity}%</div>
                  <div className="text-xs text-muted-foreground">similitud</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            Crear campaña de nurturing para estos 4 clientes
          </button>
        </div>
      )}
    </div>
  );
};

export default AISegmentsSection;
