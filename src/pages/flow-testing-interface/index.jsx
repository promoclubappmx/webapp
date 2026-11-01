import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import PersonaSelector from './components/PersonaSelector';
import SimulationTimeline from './components/SimulationTimeline';
import SimulationSummary from './components/SimulationSummary';

const FLOWS = [
  { id: 'welcome', name: 'Flow de Bienvenida', icon: 'Sparkles', color: 'from-emerald-500 to-teal-600' },
  { id: 'reactivation', name: 'Flow de Reactivación', icon: 'RefreshCw', color: 'from-orange-500 to-red-500' },
  { id: 'birthday', name: 'Flow de Cumpleaños', icon: 'Gift', color: 'from-pink-500 to-rose-600' },
  { id: 'post-visit', name: 'Flow Post-Primera-Visita', icon: 'Star', color: 'from-blue-500 to-indigo-600' },
];

const FlowTestingInterface = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user] = useState({ name: 'Usuario', role: 'owner' });
  const [selectedFlow, setSelectedFlow] = useState(FLOWS?.[0]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepConditions, setStepConditions] = useState({});
  const [simulationComplete, setSimulationComplete] = useState(false);

  const handleStartSimulation = () => {
    if (!selectedPersona) return;
    setSimulationStarted(true);
    setCurrentStep(0);
    setStepConditions({});
    setSimulationComplete(false);
  };

  const handleNextStep = (steps) => {
    const nextIdx = currentStep + 1;
    if (nextIdx >= steps?.length) {
      setSimulationComplete(true);
    } else {
      setCurrentStep(nextIdx);
    }
  };

  const handleCondition = (stepIdx, value) => {
    setStepConditions(prev => ({ ...prev, [stepIdx]: value }));
  };

  const handleReset = () => {
    setSimulationStarted(false);
    setCurrentStep(0);
    setStepConditions({});
    setSimulationComplete(false);
    setSelectedPersona(null);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} isCollapsed={isSidebarCollapsed} onCollapsedChange={setIsSidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setIsSidebarOpen(true)} user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/ifttt-rules-management')} iconName="List" iconPosition="left">Ver Reglas</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/automation-flows-dashboard')} iconName="ArrowLeft" iconPosition="left">Volver</Button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon name="Play" size={20} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Interfaz de Prueba de Flows</h1>
                  <p className="text-sm text-muted-foreground">Simula el recorrido completo de un usuario antes de activar el flow</p>
                </div>
              </div>
            </div>

            {/* Flow Selector */}
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-3">Selecciona el flow a probar</p>
              <div className="flex flex-wrap gap-2">
                {FLOWS?.map(f => (
                  <button key={f?.id} onClick={() => { setSelectedFlow(f); handleReset(); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      selectedFlow?.id === f?.id
                        ? 'border-primary bg-primary/10 text-primary' :'border-border bg-card text-foreground hover:border-primary/50'
                    }`}>
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${f?.color} flex items-center justify-center`}>
                      <Icon name={f?.icon} size={13} className="text-white" />
                    </div>
                    {f?.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Persona + Controls */}
              <div className="lg:col-span-1 space-y-4">
                <PersonaSelector
                  selectedPersona={selectedPersona}
                  onSelect={(p) => { setSelectedPersona(p); setSimulationStarted(false); setCurrentStep(0); setStepConditions({}); setSimulationComplete(false); }}
                  disabled={simulationStarted}
                />

                {!simulationStarted ? (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleStartSimulation}
                    disabled={!selectedPersona}
                    iconName="Play"
                    iconPosition="left">
                    Iniciar Simulación
                  </Button>
                ) : (
                  <button onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors">
                    <Icon name="RotateCcw" size={16} />
                    Reiniciar simulación
                  </button>
                )}

                {simulationStarted && !simulationComplete && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <p className="text-sm font-medium text-primary">Simulación activa</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Avanza paso a paso para ver qué recibiría <span className="font-medium text-foreground">{selectedPersona?.name}</span></p>
                  </div>
                )}
              </div>

              {/* Right: Timeline */}
              <div className="lg:col-span-2">
                {!simulationStarted ? (
                  <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="Play" size={28} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">Listo para simular</h3>
                    <p className="text-sm text-muted-foreground">Selecciona un perfil de usuario y presiona "Iniciar Simulación" para ver el recorrido completo del flow</p>
                  </div>
                ) : simulationComplete ? (
                  <SimulationSummary
                    flow={selectedFlow}
                    persona={selectedPersona}
                    stepConditions={stepConditions}
                    onReset={handleReset}
                  />
                ) : (
                  <SimulationTimeline
                    flow={selectedFlow}
                    persona={selectedPersona}
                    currentStep={currentStep}
                    stepConditions={stepConditions}
                    onNextStep={handleNextStep}
                    onCondition={handleCondition}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FlowTestingInterface;
