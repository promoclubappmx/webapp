import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const GeofenceHeader = ({ geofenceActive, onToggle }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Mi Geofence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define la zona alrededor de tu negocio donde se activan notificaciones automáticas.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
            <Icon name="Info" size={12} />
            Solo aplica para clientes con permisos de ubicación en background
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            {geofenceActive ? 'Activo' : 'Inactivo'}
          </span>
          <button
            onClick={onToggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              geofenceActive ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                geofenceActive ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {!geofenceActive && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
          <Icon name="AlertTriangle" size={16} className="text-yellow-600 flex-shrink-0" />
          El geofencing está desactivado. No se enviarán notificaciones de proximidad.
        </div>
      )}

      {geofenceActive && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Activo · 87 clientes en radio hoy
        </div>
      )}
    </div>
  );
};

export default GeofenceHeader;
