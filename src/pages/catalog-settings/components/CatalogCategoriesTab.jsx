import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withExponentialBackoff(fn, onRetry, maxRetries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        onRetry(attempt + 1, maxRetries, delay);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

async function getAuthHeaders() {
  const { data: { session }, error } = await supabase?.auth?.getSession();
  const token = session?.access_token || SUPABASE_ANON_KEY;
  const expiresAt = session?.expires_at ? new Date(session.expires_at * 1000)?.toISOString() : 'N/A';
  console.log('[CatalogCategoriesTab] Session state:', {
    authenticated: !!session,
    userId: session?.user?.id || null,
    expiresAt,
    tokenPreview: token ? `${token?.slice(0, 12)}...` : 'anon',
    error: error?.message || null
  });
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Prefer': 'return=representation'
  };
}

async function fetchCategories(userId) {
  const headers = await getAuthHeaders();
  const url = `${SUPABASE_URL}/rest/v1/product_categories?owner_id=eq.${userId}&is_active=eq.true&order=display_order.asc,created_at.asc&select=*`;
  const res = await fetch(url, { method: 'GET', headers });
  if (!res?.ok) {
    const err = await res?.json()?.catch(() => ({}));
    throw new Error(err?.message || `HTTP ${res.status}`);
  }
  return res?.json();
}

async function insertCategory(payload) {
  const headers = await getAuthHeaders();
  const url = `${SUPABASE_URL}/rest/v1/product_categories`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res?.ok) {
    const err = await res?.json()?.catch(() => ({}));
    throw new Error(err?.message || err?.details || `HTTP ${res.status}`);
  }
  return res?.json();
}

async function softDeleteCategory(id, userId) {
  const headers = await getAuthHeaders();
  const url = `${SUPABASE_URL}/rest/v1/product_categories?id=eq.${id}&owner_id=eq.${userId}`;
  const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ is_active: false }) });
  if (!res?.ok) {
    const err = await res?.json()?.catch(() => ({}));
    throw new Error(err?.message || `HTTP ${res.status}`);
  }
  return true;
}

const EMPTY_FORM = { name: '', description: '', color: '#3b82f6', icon: 'Tag', isSubcategory: false, parent_category_id: '' };

