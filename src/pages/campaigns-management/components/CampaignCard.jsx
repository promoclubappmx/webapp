import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const CampaignCard = ({ campaign, isSelected, onSelect, onEdit, onDelete, onDuplicate, onViewAnalytics, onToggleActivation, onPreview, viewMode = 'grid' }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef?.current && !menuRef?.current?.contains(e?.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'scheduled': return 'bg-warning/10 text-warning';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'completed': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'scheduled': return 'Programada';
      case 'draft': return 'Borrador';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'seasonal': return 'Estacional';
      case 'event': return 'Evento';
      case 'product_launch': return 'Lanzamiento';
      case 'loyalty': return 'Fidelización';
      case 'adquisicion': return 'Adquisición';
      case 'reactivacion': return 'Reactivación';
      case 'upsell': return 'Upsell';
      default: return type;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return 'Mail';
      case 'social': return 'Share2';
      case 'sms': return 'MessageSquare';
      case 'push': return 'Bell';
      default: return 'Globe';
    }
  };

  const budgetProgress = campaign?.budget > 0 ? (campaign?.spent / campaign?.budget) * 100 : 0;

  const handleDuplicar = () => {
    setMenuAbierto(false);
    onDuplicate?.(campaign);
  };

  if (viewMode === 'table') {
    return (
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <Checkbox checked={isSelected} onCheckedChange={() => onSelect(campaign?.id)} />
          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
            <div className="col-span-2">
              <h3 className="font-medium text-foreground">{campaign?.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{campaign?.description}</p>
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign?.status)}`}>
                {getStatusLabel(campaign?.status)}
              </span>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Presupuesto</p>
              <p className="font-medium text-foreground">€{campaign?.budget?.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => onViewAnalytics?.(campaign)} iconName="BarChart3" iconSize={16} title="Analíticas" />
              <Button variant="ghost" size="sm" onClick={() => onToggleActivation?.(campaign)} iconName={campaign?.status === 'active' ? 'Pause' : 'Play'} iconSize={16} title={campaign?.status === 'active' ? 'Pausar' : 'Activar'} />
              <Button variant="ghost" size="sm" onClick={() => onPreview?.(campaign)} iconName="Eye" iconSize={16} title="Vista Previa" />
              <Button variant="ghost" size="sm" onClick={() => onEdit(campaign)} iconName="Edit" iconSize={16} />
              {/* Menú ... */}
              <div className="relative" ref={menuRef}>
                <Button variant="ghost" size="sm" onClick={() => setMenuAbierto(v => !v)} iconName="MoreHorizontal" iconSize={16} />
                {menuAbierto && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-20">
                    <button
                      onClick={handleDuplicar}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-lg"
                    >
                      <Icon name="Copy" size={14} />
                      Duplicar campaña
                    </button>
                    <button
                      onClick={() => { setMenuAbierto(false); onDelete(campaign?.id); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                    >
                      <Icon name="Trash2" size={14} />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        {campaign?.imageUrl && (
          <img src={campaign?.imageUrl} alt={campaign?.name} className="w-full h-48 object-cover" />
        )}
        <div className="absolute top-3 left-3">
          <Checkbox checked={isSelected} onCheckedChange={() => onSelect(campaign?.id)} className="bg-white shadow-lg" />
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign?.status)} backdrop-blur-sm`}>
            {getStatusLabel(campaign?.status)}
          </span>
          {/* Menú ... */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuAbierto(v => !v)}
              className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <Icon name="MoreHorizontal" size={14} className="text-foreground" />
            </button>
            {menuAbierto && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-20">
                <button
                  onClick={handleDuplicar}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg"
                >
                  <Icon name="Copy" size={14} className="text-primary" />
                  Duplicar campaña
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={() => { setMenuAbierto(false); onDelete(campaign?.id); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-b-lg"
                >
                  <Icon name="Trash2" size={14} />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">{campaign?.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{campaign?.description}</p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tipo:</span>
            <span className="font-medium text-foreground">{getTypeLabel(campaign?.type)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Canales:</span>
            <div className="flex items-center gap-1">
              {campaign?.channels?.map(channel => (
                <div key={channel} className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center" title={channel}>
                  <Icon name={getChannelIcon(channel)} size={12} className="text-primary" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fechas:</span>
            <span className="font-medium text-foreground">
              {new Date(campaign?.startDate)?.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {new Date(campaign?.endDate)?.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Presupuesto:</span>
              <span className="font-medium text-foreground">
                €{campaign?.spent?.toLocaleString()} / €{campaign?.budget?.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(budgetProgress, 100)}%` }} />
            </div>
          </div>

          {campaign?.status === 'active' && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Impresiones</p>
                <p className="text-sm font-semibold text-foreground">{campaign?.metrics?.impressions?.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Clics</p>
                <p className="text-sm font-semibold text-foreground">{campaign?.metrics?.clicks?.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className="text-sm font-semibold text-success">{campaign?.metrics?.roi}x</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => onViewAnalytics?.(campaign)} iconName="BarChart3" iconSize={14} title="Ver Analíticas">
            Analíticas
          </Button>
          <Button
            variant={campaign?.status === 'active' ? 'outline' : 'default'}
            size="sm"
            onClick={() => onToggleActivation?.(campaign)}
            iconName={campaign?.status === 'active' ? 'Pause' : 'Play'}
            iconSize={14}
            title={campaign?.status === 'active' ? 'Pausar' : 'Activar'}
          />
          <Button variant="ghost" size="sm" onClick={() => onPreview?.(campaign)} iconName="Eye" iconSize={14} title="Vista Previa" />
          <Button variant="ghost" size="sm" onClick={() => onEdit(campaign)} iconName="Edit" iconSize={14} />
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;