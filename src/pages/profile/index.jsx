import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import NotificationsProfileTab from './components/NotificationsProfileTab';
import PersonalDataProfileTab from './components/PersonalDataProfileTab';

const Profile = () => {
  const { user, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Subscription data
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Deactivate account state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateStep, setDeactivateStep] = useState('confirm'); // 'confirm' | 'password'
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  const [deactivateSuccess, setDeactivateSuccess] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState('confirm'); // 'confirm' | 'password'
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const tabs = [
    { id: 'personal', label: 'Datos Personales', icon: 'User' },
    { id: 'security', label: 'Seguridad', icon: 'Shield' },
    { id: 'notifications', label: 'Notificaciones', icon: 'Bell' },
    { id: 'account', label: 'Cuenta', icon: 'CreditCard' }
  ];

  // Load subscription when account tab is active
  useEffect(() => {
    if (activeTab === 'account' && user?.id && !subscription) {
      loadSubscription();
    }
  }, [activeTab, user?.id]);

  const loadSubscription = async () => {
    if (!user?.id) return;
    setSubscriptionLoading(true);
    try {
      const { data } = await supabase
        ?.from('user_subscriptions')
        ?.select('*, subscription_plans(name, slug, price_monthly, price_annual, features)')
        ?.eq('user_id', user?.id)
        ?.eq('status', 'active')
        ?.order('created_at', { ascending: false })
        ?.limit(1)
        ?.maybeSingle();
      setSubscription(data || null);
    } catch (err) {
      console.error('Error loading subscription:', err);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!passwordData?.newPass || !passwordData?.confirm) {
      setPasswordError('Por favor completa todos los campos.');
      return;
    }
    if (passwordData?.newPass !== passwordData?.confirm) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (passwordData?.newPass?.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setPasswordLoading(true);
    const { error: signInError } = await supabase?.auth?.signInWithPassword({
      email: user?.email,
      password: passwordData?.current,
    });
    if (signInError) {
      setPasswordLoading(false);
      setPasswordError('La contraseña actual es incorrecta.');
      return;
    }
    const { error } = await supabase?.auth?.updateUser({ password: passwordData?.newPass });
    setPasswordLoading(false);
    if (error) {
      setPasswordError(error?.message);
    } else {
      setPasswordSuccess(true);
      setPasswordData({ current: '', newPass: '', confirm: '' });
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d?.toLocaleString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // ── DEACTIVATE ACCOUNT ──
  const handleDeactivateConfirm = () => {
    setDeactivateStep('password');
  };

  const handleDeactivateSubmit = async () => {
    if (!deactivatePassword) {
      setDeactivateError('Por favor ingresa tu contraseña.');
      return;
    }
    setDeactivateLoading(true);
    setDeactivateError('');
    try {
      // Verify password
      const { error: signInError } = await supabase?.auth?.signInWithPassword({
        email: user?.email,
        password: deactivatePassword,
      });
      if (signInError) {
        setDeactivateError('Contraseña incorrecta. Por favor intenta de nuevo.');
        setDeactivateLoading(false);
        return;
      }
      // Mark account as inactive in user_profiles
      const { error: updateError } = await supabase
        ?.from('user_profiles')
        ?.update({ is_active: false, updated_at: new Date()?.toISOString() })
        ?.eq('id', user?.id);
      if (updateError) throw updateError;
      setDeactivateSuccess(true);
      setDeactivateLoading(false);
      // Sign out after deactivation
      setTimeout(async () => {
        await supabase?.auth?.signOut();
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setDeactivateError(err?.message || 'Error al desactivar la cuenta.');
      setDeactivateLoading(false);
    }
  };

  const handleCloseDeactivateModal = () => {
    setShowDeactivateModal(false);
    setDeactivateStep('confirm');
    setDeactivatePassword('');
    setDeactivateError('');
    setDeactivateSuccess(false);
  };

  // ── DELETE ACCOUNT ──
  const handleDeleteConfirm = () => {
    setDeleteStep('password');
  };

  const handleDeleteSubmit = async () => {
    if (!deletePassword) {
      setDeleteError('Por favor ingresa tu contraseña.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      // Verify password
      const { error: signInError } = await supabase?.auth?.signInWithPassword({
        email: user?.email,
        password: deletePassword,
      });
      if (signInError) {
        setDeleteError('Contraseña incorrecta. Por favor intenta de nuevo.');
        setDeleteLoading(false);
        return;
      }
      // Delete related data in order (child tables first)
      const userId = user?.id;
      // Delete business_settings
      await supabase?.from('business_settings')?.delete()?.eq('owner_id', userId);
      // Delete business_hours
      await supabase?.from('business_hours')?.delete()?.eq('business_id', userId);
      // Delete engagement_automation_rules
      await supabase?.from('engagement_automation_rules')?.delete()?.eq('user_id', userId);
      // Delete loyalty_programs
      await supabase?.from('loyalty_programs')?.delete()?.eq('business_id', userId);
      // Delete user_subscriptions
      await supabase?.from('user_subscriptions')?.delete()?.eq('user_id', userId);
      // Delete billing_invoices
      await supabase?.from('billing_invoices')?.delete()?.eq('user_id', userId);
      // Delete billing_payment_methods
      await supabase?.from('billing_payment_methods')?.delete()?.eq('user_id', userId);
      // Delete access_logs
      await supabase?.from('access_logs')?.delete()?.eq('user_id', userId);
      // Delete user_profiles (this will cascade to auth via trigger if configured)
      await supabase?.from('user_profiles')?.delete()?.eq('id', userId);
      // Sign out
      await supabase?.auth?.signOut();
      window.location.href = '/login';
    } catch (err) {
      setDeleteError(err?.message || 'Error al eliminar la cuenta.');
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteStep('confirm');
    setDeletePassword('');
    setDeleteError('');
  };

  const renderSecurity = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground mb-6">Configuración de Seguridad</h3>

      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon name="Lock" size={18} className="text-muted-foreground" />
              <span className="text-base font-medium text-foreground">Contraseña</span>
            </div>
            <p className="text-sm text-muted-foreground">Tu contraseña está configurada y activa.</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Calendar" size={14} />
              <span>Fecha de registro: <span className="font-medium text-foreground">{formatDate(user?.created_at)}</span></span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowPasswordForm(v => !v); setPasswordError(null); setPasswordSuccess(false); }}
          >
            <Icon name="Key" size={15} className="mr-2" />
            {showPasswordForm ? 'Cancelar' : 'Cambiar Contraseña'}
          </Button>
        </div>

        {passwordSuccess && (
          <div className="mt-4 flex items-center space-x-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <Icon name="CheckCircle" size={16} />
            <span className="text-sm font-medium">Contraseña actualizada correctamente.</span>
          </div>
        )}

        {showPasswordForm && (
          <div className="mt-6 space-y-4 border-t border-border pt-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contraseña Actual</label>
              <Input
                type="password"
                placeholder="Ingresa tu contraseña actual"
                value={passwordData?.current}
                onChange={e => setPasswordData(p => ({ ...p, current: e?.target?.value }))}
                className="w-full h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nueva Contraseña</label>
              <Input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={passwordData?.newPass}
                onChange={e => setPasswordData(p => ({ ...p, newPass: e?.target?.value }))}
                className="w-full h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirmar Nueva Contraseña</label>
              <Input
                type="password"
                placeholder="Repite la nueva contraseña"
                value={passwordData?.confirm}
                onChange={e => setPasswordData(p => ({ ...p, confirm: e?.target?.value }))}
                className="w-full h-11"
              />
            </div>
            {passwordError && (
              <div className="flex items-center space-x-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <Icon name="AlertCircle" size={15} />
                <span className="text-sm">{passwordError}</span>
              </div>
            )}
            <Button onClick={handlePasswordChange} disabled={passwordLoading}>
              {passwordLoading ? <Icon name="Loader" size={16} className="mr-2 animate-spin" /> : <Icon name="Key" size={16} className="mr-2" />}
              {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-foreground">Autenticación de Dos Factores</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Añade una capa extra de seguridad a tu cuenta
            </p>
          </div>
          <Button variant="default">
            Activar
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground mb-6">Configuración de Cuenta</h3>
      
      {/* Account Status */}
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-medium text-foreground">Estado de la Cuenta</h4>
            <p className="text-sm text-muted-foreground mt-1">Tu cuenta está activa y verificada</p>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <Icon name="CheckCircle" size={20} />
            <span className="text-sm font-medium">Activa</span>
          </div>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            <span>ID de usuario: </span>
            <span className="font-mono text-xs text-foreground">{user?.id || '—'}</span>
          </div>
          <div>
            <span>Email: </span>
            <span className="font-medium text-foreground">{user?.email || '—'}</span>
          </div>
          <div>
            <span>Registrado el: </span>
            <span className="font-medium text-foreground">{formatDate(user?.created_at)}</span>
          </div>
          {userProfile?.account_type && (
            <div>
              <span>Tipo de cuenta: </span>
              <span className="font-medium text-foreground capitalize">{userProfile?.account_type === 'owner' ? 'Propietario' : userProfile?.account_type === 'employee' ? 'Empleado' : userProfile?.account_type}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-medium text-foreground">Plan de Suscripción</h4>
            <p className="text-sm text-muted-foreground mt-1">Información de tu plan actual</p>
          </div>
          <Icon name="CreditCard" size={20} className="text-muted-foreground" />
        </div>
        {subscriptionLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Loader" size={16} className="animate-spin" />
            <span className="text-sm">Cargando plan...</span>
          </div>
        ) : subscription ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                {subscription?.plan_slug || subscription?.subscription_plans?.slug || 'PRO'}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                subscription?.status === 'active' ? 'bg-green-100 text-green-700' :
                subscription?.status === 'trial'? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {subscription?.status === 'active' ? 'Activo' : subscription?.status === 'trial' ? 'Prueba' : subscription?.status}
              </span>
            </div>
            {subscription?.subscription_plans?.name && (
              <div className="text-muted-foreground">Plan: <span className="text-foreground font-medium">{subscription?.subscription_plans?.name}</span></div>
            )}
            {subscription?.current_period_end && (
              <div className="text-muted-foreground">Próxima renovación: <span className="text-foreground font-medium">{formatDate(subscription?.current_period_end)}</span></div>
            )}
            {subscription?.billing_cycle && (
              <div className="text-muted-foreground">Ciclo: <span className="text-foreground font-medium capitalize">{subscription?.billing_cycle === 'monthly' ? 'Mensual' : subscription?.billing_cycle === 'annual' ? 'Anual' : subscription?.billing_cycle}</span></div>
            )}
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/planes-facturacion'}>
                <Icon name="ExternalLink" size={14} className="mr-2" />
                Gestionar suscripción
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">No tienes una suscripción activa.</p>
            <Button variant="default" size="sm" onClick={() => window.location.href = '/planes-facturacion'}>
              <Icon name="Zap" size={14} className="mr-2" />
              Ver planes disponibles
            </Button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
        <h4 className="text-base font-medium text-destructive mb-4">Zona de Peligro</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Desactivar Cuenta</p>
              <p className="text-xs text-muted-foreground">Tu cuenta será desactivada temporalmente</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setShowDeactivateModal(true); setDeactivateStep('confirm'); }}>
              Desactivar
            </Button>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-destructive/20">
            <div>
              <p className="text-sm font-medium text-foreground">Eliminar Cuenta</p>
              <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => { setShowDeleteModal(true); setDeleteStep('confirm'); }}>
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6">
            {deactivateSuccess ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon name="CheckCircle" size={28} className="text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Cuenta Desactivada</h3>
                <p className="text-sm text-muted-foreground">Tu cuenta ha sido desactivada exitosamente. Serás redirigido al inicio de sesión en unos momentos.</p>
              </div>
            ) : deactivateStep === 'confirm' ? (
              <>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="AlertTriangle" size={22} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Desactivar Cuenta</h3>
                    <p className="text-sm text-muted-foreground mt-1">¿Estás seguro de que deseas desactivar tu cuenta?</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 space-y-2">
                  <p className="text-sm font-medium text-amber-800">Al desactivar tu cuenta:</p>
                  <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                    <li>Tu cuenta quedará marcada como inactiva</li>
                    <li>No podrás acceder a ninguna funcionalidad de la plataforma</li>
                    <li>Tus datos se conservarán y podrás reactivar la cuenta contactando a soporte</li>
                    <li>Tus establecimientos y configuraciones permanecerán guardados</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleCloseDeactivateModal}>Cancelar</Button>
                  <Button variant="default" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleDeactivateConfirm}>Continuar</Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Lock" size={22} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Confirmar Contraseña</h3>
                    <p className="text-sm text-muted-foreground mt-1">Ingresa tu contraseña para confirmar la desactivación de tu cuenta.</p>
                  </div>
                </div>
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
                    <Input type="password" placeholder="Ingresa tu contraseña" value={deactivatePassword} onChange={e => { setDeactivatePassword(e?.target?.value); setDeactivateError(''); }} className="w-full h-11" />
                  </div>
                  {deactivateError && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <Icon name="AlertCircle" size={15} />
                      <span className="text-sm">{deactivateError}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleCloseDeactivateModal} disabled={deactivateLoading}>Cancelar</Button>
                  <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleDeactivateSubmit} disabled={deactivateLoading || !deactivatePassword}>
                    {deactivateLoading ? <><Icon name="Loader" size={15} className="mr-2 animate-spin" />Desactivando...</> : 'Desactivar Cuenta'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6">
            {deleteStep === 'confirm' ? (
              <>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Trash2" size={22} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Eliminar Cuenta</h3>
                    <p className="text-sm text-muted-foreground mt-1">¿Estás seguro de que deseas eliminar permanentemente tu cuenta?</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 space-y-2">
                  <p className="text-sm font-medium text-red-800">⚠️ Esta acción es irreversible. Al eliminar tu cuenta:</p>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>Se eliminarán todos tus datos personales</li>
                    <li>Se eliminarán todos tus establecimientos y configuraciones</li>
                    <li>Se cancelarán todas tus suscripciones activas</li>
                    <li>No podrás recuperar ninguna información</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleCloseDeleteModal}>Cancelar</Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm}>Sí, eliminar mi cuenta</Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Lock" size={22} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Confirmar Eliminación</h3>
                    <p className="text-sm text-muted-foreground mt-1">Ingresa tu contraseña para confirmar la eliminación definitiva de tu cuenta.</p>
                  </div>
                </div>
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
                    <Input type="password" placeholder="Ingresa tu contraseña" value={deletePassword} onChange={e => { setDeletePassword(e?.target?.value); setDeleteError(''); }} className="w-full h-11" />
                  </div>
                  {deleteError && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <Icon name="AlertCircle" size={15} />
                      <span className="text-sm">{deleteError}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleCloseDeleteModal} disabled={deleteLoading}>Cancelar</Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDeleteSubmit} disabled={deleteLoading || !deletePassword}>
                    {deleteLoading ? <><Icon name="Loader" size={15} className="mr-2 animate-spin" />Eliminando...</> : 'Eliminar Definitivamente'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return <PersonalDataProfileTab />;
      case 'security': return renderSecurity();
      case 'notifications': return <NotificationsProfileTab />;
      case 'account': return renderAccount();
      default: return <PersonalDataProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={userProfile || user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={userProfile || user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto">

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Mi Perfil</h1>
              <p className="text-muted-foreground">Administra tu información personal y configuración de cuenta</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Tabs Sidebar */}
              <div className="lg:w-64 bg-card rounded-lg border border-border p-4 h-fit">
                <nav className="space-y-1">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon name={tab?.icon} size={20} />
                      <span className="text-sm font-medium">{tab?.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1">
                <div className="bg-card border border-border rounded-lg p-8">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;