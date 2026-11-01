import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import PersonalSection from './components/PersonalSection';
import OrganigramaSection from './components/OrganigramaSection';
import RolesPermisosSection from './components/RolesPermisosSection';
import ActividadAuditoriaSection from './components/ActividadAuditoriaSection';
import { useAuth } from '../../contexts/AuthContext';

const MENU_ITEMS = [
  { key: 'personal', label: 'Personal', icon: 'Users', description: 'Gestión de empleados' },
  { key: 'organigrama', label: 'Organigrama', icon: 'GitBranch', description: 'Departamentos y estructura' },
  { key: 'roles', label: 'Roles y Permisos', icon: 'Shield', description: 'Configuración de accesos' },
  { key: 'actividad', label: 'Actividad y Auditoría', icon: 'ClipboardList', description: 'Registros y seguimiento' },
];

const StaffManagement = () => {
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  const renderSection = () => {
    switch (activeSection) {
      case 'personal': return <PersonalSection />;
      case 'organigrama': return <OrganigramaSection />;
      case 'roles': return <RolesPermisosSection />;
      case 'actividad': return <ActividadAuditoriaSection />;
      default: return <PersonalSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={authUser}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={authUser}
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
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Personal</h1>
              <p className="text-muted-foreground">Administra tu equipo, departamentos, roles y permisos</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Lateral Menu - same format as business-settings */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-card rounded-lg border border-border p-4 sticky top-20">
                  <nav className="space-y-1">
                    {MENU_ITEMS?.map((item) => (
                      <button
                        key={item?.key}
                        onClick={() => setActiveSection(item?.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                          activeSection === item?.key
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon name={item?.icon} size={20} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item?.label}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 min-w-0">
                <div className="bg-card rounded-lg border border-border">
                  {/* Section Header */}
                  <div className="px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name={MENU_ITEMS?.find(m => m?.key === activeSection)?.icon || 'Users'} size={20} className="text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          {MENU_ITEMS?.find(m => m?.key === activeSection)?.label}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {MENU_ITEMS?.find(m => m?.key === activeSection)?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Section Content */}
                  <div className="p-6">
                    {renderSection()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex">
          {MENU_ITEMS?.map(item => (
            <button
              key={item?.key}
              onClick={() => setActiveSection(item?.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 transition-colors ${
                activeSection === item?.key ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon name={item?.icon} size={18} />
              <span className="text-xs font-medium truncate w-full text-center">{item?.label?.split(' ')?.[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;