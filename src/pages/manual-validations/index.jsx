import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ValidarTab from '../coupons-management/components/ValidarTab';
import StampProgressPanel from '../punch-cards-management/components/StampProgressPanel';
import CheckInValidateTab from '../check-in-module/components/CheckInValidateTab';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPunchCards } from '../../services/rewardsService';

const TABS = [
  { key: 'validate', label: 'Validar Cupón', icon: 'Ticket' },
  { key: 'ajuste', label: 'Ajustar Puntos', icon: 'SlidersHorizontal' },
  { key: 'punch', label: 'Validar Tarjeta de Sello', icon: 'ScanLine' },
  { key: 'checkin', label: 'Validar Check-in', icon: 'MapPin' },
];

const MOTIVOS = [
  { value: 'error_acreditacion', label: 'Error de acreditación' },
  { value: 'compensacion', label: 'Compensación al cliente' },
  { value: 'ajuste_contable', label: 'Ajuste contable' },
  { value: 'migracion', label: 'Migración de programa anterior' },
  { value: 'promocion_especial', label: 'Promoción especial' },
  { value: 'otro', label: 'Otro (especificar)' },
];

const MOCK_CLIENTS = [
  { id: 1, name: 'María García', email: 'maria.garcia@email.com', points: 2450 },
  { id: 2, name: 'Juan Rodríguez', email: 'juan.rodriguez@email.com', points: 1230 },
  { id: 3, name: 'Ana Martínez', email: 'ana.martinez@email.com', points: 5670 },
  { id: 4, name: 'Pedro López', email: 'pedro.lopez@email.com', points: 890 },
];

const AUDIT_LOG = [
  { id: 1, staff: 'Carlos Mendoza', date: '2026-03-05T14:30:00', client: 'María García', op: 'add', amount: 100, motivo: 'Compensación al cliente', note: 'Espera prolongada', establecimiento: 'Restaurante El Jardín' },
  { id: 2, staff: 'Carlos Mendoza', date: '2026-03-03T10:15:00', client: 'Juan Rodríguez', op: 'subtract', amount: 50, motivo: 'Ajuste contable', note: 'Doble check-in accidental', establecimiento: 'Café Premium' },
  { id: 3, staff: 'Laura Sánchez', date: '2026-03-01T16:00:00', client: 'Ana Martínez', op: 'add', amount: 200, motivo: 'Migración de programa anterior', note: '', establecimiento: 'Restaurante El Jardín' },
];

