import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TRIGGER_LABELS = {
  checkin: { label: 'Check-in verificado', icon: 'ScanLine', color: 'bg-blue-100 text-blue-700' },
  coupon_redeem: { label: 'Canje: Café gratis', icon: 'Ticket', color: 'bg-purple-100 text-purple-700' },
  order_completed: { label: 'Pedido #0042', icon: 'ShoppingBag', color: 'bg-indigo-100 text-indigo-700' },
  reservation_completed: { label: 'Reservación', icon: 'Calendar', color: 'bg-teal-100 text-teal-700' },
  geofence_visit: { label: 'Visita geofence', icon: 'MapPin', color: 'bg-orange-100 text-orange-700' },
};

const LEVEL_COLORS = {
  Bronce: 'bg-amber-100 text-amber-700',
  Plata: 'bg-slate-100 text-slate-600',
  Oro: 'bg-yellow-100 text-yellow-700',
};

const AI_SUGGESTIONS = [
  "Muchas gracias por tu reseña. Nos alegra saber que disfrutaste tu visita. Esperamos verte pronto.",
  "Agradecemos tu comentario. Tu opinión nos ayuda a mejorar cada día. ¡Hasta pronto!",
  "Gracias por tomarte el tiempo de compartir tu experiencia. Trabajamos constantemente para ofrecerte lo mejor.",
];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5]?.map(s => (
      <Icon key={s} name="Star" size={14} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'} />
    ))}
  </div>
);

