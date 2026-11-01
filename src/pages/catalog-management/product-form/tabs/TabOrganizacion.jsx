import React from 'react';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';

const TabOrganizacion = ({ formData, errors, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Categorías (jerárquicas, 2 niveles)
        </label>
        <p className="text-xs text-muted-foreground mb-4">
          Nivel 1: Alimentos | Bebidas | Servicios | Moda | Belleza...<br />
          Nivel 2: Postres | Café | Corte de cabello...
        </p>
        <select
          multiple
          value={formData?.categories}
          onChange={(e) => {
            const selected = Array.from(e?.target?.selectedOptions, option => option?.value);
            onChange('categories', selected);
          }}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          size={5}
        >
          <option value="alimentos">Alimentos</option>
          <option value="alimentos-postres">  └─ Postres</option>
          <option value="bebidas">Bebidas</option>
          <option value="bebidas-cafe">  └─ Café</option>
          <option value="servicios">Servicios</option>
          <option value="servicios-corte">  └─ Corte de cabello</option>
        </select>
        <p className="text-xs text-muted-foreground mt-2">
          Mantén presionado Ctrl/Cmd para seleccionar múltiples categorías
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Categorías internas del negocio
        </label>
        <p className="text-xs text-muted-foreground mb-4">
          Personalizadas: "Menú del día", "Temporada verano", "Más vendidos"
        </p>
        <select
          multiple
          value={formData?.internalCategories}
          onChange={(e) => {
            const selected = Array.from(e?.target?.selectedOptions, option => option?.value);
            onChange('internalCategories', selected);
          }}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          size={4}
        >
          <option value="menu-dia">Menú del día</option>
          <option value="temporada-verano">Temporada verano</option>
          <option value="mas-vendidos">Más vendidos</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Etiquetas (tags libres)
        </label>
        <p className="text-xs text-muted-foreground mb-4">
          vegano, sin-azúcar, oferta-semana, favorito-local
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData?.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => {
                  const newTags = formData?.tags?.filter((_, i) => i !== index);
                  onChange('tags', newTags);
                }}
                className="hover:text-primary/70"
              >
                <Icon name="X" size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe una etiqueta y presiona Enter"
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            onKeyDown={(e) => {
              if (e?.key === 'Enter' && e?.target?.value?.trim()) {
                e?.preventDefault();
                const newTags = [...(formData?.tags || []), e?.target?.value?.trim()];
                onChange('tags', newTags);
                e.target.value = '';
              }
            }}
          />
          <Button size="sm" variant="outline" iconName="Plus" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Colecciones / Menús
        </label>
        <p className="text-xs text-muted-foreground mb-4">
          Agrupación editorial visible al usuario (como Shop Pages en WC)<br />
          Ej: "Desayunos", "Combos para llevar", "Servicios premium"
        </p>
        <select
          multiple
          value={formData?.collections}
          onChange={(e) => {
            const selected = Array.from(e?.target?.selectedOptions, option => option?.value);
            onChange('collections', selected);
          }}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          size={4}
        >
          <option value="desayunos">Desayunos</option>
          <option value="combos-llevar">Combos para llevar</option>
          <option value="servicios-premium">Servicios premium</option>
        </select>
      </div>
    </div>
  );
};

export default TabOrganizacion;