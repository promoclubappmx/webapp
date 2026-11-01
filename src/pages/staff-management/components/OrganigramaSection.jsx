import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const DEPT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16'
];

const DepartmentForm = ({ dept, allDepartments, onSave, onClose }) => {
  const [name, setName] = useState(dept?.name || '');
  const [description, setDescription] = useState(dept?.description || '');
  const [color, setColor] = useState(dept?.color || DEPT_COLORS?.[0]);
  const [parentId, setParentId] = useState(dept?.parent_id || '');
  const [type, setType] = useState(dept?.parent_id ? 'subdepartamento' : 'departamento');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // When type changes, clear parent if switching to departamento
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'departamento') setParentId('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!name?.trim()) errs.name = 'El nombre es requerido';
    if (type === 'subdepartamento' && !parentId) errs.parentId = 'Selecciona el departamento padre';
    if (Object.keys(errs)?.length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSave({
        name: name?.trim(),
        description: description?.trim(),
        color,
        parent_id: type === 'subdepartamento' ? parentId : null,
      });
    } catch (err) {
      setErrors({ submit: err?.message });
    } finally {
      setLoading(false);
    }
  };

  // Filter out current dept from parent options to avoid circular refs
  const parentOptions = allDepartments?.filter(d => d?.id !== dept?.id && !d?.parent_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{dept ? 'Editar Departamento' : 'Nuevo Departamento'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('departamento')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                  type === 'departamento' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Icon name="Folder" size={18} />
                <div>
                  <p className="text-sm font-medium">Departamento</p>
                  <p className="text-xs opacity-70">Nivel principal</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('subdepartamento')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                  type === 'subdepartamento' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Icon name="FolderTree" size={18} />
                <div>
                  <p className="text-sm font-medium">Subdepartamento</p>
                  <p className="text-xs opacity-70">Anidado en otro</p>
                </div>
              </button>
            </div>
          </div>

          {/* Parent department selector (only for subdepartamento) */}
          {type === 'subdepartamento' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Departamento Padre <span className="text-red-500">*</span>
              </label>
              <select
                value={parentId}
                onChange={e => setParentId(e?.target?.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              >
                <option value="">Seleccionar departamento padre...</option>
                {parentOptions?.map(d => (
                  <option key={d?.id} value={d?.id}>{d?.name}</option>
                ))}
              </select>
              {errors?.parentId && <p className="text-xs text-red-500 mt-1">{errors?.parentId}</p>}
              {parentOptions?.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Primero crea un departamento principal</p>
              )}
            </div>
          )}

          <Input label="Nombre" value={name} onChange={e => setName(e?.target?.value)} error={errors?.name} required disabled={loading} />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e?.target?.value)} rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {DEPT_COLORS?.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          {errors?.submit && <p className="text-sm text-red-500">{errors?.submit}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrganigramaSection = () => {
  const { user: authUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('departments')
        ?.select('*')
        ?.eq('owner_id', authUser?.id)
        ?.order('name');
      if (error) throw error;
      setDepartments(data || []);
    } catch (e) {
      console.error('Error fetching departments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSave = async (data) => {
    try {
      if (editingDept) {
        const { error } = await supabase?.from('departments')?.update({ ...data, updated_at: new Date()?.toISOString() })?.eq('id', editingDept?.id);
        if (error) throw error;
        showNotif('Departamento actualizado');
      } else {
        const { error } = await supabase?.from('departments')?.insert({ ...data, owner_id: authUser?.id });
        if (error) throw error;
        showNotif('Departamento creado');
      }
      setShowForm(false);
      setEditingDept(null);
      fetchDepartments();
    } catch (e) {
      throw e;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este departamento?')) return;
    try {
      const { error } = await supabase?.from('departments')?.delete()?.eq('id', id);
      if (error) throw error;
      showNotif('Departamento eliminado');
      fetchDepartments();
    } catch (e) {
      showNotif(e?.message, 'error');
    }
  };

  const handleToggleActive = async (dept) => {
    try {
      const { error } = await supabase?.from('departments')?.update({ is_active: !dept?.is_active, updated_at: new Date()?.toISOString() })?.eq('id', dept?.id);
      if (error) throw error;
      fetchDepartments();
    } catch (e) {
      showNotif(e?.message, 'error');
    }
  };

  // Build tree structure
  const rootDepts = departments?.filter(d => !d?.parent_id);
  const getChildren = (parentId) => departments?.filter(d => d?.parent_id === parentId);

  const DeptCard = ({ dept, isChild = false }) => {
    const children = getChildren(dept?.id);
    return (
      <div className={isChild ? 'ml-6 mt-3' : ''}>
        <div className={`bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all ${!dept?.is_active ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: dept?.color + '20' }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept?.color }}></div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{dept?.name}</h3>
                  {dept?.parent_id && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Sub</span>
                  )}
                </div>
                {!dept?.is_active && <span className="text-xs text-muted-foreground">Inactivo</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditingDept(dept); setShowForm(true); }}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <Icon name="Edit" size={15} />
              </button>
              <button onClick={() => handleToggleActive(dept)}
                className="p-1.5 text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors">
                <Icon name={dept?.is_active ? 'EyeOff' : 'Eye'} size={15} />
              </button>
              <button onClick={() => handleDelete(dept?.id)}
                className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          </div>
          {dept?.description && <p className="text-sm text-muted-foreground">{dept?.description}</p>}
          {children?.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="GitBranch" size={12} />
              <span>{children?.length} subdepartamento{children?.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        {children?.map(child => (
          <DeptCard key={child?.id} dept={child} isChild={true} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          notification?.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification?.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Organigrama</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los departamentos y subdepartamentos de tu organización</p>
        </div>
        <Button onClick={() => { setEditingDept(null); setShowForm(true); }} iconName="Plus">
          Nuevo Departamento
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : departments?.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="GitBranch" size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Sin departamentos</h3>
          <p className="text-muted-foreground mb-6">Crea el primer departamento para organizar tu equipo</p>
          <Button onClick={() => setShowForm(true)} iconName="Plus">Crear Departamento</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {rootDepts?.map(dept => (
            <DeptCard key={dept?.id} dept={dept} />
          ))}
        </div>
      )}

      {showForm && (
        <DepartmentForm
          dept={editingDept}
          allDepartments={departments}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingDept(null); }}
        />
      )}
    </div>
  );
};

export default OrganigramaSection;
