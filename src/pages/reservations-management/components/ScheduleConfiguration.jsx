import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { supabase } from '../../../lib/supabase';

const ScheduleConfiguration = ({ businessId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('hours'); // hours, services, policies
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const daysOfWeek = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  useEffect(() => {
    loadSchedules();
    loadServices();
    loadPolicies();
    loadCatalogItems();
  }, [businessId]);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase?.from('reservation_schedules')?.select('*')?.eq('business_id', businessId)?.order('day_of_week');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error?.message);
    }
  };

  const loadServices = async () => {
    try {
      const { data, error } = await supabase?.from('reservation_services')?.select('*, catalog_items(name)')?.eq('business_id', businessId)?.order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error?.message);
    }
  };

  const loadPolicies = async () => {
    try {
      const { data, error } = await supabase?.from('cancellation_policies')?.select('*')?.eq('business_id', businessId)?.order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error loading policies:', error?.message);
    }
  };

  const loadCatalogItems = async () => {
    try {
      const { data, error } = await supabase?.from('catalog_items')?.select('id, name, business_type')?.eq('status', 'active')?.order('name');

      if (error) throw error;
      setCatalogItems(data || []);
    } catch (error) {
      console.error('Error loading catalog items:', error?.message);
    }
  };

  const handleSaveSchedule = async (scheduleData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      const payload = {
        ...scheduleData,
        business_id: businessId,
        created_by: user?.id
      };

      if (scheduleData?.id) {
        const { error } = await supabase?.from('reservation_schedules')?.update(payload)?.eq('id', scheduleData?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase?.from('reservation_schedules')?.insert([payload]);
        if (error) throw error;
      }

      await loadSchedules();
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error saving schedule:', error?.message);
      alert('Error al guardar horario: ' + error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveService = async (serviceData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      const payload = {
        ...serviceData,
        business_id: businessId,
        created_by: user?.id
      };

      if (serviceData?.id) {
        const { error } = await supabase?.from('reservation_services')?.update(payload)?.eq('id', serviceData?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase?.from('reservation_services')?.insert([payload]);
        if (error) throw error;
      }

      await loadServices();
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error?.message);
      alert('Error al guardar servicio: ' + error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePolicy = async (policyData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...policyData,
        business_id: businessId
      };

      if (policyData?.id) {
        const { error } = await supabase?.from('cancellation_policies')?.update(payload)?.eq('id', policyData?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase?.from('cancellation_policies')?.insert([payload]);
        if (error) throw error;
      }

      await loadPolicies();
      setEditingPolicy(null);
    } catch (error) {
      console.error('Error saving policy:', error?.message);
      alert('Error al guardar política: ' + error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm('¿Está seguro de eliminar este horario?')) return;
    
    try {
      const { error } = await supabase?.from('reservation_schedules')?.delete()?.eq('id', id);
      if (error) throw error;
      await loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error?.message);
      alert('Error al eliminar horario: ' + error?.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm('¿Está seguro de eliminar este servicio?')) return;
    
    try {
      const { error } = await supabase?.from('reservation_services')?.delete()?.eq('id', id);
      if (error) throw error;
      await loadServices();
    } catch (error) {
      console.error('Error deleting service:', error?.message);
      alert('Error al eliminar servicio: ' + error?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex space-x-2 border-b border-border">
        <button
          onClick={() => setActiveSection('hours')}
          className={`px-4 py-2 font-medium text-sm ${
            activeSection === 'hours' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Horarios por Sucursal
        </button>
        <button
          onClick={() => setActiveSection('services')}
          className={`px-4 py-2 font-medium text-sm ${
            activeSection === 'services' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Servicios Reservables
        </button>
        <button
          onClick={() => setActiveSection('policies')}
          className={`px-4 py-2 font-medium text-sm ${
            activeSection === 'policies' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Políticas de Cancelación
        </button>
      </div>

      {/* Hours Section */}
      {activeSection === 'hours' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Horarios de Atención</h3>
            <Button
              onClick={() => setEditingSchedule({ day_of_week: 'monday', is_available: true, start_time: '09:00', end_time: '18:00', slot_duration_minutes: 30 })}
              iconName="Plus"
            >
              Agregar Horario
            </Button>
          </div>

          <div className="grid gap-4">
            {schedules?.map((schedule) => (
              <div key={schedule?.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-foreground capitalize">
                        {daysOfWeek?.find(d => d?.value === schedule?.day_of_week)?.label}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        schedule?.is_available
                          ? 'bg-success/10 text-success' :'bg-muted text-muted-foreground'
                      }`}>
                        {schedule?.is_available ? 'Disponible' : 'Cerrado'}
                      </span>
                    </div>
                    {schedule?.is_available && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span>{schedule?.start_time} - {schedule?.end_time}</span>
                        <span className="mx-2">•</span>
                        <span>Slots de {schedule?.slot_duration_minutes} min</span>
                        {schedule?.break_start_time && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Descanso: {schedule?.break_start_time} - {schedule?.break_end_time}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSchedule(schedule)}
                      iconName="Edit"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSchedule(schedule?.id)}
                      iconName="Trash2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Section */}
      {activeSection === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Servicios Reservables</h3>
            <Button
              onClick={() => setEditingService({ service_name: '', duration_minutes: 60, max_capacity: 1, is_active: true })}
              iconName="Plus"
            >
              Agregar Servicio
            </Button>
          </div>

          <div className="grid gap-4">
            {services?.map((service) => (
              <div key={service?.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-foreground">{service?.service_name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        service?.is_active
                          ? 'bg-success/10 text-success' :'bg-muted text-muted-foreground'
                      }`}>
                        {service?.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      <div>Duración: {service?.duration_minutes} minutos</div>
                      <div>Capacidad máxima: {service?.max_capacity} persona(s)</div>
                      {service?.advance_payment_required && (
                        <div>Anticipo requerido: {service?.advance_payment_percentage}%</div>
                      )}
                      <div>Anticipación: {service?.min_advance_hours}h - {service?.max_advance_days} días</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingService(service)}
                      iconName="Edit"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteService(service?.id)}
                      iconName="Trash2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies Section */}
      {activeSection === 'policies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Políticas de Cancelación</h3>
            <Button
              onClick={() => setEditingPolicy({ policy_name: '', min_hours_before: 24, penalty_percentage: 0, points_penalty: 0 })}
              iconName="Plus"
            >
              Agregar Política
            </Button>
          </div>

          <div className="grid gap-4">
            {policies?.map((policy) => (
              <div key={policy?.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-foreground">{policy?.policy_name}</span>
                      {policy?.is_default && (
                        <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                          Por defecto
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div>{policy?.description}</div>
                      <div className="mt-1">
                        Cancelación con {policy?.min_hours_before}h de anticipación
                        {policy?.penalty_percentage > 0 && ` - Penalización: ${policy?.penalty_percentage}%`}
                        {policy?.points_penalty > 0 && ` - Puntos: -${policy?.points_penalty}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPolicy(policy)}
                      iconName="Edit"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {editingSchedule && (
        <ScheduleForm
          schedule={editingSchedule}
          daysOfWeek={daysOfWeek}
          onSave={handleSaveSchedule}
          onCancel={() => setEditingSchedule(null)}
          isLoading={isLoading}
        />
      )}

      {/* Service Form Modal */}
      {editingService && (
        <ServiceForm
          service={editingService}
          catalogItems={catalogItems}
          onSave={handleSaveService}
          onCancel={() => setEditingService(null)}
          isLoading={isLoading}
        />
      )}

      {/* Policy Form Modal */}
      {editingPolicy && (
        <PolicyForm
          policy={editingPolicy}
          onSave={handleSavePolicy}
          onCancel={() => setEditingPolicy(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Schedule Form Component
const ScheduleForm = ({ schedule, daysOfWeek, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState(schedule);

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {schedule?.id ? 'Editar Horario' : 'Nuevo Horario'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Select
            label="Día de la Semana"
            options={daysOfWeek}
            value={formData?.day_of_week}
            onChange={(value) => setFormData({ ...formData, day_of_week: value })}
            required
          />

          <Input
            label="Sucursal"
            value={formData?.branch_name || 'Principal'}
            onChange={(e) => setFormData({ ...formData, branch_name: e?.target?.value })}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData?.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
            />
            <label className="text-sm text-foreground">Disponible para reservas</label>
          </div>

          {formData?.is_available && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Hora de Inicio"
                  type="time"
                  value={formData?.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e?.target?.value })}
                  required
                />
                <Input
                  label="Hora de Fin"
                  type="time"
                  value={formData?.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e?.target?.value })}
                  required
                />
              </div>

              <Input
                label="Duración de Slots (minutos)"
                type="number"
                value={formData?.slot_duration_minutes}
                onChange={(e) => setFormData({ ...formData, slot_duration_minutes: parseInt(e?.target?.value) })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Inicio Descanso (opcional)"
                  type="time"
                  value={formData?.break_start_time || ''}
                  onChange={(e) => setFormData({ ...formData, break_start_time: e?.target?.value })}
                />
                <Input
                  label="Fin Descanso (opcional)"
                  type="time"
                  value={formData?.break_end_time || ''}
                  onChange={(e) => setFormData({ ...formData, break_end_time: e?.target?.value })}
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isLoading} iconName="Save" className="flex-1">
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Service Form Component
const ServiceForm = ({ service, catalogItems, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState(service);

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {service?.id ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nombre del Servicio"
            value={formData?.service_name}
            onChange={(e) => setFormData({ ...formData, service_name: e?.target?.value })}
            required
          />

          <Select
            label="Producto/Servicio del Catálogo (opcional)"
            options={[
              { value: '', label: 'Ninguno' },
              ...catalogItems?.map(item => ({ value: item?.id, label: item?.name }))
            ]}
            value={formData?.catalog_item_id || ''}
            onChange={(value) => setFormData({ ...formData, catalog_item_id: value || null })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duración (minutos)"
              type="number"
              value={formData?.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e?.target?.value) })}
              required
            />
            <Input
              label="Capacidad Máxima"
              type="number"
              value={formData?.max_capacity}
              onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e?.target?.value) })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData?.advance_payment_required}
              onCheckedChange={(checked) => setFormData({ ...formData, advance_payment_required: checked })}
            />
            <label className="text-sm text-foreground">Requiere anticipo</label>
          </div>

          {formData?.advance_payment_required && (
            <Input
              label="Porcentaje de Anticipo (%)"
              type="number"
              value={formData?.advance_payment_percentage}
              onChange={(e) => setFormData({ ...formData, advance_payment_percentage: parseFloat(e?.target?.value) })}
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Anticipación Mínima (horas)"
              type="number"
              value={formData?.min_advance_hours}
              onChange={(e) => setFormData({ ...formData, min_advance_hours: parseInt(e?.target?.value) })}
              required
            />
            <Input
              label="Anticipación Máxima (días)"
              type="number"
              value={formData?.max_advance_days}
              onChange={(e) => setFormData({ ...formData, max_advance_days: parseInt(e?.target?.value) })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData?.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <label className="text-sm text-foreground">Servicio activo</label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isLoading} iconName="Save" className="flex-1">
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Policy Form Component
const PolicyForm = ({ policy, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState(policy);

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {policy?.id ? 'Editar Política' : 'Nueva Política'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nombre de la Política"
            value={formData?.policy_name}
            onChange={(e) => setFormData({ ...formData, policy_name: e?.target?.value })}
            required
          />

          <Input
            label="Descripción"
            value={formData?.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
          />

          <Input
            label="Horas Mínimas de Anticipación"
            type="number"
            value={formData?.min_hours_before}
            onChange={(e) => setFormData({ ...formData, min_hours_before: parseInt(e?.target?.value) })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Penalización (%)"
              type="number"
              value={formData?.penalty_percentage}
              onChange={(e) => setFormData({ ...formData, penalty_percentage: parseFloat(e?.target?.value) })}
            />
            <Input
              label="Penalización en Puntos"
              type="number"
              value={formData?.points_penalty}
              onChange={(e) => setFormData({ ...formData, points_penalty: parseInt(e?.target?.value) })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData?.is_default}
              onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
            />
            <label className="text-sm text-foreground">Política por defecto</label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isLoading} iconName="Save" className="flex-1">
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleConfiguration;