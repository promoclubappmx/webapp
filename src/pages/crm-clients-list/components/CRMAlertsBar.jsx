import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const CRMAlertsBar = ({ ownerId }) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const buildAlerts = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    const built = [];

    try {
      // 1. Birthdays today — customers whose birth_date month+day matches today
      const today = new Date();
      const todayMonth = today?.getMonth() + 1;
      const todayDay = today?.getDate();

      const { data: bdCustomers } = await supabase?.from('owner_customers')?.select('customer_id, customer_profiles(id, full_name, birth_date)')?.eq('owner_id', ownerId);

      if (bdCustomers) {
        const birthdayToday = bdCustomers?.filter(oc => {
          const bd = oc?.customer_profiles?.birth_date;
          if (!bd) return false;
          const d = new Date(bd);
          return d?.getMonth() + 1 === todayMonth && d?.getDate() === todayDay;
        });
        if (birthdayToday?.length > 0) {
          built?.push({
            id: 'birthday',
            type: 'birthday',
            icon: 'Cake',
            color: 'bg-pink-50 border-pink-200 text-pink-800',
            iconColor: 'text-pink-600',
            message: birthdayToday?.length === 1
              ? `Hoy cumple años ${birthdayToday?.[0]?.customer_profiles?.full_name} — envía una felicitación`
              : `Hoy cumplen años ${birthdayToday?.length} de tus clientes — envía una felicitación`,
            cta: 'Ver clientes',
            ctaColor: 'bg-pink-600 text-white hover:bg-pink-700',
            action: () => {},
          });
        }
      }

      // 2. Dormant customers — no visit in 30+ days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);

      const { data: dormantData } = await supabase?.from('owner_customers')?.select('customer_id, customer_profiles(id, full_name, last_visit_at, account_status)')?.eq('owner_id', ownerId);

      if (dormantData) {
        const dormant = dormantData?.filter(oc => {
          const cp = oc?.customer_profiles;
          if (!cp || cp?.account_status === 'eliminado') return false;
          if (!cp?.last_visit_at) return true;
          return new Date(cp?.last_visit_at) < thirtyDaysAgo;
        });
        if (dormant?.length > 0) {
          built?.push({
            id: 'dormidos',
            type: 'dormidos',
            icon: 'AlertTriangle',
            color: 'bg-orange-50 border-orange-200 text-orange-800',
            iconColor: 'text-orange-600',
            message: `${dormant?.length} cliente${dormant?.length !== 1 ? 's' : ''} no ha${dormant?.length !== 1 ? 'n' : ''} visitado en más de 30 días — considera una campaña de reactivación`,
            cta: 'Ver segmento',
            ctaColor: 'bg-orange-600 text-white hover:bg-orange-700',
            action: () => {},
          });
        }
      }

      // 3. Top VIP customer (highest engagement_score) not visited in 7+ days
      const sevenDaysAgo = new Date();
      sevenDaysAgo?.setDate(sevenDaysAgo?.getDate() - 7);

      const { data: vipData } = await supabase?.from('owner_customers')?.select('customer_id, customer_profiles(id, full_name, last_visit_at, engagement_score, vip_level)')?.eq('owner_id', ownerId)?.order('customer_profiles(engagement_score)', { ascending: false })?.limit(20);

      if (vipData) {
        const atRiskVip = vipData?.find(oc => {
          const cp = oc?.customer_profiles;
          if (!cp || !cp?.last_visit_at) return false;
          return (cp?.vip_level === 'Oro' || (cp?.engagement_score || 0) >= 80) && new Date(cp?.last_visit_at) < sevenDaysAgo;
        });
        if (atRiskVip) {
          const cp = atRiskVip?.customer_profiles;
          const daysSince = Math.floor((new Date() - new Date(cp?.last_visit_at)) / (1000 * 60 * 60 * 24));
          built?.push({
            id: 'vip_alert',
            type: 'vip_alert',
            icon: 'Star',
            color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            iconColor: 'text-yellow-600',
            message: `Tu cliente VIP ${cp?.full_name} (score ${cp?.engagement_score || '—'}) no ha venido en ${daysSince} días — esto es inusual`,
            cta: 'Ver perfil',
            ctaColor: 'bg-yellow-600 text-white hover:bg-yellow-700',
            action: () => navigate(`/customer-profile-detail/${cp?.id}`),
          });
        }
      }

      // 4. New customers linked in the last 7 days
      const { data: newLinked, count: newCount } = await supabase?.from('owner_customers')?.select('id', { count: 'exact' })?.eq('owner_id', ownerId)?.gte('linked_at', sevenDaysAgo?.toISOString());

      if (newCount && newCount > 0) {
        built?.push({
          id: 'new_customers',
          type: 'new_customers',
          icon: 'UserPlus',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          iconColor: 'text-blue-600',
          message: `${newCount} nuevo${newCount !== 1 ? 's' : ''} cliente${newCount !== 1 ? 's' : ''} se vinculó${newCount !== 1 ? 'ron' : ''} esta semana`,
          cta: 'Ver clientes',
          ctaColor: 'bg-blue-600 text-white hover:bg-blue-700',
          action: () => {},
        });
      }
    } catch (e) {
      console.error('CRM alerts error:', e?.message);
    } finally {
      setLoading(false);
    }

    setAlerts(built);
  }, [ownerId, navigate]);

  useEffect(() => {
    buildAlerts();
  }, [buildAlerts]);

  const dismiss = (id) => setAlerts(prev => prev?.filter(a => a?.id !== id));

  if (loading) return null;
  if (alerts?.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Bell" size={14} className="text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Alertas del CRM</span>
        <span className="text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center font-bold">{alerts?.length}</span>
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
          {collapsed ? 'Mostrar' : 'Ocultar'}
        </button>
      </div>
      {!collapsed && (
        <div className="space-y-2">
          {alerts?.map(alert => (
            <div key={alert?.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${alert?.color}`}>
              <Icon name={alert?.icon} size={16} className={alert?.iconColor} />
              <p className="text-sm flex-1">{alert?.message}</p>
              <button
                onClick={alert?.action}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 ${alert?.ctaColor}`}
              >
                {alert?.cta}
              </button>
              <button onClick={() => dismiss(alert?.id)} className="p-1 hover:opacity-70 transition-opacity flex-shrink-0">
                <Icon name="X" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CRMAlertsBar;
