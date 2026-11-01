import React, { useState, useRef, useCallback, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const NODE_TYPE_CONFIG = {
  trigger: { border: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', iconBg: 'bg-emerald-500', badge: 'bg-emerald-500', label: 'Trigger' },
  action: { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', iconBg: 'bg-blue-500', badge: 'bg-blue-500', label: 'Acción' },
  wait: { border: 'border-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/30', iconBg: 'bg-gray-400', badge: 'bg-gray-400', label: 'Espera' },
  condition: { border: 'border-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', iconBg: 'bg-amber-500', badge: 'bg-amber-500', label: 'Condición' },
  end: { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-950/30', iconBg: 'bg-red-500', badge: 'bg-red-500', label: 'Fin' },
};

const getNodeCategory = (nodeType) => {
  if (['user-register','first-visit','inactivity','vip-proximity','birthday','weather','low-checkins','geofence-enter','geofence-exit','review','survey']?.includes(nodeType)) return 'trigger';
  if (['wait-time','wait-action']?.includes(nodeType)) return 'wait';
  if (['condition-yesno','condition-multi']?.includes(nodeType)) return 'condition';
  if (nodeType === 'end-flow') return 'end';
  return 'action';
};

const STAT_BADGE_COLORS = {
  trigger: 'bg-emerald-500',
  action: 'bg-blue-500',
  wait: 'bg-gray-400',
  condition: 'bg-amber-500',
  end: 'bg-red-500',
};

const FlowNode = ({ node, isSelected, showStats, showLive, onSelect, needsConfig }) => {
  const [showStatPopover, setShowStatPopover] = useState(false);
  const category = getNodeCategory(node?.type);
  const config = NODE_TYPE_CONFIG?.[category];
  const isCondition = category === 'condition';
  const isLive = showLive && node?.liveUsers > 0;

  if (isCondition) {
    return (
      <div
        style={{ left: node?.x, top: node?.y, position: 'absolute', width: 120, height: 80 }}
        className="flex items-center justify-center cursor-pointer"
        onClick={() => onSelect(node)}
      >
        <div className={`w-24 h-14 rotate-45 border-2 ${config?.border} ${config?.bg} transition-all ${
          isSelected ? 'ring-2 ring-offset-2 ring-amber-400 shadow-lg' : 'hover:shadow-md'
        } ${needsConfig ? '!border-dashed !border-amber-400' : ''} ${isLive ? 'shadow-amber-400/50 shadow-lg' : ''}`}></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <Icon name={node?.icon || 'GitBranch'} size={13} className={`${config?.iconBg?.replace('bg-', 'text-')} text-white`} />
            <span className="text-xs font-medium text-foreground mt-0.5 text-center leading-tight max-w-16 px-1">{node?.label}</span>
          </div>
        </div>
        {showStats && node?.stats && (
          <div
            className="absolute -top-7 left-1/2 -translate-x-1/2 cursor-pointer"
            onMouseEnter={() => setShowStatPopover(true)}
            onMouseLeave={() => setShowStatPopover(false)}
          >
            <span className={`text-xs px-2 py-0.5 rounded-full text-white whitespace-nowrap ${STAT_BADGE_COLORS?.[category]}`}>{node?.stats}</span>
            {showStatPopover && <StatPopover node={node} />}
          </div>
        )}
        {isLive && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(node)}
      style={{ left: node?.x, top: node?.y, position: 'absolute', width: 176 }}
      className={`rounded-xl border-2 ${config?.border} ${config?.bg} cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-offset-2 ring-primary shadow-lg' : 'hover:shadow-md'
      } ${needsConfig ? '!border-dashed !border-amber-400' : ''} ${isLive ? 'shadow-emerald-400/40 shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-2 p-3">
        <div className={`w-7 h-7 rounded-md ${config?.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon name={node?.icon || 'Circle'} size={13} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-tight">{node?.label}</p>
          {node?.subtitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{node?.subtitle}</p>}
        </div>
        {needsConfig && (
          <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
            <Icon name="AlertCircle" size={9} className="text-white" />
          </div>
        )}
        {isLive && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"></div>}
      </div>
      {showStats && node?.stats && (
        <div
          className="px-3 pb-2 relative"
          onMouseEnter={() => setShowStatPopover(true)}
          onMouseLeave={() => setShowStatPopover(false)}
        >
          <span className={`text-xs px-2 py-0.5 rounded-full text-white cursor-pointer ${STAT_BADGE_COLORS?.[category]}`}>{node?.stats}</span>
          {showStatPopover && <StatPopover node={node} />}
        </div>
      )}
    </div>
  );
};

const StatPopover = ({ node }) => (
  <div className="absolute bottom-full left-0 mb-2 w-56 bg-popover border border-border rounded-lg shadow-xl p-3 z-50">
    <p className="text-xs font-semibold text-foreground mb-2">{node?.label}</p>
    <div className="space-y-1.5">
      {node?.statDetails?.map((d, i) => (
        <div key={i} className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{d?.label}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-foreground">{d?.value}</span>
            {d?.trend && (
              <Icon name={d?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={10}
                className={d?.trend === 'up' ? 'text-emerald-500' : 'text-red-500'} />
            )}
          </div>
        </div>
      ))}
    </div>
    {node?.benchmark && (
      <div className="mt-2 pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">{node?.benchmark}</p>
      </div>
    )}
  </div>
);

const ConnectionLine = ({ from, to, nodes, label, dashed }) => {
  const fromNode = nodes?.find(n => n?.id === from);
  const toNode = nodes?.find(n => n?.id === to);
  if (!fromNode || !toNode) return null;

  const fromCat = getNodeCategory(fromNode?.type);
  const toCat = getNodeCategory(toNode?.type);
  const isCondition = fromCat === 'condition';

  const x1 = fromNode?.x + (isCondition ? 60 : 88);
  const y1 = fromNode?.y + (isCondition ? 80 : 52);
  const x2 = toNode?.x + (getNodeCategory(toNode?.type) === 'condition' ? 60 : 88);
  const y2 = toNode?.y;

  const midY = (y1 + y2) / 2;
  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  const strokeColor = label === 'Visitó' || label === 'Canjeó' || label === 'Se registró' || label === '9-10' ? '#10b981'
    : label === 'No visitó' || label === 'No canjeó' || label === '1-6' ? '#ef4444'
    : label === '7-8'? '#f59e0b' :'#94a3b8';

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray={dashed ? '6,4' : 'none'}
        markerEnd="url(#arrowhead)"
        opacity={0.8}
      />
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 6}
          textAnchor="middle"
          fontSize="10"
          fill={strokeColor}
          fontWeight="600"
          className="select-none"
        >
          {label}
        </text>
      )}
    </g>
  );
};

const VFECanvas = ({ nodes, connections, selectedNode, onSelectNode, onDeleteNode, onDropNode, showStats, showLive }) => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = useCallback((e) => {
    e?.preventDefault();
    const nodeData = e?.dataTransfer?.getData('nodeData');
    if (!nodeData) return;
    const node = JSON.parse(nodeData);
    const rect = canvasRef?.current?.getBoundingClientRect();
    const x = (e?.clientX - rect?.left - pan?.x) / zoom - 88;
    const y = (e?.clientY - rect?.top - pan?.y) / zoom - 30;
    onDropNode({ ...node, x: Math.max(20, x), y: Math.max(20, y) });
  }, [pan, zoom, onDropNode]);

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

  const handleWheel = useCallback((e) => {
    e?.preventDefault();
    const delta = e?.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(2.5, Math.max(0.25, z * delta)));
  }, []);

  useEffect(() => {
    const el = canvasRef?.current;
    if (el) el?.addEventListener('wheel', handleWheel, { passive: false });
    return () => { if (el) el?.removeEventListener('wheel', handleWheel); };
  }, [handleWheel]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e?.key === 'Delete' || e?.key === 'Backspace') && selectedNode && e?.target?.tagName !== 'INPUT' && e?.target?.tagName !== 'TEXTAREA') {
        onDeleteNode(selectedNode?.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, onDeleteNode]);

  const handleFitView = () => {
    setPan({ x: 60, y: 40 });
    setZoom(1);
  };

  const needsConfig = (node) => !node?.configured && node?.type !== 'end-flow';

  return (
    <div
      className="flex-1 relative overflow-hidden"
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDraggingCanvas ? 'grabbing' : 'default', background: showStats ? '#f8fafc' : undefined }}
    >
      {/* Dot grid background */}
      <svg className="absolute inset-0 w-full h-full canvas-bg pointer-events-none" style={{ opacity: showStats ? 0.2 : 0.4 }}>
        <defs>
          <pattern id="vfe-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#94a3b8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vfe-grid)" />
      </svg>
      {/* Canvas content */}
      <div
        style={{
          transform: `translate(${pan?.x}px, ${pan?.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'relative',
          width: '2400px',
          height: '2400px',
        }}
      >
        {/* SVG connections layer */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>
          {connections?.map((conn, i) => (
            <ConnectionLine key={i} from={conn?.from} to={conn?.to} nodes={nodes} label={conn?.label} dashed={conn?.dashed} />
          ))}
        </svg>

        {/* Nodes */}
        {nodes?.map(node => (
          <FlowNode
            key={node?.id}
            node={node}
            isSelected={selectedNode?.id === node?.id}
            showStats={showStats}
            showLive={showLive}
            onSelect={onSelectNode}
            needsConfig={needsConfig(node)}
          />
        ))}
      </div>
      {/* Canvas controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
        <button onClick={() => setZoom(z => Math.min(2.5, z * 1.2))}
          className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors shadow-sm">
          <Icon name="Plus" size={14} className="text-foreground" />
        </button>
        <button onClick={() => setZoom(z => Math.max(0.25, z * 0.8))}
          className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors shadow-sm">
          <Icon name="Minus" size={14} className="text-foreground" />
        </button>
        <button onClick={handleFitView}
          className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors shadow-sm" title="Ajustar vista">
          <Icon name="Maximize2" size={14} className="text-foreground" />
        </button>
      </div>
      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-md px-2 py-1 text-xs text-muted-foreground shadow-sm">
        {Math.round(zoom * 100)}%
      </div>
      {/* Empty state */}
      {nodes?.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="GitBranch" size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Arrastra nodos desde el panel izquierdo</p>
            <p className="text-xs text-muted-foreground mt-1">o selecciona un flow pre-armado</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VFECanvas;
