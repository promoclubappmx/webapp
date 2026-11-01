import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const tagColors = [
  { id: 'violet', class: 'bg-violet-100 text-violet-700 border-violet-200' },
  { id: 'blue', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'green', class: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'yellow', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'orange', class: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'red', class: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'pink', class: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'cyan', class: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { id: 'emerald', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'amber', class: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'indigo', class: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'gray', class: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const colorDots = [
  'bg-violet-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-orange-500', 'bg-red-500', 'bg-pink-500', 'bg-cyan-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-gray-500',
];

const allAvailableTags = [
  { name: 'Fan del café', colorIdx: 2 },
  { name: 'Alérgico a nueces', colorIdx: 5 },
  { name: 'Cliente corporativo', colorIdx: 1 },
  { name: 'Cumpleaños en diciembre', colorIdx: 7 },
  { name: 'Influencer local', colorIdx: 6 },
  { name: 'Prefiere terraza', colorIdx: 3 },
  { name: 'Viene con niños', colorIdx: 9 },
  { name: 'Paga siempre en efectivo', colorIdx: 11 },
  { name: 'Amigo del dueño', colorIdx: 0 },
];

export default function TagsNotesTab({ clientTags = ['Fan del café', 'Influencer local', 'Amigo del dueño'] }) {
  const [tags, setTags] = useState(clientTags);
  const [tagInput, setTagInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([
    { id: 1, text: 'Le gusta su café sin azúcar, siempre pide lo mismo. Muy puntual en sus visitas.', author: 'Carlos (Admin)', date: 'Hace 3 días' },
    { id: 2, text: 'Contactar para evento del sábado — mencionó que le interesan los eventos especiales.', author: 'María (Staff)', date: 'Hace 1 semana' },
    { id: 3, text: 'Tuvo mala experiencia el 15/ene con el tiempo de espera. Se le ofreció disculpa y cupón de compensación.', author: 'Carlos (Admin)', date: 'Hace 3 semanas' },
  ]);
  const [hoveredNote, setHoveredNote] = useState(null);

  const handleTagInput = (val) => {
    setTagInput(val);
    if (val?.length > 0) {
      const sugg = allAvailableTags?.filter(t => 
        t?.name?.toLowerCase()?.includes(val?.toLowerCase()) && !tags?.includes(t?.name)
      );
      setSuggestions(sugg);
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tagName, colorIdx) => {
    if (tagName && !tags?.includes(tagName)) {
      setTags(prev => [...prev, tagName]);
    }
    setTagInput('');
    setSuggestions([]);
    setShowColorPicker(false);
  };

  const removeTag = (tagName) => {
    setTags(prev => prev?.filter(t => t !== tagName));
  };

  const handleTagKeyDown = (e) => {
    if (e?.key === 'Enter' && tagInput?.trim()) {
      const existing = allAvailableTags?.find(t => t?.name?.toLowerCase() === tagInput?.toLowerCase());
      if (existing) {
        addTag(existing?.name, existing?.colorIdx);
      } else {
        setShowColorPicker(true);
      }
    }
  };

  const addNote = () => {
    if (noteText?.trim()) {
      setNotes(prev => [{
        id: Date.now(),
        text: noteText?.trim(),
        author: 'Tú (Admin)',
        date: 'Ahora'
      }, ...prev]);
      setNoteText('');
    }
  };

  const deleteNote = (id) => {
    setNotes(prev => prev?.filter(n => n?.id !== id));
  };

  const getTagColor = (tagName) => {
    const found = allAvailableTags?.find(t => t?.name === tagName);
    return found ? tagColors?.[found?.colorIdx]?.class : tagColors?.[0]?.class;
  };

  return (
    <div className="space-y-6">
      {/* Tags Section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Tags</h4>
        {tags?.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-xl">
            <Icon name="Tag" size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Sin tags. Agrega tags para organizar y segmentar a este cliente.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags?.map(tag => (
              <span key={tag} className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-medium ${getTagColor(tag)}`}>
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:opacity-70 transition-opacity">
                  <Icon name="X" size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={tagInput}
                onChange={e => handleTagInput(e?.target?.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Agregar tag (Enter para crear nuevo)"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {suggestions?.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  {suggestions?.map(s => (
                    <button
                      key={s?.name}
                      onClick={() => addTag(s?.name, s?.colorIdx)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <span className={`w-2 h-2 rounded-full ${colorDots?.[s?.colorIdx]}`} />
                      {s?.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {showColorPicker && (
            <div className="mt-2 p-3 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground mb-2">Elige un color para el nuevo tag <strong>"{tagInput}"</strong>:</p>
              <div className="flex gap-2 flex-wrap mb-3">
                {colorDots?.map((dot, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColorIdx(i)}
                    className={`w-5 h-5 rounded-full ${dot} ${ selectedColorIdx === i ? 'ring-2 ring-offset-1 ring-primary' : '' }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowColorPicker(false); setTagInput(''); }} className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted">Cancelar</button>
                <button onClick={() => addTag(tagInput, selectedColorIdx)} className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg">Crear tag</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Notes Section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Notas internas</h4>
        <div className="flex gap-2 mb-4">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e?.target?.value?.slice(0, 500))}
            placeholder="Agregar nota interna (solo visible para el staff)..."
            rows={2}
            className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <button
            onClick={addNote}
            disabled={!noteText?.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium self-end disabled:opacity-50 hover:bg-primary/90 transition-all"
          >
            Agregar
          </button>
        </div>
        <div className="text-xs text-muted-foreground text-right mb-3">{noteText?.length}/500</div>

        <div className="space-y-3">
          {notes?.map(note => (
            <div
              key={note?.id}
              className="relative bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors"
              onMouseEnter={() => setHoveredNote(note?.id)}
              onMouseLeave={() => setHoveredNote(null)}
            >
              <p className="text-sm text-foreground mb-2">{note?.text}</p>
              <p className="text-xs text-muted-foreground">— {note?.author}, {note?.date}</p>
              {hoveredNote === note?.id && (
                <button
                  onClick={() => deleteNote(note?.id)}
                  className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              )}
            </div>
          ))}
          {notes?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="StickyNote" size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sin notas. Agrega notas internas sobre este cliente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
