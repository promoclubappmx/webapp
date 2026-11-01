import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ReportBuilder = ({ onGenerateReport, isGenerating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [reportFormat, setReportFormat] = useState('csv');
  const [reportName, setReportName] = useState('');

  const availableMetrics = [
    { id: 'revenue', label: 'Ingresos totales', category: 'Financiero' },
    { id: 'campaigns', label: 'Campañas activas', category: 'Promociones' },
    { id: 'customers', label: 'Clientes únicos', category: 'Clientes' },
    { id: 'redemptions', label: 'Canjes de cupones', category: 'Cupones' },
    { id: 'loyalty_points', label: 'Puntos de lealtad', category: 'Lealtad' },
    { id: 'engagement', label: 'Tasa de engagement', category: 'Engagement' },
    { id: 'conversion', label: 'Tasa de conversión', category: 'Conversión' },
    { id: 'retention', label: 'Retención de clientes', category: 'Retención' }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: 'FileText' },
    { value: 'pdf', label: 'PDF', icon: 'FileImage' },
    { value: 'excel', label: 'Excel', icon: 'Sheet' }
  ];

  const handleMetricToggle = (metricId) => {
    setSelectedMetrics(prev => 
      prev?.includes(metricId)
        ? prev?.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleGenerateReport = () => {
    if (selectedMetrics?.length === 0 || !reportName?.trim()) return;

    onGenerateReport({
      name: reportName,
      metrics: selectedMetrics,
      format: reportFormat,
      timestamp: new Date()?.toISOString()
    });

    // Reset form
    setSelectedMetrics([]);
    setReportName('');
    setIsOpen(false);
  };

  const groupedMetrics = availableMetrics?.reduce((acc, metric) => {
    if (!acc?.[metric?.category]) {
      acc[metric.category] = [];
    }
    acc?.[metric?.category]?.push(metric);
    return acc;
  }, {});

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        iconName="FileBarChart"
        iconPosition="left"
      >
        Generar Reporte
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-popover border border-border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">Generar Reporte</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded-md transition-colors duration-150"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Report Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre del reporte
                  </label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e?.target?.value)}
                    placeholder="Ej: Reporte mensual octubre 2024"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Metrics Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Métricas a incluir
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {Object.entries(groupedMetrics)?.map(([category, metrics]) => (
                      <div key={category}>
                        <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                          {category}
                        </h5>
                        <div className="space-y-2 ml-2">
                          {metrics?.map((metric) => (
                            <Checkbox
                              key={metric?.id}
                              label={metric?.label}
                              checked={selectedMetrics?.includes(metric?.id)}
                              onChange={() => handleMetricToggle(metric?.id)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Formato de exportación
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {formatOptions?.map((format) => (
                      <button
                        key={format?.value}
                        onClick={() => setReportFormat(format?.value)}
                        className={`flex flex-col items-center p-3 text-xs border rounded-md transition-colors duration-150 ${
                          reportFormat === format?.value
                            ? 'border-primary bg-primary/10 text-primary' :'border-border hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon name={format?.icon} size={20} className="mb-1" />
                        {format?.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateReport}
                  disabled={selectedMetrics?.length === 0 || !reportName?.trim() || isGenerating}
                  loading={isGenerating}
                  className="w-full"
                  iconName="Download"
                  iconPosition="left"
                >
                  {isGenerating ? 'Generando...' : 'Generar y Descargar'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportBuilder;