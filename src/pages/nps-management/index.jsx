import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';

import NPSHeader from './components/NPSHeader';
import NPSAutoConfig from './components/NPSAutoConfig';
import NPSDashboard from './components/NPSDashboard';

const TABS = [
  { id: 'config', label: 'Configuración', icon: 'Settings' },
  { id: 'dashboard', label: 'Dashboard NPS', icon: 'BarChart3' },
];

const NPSManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [branch, setBranch] = useState('Todas las sucursales');

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
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
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6">

          <NPSHeader
            score={42}
            totalResponses={234}
            branch={branch}
            setBranch={setBranch}
          />

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-1 overflow-x-auto">
              {TABS?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="pb-12">
            {activeTab === 'config' && <NPSAutoConfig />}
            {activeTab === 'dashboard' && <NPSDashboard />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NPSManagement;
