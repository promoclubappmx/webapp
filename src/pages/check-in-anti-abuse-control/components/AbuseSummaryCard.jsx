import React from 'react';
import Icon from '../../../components/AppIcon';

const AbuseSummaryCard = ({ summary }) => (
  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon name="FileText" size={18} className="text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-1.5">Resumen de configuración actual</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
      </div>
    </div>
  </div>
);

export default AbuseSummaryCard;
