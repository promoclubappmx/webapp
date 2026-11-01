import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

const StaffConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, set_password, success, error, expired
  const [message, setMessage] = useState('');
  const [staffInfo, setStaffInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountError, setAccountError] = useState('');
  const token = searchParams?.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de invitación no válido o faltante.');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setStatus('loading');
      // Verify token is valid and not expired (without confirming yet)
      const { data, error } = await supabase
        ?.from('staff_members')
        ?.select('id, full_name, email, staff_role, status, invitation_expires_at, email_confirmed, auth_user_id')
        ?.eq('invitation_token', token)
        ?.single();

      if (error || !data) {
        setStatus('error');
        setMessage('El enlace de invitación no es válido. Por favor contacta a tu empleador.');
        return;
      }

      if (data?.status === 'active' && data?.email_confirmed) {
        setStaffInfo({ fullName: data?.full_name, email: data?.email, role: data?.staff_role, staffId: data?.id });
        setStatus('already_confirmed');
        setMessage('Tu cuenta ya ha sido confirmada y está activa.');
        return;
      }

      if (data?.invitation_expires_at && new Date(data?.invitation_expires_at) < new Date()) {
        setStatus('expired');
        setMessage('El enlace de invitación ha expirado. Por favor solicita uno nuevo a tu empleador.');
        return;
      }

      setStaffInfo({ fullName: data?.full_name, email: data?.email, role: data?.staff_role, staffId: data?.id });
      setStatus('set_password');
    } catch (err) {
      console.error('Error verifying token:', err);
      setStatus('error');
      setMessage('Ocurrió un error al verificar tu invitación.');
    }
  };

  const handleCreateAccount = async (e) => {
    e?.preventDefault();
    setAccountError('');

    if (!password || password?.length < 8) {
      setAccountError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setAccountError('Las contraseñas no coinciden.');
      return;
    }

    setIsCreatingAccount(true);
    try {
      // Step 1: Confirm the invitation (update staff_members status)
      const { data: confirmData, error: confirmError } = await supabase
        ?.rpc('confirm_staff_invitation', { p_invitation_token: token });

      if (confirmError) throw confirmError;

      const result = confirmData?.[0];
      if (!result?.success) {
        setAccountError(result?.message || 'Error al confirmar la invitación.');
        setIsCreatingAccount(false);
        return;
      }

      // Step 2: Create Supabase auth account for the employee
      // NOTE: In production, this would be done via a secure edge function.
      // For now, we use signUp with employee metadata so the trigger creates
      // a user_profiles row with account_type = 'employee'.
      const { data: authData, error: authError } = await supabase?.auth?.signUp({
        email: staffInfo?.email,
        password: password,
        options: {
          data: {
            full_name: staffInfo?.fullName,
            account_type: 'employee',
            staff_member_id: result?.staff_id,
            role: staffInfo?.role,
          },
        },
      });

      if (authError) {
        // If user already exists, that's okay - just link them
        if (!authError?.message?.includes('already registered')) {
          throw authError;
        }
      }

      // Step 3: Link auth_user_id back to staff_members if created
      if (authData?.user?.id) {
        await supabase?.from('staff_members')?.update({
          auth_user_id: authData?.user?.id,
          updated_at: new Date()?.toISOString(),
        })?.eq('id', result?.staff_id);
      }

      setStatus('success');
      setMessage('¡Tu cuenta de empleado ha sido creada exitosamente! Ya puedes iniciar sesión con tu correo y contraseña.');
    } catch (err) {
      console.error('Error creating account:', err);
      setAccountError(err?.message || 'Error al crear la cuenta. Por favor intenta de nuevo.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      manager: 'Gerente',
      cashier: 'Cajero',
      clerk: 'Empleado',
    };
    return roles?.[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-6">
            <img
              src="/assets/images/promoclublogo-1771730627166.png"
              alt="PromoClub Logo"
              className="h-8 w-auto object-contain mx-auto mb-4"
            />
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-indigo-100 dark:bg-indigo-900/30">
              {status === 'loading' && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              )}
              {status === 'set_password' && (
                <Icon name="UserCheck" size={32} className="text-indigo-600 dark:text-indigo-400" />
              )}
              {status === 'success' && (
                <Icon name="CheckCircle" size={32} className="text-green-600" />
              )}
              {status === 'already_confirmed' && (
                <Icon name="CheckCircle2" size={32} className="text-blue-600" />
              )}
              {status === 'error' && (
                <Icon name="XCircle" size={32} className="text-red-600" />
              )}
              {status === 'expired' && (
                <Icon name="Clock" size={32} className="text-amber-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {status === 'loading' && 'Verificando invitación...'}
              {status === 'set_password' && 'Activar cuenta de empleado'}
              {status === 'success' && '¡Cuenta creada!'}
              {status === 'already_confirmed' && 'Cuenta ya activa'}
              {status === 'error' && 'Enlace no válido'}
              {status === 'expired' && 'Enlace expirado'}
            </h1>
          </div>

          {/* Employee account badge */}
          {(status === 'set_password' || status === 'success' || status === 'already_confirmed') && (
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Icon name="UserCheck" size={14} />
                Cuenta de Empleado
              </span>
            </div>
          )}

          {/* Staff Info */}
          {staffInfo && (status === 'set_password' || status === 'success' || status === 'already_confirmed') && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Nombre:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{staffInfo?.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{staffInfo?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Rol:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{getRoleLabel(staffInfo?.role)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Set Password Form */}
          {status === 'set_password' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                Crea una contraseña para activar tu cuenta de empleado en la plataforma.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e?.target?.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e?.target?.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              {accountError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                    <Icon name="AlertCircle" size={14} />
                    {accountError}
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={isCreatingAccount}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingAccount ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <Icon name="UserCheck" size={18} />
                    <span>Activar mi cuenta</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Success state */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
              </div>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Al iniciar sesión, tendrás acceso a los módulos y funciones que tu empleador ha configurado para tu rol.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Ir al inicio de sesión
              </Button>
            </div>
          )}

          {/* Already confirmed */}
          {status === 'already_confirmed' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">{message}</p>
              </div>
              <Button onClick={() => navigate('/login')} className="w-full">
                Iniciar sesión
              </Button>
            </div>
          )}

          {/* Error / Expired states */}
          {(status === 'error' || status === 'expired') && (
            <div className="space-y-4">
              <div className={`border rounded-lg p-4 ${
                status === 'expired' ?'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm ${
                  status === 'expired' ?'text-amber-700 dark:text-amber-400' :'text-red-700 dark:text-red-400'
                }`}>
                  {message}
                </p>
              </div>
              <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                Volver al inicio
              </Button>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Contacta a tu empleador para recibir un nuevo enlace de invitación.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 PromoClub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffConfirmation;