import React from 'react';
import Icon from '../../../components/AppIcon';

const MOCK_CONVERSIONES = [
  { id: 1, nombre: 'María García', fecha: '2026-02-28', paso: 'Push Día 1', valor: 320, tipo: 'recuperado', avatar: 'MG' },
  { id: 2, nombre: 'Carlos López', fecha: '2026-02-27', paso: 'Cupón Día 3', valor: 180, tipo: 'nuevo', avatar: 'CL' },
  { id: 3, nombre: 'Ana Martínez', fecha: '2026-02-26', paso: 'Push Día 1', valor: 450, tipo: 'recuperado', avatar: 'AM' },
  { id: 4, nombre: 'Roberto Sánchez', fecha: '2026-02-25', paso: 'Email Día 7', valor: 290, tipo: 'nuevo', avatar: 'RS' },
  { id: 5, nombre: 'Laura Torres', fecha: '2026-02-24', paso: 'Cupón Día 3', valor: 520, tipo: 'recuperado', avatar: 'LT' },
  { id: 6, nombre: 'Miguel Flores', fecha: '2026-02-23', paso: 'Push Día 1', valor: 175, tipo: 'nuevo', avatar: 'MF' },
];

const ConversionTable = ({ campaign, conversiones }) => {
  const data = conversiones?.length > 0 ? conversiones : MOCK_CONVERSIONES;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon name="Users" size={18} className="text-primary" />
          Usuarios convertidos
        </h3>
        <span className="text-sm text-muted-foreground">{data?.length} conversiones</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground pb-2">Cliente</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-2">Fecha</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-2">Paso</th>
              <th className="text-right text-xs font-medium text-muted-foreground pb-2">Valor</th>
              <th className="text-center text-xs font-medium text-muted-foreground pb-2">Tipo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.map(conv => (
              <tr key={conv?.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {conv?.avatar}
                    </div>
                    <span className="text-sm font-medium text-foreground">{conv?.nombre}</span>
                  </div>
                </td>
                <td className="py-2.5">
                  <span className="text-sm text-muted-foreground">
                    {new Date(conv.fecha)?.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </span>
                </td>
                <td className="py-2.5">
                  <span className="text-sm text-foreground">{conv?.paso}</span>
                </td>
                <td className="py-2.5 text-right">
                  <span className="text-sm font-semibold text-foreground">${conv?.valor}</span>
                </td>
                <td className="py-2.5 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    conv?.tipo === 'nuevo' ?'bg-blue-100 text-blue-700' :'bg-amber-100 text-amber-700'
                  }`}>
                    {conv?.tipo === 'nuevo' ? 'Nuevo' : 'Recuperado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConversionTable;
