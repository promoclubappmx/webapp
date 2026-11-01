import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { NotificationEditor, PhoneMockup } from './components/NotificationEditor';
import GlobalNotificationsConfig from './components/GlobalNotificationsConfig';

const BRANCHES = [
  { value: 'all', label: 'Ver todas' },
  { value: 'centro', label: 'Sucursal Centro' },
  { value: 'norte', label: 'Sucursal Norte' },
  { value: 'sur', label: 'Sucursal Sur' },
];

const GeofenceNotifications = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [phonePlatform, setPhonePlatform] = useState('ios');
  const [showToast, setShowToast] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('centro');

  // Welcome notification state
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeBody, setWelcomeBody] = useState('');
  const [welcomeSound, setWelcomeSound] = useState(true);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [welcomeTitleB, setWelcomeTitleB] = useState('');
  const [welcomeBodyB, setWelcomeBodyB] = useState('');

  // Farewell notification state
  const [farewellTitle, setFarewellTitle] = useState('');
  const [farewellBody, setFarewellBody] = useState('');
  const [farewellCta, setFarewellCta] = useState('Ver cupón');

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const Toggle = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${
          checked ? 'bg-primary' : 'bg-slate-300'
        }`}
      >
        <span
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
          style={{ left: checked ? '22px' : '2px' }}
        />
      </button>
    </div>
  );

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
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6">

          <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Notificaciones
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Personaliza los mensajes push que reciben tus clientes al entrar o salir de tu zona.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm min-w-[200px]">
              <Icon name="MapPin" size={16} className="text-primary shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e?.target?.value)}
                className="flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer"
              >
                {BRANCHES?.map(b => (
                  <option key={b?.value} value={b?.value}>{b?.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-1 overflow-x-auto">
              {[
                { label: '🗺️ Mi Geofence', path: '/geofence-config', active: false },
                { label: '🔔 Notificaciones', path: '/geofence-notifications', active: true },
                { label: '📊 Actividad', path: '/geofence-activity', active: false },
              ]?.map(tab => (
                <a
                  key={tab?.label}
                  href={tab?.path}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    tab?.active
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  {tab?.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Welcome notification editor */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Bell" size={18} className="text-primary" />
              Mensaje de bienvenida
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Al entrar</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
              {/* Editor */}
              <div className="space-y-4">
                <NotificationEditor
                  type="welcome"
                  title={welcomeTitle}
                  setTitle={setWelcomeTitle}
                  body={welcomeBody}
                  setBody={setWelcomeBody}
                  ctaText=""
                  setCtaText={() => {}}
                  showCta={false}
                />
                <Toggle checked={welcomeSound} onChange={setWelcomeSound} label="Notificación con sonido" />

                {/* A/B Testing */}
                <div className="pt-3 border-t border-border">
                  <Toggle checked={abTestEnabled} onChange={setAbTestEnabled} label="Crear variante B para A/B testing" />
                  {abTestEnabled && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Variante B</span>
                        <span className="text-xs text-muted-foreground">Split 50/50 automático</span>
                      </div>
                      <NotificationEditor
                        type="welcome"
                        title={welcomeTitleB}
                        setTitle={setWelcomeTitleB}
                        body={welcomeBodyB}
                        setBody={setWelcomeBodyB}
                        ctaText=""
                        setCtaText={() => {}}
                        showCta={false}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div>
                <div className="flex gap-2 mb-4">
                  {['ios', 'android']?.map(p => (
                    <button
                      key={p}
                      onClick={() => setPhonePlatform(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        phonePlatform === p ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {p === 'ios' ? '🍎 iOS' : '🤖 Android'}
                    </button>
                  ))}
                </div>
                <PhoneMockup
                  platform={phonePlatform}
                  title={welcomeTitle}
                  body={welcomeBody}
                  ctaText=""
                />
              </div>
            </div>
          </div>

          {/* Farewell notification editor */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="LogOut" size={18} className="text-primary" />
              Mensaje de despedida
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Al salir</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
              <div>
                <NotificationEditor
                  type="farewell"
                  title={farewellTitle}
                  setTitle={setFarewellTitle}
                  body={farewellBody}
                  setBody={setFarewellBody}
                  ctaText={farewellCta}
                  setCtaText={setFarewellCta}
                  showCta={true}
                />
              </div>
              <div>
                <div className="flex gap-2 mb-4">
                  {['ios', 'android']?.map(p => (
                    <button
                      key={p}
                      onClick={() => setPhonePlatform(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        phonePlatform === p ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {p === 'ios' ? '🍎 iOS' : '🤖 Android'}
                    </button>
                  ))}
                </div>
                <PhoneMockup
                  platform={phonePlatform}
                  title={farewellTitle}
                  body={farewellBody}
                  ctaText={farewellCta}
                />
              </div>
            </div>
          </div>

          <GlobalNotificationsConfig />

          {/* Save button */}
          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={handleSave}
              className="w-full sm:w-auto sm:min-w-[200px] py-3 px-6 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Save" size={16} />
              Guardar configuración
            </button>
          </div>
        </div>
      </main>
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg">
          <Icon name="CheckCircle" size={18} />
          <span className="text-sm font-medium">✓ Notificaciones guardadas correctamente</span>
        </div>
      )}
    </div>
  );
};

export default GeofenceNotifications;
