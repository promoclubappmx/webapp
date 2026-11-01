import React from 'react';
import Icon from '../../../components/AppIcon';

const PERSONAS = [
  {
    id: 'new',
    name: 'Ana García',
    type: 'Nuevo cliente',
    icon: 'UserPlus',
    color: 'from-emerald-500 to-teal-600',
    avatar: 'AG',
    age: 28,
    visits: 0,
    lastVisit: null,
    points: 0,
    level: 'Nuevo',
    tags: ['Primer registro', 'Sin historial'],
    desc: 'Se registró hace 2 horas, nunca ha visitado',
  },
  {
    id: 'dormant',
    name: 'Carlos Mendoza',
    type: 'Cliente dormido 30d',
    icon: 'UserX',
    color: 'from-orange-500 to-red-500',
    avatar: 'CM',
    age: 35,
    visits: 8,
    lastVisit: '30 días',
    points: 240,
    level: 'Bronce',
    tags: ['Inactivo 30d', 'Ex-frecuente'],
    desc: 'Visitó 8 veces, última visita hace 30 días',
  },
  {
    id: 'vip',
    name: 'María López',
    type: 'Cliente VIP',
    icon: 'Crown',
    color: 'from-amber-500 to-yellow-600',
    avatar: 'ML',
    age: 42,
    visits: 47,
    lastVisit: '3 días',
    points: 1840,
    level: 'Oro',
    tags: ['VIP', 'Alta frecuencia', 'Referidor'],
    desc: '47 visitas, nivel Oro, última visita hace 3 días',
  },
  {
    id: 'birthday',
    name: 'Roberto Sánchez',
    type: 'Cumpleañero',
    icon: 'Cake',
    color: 'from-pink-500 to-rose-600',
    avatar: 'RS',
    age: 31,
    visits: 15,
    lastVisit: '7 días',
    points: 580,
    level: 'Plata',
    tags: ['Cumpleaños en 3 días', 'Cliente regular'],
    desc: 'Cumpleaños en 3 días, cliente regular con 15 visitas',
  },
];

const PersonaSelector = ({ selectedPersona, onSelect, disabled }) => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden">
    <div className="px-4 py-3 border-b border-border">
      <p className="text-sm font-semibold text-foreground">Perfil de usuario simulado</p>
      <p className="text-xs text-muted-foreground">Elige quién recorrerá el flow</p>
    </div>
    <div className="p-3 space-y-2">
      {PERSONAS?.map(p => (
        <button
          key={p?.id}
          onClick={() => !disabled && onSelect(p)}
          disabled={disabled}
          className={`w-full text-left p-3 rounded-xl border transition-all ${
            selectedPersona?.id === p?.id
              ? 'border-primary bg-primary/5'
              : disabled
              ? 'border-border opacity-60 cursor-not-allowed' :'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p?.color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-xs font-bold text-white">{p?.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{p?.name}</p>
                {selectedPersona?.id === p?.id && <Icon name="Check" size={14} className="text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">{p?.desc}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {p?.tags?.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">{tag}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default PersonaSelector;
