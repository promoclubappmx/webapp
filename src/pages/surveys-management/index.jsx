import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import SurveysList from './components/SurveysList';
import SurveyBuilder from './components/SurveyBuilder';
import SurveyResults from './components/SurveyResults';
import ManualSendModal from './components/ManualSendModal';

const TABS = [
  { id: 'active', label: 'Activas' },
  { id: 'draft', label: 'Borradores' },
  { id: 'archived', label: 'Archivadas' },
];

const SurveysManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [view, setView] = useState('list'); // 'list' | 'builder' | 'results'
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [viewingResultsId, setViewingResultsId] = useState(null);
  const [manualSendSurvey, setManualSendSurvey] = useState(null);

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  const handleEdit = (survey) => {
    setEditingSurvey(survey);
    setView('builder');
  };

  const handleNew = () => {
    setEditingSurvey(null);
    setView('builder');
  };

  const handleViewResults = (id) => {
    setViewingResultsId(id);
    setView('results');
  };

  const handleSave = (data) => {
    setView('list');
  };

  const handleBack = () => {
    setView('list');
    setEditingSurvey(null);
    setViewingResultsId(null);
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
        {view === 'builder' ? (
          <SurveyBuilder
            survey={editingSurvey}
            onSave={handleSave}
            onCancel={handleBack}
          />
        ) : view === 'results' ? (
          <SurveyResults
            surveyId={viewingResultsId}
            onBack={handleBack}
          />
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Mis Encuestas
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Crea y gestiona encuestas personalizadas para tus clientes.
                </p>
              </div>
              <button
                onClick={handleNew}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Icon name="Plus" size={16} />
                Nueva encuesta
              </button>
            </div>

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
              <SurveysList
                activeTab={activeTab}
                onEdit={handleEdit}
                onViewResults={handleViewResults}
                onNew={handleNew}
                onManualSend={(survey) => setManualSendSurvey(survey)}
              />
            </div>
          </div>
        )}
      </main>
      {manualSendSurvey && (
        <ManualSendModal
          survey={manualSendSurvey}
          onClose={() => setManualSendSurvey(null)}
        />
      )}
    </div>
  );
};

export default SurveysManagement;
