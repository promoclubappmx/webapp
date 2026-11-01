import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const BillingProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [billingProfile, setBillingProfile] = useState({
    rfc: 'XAXX010101000',
    razonSocial: 'Empresa Demo S.A. de C.V.',
    regimenFiscal: '612',
    codigoPostalFiscal: '06600',
    calleNumero: 'Av. Paseo de la Reforma 123',
    colonia: 'Juárez',
    ciudad: 'Ciudad de México',
    estado: 'CDMX',
    pais: 'México',
    email: 'facturacion@empresademo.com',
    telefono: '5555551234'
  });

  useEffect(() => {
    loadBillingProfile();
  }, [user]);

  const loadBillingProfile = async () => {
    if (!user?.id) {
      // Si no hay usuario, usar datos mock
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('rfc, razon_social, regimen_fiscal, codigo_postal_fiscal, email, phone')
        ?.eq('id', user?.id)
        ?.single();

      if (!error && data && (data?.rfc || data?.razon_social)) {
        setBillingProfile({
          rfc: data?.rfc || 'XAXX010101000',
          razonSocial: data?.razon_social || 'Empresa Demo S.A. de C.V.',
          regimenFiscal: data?.regimen_fiscal || '612',
          codigoPostalFiscal: data?.codigo_postal_fiscal || '06600',
          email: data?.email || 'facturacion@empresademo.com',
          telefono: data?.phone || '5555551234',
          calleNumero: 'Av. Paseo de la Reforma 123',
          colonia: 'Juárez',
          ciudad: 'Ciudad de México',
          estado: 'CDMX',
          pais: 'México'
        });
      } else {
        // Si no hay datos en Supabase, mantener datos mock
        console.log('Usando datos de prueba para perfil de facturación');
      }
    } catch (error) {
      console.error('Error loading billing profile:', error);
      // En caso de error, mantener datos mock
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        ?.from('user_profiles')
        ?.update({
          rfc: billingProfile?.rfc,
          razon_social: billingProfile?.razonSocial,
          regimen_fiscal: billingProfile?.regimenFiscal,
          codigo_postal_fiscal: billingProfile?.codigoPostalFiscal,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', user?.id);

      if (!error) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving billing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loadBillingProfile();
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setBillingProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading && !billingProfile?.rfc) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Perfil de Facturación</h3>
          <p className="text-gray-600 text-sm mt-1">Gestiona tus datos fiscales para facturación</p>
        </div>
        {!isEditing && (
          <Button
            variant="default"
            onClick={() => setIsEditing(true)}
          >
            <Icon name="Edit" size={18} className="mr-2" />
            Editar
          </Button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Datos Fiscales</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="RFC"
              placeholder="XAXX010101000"
              value={billingProfile?.rfc}
              onChange={(e) => handleInputChange('rfc', e?.target?.value)}
              disabled={!isEditing}
              maxLength={13}
            />
          </div>
          <div>
            <Input
              label="Razón Social"
              placeholder="Nombre o Razón Social"
              value={billingProfile?.razonSocial}
              onChange={(e) => handleInputChange('razonSocial', e?.target?.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Régimen Fiscal
            </label>
            <select
              value={billingProfile?.regimenFiscal}
              onChange={(e) => handleInputChange('regimenFiscal', e?.target?.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona un régimen</option>
              <option value="601">601 - General de Ley Personas Morales</option>
              <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
              <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
              <option value="606">606 - Arrendamiento</option>
              <option value="608">608 - Demás ingresos</option>
              <option value="610">610 - Residentes en el Extranjero sin Establecimiento Permanente en México</option>
              <option value="611">611 - Ingresos por Dividendos (socios y accionistas)</option>
              <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
              <option value="614">614 - Ingresos por intereses</option>
              <option value="616">616 - Sin obligaciones fiscales</option>
              <option value="620">620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos</option>
              <option value="621">621 - Incorporación Fiscal</option>
              <option value="622">622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras</option>
              <option value="623">623 - Opcional para Grupos de Sociedades</option>
              <option value="624">624 - Coordinados</option>
              <option value="625">625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>
              <option value="626">626 - Régimen Simplificado de Confianza</option>
            </select>
          </div>
          <div>
            <Input
              label="Código Postal Fiscal"
              placeholder="12345"
              value={billingProfile?.codigoPostalFiscal}
              onChange={(e) => handleInputChange('codigoPostalFiscal', e?.target?.value)}
              disabled={!isEditing}
              maxLength={5}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Dirección Fiscal</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Calle y Número"
              placeholder="Av. Reforma 123"
              value={billingProfile?.calleNumero}
              onChange={(e) => handleInputChange('calleNumero', e?.target?.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Input
              label="Colonia"
              placeholder="Centro"
              value={billingProfile?.colonia}
              onChange={(e) => handleInputChange('colonia', e?.target?.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Input
              label="Ciudad"
              placeholder="Ciudad de México"
              value={billingProfile?.ciudad}
              onChange={(e) => handleInputChange('ciudad', e?.target?.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Input
              label="Estado"
              placeholder="CDMX"
              value={billingProfile?.estado}
              onChange={(e) => handleInputChange('estado', e?.target?.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Input
              label="País"
              value={billingProfile?.pais}
              disabled
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Contacto de Facturación</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Email de Facturación"
              type="email"
              placeholder="facturacion@empresa.com"
              value={billingProfile?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Input
              label="Teléfono"
              placeholder="+52 55 1234 5678"
              value={billingProfile?.telefono}
              onChange={(e) => handleInputChange('telefono', e?.target?.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-3">
          <Button
            variant="default"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Información importante</p>
            <p className="text-sm text-blue-800">
              Los datos fiscales son necesarios para la emisión de facturas. Asegúrate de que la información sea correcta y esté actualizada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingProfile;