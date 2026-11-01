import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import RoleGuard from '../../../components/ui/RoleGuard';

const ShiftScheduler = ({ staff, userRole }) => {
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'

  // Mock shift data
  const [shifts, setShifts] = useState([
    {
      id: 'shift1',
      staffId: 'staff1',
      staffName: 'María González',
      shiftDate: '2024-12-17',
      startTime: '09:00',
      endTime: '17:00',
      status: 'completed',
      actualStartTime: '2024-12-17T09:05:00Z',
      actualEndTime: '2024-12-17T17:10:00Z',
      breakDuration: 60
    },
    {
      id: 'shift2',
      staffId: 'staff2',
      staffName: 'Juan Pérez',
      shiftDate: '2024-12-17',
      startTime: '10:00',
      endTime: '18:00',
      status: 'in_progress',
      actualStartTime: '2024-12-17T10:00:00Z',
      actualEndTime: null,
      breakDuration: 60
    },
    {
      id: 'shift3',
      staffId: 'staff3',
      staffName: 'Ana Martínez',
      shiftDate: '2024-12-17',
      startTime: '14:00',
      endTime: '22:00',
      status: 'scheduled',
      actualStartTime: null,
      actualEndTime: null,
      breakDuration: 60
    },
    {
      id: 'shift4',
      staffId: 'staff1',
      staffName: 'María González',
      shiftDate: '2024-12-18',
      startTime: '09:00',
      endTime: '17:00',
      status: 'scheduled',
      actualStartTime: null,
      actualEndTime: null,
      breakDuration: 60
    }
  ]);

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { label: 'Programado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
      in_progress: { label: 'En Progreso', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
      completed: { label: 'Completado', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' }
    };
    return badges?.[status] || badges?.scheduled;
  };

  const formatTime = (time) => {
    return time?.substring(0, 5);
  };

  const handleAddShift = () => {
    // In real app, open modal to add shift
    alert('Agregar nuevo turno');
  };

  const handleEditShift = (shift) => {
    // In real app, open modal to edit shift
    alert(`Editar turno de ${shift?.staffName}`);
  };

  const handleDeleteShift = (shiftId) => {
    if (confirm('¿Está seguro de eliminar este turno?')) {
      setShifts(shifts?.filter(s => s?.id !== shiftId));
    }
  };

  const filteredShifts = shifts?.filter(shift => shift?.shiftDate === selectedDate);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e?.target?.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'day' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Mes
            </button>
          </div>
        </div>
        <RoleGuard allowedRoles={['owner', 'admin']} userRole={userRole} module="shifts" showFallback={false}>
          <Button onClick={handleAddShift} iconName="Plus">
            Agregar Turno
          </Button>
        </RoleGuard>
      </div>
      {/* Shifts List */}
      <div className="space-y-3">
        {filteredShifts?.length > 0 ? (
          filteredShifts?.map((shift) => {
            const badge = getStatusBadge(shift?.status);
            return (
              <div key={shift?.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Clock" size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-foreground">{shift?.staffName}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          badge?.color
                        }`}>
                          {badge?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          <span>{formatTime(shift?.startTime)} - {formatTime(shift?.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Coffee" size={14} />
                          <span>{shift?.breakDuration} min descanso</span>
                        </div>
                        {shift?.actualStartTime && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Icon name="CheckCircle" size={14} />
                            <span>Inició: {new Date(shift?.actualStartTime)?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <RoleGuard allowedRoles={['owner', 'admin']} userRole={userRole} module="shifts" showFallback={false}>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditShift(shift)}
                        iconName="Edit"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteShift(shift?.id)}
                        iconName="Trash2"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      />
                    </div>
                  </RoleGuard>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay turnos programados para esta fecha</p>
            <RoleGuard allowedRoles={['owner', 'admin']} userRole={userRole} module="shifts" showFallback={false}>
              <Button onClick={handleAddShift} variant="outline" className="mt-4" iconName="Plus">
                Agregar Primer Turno
              </Button>
            </RoleGuard>
          </div>
        )}
      </div>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="Calendar" size={20} className="text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Turnos Programados</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {shifts?.filter(s => s?.status === 'scheduled')?.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="CheckCircle" size={20} className="text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Completados Hoy</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {shifts?.filter(s => s?.status === 'completed' && s?.shiftDate === selectedDate)?.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="Clock" size={20} className="text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-sm text-orange-700 dark:text-orange-300">En Progreso</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {shifts?.filter(s => s?.status === 'in_progress')?.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftScheduler;