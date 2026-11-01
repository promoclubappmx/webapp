import React from 'react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Checkbox } from '../../../../components/ui/Checkbox';
import Icon from '../../../../components/AppIcon';

const TabSEO = ({ formData, errors, onChange }) => {
  const schemaTypeOptions = [
    { value: 'Product', label: 'Product' },
    { value: 'Service', label: 'Service' },
    { value: 'Event', label: 'Event' },
    { value: 'Offer', label: 'Offer' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">SEO del ítem</p>
            <p className="text-xs text-blue-700">
              Optimiza la visibilidad de este producto en la ficha pública del negocio y motores de búsqueda
            </p>
          </div>
        </div>
      </div>
      <Input
        label="Meta título"
        value={formData?.metaTitle}
        onChange={(e) => onChange('metaTitle', e?.target?.value)}
        placeholder="Se genera automáticamente desde el nombre"
        helperText="Autogenerado desde nombre, pero editable"
        maxLength={60}
      />
      <p className="text-xs text-muted-foreground -mt-4">
        {formData?.metaTitle?.length || 0}/60 caracteres
      </p>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Meta descripción
        </label>
        <textarea
          value={formData?.metaDescription}
          onChange={(e) => onChange('metaDescription', e?.target?.value)}
          placeholder="Descripción breve para motores de búsqueda"
          maxLength={160}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData?.metaDescription?.length || 0}/160 caracteres
        </p>
      </div>
      <Input
        label="Palabra clave principal"
        value={formData?.focusKeyword}
        onChange={(e) => onChange('focusKeyword', e?.target?.value)}
        placeholder="Ej: paella valenciana"
        helperText="Palabra clave principal para SEO"
      />
      <Select
        label="Schema type"
        value={formData?.schemaType}
        onChange={(e) => onChange('schemaType', e?.target?.value)}
        options={schemaTypeOptions}
        helperText="Tipo de schema para structured data"
      />
      <div className="flex items-center gap-2">
        <Checkbox
          checked={formData?.indexable}
          onCheckedChange={(checked) => onChange('indexable', checked)}
        />
        <label className="text-sm font-medium text-foreground cursor-pointer">
          Indexable (para la ficha pública del negocio)
        </label>
      </div>
      <div className="bg-muted rounded-lg p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">Vista previa en buscadores</h4>
        <div className="bg-background rounded p-3">
          <p className="text-blue-600 text-sm font-medium mb-1">
            {formData?.metaTitle || formData?.name || 'Título del producto'}
          </p>
          <p className="text-green-700 text-xs mb-1">
            https://promospot.com/negocio/{formData?.slug || 'producto'}
          </p>
          <p className="text-muted-foreground text-xs">
            {formData?.metaDescription || formData?.shortDescription || 'Descripción del producto que aparecerá en los resultados de búsqueda'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TabSEO;