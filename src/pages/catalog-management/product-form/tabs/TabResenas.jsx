import React from 'react';
import { Checkbox } from '../../../../components/ui/Checkbox';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';

const TabResenas = ({ formData, errors, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Checkbox
          checked={formData?.showInPublicProfile}
          onCheckedChange={(checked) => onChange('showInPublicProfile', checked)}
        />
        <label className="text-sm font-medium text-foreground cursor-pointer">
          Mostrar reseñas en ficha pública
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon name="Star" size={24} className="text-yellow-500 fill-yellow-500" />
            <span className="text-3xl font-bold text-foreground">
              {formData?.averageRating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Rating promedio</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon name="MessageSquare" size={24} className="text-primary" />
            <span className="text-3xl font-bold text-foreground">
              {formData?.totalReviews || 0}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Total de reseñas</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon name="CheckCircle" size={24} className="text-green-600" />
            <span className="text-3xl font-bold text-foreground">
              {formData?.reviews?.filter(r => r?.verified)?.length || 0}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Verificadas</p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Reseñas verificadas</p>
            <p className="text-xs text-blue-700">
              Las reseñas están vinculadas a transacciones verificadas para prevenir fraude
            </p>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground">Reseñas recientes</h4>
          <Button size="sm" variant="outline">
            Ver todas
          </Button>
        </div>

        {formData?.reviews?.length > 0 ? (
          <div className="space-y-4">
            {formData?.reviews?.map((review, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{review?.userName}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)]?.map((_, i) => (
                          <Icon
                            key={i}
                            name="Star"
                            size={12}
                            className={i < review?.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" iconName="Check">
                      Aprobar
                    </Button>
                    <Button size="sm" variant="ghost" iconName="X">
                      Rechazar
                    </Button>
                    <Button size="sm" variant="ghost" iconName="Flag">
                      Reportar
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-foreground mb-2">{review?.comment}</p>
                {review?.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    <Icon name="CheckCircle" size={12} />
                    Compra verificada
                  </span>
                )}
                {review?.businessResponse && (
                  <div className="mt-3 pl-4 border-l-2 border-primary">
                    <p className="text-xs font-medium text-primary mb-1">Respuesta del negocio:</p>
                    <p className="text-xs text-muted-foreground">{review?.businessResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <Icon name="MessageSquare" size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No hay reseñas todavía</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabResenas;