import React, { useState, useRef, useCallback } from 'react';
import Icon from '../../../components/AppIcon';

const NODE_COLORS = {
  trigger: { border: 'border-emerald-500', bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-500' },
  action: { border: 'border-blue-500', bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-500' },
  wait: { border: 'border-gray-400', bg: 'bg-gray-50', icon: 'text-gray-600', badge: 'bg-gray-400' },
  condition: { border: 'border-amber-500', bg: 'bg-amber-50', icon: 'text-amber-600', badge: 'bg-amber-500' },
  end: { border: 'border-red-500', bg: 'bg-red-50', icon: 'text-red-600', badge: 'bg-red-500' },
};

const getNodeType = (nodeId) => {
  if (nodeId?.startsWith('trigger') || ['user-register','first-visit','inactivity','vip-proximity','birthday','weather','low-checkins','geofence-enter','review','survey']?.includes(nodeId)) return 'trigger';
  if (nodeId?.startsWith('wait')) return 'wait';
  if (nodeId?.startsWith('condition')) return 'condition';
  if (nodeId === 'end-flow') return 'end';
  return 'action';
};

const FlowNode = ({ node, isSelected, showStats, onSelect, onDelete, needsConfig }) => {
  const type = getNodeType(node?.type);
  const colors = NODE_COLORS?.[type];
  const isCondition = type === 'condition';

  if (isCondition) {
    return (
      <div className="relative flex flex-col items-center" style={{ left: node?.x, top: node?.y, position: 'absolute' }}>
        <div onClick={() => onSelect(node)} className={`w-28 h-16 rotate-45 border-2 ${colors?.border} ${colors?.bg} cursor-pointer hover:shadow-md transition-shadow ${
          isSelected ? 'ring-2 ring-offset-2 ring-amber-400' : ''
        } ${needsConfig ? 'border-dashed border-amber-400' : ''}`}></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <Icon name={node?.icon || 'GitBranch'} size={14} className={colors?.icon} />
            <span className="text-xs font-medium text-foreground mt-0.5 text-center leading-tight max-w-20">{node?.label}</span>
          </div>
        </div>
        {showStats && node?.stats && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">{node?.stats}</div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(node)}
      style={{ left: node?.x, top: node?.y, position: 'absolute' }}
      className={`w-44 rounded-lg border-2 ${colors?.border} ${colors?.bg} cursor-pointer hover:shadow-md transition-all ${
        isSelected ? 'ring-2 ring-offset-2 ring-primary shadow-md' : ''
      } ${needsConfig ? 'border-dashed !border-amber-400' : ''} ${type === 'end' ? 'opacity-80' : ''}`}
    >
      <div className="flex items-center gap-2 p-3">
        <div className={`w-7 h-7 rounded-md ${colors?.badge} flex items-center justify-center flex-shrink-0`}>
          <Icon name={node?.icon || 'Circle'} size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-tight">{node?.label}</p>
          {node?.subtitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{node?.subtitle}</p>}
        </div>
        {needsConfig && (
          <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
            <Icon name="AlertCircle" size={10} className="text-white" />
          </div>
        )}
      </div>
      {showStats && node?.stats && (
        <div className={`px-3 pb-2 flex items-center gap-1`}>
          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${colors?.badge}`}>{node?.stats}</span>
        </div>
      )}
    </div>
  );
};

const FlowCanvas = ({ nodes, connections, selectedNode, onSelectNode, onDeleteNode, onDropNode, showStats, flowType }) => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    const nodeData = e?.dataTransfer?.getData('nodeData');
    if (!nodeData) return;
    const node = JSON.parse(nodeData);
    const rect = canvasRef?.current?.getBoundingClientRect();
    const x = (e?.clientX - rect?.left - pan?.x) / zoom - 88;
    const y = (e?.clientY - rect?.top - pan?.y) / zoom - 30;
    onDropNode({ ...node, x: Math.max(0, x), y: Math.max(0, y) });
  };

  const handleMouseDown = (e) => {
    if (e?.target === canvasRef?.current || e?.target?.classList?.contains('canvas-bg')) {
      setIsDraggingCanvas(true);
      setDragStart({ x: e?.clientX - pan?.x, y: e?.clientY - pan?.y });
      onSelectNode(null);
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingCanvas && dragStart) {
      setPan({ x: e?.clientX - dragStart?.x, y: e?.clientY - dragStart?.y });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDragStart(null);
  };

  const handleWheel = (e) => {
    e?.preventDefault();
    const delta = e?.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(2, Math.max(0.3, z * delta)));
  };

  const needsConfig = (node) => {
    return !node?.configured && node?.type !== 'end-flow';
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-muted/20"
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDraggingCanvas ? 'grabbing' : 'default' }}
    >
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full canvas-bg pointer-events-none" style={{ opacity: 0.4 }}>
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#94a3b8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Canvas content */}
      <div style={{ transform: `translate(${pan?.x}px, ${pan?.y}px) scale(${zoom})`, transformOrigin: '0 0', position: 'relative', width: '2000px', height: '2000px' }}>
        {/* SVG connections */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '2000px', height: '2000px', overflow: 'visible' }}>
          {connections?.map((conn, i) => {
            const from = nodes?.find(n => n?.id === conn?.from);
            const to = nodes?.find(n => n?.id === conn?.to);
            if (!from || !to) return null;
            const x1 = from.x + 88;
            const y1 = from.y + 40;
            const x2 = to?.x + 88;
            const y2 = to?.y;
            const cp1y = y1 + (y2 - y1) * 0.5;
            const cp2y = y2 - (y2 - y1) * 0.5;
            return (
              <g key={i}>
                <path d={`M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`}
                  stroke={conn?.label === 'Sí' || conn?.label === 'Visitó' ? '#22c55e' : conn?.label === 'No' || conn?.label === 'No visitó' ? '#ef4444' : '#94a3b8'}
                  strokeWidth="2" fill="none" strokeDasharray={conn?.dashed ? '6,4' : 'none'} />
                {conn?.label && (
                  <text x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2} fontSize="10" fill="#64748b" fontWeight="600">{conn?.label}</text>
                )}
                <polygon points={`${x2},${y2} ${x2-5},${y2-8} ${x2+5},${y2-8}`} fill="#94a3b8" />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes?.map(node => (
          <FlowNode
            key={node?.id}
            node={node}
            isSelected={selectedNode?.id === node?.id}
            showStats={showStats}
            onSelect={onSelectNode}
            onDelete={onDeleteNode}
            needsConfig={needsConfig(node)}
          />
        ))}

        {/* Empty state */}
        {nodes?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Icon name="GitBranch" size={28} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Arrastra nodos desde el panel izquierdo</p>
              <p className="text-sm text-muted-foreground mt-1">o selecciona un flow pre-armado</p>
            </div>
          </div>
        )}
      </div>
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button onClick={() => setZoom(z => Math.min(2, z * 1.2))} className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors shadow-sm">
          <Icon name="Plus" size={14} />
        </button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors shadow-sm text-xs font-medium">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors shadow-sm">
          <Icon name="Minus" size={14} />
        </button>
      </div>
      {/* Health score */}
      <div className="absolute top-4 right-4">
        <div className="w-14 h-14 rounded-full border-4 border-success bg-card flex flex-col items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-shadow">
          <span className="text-lg font-bold text-success">78</span>
          <span className="text-xs text-muted-foreground leading-none">salud</span>
        </div>
      </div>
    </div>
  );
};

export default FlowCanvas;
