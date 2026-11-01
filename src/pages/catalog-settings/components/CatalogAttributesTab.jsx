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
      return await fn();
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
  console.log('[CatalogAttributesTab] Session state:', {
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

async function fetchAttributes(userId) {
  const headers = await getAuthHeaders();
  const url = `${SUPABASE_URL}/rest/v1/catalog_attributes?owner_id=eq.${userId}&is_active=eq.true&order=created_at.desc&select=*`;
  const res = await fetch(url, { method: 'GET', headers });
  if (!res?.ok) {
    const err = await res?.json()?.catch(() => ({}));
    throw new Error(err?.message || `HTTP ${res.status}`);
  }
  return res?.json();
}

async function insertAttribute(payload) {
  const headers = await getAuthHeaders();
  const url = `${SUPABASE_URL}/rest/v1/catalog_attributes`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res?.ok) {
    const err = await res?.json()?.catch(() => ({}));
    throw new Error(err?.message || err?.details || `HTTP ${res.status}`);
  }
  return res?.json();
}

async function softDeleteAttribute(id, userId) {
  const headers = await getAuthHeaders();
  const url = `${SUPABASE_URL}/rest/v1/catalog_attributes?id=eq.${id}&owner_id=eq.${userId}`;
  const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ is_active: false }) });
  if (!res?.ok) {
    const err = await res?.json()?.catch(() => ({}));
    throw new Error(err?.message || `HTTP ${res.status}`);
  }
  return true;
}

const EMPTY_FORM = { name: '', slug: '', values: [], description: '' };

const toSlug = (text) =>
  text?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '')?.replace(/[^a-z0-9]+/g, '-')?.replace(/^-|-$/g, '');

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

const CatalogAttributesTab = () => {
  const [userId, setUserId] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [valueInput, setValueInput] = useState('');
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

  const loadAttributes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAttributes(userId);
      if (mountedRef?.current) setAttributes(data || []);
    } catch (err) {
      console.error('[CatalogAttributesTab] load error:', err);
      if (mountedRef?.current) setError(err?.message);
    } finally {
      if (mountedRef?.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadAttributes();
  }, [userId, loadAttributes]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData?.name?.trim() || !userId) return;
    setSaving(true);
    setError(null);

    const toastId = addToast('Guardando variante...', 'retrying', 0);

    try {
      console.log('[CatalogAttributesTab] Pre-save: refreshing session token...');
      const { data: refreshData, error: refreshError } = await supabase?.auth?.refreshSession();
      if (refreshError) {
        console.warn('[CatalogAttributesTab] Token refresh warning:', refreshError?.message);
      } else {
        const refreshedSession = refreshData?.session;
        console.log('[CatalogAttributesTab] Token refreshed successfully:', {
          userId: refreshedSession?.user?.id || null,
          expiresAt: refreshedSession?.expires_at ? new Date(refreshedSession.expires_at * 1000)?.toISOString() : 'N/A',
          tokenPreview: refreshedSession?.access_token ? `${refreshedSession?.access_token?.slice(0, 12)}...` : 'N/A'
        });
      }

      const slug = formData?.slug?.trim() || toSlug(formData?.name);

      await withExponentialBackoff(
        () => insertAttribute({
          owner_id: userId,
          name: formData?.name?.trim(),
          slug,
          attr_type: 'select',
          values: formData?.values,
          description: formData?.description?.trim() || null,
          is_active: true
        }),
        (attempt, maxRetries, delayMs) => {
          console.log(`[CatalogAttributesTab] Retry attempt ${attempt}/${maxRetries}, waiting ${delayMs}ms`);
          if (mountedRef?.current) {
            updateToast(toastId, `Reintento ${attempt}/${maxRetries} — esperando ${delayMs / 1000}s...`, 'retrying');
          }
        }
      );

      if (mountedRef?.current) {
        updateToast(toastId, '¡Variante guardada exitosamente!', 'success');
        setTimeout(() => dismissToast(toastId), 3000);
        setShowForm(false);
        setFormData(EMPTY_FORM);
        setValueInput('');
        await loadAttributes();
      }
    } catch (err) {
      console.error('[CatalogAttributesTab] save error after retries:', err);
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
      await softDeleteAttribute(id, userId);
      setAttributes(prev => prev?.filter(a => a?.id !== id));
    } catch (err) {
      console.error('[CatalogAttributesTab] delete error:', err);
      setError(err?.message);
    } finally {
      setDeletingId(null);
    }
  };

  const addValue = () => {
    const v = valueInput?.trim();
    if (v && !formData?.values?.includes(v)) {
      setFormData({ ...formData, values: [...formData?.values, v] });
      setValueInput('');
    }
  };

  const removeValue = (value) => {
    setFormData({ ...formData, values: formData?.values?.filter(v => v !== value) });
  };

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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Variantes Globales</h3>
          <p className="text-sm text-muted-foreground">
            Variantes reutilizables para productos variables: Talla, Color, Sabor, etc.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Agregar variante
        </button>
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-4">Nueva Variante</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData?.name}
                  onChange={e => {
                    const name = e?.target?.value;
                    setFormData({ ...formData, name, slug: toSlug(name) });
                  }}
                  placeholder="Ej: Talla"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Slug</label>
                <input
                  type="text"
                  value={formData?.slug}
                  onChange={e => setFormData({ ...formData, slug: e?.target?.value })}
                  placeholder="talla"
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
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Valores predefinidos</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={valueInput}
                  onChange={e => setValueInput(e?.target?.value)}
                  onKeyDown={e => { if (e?.key === 'Enter') { e?.preventDefault(); addValue(); } }}
                  placeholder="Ej: S, M, L"
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={addValue}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                >
                  <Icon name="Plus" size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData?.values?.map((value, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {value}
                    <button type="button" onClick={() => removeValue(value)} className="hover:text-primary/70">
                      <Icon name="X" size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
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
                onClick={() => { setShowForm(false); setError(null); setFormData(EMPTY_FORM); setValueInput(''); }}
                className="px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      {attributes?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="List" size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No hay variantes aún</p>
          <p className="text-xs mt-1">Crea la primera variante</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes?.map(attr => (
            <div key={attr?.id} className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="List" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{attr?.name}</h4>
                    <p className="text-xs text-muted-foreground">{attr?.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(attr?.id)}
                  disabled={deletingId === attr?.id}
                  className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Icon
                    name={deletingId === attr?.id ? 'Loader' : 'Trash2'}
                    size={15}
                    className={deletingId === attr?.id ? 'animate-spin text-muted-foreground' : 'text-red-500'}
                  />
                </button>
              </div>
              {attr?.values?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {attr?.values?.map((value, index) => (
                    <span key={index} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">{value}</span>
                  ))}
                </div>
              )}
              {attr?.description && <p className="text-xs text-muted-foreground mt-2">{attr?.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogAttributesTab;
