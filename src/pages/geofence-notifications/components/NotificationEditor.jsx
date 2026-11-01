import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const EMOJIS = ['🍕', '🎉', '🛍️', '☕', '🎟️', '💰'];

const VARIABLES = ['[Nombre Negocio]', '[Nombre Cliente]', '[Promo Activa]'];

const PhoneMockup = ({ platform, title, body, ctaText }) => {
  const displayTitle = title?.replace('[Nombre Negocio]', 'Café Central')?.replace('[Nombre Cliente]', 'Carlos')?.replace('[Promo Activa]', '2x1 en Hamburguesas') || '¡Hola! Estás cerca de Café Central';
  const displayBody = body?.replace('[Nombre Negocio]', 'Café Central')?.replace('[Nombre Cliente]', 'Carlos')?.replace('[Promo Activa]', '2x1 en Hamburguesas') || 'Tenemos una oferta especial para ti hoy 🎁';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-gray-800">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-10" />
        {/* Screen */}
        <div
          className="rounded-[2rem] overflow-hidden"
          style={{
            background: platform === 'ios' ?'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' :'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)',
            minHeight: '420px',
          }}
        >
          {/* Status bar */}
          <div className="flex justify-between items-center px-5 pt-8 pb-2">
            <span className="text-white text-xs font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <Icon name="Signal" size={12} className="text-white" />
              <Icon name="Wifi" size={12} className="text-white" />
              <Icon name="Battery" size={12} className="text-white" />
            </div>
          </div>

          {/* Lock screen time */}
          <div className="text-center py-4">
            <p className="text-white/60 text-xs">Miércoles, 11 de marzo</p>
            <p className="text-white text-5xl font-thin mt-1">9:41</p>
          </div>

          {/* Notification card */}
          <div className="mx-3 mt-2">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Store" size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs font-medium">PromoClub · ahora</span>
                  </div>
                  <p className="text-white text-xs font-semibold mt-0.5 leading-tight">{displayTitle}</p>
                  <p className="text-white/80 text-xs mt-0.5 leading-tight">{displayBody}</p>
                  {ctaText && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <span className="text-blue-300 text-xs font-medium">{ctaText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationEditor = ({ type, title, setTitle, body, setBody, ctaText, setCtaText, showCta }) => {
  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  const insertVariable = (variable, field) => {
    if (field === 'title') {
      const pos = titleRef?.current?.selectionStart || title?.length;
      const newVal = title?.slice(0, pos) + variable + title?.slice(pos);
      if (newVal?.length <= 50) setTitle(newVal);
    } else {
      const pos = bodyRef?.current?.selectionStart || body?.length;
      const newVal = body?.slice(0, pos) + variable + body?.slice(pos);
      if (newVal?.length <= 120) setBody(newVal);
    }
  };

  const insertEmoji = (emoji) => {
    if (body?.length + emoji?.length <= 120) setBody(body + emoji);
  };

  const titlePlaceholder = type === 'welcome' ?'¡Hola! Estás cerca de [Nombre Negocio]' :'¿Ya te vas? Vuelve pronto 👋';
  const bodyPlaceholder = type === 'welcome' ?'Tenemos una oferta especial para ti hoy 🎁' :'Te dejamos un cupón para tu próxima visita';

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-foreground">Título</label>
          <span className="text-xs font-mono text-muted-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {title?.length}/50
          </span>
        </div>
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={e => e?.target?.value?.length <= 50 && setTitle(e?.target?.value)}
          placeholder={titlePlaceholder}
          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {VARIABLES?.map(v => (
            <button
              key={v}
              onClick={() => insertVariable(v, 'title')}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-foreground">Cuerpo</label>
          <span className="text-xs font-mono text-muted-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {body?.length}/120
          </span>
        </div>
        <textarea
          ref={bodyRef}
          value={body}
          onChange={e => e?.target?.value?.length <= 120 && setBody(e?.target?.value)}
          placeholder={bodyPlaceholder}
          rows={3}
          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {VARIABLES?.map(v => (
            <button
              key={v}
              onClick={() => insertVariable(v, 'body')}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
        {/* Emoji row */}
        <div className="flex gap-2 mt-2">
          {EMOJIS?.map(e => (
            <button
              key={e}
              onClick={() => insertEmoji(e)}
              className="text-lg hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      {/* CTA */}
      {showCta && setCtaText && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-foreground">Texto del botón CTA</label>
            <span className="text-xs font-mono text-muted-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {ctaText?.length}/20
            </span>
          </div>
          <input
            type="text"
            value={ctaText}
            onChange={e => e?.target?.value?.length <= 20 && setCtaText(e?.target?.value)}
            placeholder="Ver cupón"
            className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}
    </div>
  );
};

export { NotificationEditor, PhoneMockup };
export default NotificationEditor;
