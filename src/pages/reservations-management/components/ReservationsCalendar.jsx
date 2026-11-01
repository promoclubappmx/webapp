import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';

const locales = {
  'es': es
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const ReservationsCalendar = ({ businessId, refreshTrigger }) => {
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    loadReservations();
    loadServices();
    loadCustomers();
  }, [businessId, refreshTrigger]);

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase?.from('reservations')?.select(`
          *,
          customer:customer_profiles(full_name, phone, email),
          service:reservation_services(service_name, duration_minutes)
        `)?.eq('business_id', businessId)?.order('reservation_date', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error loading reservations:', error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const { data, error } = await supabase?.from('reservation_services')?.select('*')?.eq('business_id', businessId)?.eq('is_active', true);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error?.message);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase?.from('customer_profiles')?.select('id, full_name, phone, email')?.eq('business_id', businessId)?.eq('is_active', true);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error?.message);
    }
  };

  const handleConfirmReservation = async (reservationId) => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      const { error } = await supabase?.from('reservations')?.update({
          status: 'confirmed',
          confirmed_at: new Date()?.toISOString(),
          confirmed_by: user?.id
        })?.eq('id', reservationId);

      if (error) throw error;
      await loadReservations();
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error confirming reservation:', error?.message);
      alert('Error al confirmar reserva: ' + error?.message);
    }
  };

  const handleCancelReservation = async (reservationId, reason) => {
    try {
      const { error } = await supabase?.from('reservations')?.update({
          status: 'cancelled',
          cancelled_at: new Date()?.toISOString(),
          cancellation_reason: reason
        })?.eq('id', reservationId);

      if (error) throw error;
      await loadReservations();
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error cancelling reservation:', error?.message);
      alert('Error al cancelar reserva: ' + error?.message);
    }
  };

  const handleCheckIn = async (reservationId) => {
    try {
      const { error } = await supabase?.from('reservations')?.update({
          checked_in_at: new Date()?.toISOString()
        })?.eq('id', reservationId);

      if (error) throw error;
      await loadReservations();
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error checking in:', error?.message);
      alert('Error al registrar asistencia: ' + error?.message);
    }
  };

  const handleMarkNoShow = async (reservationId) => {
    try {
      const { error } = await supabase?.from('reservations')?.update({
          status: 'no_show',
          no_show_at: new Date()?.toISOString()
        })?.eq('id', reservationId);

      if (error) throw error;
      await loadReservations();
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error marking no-show:', error?.message);
      alert('Error al marcar no-show: ' + error?.message);
    }
  };

  const handleCompleteReservation = async (reservationId) => {
    try {
      const { error } = await supabase?.from('reservations')?.update({
          status: 'completed',
          completed_at: new Date()?.toISOString()
        })?.eq('id', reservationId);

      if (error) throw error;
      await loadReservations();
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error completing reservation:', error?.message);
      alert('Error al completar reserva: ' + error?.message);
    }
  };

  // Convert reservations to calendar events
  const events = reservations?.map(reservation => {
    const startDate = new Date(`${reservation?.reservation_date}T${reservation?.reservation_time}`);
    const endDate = new Date(startDate.getTime() + (reservation?.duration_minutes * 60000));

    return {
      id: reservation?.id,
      title: `${reservation?.customer?.full_name} - ${reservation?.service?.service_name}`,
      start: startDate,
      end: endDate,
      resource: reservation
    };
  });

  const eventStyleGetter = (event) => {
    const reservation = event?.resource;
    let backgroundColor = '#4ECDC4';

    switch (reservation?.status) {
      case 'pending':
        backgroundColor = '#FFA500';
        break;
      case 'confirmed':
        backgroundColor = '#45B7D1';
        break;
      case 'completed':
        backgroundColor = '#2ECC71';
        break;
      case 'cancelled':
        backgroundColor = '#95A5A6';
        break;
      case 'no_show':
        backgroundColor = '#E74C3C';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setShowReservationForm(true)}
          iconName="Plus"
        >
          Nueva Reserva
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowBlockForm(true)}
          iconName="Ban"
        >
          Bloquear Horario
        </Button>
        <Button
          variant="outline"
          onClick={loadReservations}
          iconName="RefreshCw"
        >
          Actualizar
        </Button>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFA500' }}></div>
          <span className="text-muted-foreground">Pendiente</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#45B7D1' }}></div>
          <span className="text-muted-foreground">Confirmada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2ECC71' }}></div>
          <span className="text-muted-foreground">Completada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E74C3C' }}></div>
          <span className="text-muted-foreground">No-Show</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#95A5A6' }}></div>
          <span className="text-muted-foreground">Cancelada</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card border border-border rounded-lg p-4" style={{ height: '600px' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Cargando reservas...</div>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={(event) => setSelectedReservation(event?.resource)}
            eventPropGetter={eventStyleGetter}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            messages={{
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'No hay reservas en este rango',
              showMore: (total) => `+ Ver más (${total})`
            }}
          />
        )}
      </div>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <ReservationDetailsModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onConfirm={handleConfirmReservation}
          onCancel={handleCancelReservation}
          onCheckIn={handleCheckIn}
          onNoShow={handleMarkNoShow}
          onComplete={handleCompleteReservation}
        />
      )}

      {/* Reservation Form Modal */}
      {showReservationForm && (
        <ReservationFormModal
          businessId={businessId}
          services={services}
          customers={customers}
          onClose={() => setShowReservationForm(false)}
          onSuccess={() => {
            setShowReservationForm(false);
            loadReservations();
          }}
        />
      )}

      {/* Block Form Modal */}
      {showBlockForm && (
        <BlockFormModal
          businessId={businessId}
          onClose={() => setShowBlockForm(false)}
          onSuccess={() => {
            setShowBlockForm(false);
            loadReservations();
          }}
        />
      )}
    </div>
  );
};