// Toast component
const Toast = ({ toasts, onDismiss }) => {
  if (!toasts?.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts?.map(toast => (
        <div
          key={toast?.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-300 ${
            toast?.type === 'success' ?'bg-green-50 border-green-200 text-green-800'
              : toast?.type === 'error' ?'bg-red-50 border-red-200 text-red-800' :'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <Icon
            name={toast?.type === 'success' ? 'CheckCircle' : toast?.type === 'error' ? 'XCircle' : 'RefreshCw'}
            size={16}
            className={`flex-shrink-0 mt-0.5 ${toast?.type === 'retrying' ? 'animate-spin' : ''}`}
          />
          <span className="flex-1">{toast?.message}</span>
          <button onClick={() => onDismiss(toast?.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
            <Icon name="X" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

const CatalogCategoriesTab = () => {
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toasts, setToasts] = useState([]);
  const mountedRef = useRef(true);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        if (mountedRef?.current) setToasts(prev => prev?.filter(t => t?.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev?.filter(t => t?.id !== id));
  }, []);

  const updateToast = useCallback((id, message, type) => {
    setToasts(prev => prev?.map(t => t?.id === id ? { ...t, message, type } : t));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      if (mountedRef?.current && session?.user?.id) {
        setUserId(session?.user?.id);
      } else if (mountedRef?.current) {
        setLoading(false);
      }
    });
    return () => { mountedRef.current = false; };
  }, []);

  const loadCategories = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories(userId);
      if (mountedRef?.current) setCategories(data || []);
    } catch (err) {
      console.error('[CatalogCategoriesTab] load error:', err);
      if (mountedRef?.current) setError(err?.message);
    } finally {
      if (mountedRef?.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadCategories();
  }, [userId, loadCategories]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData?.name?.trim() || !userId) return;
    setSaving(true);
    setError(null);

    const toastId = addToast('Guardando categoría...', 'retrying', 0);

    try {
      console.log('[CatalogCategoriesTab] Pre-save: refreshing session token...');
      const { data: refreshData, error: refreshError } = await supabase?.auth?.refreshSession();
      if (refreshError) {
        console.warn('[CatalogCategoriesTab] Token refresh warning:', refreshError?.message);
      } else {
        const refreshedSession = refreshData?.session;
        console.log('[CatalogCategoriesTab] Token refreshed successfully:', {
          userId: refreshedSession?.user?.id || null,
          expiresAt: refreshedSession?.expires_at ? new Date(refreshedSession.expires_at * 1000)?.toISOString() : 'N/A',
          tokenPreview: refreshedSession?.access_token ? `${refreshedSession?.access_token?.slice(0, 12)}...` : 'N/A'
        });
      }

      const payload = {
        owner_id: userId,
        name: formData?.name?.trim(),
        description: formData?.description?.trim() || null,
        color: formData?.color,
        icon: formData?.icon,
        is_active: true,
        parent_category_id: formData?.isSubcategory && formData?.parent_category_id ? formData?.parent_category_id : null
      };

      await withExponentialBackoff(
        () => insertCategory(payload),
        (attempt, maxRetries, delayMs) => {
          console.log(`[CatalogCategoriesTab] Retry attempt ${attempt}/${maxRetries}, waiting ${delayMs}ms`);
          if (mountedRef?.current) {
            updateToast(toastId, `Reintento ${attempt}/${maxRetries} — esperando ${delayMs / 1000}s...`, 'retrying');
          }
        }
      );

      if (mountedRef?.current) {
        updateToast(toastId, '¡Categoría guardada exitosamente!', 'success');
        setTimeout(() => dismissToast(toastId), 3000);
        setShowForm(false);
        setFormData(EMPTY_FORM);
        await loadCategories();
      }
    } catch (err) {
      console.error('[CatalogCategoriesTab] save error after retries:', err);
      if (mountedRef?.current) {
        updateToast(toastId, `Error al guardar después de ${MAX_RETRIES} intentos: ${err?.message}`, 'error');
        setTimeout(() => dismissToast(toastId), 6000);
        setError(err?.message);
      }
    } finally {
      if (mountedRef?.current) setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!userId) return;
    setDeletingId(id);
    setError(null);
    try {
      await softDeleteCategory(id, userId);
      setCategories(prev => prev?.filter(c => c?.id !== id));
    } catch (err) {
      console.error('[CatalogCategoriesTab] delete error:', err);
      setError(err?.message);
    } finally {
      setDeletingId(null);
    }
  };

  const buildTree = (items, parentId = null) =>
    items?.filter(item => (item?.parent_category_id || null) === parentId)?.map(item => ({ ...item, children: buildTree(items, item?.id) }));

  const tree = buildTree(categories);

  const renderCategory = (category, depth = 0) => (
    <div key={category?.id}>
      <div
        className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
        style={{ marginLeft: depth > 0 ? `${depth * 20}px` : 0 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {depth > 0 && <Icon name="CornerDownRight" size={14} className="text-muted-foreground flex-shrink-0" />}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: (category?.color || '#3b82f6') + '20' }}
            >
              <Icon name={category?.icon || 'Tag'} size={18} style={{ color: category?.color || '#3b82f6' }} />
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-foreground truncate">{category?.name}</h4>
              {category?.description && <p className="text-xs text-muted-foreground truncate">{category?.description}</p>}
              {depth > 0 && <span className="text-xs text-primary/70 font-medium">Subcategoría</span>}
            </div>
          </div>
          <button
            onClick={() => handleDelete(category?.id)}
            disabled={deletingId === category?.id}
            className="p-1.5 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
            title="Eliminar"
          >
            <Icon
              name={deletingId === category?.id ? 'Loader' : 'Trash2'}
              size={15}
              className={deletingId === category?.id ? 'animate-spin text-muted-foreground' : 'text-red-500'}
            />
          </button>
        </div>
      </div>
      {category?.children?.length > 0 && (
        <div className="mt-2 space-y-2">
          {category?.children?.map(child => renderCategory(child, depth + 1))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Categorías de Productos</h3>
          <p className="text-sm text-muted-foreground">Organiza tus productos en categorías y subcategorías anidadas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Agregar Categoría
        </button>
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-sm font-semibold text-foreground mb-4">Nueva Categoría</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData?.name}
                  onChange={e => setFormData({ ...formData, name: e?.target?.value })}
                  placeholder="Ej: Bebidas"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                <input
                  type="text"
                  value={formData?.description}
                  onChange={e => setFormData({ ...formData, description: e?.target?.value })}
                  placeholder="Descripción opcional"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Color</label>
                <input
                  type="color"
                  value={formData?.color}
                  onChange={e => setFormData({ ...formData, color: e?.target?.value })}
                  className="w-full h-10 rounded-lg border border-border cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ícono</label>
                <input
                  type="text"
                  value={formData?.icon}
                  onChange={e => setFormData({ ...formData, icon: e?.target?.value })}
                  placeholder="Tag"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSubcategory"
                checked={formData?.isSubcategory}
                onChange={e => setFormData({ ...formData, isSubcategory: e?.target?.checked, parent_category_id: '' })}
                className="rounded border-border"
              />
              <label htmlFor="isSubcategory" className="text-sm text-foreground">Es subcategoría</label>
            </div>
            {formData?.isSubcategory && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Categoría padre *</label>
                <select
                  value={formData?.parent_category_id}
                  onChange={e => setFormData({ ...formData, parent_category_id: e?.target?.value })}
                  required={formData?.isSubcategory}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Seleccionar categoría padre</option>
                  {categories?.filter(c => !c?.parent_category_id)?.map(c => (
                    <option key={c?.id} value={c?.id}>{c?.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving && <Icon name="Loader" size={14} className="animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(null); setFormData(EMPTY_FORM); }}
                className="px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="space-y-2">
        {tree?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Tag" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay categorías aún. Agrega la primera.</p>
          </div>
        ) : (
          tree?.map(cat => renderCategory(cat))
        )}
      </div>
    </div>
  );
};

export default CatalogCategoriesTab;
