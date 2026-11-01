import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';

import GeofenceKPIs from './components/GeofenceKPIs';
import GeofenceActivityMap from './components/GeofenceActivityMap';
import GeofenceFunnelChart from './components/GeofenceFunnelChart';
import GeofenceActivityTimeline from './components/GeofenceActivityTimeline';
import GeofenceEventsTable from './components/GeofenceEventsTable';
import GeofenceABResults from './components/GeofenceABResults';
import DwellTimeDistributionChart from './components/DwellTimeDistributionChart';

const BRANCHES = [
  { value: 'all', label: 'Ver todas' },
  { value: 'centro', label: 'Sucursal Centro' },
  { value: 'norte', label: 'Sucursal Norte' },
  { value: 'sur', label: 'Sucursal Sur' },
];

const GeofenceActivity = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [period, setPeriod] = useState('today');
  const [abTestActive] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('centro');

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isSidebarOpen={isSidebarOpen}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
      />
      <main className="pt-16 lg:ml-72">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">

          {/* Page Header with Branch Selector */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mt-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Actividad
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Analíticas de detecciones y conversiones de tu geofence.
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

          {/* Tab Navigation */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-1 overflow-x-auto">
              {[
                { label: '🗺️ Mi Geofence', path: '/geofence-config', active: false },
                { label: '🔔 Notificaciones', path: '/geofence-notifications', active: false },
                { label: '📊 Actividad', path: '/geofence-activity', active: true },
              ]?.map((tab) => (
                <a
                  key={tab?.path}
                  href={tab?.path}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                    tab?.active
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {tab?.label}
                </a>
              ))}
            </nav>
          </div>

          {/* KPIs */}
          <GeofenceKPIs period={period} onPeriodChange={setPeriod} />

          {/* Activity Map */}
          <GeofenceActivityMap period={period} />

          {/* Funnel + Timeline grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <div className="lg:col-span-2">
              <GeofenceFunnelChart />
            </div>
            <div className="lg:col-span-3">
              <GeofenceActivityTimeline />
            </div>
          </div>

          {/* Dwell Time Distribution */}
          <DwellTimeDistributionChart />

          {/* Events Table */}
          <GeofenceEventsTable />

          {/* A/B Results */}
          {abTestActive && <GeofenceABResults />}
        </div>
      </main>
    </div>
  );
};

export default GeofenceActivity;
