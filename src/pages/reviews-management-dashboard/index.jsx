import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';

import ReviewsModuleHeader from './components/ReviewsModuleHeader';
import ReviewsManagementTab from './components/ReviewsManagementTab';
import ReviewsDashboardTab from './components/ReviewsDashboardTab';

const TABS = [
  { id: 'manage', label: 'Gestionar Reseñas' },
  { id: 'dashboard', label: 'Dashboard' },
];

const ReviewsManagementDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('manage');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'manage': return <ReviewsManagementTab />;
      case 'dashboard': return <ReviewsDashboardTab />;
      default: return null;
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
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}
        style={{ transitionProperty: 'margin-left', transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="p-6">

          <ReviewsModuleHeader selectedBranch={selectedBranch} onBranchChange={setSelectedBranch} />

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

          {/* Tab content */}
          <div className="pb-12">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewsManagementDashboard;
