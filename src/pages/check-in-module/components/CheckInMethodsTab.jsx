import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import QRMethodConfig from './QRMethodConfig';
import GeofenceMethodConfig from './GeofenceMethodConfig';
import NFCMethodConfig from './NFCMethodConfig';
import BeaconMethodConfig from './BeaconMethodConfig';

const METHODS = [
  {
    id: 'qr',
    name: 'QR en Mostrador',
    icon: 'QrCode',
    description: 'El cliente escanea un código QR con la app PromoSpot para registrar su visita.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    checkins: 1240,
    enabled: true,
    hasHardware: true,
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
  },
  {
    id: 'geofence',
    name: 'Geofence Automático',
    icon: 'MapPin',
    description: 'Detecta automáticamente cuando el cliente entra al radio del negocio.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    checkins: 387,
    enabled: true,
    hasHardware: true,
    confidence: 'Media',
    confidenceColor: 'bg-yellow-100 text-yellow-700',
  },
  {
    id: 'manual',
    name: 'Código Manual',
    icon: 'Keyboard',
    description: 'El cajero ingresa el código del cliente para registrar la visita manualmente.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    checkins: 156,
    enabled: true,
    hasHardware: true,
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
  },
  {
    id: 'nfc',
    name: 'NFC / Tap',
    icon: 'Wifi',
    description: 'El cliente acerca su teléfono al tag NFC para registrar su visita instantáneamente.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    checkins: 89,
    enabled: false,
    hasHardware: false,
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
  },
  {
    id: 'beacon',
    name: 'BLE Beacon',
    icon: 'Radio',
    description: 'Registro automático sin acción del usuario mediante dispositivo beacon Bluetooth.',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    checkins: 0,
    enabled: false,
    hasHardware: false,
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
  },
];

const ManualMethodConfig = ({ onBack }) => {
  const [requireReason, setRequireReason] = useState(false);
  const [allowedRoles, setAllowedRoles] = useState(['owner', 'admin', 'cajero']);

  const roles = [
    { id: 'owner', label: 'Owner' },
    { id: 'admin', label: 'Admin' },
    { id: 'cajero', label: 'Cajero' },
    { id: 'viewer', label: 'Viewer' },
  ];

  const reasons = [
    'QR no disponible',
    'Teléfono del cliente sin cámara',
    'Cliente dictó su código',
    'Registro retroactivo',
    'Otro (especificar)',
  ];

  const toggleRole = (roleId) => {
    setAllowedRoles(prev =>
      prev?.includes(roleId) ? prev?.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <Icon name="ArrowLeft" size={16} />
        Volver a Métodos
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config */}
        <div className="space-y-5">
          {/* Roles */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-1">Roles con permiso de check-in manual</h3>
            <p className="text-xs text-muted-foreground mb-4">Define qué miembros del staff pueden registrar check-ins manualmente.</p>
            <div className="space-y-2">
              {roles?.map(role => (
                <label key={role?.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowedRoles?.includes(role?.id)}
                    onChange={() => toggleRole(role?.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-foreground">{role?.label}</span>
                  {role?.id === 'viewer' && (
                    <span className="text-xs text-muted-foreground">(no recomendado)</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Require Reason */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">Requiere motivo</h3>
                <p className="text-xs text-muted-foreground mt-0.5">El staff debe seleccionar un motivo al registrar un check-in manual.</p>
              </div>
              <button
                onClick={() => setRequireReason(!requireReason)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  requireReason ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  requireReason ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            {requireReason && (
              <div className="space-y-1.5">
                {reasons?.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Check" size={13} className="text-primary" />
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            Guardar configuración
          </button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Vista del cajero</h3>
            <p className="text-xs text-muted-foreground mb-4">Así se ve la pantalla de validación para el staff en el punto de venta.</p>
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Icon name="ScanLine" size={20} className="text-primary" />
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-2 bg-muted/60 rounded w-1/2" />
                </div>
                <div className="px-3 py-1.5 bg-primary rounded-lg">
                  <div className="h-3 w-12 bg-white/60 rounded" />
                </div>
              </div>
              <div className="bg-green-500 rounded-lg p-3 text-center">
                <Icon name="CheckCircle" size={24} className="text-white mx-auto mb-1" />
                <p className="text-white text-xs font-semibold">¡Check-in registrado!</p>
                <p className="text-white/80 text-xs">María García · +5 puntos</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Pantalla operativa</p>
                <p className="text-xs text-amber-700 mt-0.5">La pantalla de validación en vivo está disponible en el tab <strong>Validar</strong>. Está optimizada para uso rápido en el punto de venta.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckInMethodsTab = () => {
  const [methods, setMethods] = useState(METHODS);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const toggleMethod = (id, e) => {
    e?.stopPropagation();
    setMethods(prev => prev?.map(m => m?.id === id ? { ...m, enabled: !m?.enabled } : m));
  };

  if (selectedMethod) {
    const method = methods?.find(m => m?.id === selectedMethod);
    return (
      <div>
        {selectedMethod === 'qr' && <QRMethodConfig method={method} onBack={() => setSelectedMethod(null)} />}
        {selectedMethod === 'geofence' && <GeofenceMethodConfig method={method} onBack={() => setSelectedMethod(null)} />}
        {selectedMethod === 'manual' && <ManualMethodConfig onBack={() => setSelectedMethod(null)} />}
        {selectedMethod === 'nfc' && <NFCMethodConfig method={method} onBack={() => setSelectedMethod(null)} />}
        {selectedMethod === 'beacon' && <BeaconMethodConfig method={method} onBack={() => setSelectedMethod(null)} />}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {methods?.map(method => (
        <div
          key={method?.id}
          onClick={() => setSelectedMethod(method?.id)}
          className={`bg-card rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
            method?.hasHardware ? 'border-border' : 'border-dashed border-border/60'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl ${method?.bg} flex items-center justify-center`}>
              <Icon name={method?.icon} size={22} className={method?.color} />
            </div>
            <div className="flex items-center gap-2">
              {method?.enabled ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Activo</span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inactivo</span>
              )}
              <button
                onClick={(e) => toggleMethod(method?.id, e)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  method?.enabled ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  method?.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
          <h3 className="font-semibold text-foreground mb-1">{method?.name}</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{method?.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-foreground">{method?.checkins?.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-1">check-ins/mes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${method?.confidenceColor}`}>
                Confianza {method?.confidence}
              </span>
              {!method?.hasHardware && (
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Requiere hardware</span>
              )}
            </div>
          </div>
          {!method?.hasHardware && (
            <button
              onClick={(e) => { e?.stopPropagation(); setSelectedMethod(method?.id); }}
              className="mt-3 w-full py-2 text-xs font-medium border border-dashed border-primary/40 text-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              Configurar / Comprar hardware
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CheckInMethodsTab;