const AjusteManualTab = ({ selectedEstablishment, establishments }) => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [op, setOp] = useState('add');
  const [amount, setAmount] = useState('');
  const [motivo, setMotivo] = useState('');
  const [otroMotivo, setOtroMotivo] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [showAudit, setShowAudit] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const selectedEstablishmentName =
    selectedEstablishment === 'all' ?'Todos los establecimientos'
      : establishments?.find(e => e?.id === selectedEstablishment)?.location_name || '';

  const filteredClients = MOCK_CLIENTS?.filter(c =>
    c?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
    c?.email?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const filteredAuditLog =
    selectedEstablishment === 'all'
      ? AUDIT_LOG
      : AUDIT_LOG?.filter(log => {
          const est = establishments?.find(e => e?.id === selectedEstablishment);
          return log?.establecimiento === est?.location_name;
        });

  const newBalance = selectedClient
    ? op === 'add'
      ? selectedClient?.points + (parseInt(amount) || 0)
      : Math.max(0, selectedClient?.points - (parseInt(amount) || 0))
    : 0;

  const handleConfirm = () => {
    if (!selectedClient || !amount || !motivo || pin?.length < 4) return;
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setSelectedClient(null);
      setAmount('');
      setMotivo('');
      setOtroMotivo('');
      setNote('');
      setPin('');
      setSearch('');
    }, 2000);
  };

  return (
    <div className="max-w-2xl">
      {/* Establishment context banner */}
      {selectedEstablishment !== 'all' && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          <Icon name="Building2" size={15} className="text-primary" />
          <span className="text-sm text-foreground">
            Registrando ajuste para: <strong>{selectedEstablishmentName}</strong>
          </span>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Ajuste manual de saldo</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Solo Owner y Admin · Requiere PIN</p>
          </div>
          <button
            onClick={() => setShowAudit(!showAudit)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {showAudit ? 'Nuevo ajuste' : 'Ver auditoría'}
          </button>
        </div>

        {showAudit ? (
          <div className="p-5">
            <h4 className="font-semibold text-foreground mb-4">
              Log de auditoría
              {selectedEstablishment !== 'all' && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">— {selectedEstablishmentName}</span>
              )}
            </h4>
            {filteredAuditLog?.length === 0 ? (
              <div className="text-center py-10">
                <Icon name="ClipboardList" size={36} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Sin registros para este establecimiento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAuditLog?.map(log => (
                  <div key={log?.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{log?.client}</span>
                      <span className={`text-xs font-semibold ${
                        log?.op === 'add' ? 'text-emerald-600' : 'text-destructive'
                      }`}>
                        {log?.op === 'add' ? '+' : '-'}{log?.amount} pts
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{log?.motivo}</p>
                    {log?.note && <p className="text-xs text-muted-foreground italic">"{log?.note}"</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {log?.staff} · {new Date(log?.date)?.toLocaleString('es-MX')}
                      </p>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Icon name="Building2" size={11} />
                        {log?.establecimiento}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {confirmed ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Icon name="Check" size={32} className="text-emerald-600" />
                </div>
                <p className="font-semibold text-foreground">Ajuste aplicado</p>
                <p className="text-sm text-muted-foreground mt-1">Registro de auditoría generado</p>
              </div>
            ) : (
              <>
                {/* Client search */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Buscar cliente</label>
                  <input
                    value={search}
                    onChange={e => { setSearch(e?.target?.value); setSelectedClient(null); }}
                    placeholder="Nombre o email..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  />
                  {search && !selectedClient && (
                    <div className="mt-1 border border-border rounded-lg overflow-hidden">
                      {filteredClients?.map(c => (
                        <button
                          key={c?.id}
                          onClick={() => { setSelectedClient(c); setSearch(c?.name); }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 text-left border-b border-border last:border-0"
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">{c?.name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{c?.name}</p>
                            <p className="text-xs text-muted-foreground">{c?.points?.toLocaleString()} pts actuales</p>
                          </div>
                        </button>
                      ))}
                      {filteredClients?.length === 0 && (
                        <p className="p-3 text-sm text-muted-foreground">Sin resultados</p>
                      )}
                    </div>
                  )}
                </div>

                {selectedClient && (
                  <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-medium text-primary">{selectedClient?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedClient?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Saldo actual: <strong>{selectedClient?.points?.toLocaleString()} pts</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Operation */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Operación</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'add', label: 'Agregar puntos', icon: 'Plus', color: 'text-emerald-600' },
                      { id: 'subtract', label: 'Quitar puntos', icon: 'Minus', color: 'text-destructive' },
                    ]?.map(o => (
                      <button
                        key={o?.id}
                        onClick={() => setOp(o?.id)}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          op === o?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <Icon name={o?.icon} size={16} className={op === o?.id ? 'text-primary' : o?.color} />
                        <span className="text-sm font-medium text-foreground">{o?.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Cantidad de puntos</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e?.target?.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  />
                  {selectedClient && amount && (
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saldo actual:</span>
                        <span className="font-medium">{selectedClient?.points?.toLocaleString()} pts</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Saldo resultante:</span>
                        <span className={`font-semibold ${
                          newBalance > selectedClient?.points ? 'text-emerald-600' : 'text-destructive'
                        }`}>
                          {newBalance?.toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Motivo */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    Motivo <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={motivo}
                    onChange={e => setMotivo(e?.target?.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  >
                    <option value="">Seleccionar motivo...</option>
                    {MOTIVOS?.map(m => (
                      <option key={m?.value} value={m?.value}>{m?.label}</option>
                    ))}
                  </select>
                  {motivo === 'otro' && (
                    <input
                      value={otroMotivo}
                      onChange={e => setOtroMotivo(e?.target?.value)}
                      placeholder="Especifica el motivo..."
                      className="mt-2 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                    />
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Nota interna (opcional)</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e?.target?.value?.slice(0, 200))}
                    rows={2}
                    placeholder="Solo visible para el staff..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{note?.length}/200</p>
                </div>

                {/* PIN */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    PIN de Admin <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={e => setPin(e?.target?.value)}
                    maxLength={6}
                    placeholder="••••"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Capa de seguridad para prevenir ajustes no autorizados.
                  </p>
                </div>

                <Button
                  onClick={handleConfirm}
                  iconName="Check"
                  className="w-full"
                  disabled={!selectedClient || !amount || !motivo || pin?.length < 4}
                >
                  Confirmar ajuste
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ManualValidations = () => {
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('validate');

  // Establishments
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');

  // Punch cards
  const [punchCards, setPunchCards] = useState([]);

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@restauranteoliva.mx',
    role: 'owner',
  };

  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!authUser?.id) return;
      setLoadingEstablishments(true);
      try {
        const { data, error } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code')
          ?.eq('user_id', authUser?.id)
          ?.eq('is_active', true)
          ?.order('location_name', { ascending: true });
        if (!error && data) setEstablishments(data);
      } catch (err) {
        console.error('Error loading establishments:', err);
      } finally {
        setLoadingEstablishments(false);
      }
    };
    fetchEstablishments();
  }, [authUser?.id]);

  useEffect(() => {
    const loadPunchCards = async () => {
      if (!authUser?.id) return;
      try {
        const data = await fetchPunchCards(authUser?.id);
        if (data) setPunchCards(data);
      } catch (err) {
        console.error('Error loading punch cards:', err);
      }
    };
    loadPunchCards();
  }, [authUser?.id]);

  const selectedEstablishmentName =
    selectedEstablishment === 'all' ?'Todos los establecimientos'
      : establishments?.find(e => e?.id === selectedEstablishment)?.location_name || '';

  const renderTab = () => {
    switch (activeTab) {
      case 'validate':
        return <ValidarTab />;
      case 'ajuste':
        return (
          <AjusteManualTab
            selectedEstablishment={selectedEstablishment}
            establishments={establishments}
          />
        );
      case 'punch':
        return <StampProgressPanel cards={punchCards} />;
      case 'checkin':
        return <CheckInValidateTab />;
      default:
        return <ValidarTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto">

            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Validaciones Manuales</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Valida cupones y realiza ajustes manuales de saldo en punto de venta
              </p>
            </div>

            {/* Establishment Selector */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Building2" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Establecimiento</span>
                {loadingEstablishments && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedEstablishment('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedEstablishment === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  Todos los establecimientos
                </button>
                {establishments?.map(est => (
                  <button
                    key={est?.id}
                    onClick={() => setSelectedEstablishment(est?.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedEstablishment === est?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {est?.location_name}
                    {est?.location_code && (
                      <span className="ml-1.5 opacity-70 text-xs">({est?.location_code})</span>
                    )}
                  </button>
                ))}
                {!loadingEstablishments && establishments?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
                )}
              </div>
              {selectedEstablishment !== 'all' && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Icon name="Info" size={12} />
                  Mostrando datos de: <span className="font-medium text-foreground ml-1">{selectedEstablishmentName}</span>
                </p>
              )}
            </div>

            {/* Tab navigation */}
            <div className="border-b border-border mb-6">
              <nav className="flex gap-0 -mb-px">
                {TABS?.map(tab => (
                  <button
                    key={tab?.key}
                    onClick={() => setActiveTab(tab?.key)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab?.key
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    {tab?.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            {renderTab()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManualValidations;