const ReviewCard = ({ review, onReplySubmit, onReport }) => {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(null);
  const [localReply, setLocalReply] = useState(review?.reply || null);
  const [editingReply, setEditingReply] = useState(false);
  const [toast, setToast] = useState(null);

  const trigger = TRIGGER_LABELS?.[review?.trigger_type] || TRIGGER_LABELS?.checkin;
  const tags = Array.isArray(review?.tags) ? review?.tags : (typeof review?.tags === 'string' ? JSON.parse(review?.tags || '[]') : []);
  const photos = Array.isArray(review?.photos) ? review?.photos : [];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePublishReply = () => {
    if (!replyText?.trim()) return;
    const newReply = { content: replyText, published_at: new Date()?.toISOString() };
    setLocalReply(newReply);
    setExpanded(false);
    setEditingReply(false);
    setReplyText('');
    setShowAISuggestions(false);
    onReplySubmit?.(review?.id, replyText);
    showToast('Respuesta publicada correctamente');
  };

  const handleReport = () => {
    if (!reportReason) return;
    onReport?.(review?.id, reportReason, reportDesc);
    setShowReportModal(false);
    setReportReason('');
    setReportDesc('');
    showToast('Reporte enviado. El equipo de PromoClub lo revisará en 48 horas.');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d?.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusBadge = review?.review_status === 'reported'
    ? <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1"><Icon name="Flag" size={11} />Reportada</span>
    : localReply
    ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1"><Icon name="CheckCircle" size={11} />Respondida</span>
    : <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1"><Icon name="Clock" size={11} />Sin responder</span>;

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-5 py-3 rounded-2xl text-sm font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
      <div className={`bg-card border rounded-2xl overflow-hidden transition-all ${review?.review_status === 'reported' ? 'border-red-200' : 'border-border'}`}>
        <div className="p-5">
          {/* Row 1: Identity */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{review?.customer_name?.[0] || 'C'}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{review?.customer_name || 'Cliente'}</span>
                  {review?.customer_level && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${LEVEL_COLORS?.[review?.customer_level] || LEVEL_COLORS?.Bronce}`}>
                      {review?.customer_level}
                    </span>
                  )}
                  <StarRating rating={review?.rating} />
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">{formatDate(review?.created_at)}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${trigger?.color}`}>
                    <Icon name={trigger?.icon} size={11} />
                    {trigger?.label}
                  </span>
                  {statusBadge}
                </div>
              </div>
            </div>

            {/* Actions menu */}
            <div className="relative flex-shrink-0">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                <Icon name="MoreHorizontal" size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                  <button onClick={() => { navigator.clipboard?.writeText(review?.comment || ''); setShowMenu(false); showToast('Texto copiado'); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 flex items-center gap-2 text-foreground">
                    <Icon name="Copy" size={14} />Copiar texto
                  </button>
                  <button onClick={() => { setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 flex items-center gap-2 text-foreground">
                    <Icon name="User" size={14} />Ver perfil en CRM
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Content */}
          <div className="mb-3">
            <p className="text-sm text-foreground leading-relaxed">{review?.comment}</p>
            {photos?.length > 0 && (
              <div className="flex gap-2 mt-2">
                {photos?.map((photo, i) => (
                  <button key={i} onClick={() => setShowPhotoModal(photo)} className="w-20 h-20 rounded-xl overflow-hidden border border-border hover:opacity-80 transition-opacity">
                    <img src={photo} alt={`Foto de reseña ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags?.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-muted/50 text-xs text-muted-foreground rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Existing reply */}
          {localReply && !editingReply && (
            <div className="mb-3 p-3 rounded-xl" style={{ background: '#F5F6FA' }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="MessageSquare" size={12} />
                  <span className="font-medium">Respuesta del negocio</span>
                  <span>· {formatDate(localReply?.published_at)}</span>
                </div>
                <button onClick={() => { setEditingReply(true); setExpanded(true); setReplyText(localReply?.content); }} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Icon name="Pencil" size={11} />Editar
                </button>
              </div>
              <p className="text-sm text-foreground">{localReply?.content}</p>
            </div>
          )}

          {/* Row 4: Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setExpanded(!expanded); setEditingReply(false); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Icon name={localReply && !editingReply ? 'Eye' : 'MessageSquare'} size={13} />
              {localReply && !editingReply ? 'Ver respuesta' : 'Responder'}
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-medium text-muted-foreground hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <Icon name="Flag" size={13} />Reportar
            </button>
          </div>
        </div>

        {/* Inline reply panel */}
        {expanded && (
          <div className="border-t border-border p-5 bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Eye" size={15} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Tu respuesta pública</span>
              <span className="text-xs text-muted-foreground">· Visible para todos los clientes en la ficha</span>
            </div>

            <div className="relative mb-3">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e?.target?.value?.slice(0, 400))}
                placeholder="Agradece o responde de forma profesional..."
                rows={3}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <span className="absolute bottom-3 right-3 text-xs text-muted-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {replyText?.length}/400
              </span>
            </div>

            {/* AI suggestions */}
            <button
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className="flex items-center gap-1.5 px-3 py-2 border border-primary/30 text-primary rounded-xl text-xs font-medium hover:bg-primary/5 transition-colors mb-3"
            >
              <span>✨</span> Sugerir respuesta
            </button>

            {showAISuggestions && (
              <div className="space-y-2 mb-3">
                {AI_SUGGESTIONS?.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setReplyText(s); setShowAISuggestions(false); }}
                    className="w-full text-left p-3 bg-card border border-primary/20 rounded-xl text-xs text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handlePublishReply}
                disabled={!replyText?.trim()}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publicar respuesta
              </button>
              <button
                onClick={() => { setExpanded(false); setReplyText(''); setShowAISuggestions(false); setEditingReply(false); }}
                className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Report modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Reportar reseña</h3>
              <button onClick={() => setShowReportModal(false)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground">
                <Icon name="X" size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Si crees que esta reseña no cumple con los estándares de PromoClub, puedes reportarla para revisión.
            </p>
            <div className="space-y-2 mb-4">
              {[
                'No es un cliente real de mi negocio',
                'Contiene información falsa o engañosa',
                'Lenguaje ofensivo o inapropiado',
                'Es spam o publicidad de competencia',
                'Contiene datos personales o privados',
                'Otro motivo',
              ]?.map(reason => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="report_reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{reason}</span>
                </label>
              ))}
            </div>
            {reportReason === 'Otro motivo' && (
              <textarea
                value={reportDesc}
                onChange={e => setReportDesc(e?.target?.value)}
                placeholder="Describe el problema (opcional)"
                rows={3}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-4"
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Enviar reporte
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 border border-border rounded-xl font-medium text-sm hover:bg-muted/50 transition-colors text-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Photo modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowPhotoModal(null)}>
          <img src={showPhotoModal} alt="Foto de reseña ampliada" className="max-w-full max-h-full rounded-2xl" />
        </div>
      )}
    </>
  );
};

export default ReviewCard;
