import React, { useState } from 'react';
import TabResumenNew from './TabResumenNew';
import TabClientesNew from './TabClientesNew';
import TabFinancieroNew from './TabFinancieroNew';
import TabAtribucion from './TabAtribucion';
import TabMercado from './TabMercado';

const subTabs = [
  { id: 'resumen', label: '📊 Resumen' },
  { id: 'atribucion', label: '🎯 Atribución' },
  { id: 'clientes', label: '👥 Clientes' },
  { id: 'financiero', label: '💰 Financiero' },
  { id: 'mercado', label: '🗺️ Mercado' },
];

const AnalyticsSection = ({ period, branch, businessId }) => {
  const [activeSubTab, setActiveSubTab] = useState('resumen');

  const renderContent = () => {
    switch (activeSubTab) {
      case 'resumen': return <TabResumenNew period={period} businessId={businessId} branch={branch} />;
      case 'atribucion': return <TabAtribucion period={period} businessId={businessId} />;
      case 'clientes': return <TabClientesNew businessId={businessId} branch={branch} />;
      case 'financiero': return <TabFinancieroNew period={period} businessId={businessId} branch={branch} />;
      case 'mercado': return <TabMercado businessId={businessId} />;
      default: return <TabResumenNew period={period} businessId={businessId} branch={branch} />;
    }
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {subTabs?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => setActiveSubTab(tab?.id)}
              className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeSubTab === tab?.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              {tab?.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Content */}
      <div>
        {renderContent()}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AnalyticsSection;
