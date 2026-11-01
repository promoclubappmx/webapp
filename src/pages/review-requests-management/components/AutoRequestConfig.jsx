import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BRANCHES = [
  { id: 'all', label: 'Todas las sucursales' },
  { id: 'centro', label: 'Sucursal Centro' },
  { id: 'norte', label: 'Sucursal Norte' },
  { id: 'sur', label: 'Sucursal Sur' },
  { id: 'poniente', label: 'Sucursal Poniente' },
];

const TRIGGERS = [
  { id: 'checkin', label: 'Post check-in', delays: ['Inmediato', '30 min', '1 hora'] },
  { id: 'coupon', label: 'Post canje de cupón/promo', delays: ['Inmediato', '30 min', '1 hora'] },
  { id: 'order', label: 'Post Order Ahead completado', delays: ['30 min', '1 hora', '2 horas'] },
  { id: 'reservation', label: 'Post reservación cumplida', delays: ['1 hora', '2 horas', 'Al día siguiente'] },
  { id: 'geofence', label: 'Post visita por geofence', delays: ['30 min', '1 hora', '2 horas'] },
];

const AutoRequestConfig = ({ branch }) => {
  const [masterToggle, setMasterToggle] = useState(true);
  const [triggerConfig, setTriggerConfig] = useState({
    checkin: { enabled: true, delay: 'Inmediato' },
    coupon: { enabled: true, delay: 'Inmediato' },
    order: { enabled: true, delay: '30 min' },
    reservation: { enabled: false, delay: '1 hora' },
    geofence: { enabled: true, delay: '1 hora' },
  });

  const updateTrigger = (id, field, value) => {
    setTriggerConfig(prev => ({ ...prev, [id]: { ...prev?.[id], [field]: value } }));
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Solicitar reseñas automáticamente</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Configura cuándo y cómo se envían solicitudes de reseña a tus clientes</p>
        </div>
        <button
          onClick={() => setMasterToggle(!masterToggle)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${masterToggle ? 'bg-primary' : 'bg-muted'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${masterToggle ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {masterToggle && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4">Trigger</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 px-4">Activo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pl-4">Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TRIGGERS?.map(trigger => (
                  <tr key={trigger?.id} className="py-3">
                    <td className="py-3 pr-4">
                      <span className="text-sm font-medium text-foreground">{trigger?.label}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => updateTrigger(trigger?.id, 'enabled', !triggerConfig?.[trigger?.id]?.enabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${triggerConfig?.[trigger?.id]?.enabled ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${triggerConfig?.[trigger?.id]?.enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="py-3 pl-4">
                      <select
                        value={triggerConfig?.[trigger?.id]?.delay}
                        onChange={e => updateTrigger(trigger?.id, 'delay', e?.target?.value)}
                        disabled={!triggerConfig?.[trigger?.id]?.enabled}
                        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {trigger?.delays?.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">No enviaremos más de 1 solicitud por cliente cada 7 días para este negocio</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">Si el cliente ignora 3 solicitudes seguidas, pausamos el envío por 30 días</p>
            </div>
          </div>
        </>
      )}
      {!masterToggle && (
        <div className="text-center py-6 text-muted-foreground">
          <Icon name="BellOff" size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Las solicitudes automáticas están desactivadas para esta sucursal</p>
        </div>
      )}
    </div>
  );
};

export default AutoRequestConfig;
