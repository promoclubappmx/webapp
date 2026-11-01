import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const mockBeacons = [
  {
    id: 1,
    name: 'Beacon Entrada',
    status: 'active',
    checkins: 156,
    dwellTime: '8.4 min',
    battery: 87,
    lastSeen: 'Hace 2 min',
    sensitivity: 'media',
    minPresence: 2,
    hourlyData: [2, 5, 8, 12, 15, 18, 22, 19, 14, 10, 8, 6],
  },
  {
    id: 2,
    name: 'Beacon Terraza',
    status: 'low_battery',
    checkins: 43,
    dwellTime: '12.1 min',
    battery: 12,
    lastSeen: 'Hace 1 hora',
    sensitivity: 'alta',
    minPresence: 5,
    hourlyData: [1, 2, 3, 5, 8, 10, 12, 9, 7, 5, 3, 2],
  },
];

const MiniBarChart = ({ data }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data?.map((v, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/40 rounded-sm"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

const BeaconMethodConfig = ({ onBack }) => {
  const [beacons, setBeacons] = useState(mockBeacons);
  const [showModal, setShowModal] = useState(false);
  const [selectedBeacon, setSelectedBeacon] = useState(null);

  const statusConfig = {
    active: { label: 'Activo', color: 'bg-green-500', pulse: true },
    low_battery: { label: 'Batería baja', color: 'bg-red-500', pulse: false },
    offline: { label: 'Sin señal', color: 'bg-gray-400', pulse: false },
  };

  const alertBeacons = beacons?.filter(b => b?.status !== 'active');

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          Volver a Métodos
        </button>
      )}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">BLE Beacon</h2>
          <p className="text-sm text-muted-foreground">Registro automático sin acción del usuario mediante dispositivos Bluetooth.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Registrar beacon
        </button>
      </div>
      {/* Alert Banner */}
      {alertBeacons?.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Icon name="AlertTriangle" size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Tu beacon <strong>'{alertBeacons?.[0]?.name}'</strong> tiene batería baja ({alertBeacons?.[0]?.battery}%). Reemplaza la batería pronto.
          </p>
        </div>
      )}
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Beacons activos', value: beacons?.filter(b => b?.status === 'active')?.length, icon: 'Radio', color: 'text-green-600 bg-green-50' },
          { label: 'Alertas', value: alertBeacons?.length, icon: 'AlertTriangle', color: 'text-amber-600 bg-amber-50' },
          { label: 'Check-ins esta semana', value: beacons?.reduce((a, b) => a + b?.checkins, 0), icon: 'CheckCircle', color: 'text-blue-600 bg-blue-50' },
        ]?.map(item => (
          <div key={item?.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item?.color}`}>
              <Icon name={item?.icon} size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{item?.value}</p>
              <p className="text-xs text-muted-foreground">{item?.label}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Beacon Cards */}
      {beacons?.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-xl p-12 text-center">
          <Icon name="Radio" size={48} className="text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Sin beacons registrados</h3>
          <p className="text-sm text-muted-foreground mb-2">Los beacons BLE registran visitas automáticamente sin que el cliente haga nada.</p>
          <p className="text-sm font-semibold text-foreground mb-6">$299/mes incluye beacon + servicio de gestión</p>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Comprar beacons en la tienda PromoSpot</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beacons?.map(beacon => {
            const sc = statusConfig?.[beacon?.status];
            return (
              <div
                key={beacon?.id}
                onClick={() => setSelectedBeacon(beacon)}
                className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${sc?.color} ${sc?.pulse ? 'animate-pulse' : ''}`} />
                    <h3 className="font-semibold text-foreground">{beacon?.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    beacon?.status === 'active' ? 'bg-green-100 text-green-700' :
                    beacon?.status === 'low_battery' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{sc?.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <p className="text-lg font-bold text-foreground">{beacon?.checkins}</p>
                    <p className="text-xs text-muted-foreground">check-ins/mes</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{beacon?.dwellTime}</p>
                    <p className="text-xs text-muted-foreground">dwell time</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${beacon?.battery < 20 ? 'text-red-600' : 'text-foreground'}`}>{beacon?.battery}%</p>
                    <p className="text-xs text-muted-foreground">batería</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check-ins por hora</p>
                  <MiniBarChart data={beacon?.hourlyData} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Última señal: {beacon?.lastSeen}</p>
              </div>
            );
          })}
        </div>
      )}
      {/* Beacon Detail Modal */}
      {selectedBeacon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">{selectedBeacon?.name}</h3>
              <button onClick={() => setSelectedBeacon(null)} className="p-1.5 hover:bg-muted rounded-lg">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Sensibilidad</p>
                  <p className="font-semibold capitalize">{selectedBeacon?.sensitivity}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Tiempo mínimo</p>
                  <p className="font-semibold">{selectedBeacon?.minPresence} min</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Señales últimas 12 horas</p>
                <div className="bg-muted/30 rounded-xl p-3">
                  <MiniBarChart data={selectedBeacon?.hourlyData} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>12h</span><span>6h</span><span>Ahora</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Últimos check-ins</p>
                <div className="space-y-2">
                  {['María García — hace 15 min', 'Carlos Mendoza — hace 32 min', 'Ana Herrera — hace 1 hora']?.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="CheckCircle" size={14} className="text-green-500" />
                      {entry}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Registrar nuevo beacon</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-muted rounded-lg">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="Radio" size={32} className="text-pink-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Asegúrate de que el beacon está encendido y a menos de 5 metros de este dispositivo.</p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Escaneando dispositivos Bluetooth...
              </div>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeaconMethodConfig;