// Reservation Details Modal
const ReservationDetailsModal = ({ reservation, onClose, onConfirm, onCancel, onCheckIn, onNoShow, onComplete }) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  const handleCancel = () => {
    if (!cancellationReason?.trim()) {
      alert('Por favor ingrese un motivo de cancelación');
      return;
    }
    onCancel(reservation?.id, cancellationReason);
  };

  const statusColors = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-info/10 text-info',
    completed: 'bg-success/10 text-success',
    cancelled: 'bg-muted text-muted-foreground',
    no_show: 'bg-destructive/10 text-destructive'
  };

  const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No-Show'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Detalles de Reserva</h3>
            <Button variant="ghost" size="icon" onClick={onClose} iconName="X" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-muted-foreground">Estado:</span>
            <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors?.[reservation?.status]}`}>
              {statusLabels?.[reservation?.status]}
            </span>
          </div>

          {/* Reservation Info */}
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Número de Reserva:</span>
              <p className="text-foreground">{reservation?.reservation_number}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Cliente:</span>
              <p className="text-foreground">{reservation?.customer?.full_name}</p>
              <p className="text-sm text-muted-foreground">{reservation?.customer?.phone} - {reservation?.customer?.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Servicio:</span>
              <p className="text-foreground">{reservation?.service?.service_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Fecha:</span>
                <p className="text-foreground">{new Date(reservation?.reservation_date)?.toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Hora:</span>
                <p className="text-foreground">{reservation?.reservation_time}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Duración:</span>
                <p className="text-foreground">{reservation?.duration_minutes} minutos</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Personas:</span>
                <p className="text-foreground">{reservation?.party_size}</p>
              </div>
            </div>
            {reservation?.special_requests && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Solicitudes Especiales:</span>
                <p className="text-foreground">{reservation?.special_requests}</p>
              </div>
            )}
            {reservation?.points_earned > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Puntos Ganados:</span>
                <p className="text-success">+{reservation?.points_earned} puntos</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {!showCancelForm && (
            <div className="flex flex-wrap gap-2 pt-4">
              {reservation?.status === 'pending' && (
                <>
                  <Button
                    onClick={() => onConfirm(reservation?.id)}
                    iconName="Check"
                    className="flex-1"
                  >
                    Confirmar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelForm(true)}
                    iconName="X"
                  >
                    Cancelar
                  </Button>
                </>
              )}
              {reservation?.status === 'confirmed' && (
                <>
                  <Button
                    onClick={() => onCheckIn(reservation?.id)}
                    iconName="UserCheck"
                    className="flex-1"
                  >
                    Marcar Asistencia
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onNoShow(reservation?.id)}
                    iconName="UserX"
                  >
                    No-Show
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelForm(true)}
                    iconName="X"
                  >
                    Cancelar
                  </Button>
                </>
              )}
              {reservation?.checked_in_at && reservation?.status !== 'completed' && (
                <Button
                  onClick={() => onComplete(reservation?.id)}
                  iconName="CheckCircle"
                  className="flex-1"
                >
                  Completar Servicio
                </Button>
              )}
            </div>
          )}

          {/* Cancel Form */}
          {showCancelForm && (
            <div className="space-y-3 pt-4 border-t border-border">
              <Input
                label="Motivo de Cancelación"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e?.target?.value)}
                placeholder="Ingrese el motivo..."
              />
              <div className="flex space-x-2">
                <Button onClick={handleCancel} iconName="Check" className="flex-1">
                  Confirmar Cancelación
                </Button>
                <Button variant="outline" onClick={() => setShowCancelForm(false)}>
                  Volver
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reservation Form Modal
const ReservationFormModal = ({ businessId, services, customers, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 1,
    special_requests: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      const selectedService = services?.find(s => s?.id === formData?.service_id);

      const payload = {
        ...formData,
        business_id: businessId,
        duration_minutes: selectedService?.duration_minutes || 60,
        status: 'pending',
        created_by: user?.id
      };

      const { error } = await supabase?.from('reservations')?.insert([payload]);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error creating reservation:', error?.message);
      alert('Error al crear reserva: ' + error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Nueva Reserva</h3>
            <Button variant="ghost" size="icon" onClick={onClose} iconName="X" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Select
            label="Cliente"
            options={customers?.map(c => ({ value: c?.id, label: `${c?.full_name} - ${c?.phone}` }))}
            value={formData?.customer_id}
            onChange={(value) => setFormData({ ...formData, customer_id: value })}
            required
          />

          <Select
            label="Servicio"
            options={services?.map(s => ({ value: s?.id, label: `${s?.service_name} (${s?.duration_minutes} min)` }))}
            value={formData?.service_id}
            onChange={(value) => setFormData({ ...formData, service_id: value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha"
              type="date"
              value={formData?.reservation_date}
              onChange={(e) => setFormData({ ...formData, reservation_date: e?.target?.value })}
              required
            />
            <Input
              label="Hora"
              type="time"
              value={formData?.reservation_time}
              onChange={(e) => setFormData({ ...formData, reservation_time: e?.target?.value })}
              required
            />
          </div>

          <Input
            label="Número de Personas"
            type="number"
            value={formData?.party_size}
            onChange={(e) => setFormData({ ...formData, party_size: parseInt(e?.target?.value) })}
            min="1"
            required
          />

          <Input
            label="Solicitudes Especiales (opcional)"
            value={formData?.special_requests}
            onChange={(e) => setFormData({ ...formData, special_requests: e?.target?.value })}
            placeholder="Ej: Preferencia de ubicación, alergias, etc."
          />

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isLoading} iconName="Save" className="flex-1">
              {isLoading ? 'Creando...' : 'Crear Reserva'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Block Form Modal
const BlockFormModal = ({ businessId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    block_date: '',
    start_time: '',
    end_time: '',
    reason: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase?.auth?.getUser();

      const payload = {
        ...formData,
        business_id: businessId,
        created_by: user?.id
      };

      const { error } = await supabase?.from('reservation_blocks')?.insert([payload]);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error creating block:', error?.message);
      alert('Error al bloquear horario: ' + error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Bloquear Horario</h3>
            <Button variant="ghost" size="icon" onClick={onClose} iconName="X" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Fecha"
            type="date"
            value={formData?.block_date}
            onChange={(e) => setFormData({ ...formData, block_date: e?.target?.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora Inicio"
              type="time"
              value={formData?.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e?.target?.value })}
              required
            />
            <Input
              label="Hora Fin"
              type="time"
              value={formData?.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e?.target?.value })}
              required
            />
          </div>

          <Input
            label="Motivo"
            value={formData?.reason}
            onChange={(e) => setFormData({ ...formData, reason: e?.target?.value })}
            placeholder="Ej: Mantenimiento, evento privado, etc."
            required
          />

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isLoading} iconName="Save" className="flex-1">
              {isLoading ? 'Bloqueando...' : 'Bloquear'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationsCalendar;