import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const CONSENT_FIELDS = [
  { key: 'consent_push', label: 'Push', icon: 'Bell' },
  { key: 'consent_email', label: 'Email', icon: 'Mail' },
  { key: 'consent_whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { key: 'consent_analytics', label: 'Analytics', icon: 'BarChart2' },
  { key: 'consent_third_party', label: 'Terceros', icon: 'Share2' },
];

const ConsentIndicator = ({ value }) => (
  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${value ? 'bg-green-100' : 'bg-red-100'}`}>
    <Icon name={value ? 'Check' : 'X'} size={12} className={value ? 'text-green-600' : 'text-red-500'} />
  </div>
);

const STATUS_OPTIONS = [
  { value: 'activo', label: 'Activo', color: 'bg-green-100 text-green-700' },
  { value: 'suspendido', label: 'Suspendido', color: 'bg-orange-100 text-orange-700' },
  { value: 'eliminado', label: 'Eliminado', color: 'bg-red-100 text-red-700' },
];

const ConsentPrivacyTab = ({ ownerCustomers = [] }) => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState('consents');
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchConsents = useCallback(async () => {
    if (!user?.id || ownerCustomers?.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const customerIds = ownerCustomers?.map(oc => oc?.customer_id)?.filter(Boolean);
      if (customerIds?.length === 0) { setLoading(false); return; }

      // Get customer profiles with their consent data
      const { data: profiles, error: pErr } = await supabase?.from('customer_profiles')?.select('id, full_name, email, phone, account_status')?.in('id', customerIds);
      if (pErr) throw pErr;

      const { data: consentData, error: cErr } = await supabase?.from('customer_consents')?.select('*')?.in('customer_id', customerIds);
      if (cErr && cErr?.code !== 'PGRST116') throw cErr;

      const consentMap = {};
      (consentData || [])?.forEach(c => { consentMap[c?.customer_id] = c; });

      const merged = (profiles || [])?.map(p => ({
        ...p,
        consent: consentMap?.[p?.id] || null,
      }));
      setConsents(merged);
    } catch (e) {
      setError(e?.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, ownerCustomers]);

  useEffect(() => { fetchConsents(); }, [fetchConsents]);

  const updateCustomerStatus = async (customerId, newStatus) => {
    if (!customerId) return;
    setUpdatingStatus(customerId);
    try {
      const { error: err } = await supabase?.from('customer_profiles')?.update({ account_status: newStatus, updated_at: new Date()?.toISOString() })?.eq('id', customerId);
      if (err) throw err;
      setConsents(prev => prev?.map(c => c?.id === customerId ? { ...c, account_status: newStatus } : c));
    } catch (e) {
      console.error('Error updating status:', e?.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const pendingArco = consents?.filter(c => c?.consent?.arco_pending)?.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">Privacidad y Consentimiento</h2>
          <p className="text-sm text-muted-foreground">Gestión de permisos LFPDPPP</p>
        </div>
        {pendingArco > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <Icon name="AlertTriangle" size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-700">{pendingArco} solicitudes ARCO pendientes</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-5 border-b border-border">
        {[['consents', 'Bell', 'Consentimientos'], ['status', 'UserCheck', 'Estado de clientes']]?.map(([id, icon, label]) => (
          <button key={id} onClick={() => setSubTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${subTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Icon name={icon} size={14} />{label}
            {id === 'consents' && pendingArco > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{pendingArco}</span>
            )}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Cargando datos de privacidad...</div>
      ) : (
        <>
          {subTab === 'consents' && (
            <div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                <Icon name="Info" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">Los consentimientos son configurados por el usuario desde su perfil en la app. Solo puedes visualizarlos, no modificarlos.</p>
              </div>
              {consents?.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-border rounded-xl">
                  <Icon name="Shield" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No hay datos de consentimiento disponibles</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-4">Cliente</th>
                        {CONSENT_FIELDS?.map(f => (
                          <th key={f?.key} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3">
                            <div className="flex flex-col items-center gap-1">
                              <Icon name={f?.icon} size={14} />
                              <span>{f?.label}</span>
                            </div>
                          </th>
                        ))}
                        <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3">ARCO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consents?.map(client => (
                        <tr key={client?.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="text-sm font-medium">{client?.full_name}</div>
                            <div className="text-xs text-muted-foreground">{client?.email || client?.phone || '—'}</div>
                            {client?.consent?.arco_pending && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded mt-1 inline-block">ARCO pendiente</span>
                            )}
                          </td>
                          {CONSENT_FIELDS?.map(f => (
                            <td key={f?.key} className="py-3 px-3 text-center">
                              <div className="flex justify-center">
                                {client?.consent ? (
                                  <ConsentIndicator value={client?.consent?.[f?.key]} />
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </div>
                            </td>
                          ))}
                          <td className="py-3 px-3 text-center">
                            {client?.consent?.arco_pending ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Pendiente</span>
                                <span className="text-xs text-muted-foreground">{client?.consent?.arco_type}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {subTab === 'status' && (
            <div>
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <Icon name="AlertTriangle" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">Cambiar el estado a "Eliminado" no borra la información del cliente. Los datos históricos se conservan para fines de análisis y cumplimiento legal.</p>
              </div>
              {consents?.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-border rounded-xl">
                  <Icon name="Users" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No hay clientes vinculados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consents?.map(client => {
                    const currentStatus = STATUS_OPTIONS?.find(s => s?.value === (client?.account_status || 'activo'));
                    return (
                      <div key={client?.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                          {client?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{client?.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{client?.email || client?.phone || '—'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${currentStatus?.color}`}>
                            {currentStatus?.label || 'Activo'}
                          </span>
                          <select
                            value={client?.account_status || 'activo'}
                            onChange={e => updateCustomerStatus(client?.id, e?.target?.value)}
                            disabled={updatingStatus === client?.id}
                            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background disabled:opacity-50"
                          >
                            {STATUS_OPTIONS?.map(s => (
                              <option key={s?.value} value={s?.value}>{s?.label}</option>
                            ))}
                          </select>
                          {updatingStatus === client?.id && (
                            <Icon name="Loader2" size={14} className="animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConsentPrivacyTab;
