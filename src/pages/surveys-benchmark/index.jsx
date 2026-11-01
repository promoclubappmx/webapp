import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import BenchmarkHeader from './components/BenchmarkHeader';
import NPSBenchmarkPanel from './components/NPSBenchmarkPanel';
import DimensionsBenchmarkPanel from './components/DimensionsBenchmarkPanel';
import BenchmarkTrendChart from './components/BenchmarkTrendChart';
import BenchmarkAlerts from './components/BenchmarkAlerts';

const myData = {
  nps: 42,
  promoters: 62,
  neutrals: 23,
  detractors: 15,
  totalResponses: 234,
  percentile: 73,
};

const benchmarkData = {
  avgNPS: 31,
  promoters: 51,
  neutrals: 28,
  detractors: 21,
  businessCount: 23,
};

const dimensions = [
  { name: 'Satisfacción general', myScore: 4.6, avgScore: 4.1 },
  { name: 'Velocidad de servicio', myScore: 3.8, avgScore: 4.0 },
  { name: 'Calidad del producto', myScore: 4.8, avgScore: 4.3 },
  { name: 'Precio / valor', myScore: 4.2, avgScore: 3.9 },
];

const SurveysBenchmark = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [radius, setRadius] = useState(5);
  const [category, setCategory] = useState('Restaurante');
  const hasEnoughData = true; // toggle to false to test locked state

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

          <BenchmarkHeader
            radius={radius}
            setRadius={setRadius}
            category={category}
            setCategory={setCategory}
          />

          <NPSBenchmarkPanel
            myData={myData}
            benchmarkData={benchmarkData}
            hasEnoughData={hasEnoughData}
          />

          <DimensionsBenchmarkPanel
            dimensions={dimensions}
            hasEnoughData={hasEnoughData}
          />

          <BenchmarkTrendChart />

          <BenchmarkAlerts />

          {/* Privacy banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <Icon name="Lock" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">🔒 Privacidad garantizada</p>
              <p className="text-sm text-blue-700">
                Los datos de benchmark son completamente anónimos. Nunca verás información identificable de otros negocios.
                PromoClub agrega un mínimo de 5 negocios para calcular cualquier métrica comparativa.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SurveysBenchmark;
