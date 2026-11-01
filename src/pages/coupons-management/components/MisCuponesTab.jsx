import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import NuevoCuponRecuperacionForm from './NuevoCuponRecuperacionForm';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const BENEFIT_TYPES = [
  { key: 'percentage', label: '% Descuento', icon: 'Percent', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { key: 'fixed', label: 'Monto fijo', icon: 'Banknote', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { key: 'free_product', label: 'Producto gratis', icon: 'Gift', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { key: 'bogo', label: '2×1 / 3×2', icon: 'Copy', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { key: 'upgrade', label: 'Upgrade', icon: 'ArrowUpCircle', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  { key: 'free_shipping', label: 'Envío gratis', icon: 'Truck', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  { key: 'vip_access', label: 'Acceso VIP', icon: 'Crown', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
];

const statusConfig = {
  active: { label: 'Activo', cls: 'bg-green-100 text-green-700 border-green-200' },
  scheduled: { label: 'Programado', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  draft: { label: 'Borrador', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  expired: { label: 'Vencido', cls: 'bg-red-100 text-red-600 border-red-200' },
  paused: { label: 'Pausado', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

const getBenefitDisplay = (coupon) => {
  const type = coupon?.discount_type || coupon?.benefitType;
  const value = coupon?.discount_value ?? coupon?.benefitValue;
  if (type === 'percentage') return `${value}% OFF`;
  if (type === 'fixed') return `$${value} OFF`;
  if (type === 'free_product') return 'Producto Gratis';
  if (type === 'bogo') return '2×1';
  if (type === 'upgrade') return 'Upgrade Gratis';
  if (type === 'free_shipping') return 'Envío Gratis';
  if (type === 'vip_access') return 'Acceso VIP';
  return 'Beneficio';
};

const getBenefitInfo = (type) => BENEFIT_TYPES?.find(b => b?.key === type) || BENEFIT_TYPES?.[0];

const CouponListCard = ({ coupon, onEdit, onDuplicate, onToggle, onDelete }) => {
  const benefitType = coupon?.discount_type || coupon?.benefitType;
  const benefitInfo = getBenefitInfo(benefitType);
  const emitted = coupon?.usage_limit || 0;
  const redeemed = coupon?.usage_count || 0;
  const redemptionRate = emitted > 0 ? Math.round((redeemed / emitted) * 100) : 0;
  const sc = statusConfig?.[coupon?.status] || statusConfig?.draft;
  const accentColor = coupon?.design_config?.accentColor || '#7C3AED';
  const image = coupon?.design_config?.image || null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group">
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {image ? (
          <img src={image} alt={`Imagen del cupón ${coupon?.title}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)` }}>
            <Icon name="Ticket" size={40} style={{ color: accentColor }} className="opacity-60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <span className="text-white font-bold text-lg leading-tight">{getBenefitDisplay(coupon)}</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${sc?.cls}`}>{sc?.label}</span>
        </div>
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-foreground text-sm leading-tight flex-1 pr-2">{coupon?.title}</h3>
          <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded border ${benefitInfo?.bg} ${benefitInfo?.color}`}>
            <Icon name={benefitInfo?.icon} size={10} className="inline mr-1" />
            {benefitInfo?.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{coupon?.description}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-foreground">{coupon?.code}</span>
          <Icon name="QrCode" size={14} className="text-muted-foreground" />
        </div>
        {emitted > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{redeemed} canjeados</span>
              <span>{emitted} emitidos · {redemptionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(redemptionRate, 100)}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        )}
        {coupon?.valid_until && (
          <div className="text-xs text-muted-foreground mb-3">
            Vence: {new Date(coupon.valid_until)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        )}
        <div className="flex items-center gap-1 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => onEdit(coupon)} className="flex-1 text-xs h-7">
            <Icon name="Edit" size={12} className="mr-1" />Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(coupon)} className="flex-1 text-xs h-7">
            <Icon name="Copy" size={12} className="mr-1" />Duplicar
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={() => onToggle(coupon)}
            className={`flex-1 text-xs h-7 ${coupon?.status === 'active' ? 'text-yellow-600' : 'text-green-600'}`}
          >
            <Icon name={coupon?.status === 'active' ? 'Pause' : 'Play'} size={12} className="mr-1" />
            {coupon?.status === 'active' ? 'Pausar' : 'Activar'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(coupon?.id)} className="text-destructive h-7 w-7 p-0">
            <Icon name="Trash2" size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MisCuponesTab = ({ selectedEstablishment }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [subTab, setSubTab] = useState('active');
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showRecuperacion, setShowRecuperacion] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef?.current && !menuRef?.current?.contains(e?.target)) {
        setShowNewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCoupons = useCallback(async () => {
    if (!authUser?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        ?.from('coupons')
        ?.select('*')
        ?.eq('business_id', authUser?.id)
        ?.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setCoupons(data || []);
    } catch (err) {
      console.error('Error loading coupons:', err);
      setError(err?.message || 'Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const subTabs = [
    { key: 'active', label: 'Activos', filter: c => c?.status === 'active' },
    { key: 'scheduled', label: 'Programados', filter: c => c?.status === 'scheduled' },
    { key: 'draft', label: 'Borradores', filter: c => c?.status === 'draft' },
    { key: 'expired', label: 'Vencidos / Agotados', filter: c => c?.status === 'expired' || c?.status === 'paused' },
  ];

  const currentFilter = subTabs?.find(t => t?.key === subTab)?.filter || (() => true);
  const filtered = coupons?.filter(currentFilter);

  const handleEdit = (coupon) => {
    navigate('/coupons-management/edit-promotion/' + coupon?.id, { state: { coupon } });
  };

  const handleDuplicate = async (coupon) => {
    try {
      const { error: dupError } = await supabase?.from('coupons')?.insert({
        business_id: authUser?.id,
        code: coupon?.code + '_COPIA',
        title: coupon?.title + ' (Copia)',
        description: coupon?.description,
        discount_type: coupon?.discount_type,
        discount_value: coupon?.discount_value,
        min_purchase_amount: coupon?.min_purchase_amount,
        max_discount_amount: coupon?.max_discount_amount,
        usage_limit: coupon?.usage_limit,
        usage_count: 0,
        per_customer_limit: coupon?.per_customer_limit,
        valid_from: coupon?.valid_from,
        valid_until: coupon?.valid_until,
        status: 'draft',
        coupon_type: coupon?.coupon_type,
        valid_establishments: coupon?.valid_establishments,
        valid_establishments_list: coupon?.valid_establishments_list,
        customer_segment: coupon?.customer_segment,
        terms_and_conditions: coupon?.terms_and_conditions,
        design_config: coupon?.design_config,
      });
      if (dupError) throw dupError;
      await loadCoupons();
    } catch (err) {
      console.error('Error duplicating coupon:', err);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      const newStatus = coupon?.status === 'active' ? 'paused' : 'active';
      const { error: updateError } = await supabase
        ?.from('coupons')
        ?.update({ status: newStatus, updated_at: new Date()?.toISOString() })
        ?.eq('id', coupon?.id)
        ?.eq('business_id', authUser?.id);
      if (updateError) throw updateError;
      setCoupons(prev => prev?.map(c => c?.id === coupon?.id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error('Error toggling coupon:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cupón?')) return;
    try {
      const { error: deleteError } = await supabase
        ?.from('coupons')
        ?.delete()
        ?.eq('id', id)
        ?.eq('business_id', authUser?.id);
      if (deleteError) throw deleteError;
      setCoupons(prev => prev?.filter(c => c?.id !== id));
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  const handleSaveRecuperacion = async (data) => {
    try {
      const { error: saveError } = await supabase?.from('coupons')?.insert({
        business_id: authUser?.id,
        code: data?.code || `REC${Date.now()}`,
        title: data?.title,
        description: data?.description,
        discount_type: data?.benefitType || 'percentage',
        discount_value: data?.benefitValue || 0,
        status: 'active',
        coupon_type: 'recovery',
        usage_count: 0,
        design_config: data?.design_config || {},
      });
      if (saveError) throw saveError;
      await loadCoupons();
      setShowRecuperacion(false);
    } catch (err) {
      console.error('Error saving recovery coupon:', err);
    }
  };

  if (showRecuperacion) {
    return (
      <NuevoCuponRecuperacionForm
        onSave={handleSaveRecuperacion}
        onCancel={() => setShowRecuperacion(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={28} className="text-primary animate-spin mr-3" />
        <span className="text-muted-foreground">Cargando cupones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
        <Icon name="AlertCircle" size={16} className="text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={loadCoupons} className="ml-auto text-xs text-destructive underline">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {subTabs?.map(t => {
            const count = coupons?.filter(t?.filter)?.length;
            return (
              <button
                key={t?.key}
                onClick={() => setSubTab(t?.key)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                  subTab === t?.key ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t?.label}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    subTab === t?.key ? 'bg-primary text-white' : 'bg-muted-foreground/20 text-muted-foreground'
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* New Coupon dropdown button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowNewMenu(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Plus" size={16} />
            Nuevo cupón
            <Icon name="ChevronDown" size={14} className={`transition-transform ${showNewMenu ? 'rotate-180' : ''}`} />
          </button>

          {showNewMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  navigate('/coupons-management/new-promotion');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Ticket" size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">Cupón de Promoción</p>
                  <p className="text-xs text-muted-foreground">Descuentos y beneficios</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  setShowRecuperacion(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors text-left border-t border-border"
              >
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="RefreshCw" size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Cupón de Recuperación</p>
                  <p className="text-xs text-muted-foreground">Reactivar clientes inactivos</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎟️</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {coupons?.length === 0 ? 'Aún no tienes cupones' : `No hay cupones ${subTab === 'active' ? 'activos' : subTab === 'draft' ? 'en borrador' : subTab === 'scheduled' ? 'programados' : 'vencidos'}`}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {coupons?.length === 0 ? 'Crea tu primer cupón para empezar a fidelizar clientes con descuentos y beneficios exclusivos.' : 'Cambia el filtro para ver otros cupones.'}
          </p>
          {coupons?.length === 0 && (
            <button
              onClick={() => navigate('/coupons-management/new-promotion')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mx-auto"
            >
              <Icon name="Plus" size={16} />
              Crear primer cupón
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered?.map(coupon => (
            <CouponListCard
              key={coupon?.id}
              coupon={coupon}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCuponesTab;
