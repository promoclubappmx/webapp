import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const AutoReorderRulesModal = ({ suppliers, onClose }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    product_id: '',
    supplier_id: '',
    reorder_quantity: 10,
    trigger_stock: 5,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: prods } = await supabase
        ?.from('catalog_items')
        ?.select('id, name, sku, stock_quantity, min_stock_level, metadata')
        ?.eq('user_id', user?.id)
        ?.eq('status', 'active');
      setProducts(prods || []);

      const { data: rulesData } = await supabase
        ?.from('auto_reorder_rules')
        ?.select('*, catalog_items(name, sku, stock_quantity), suppliers(name)')
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false });
      setRules(rulesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRule = async () => {
    if (!newRule?.product_id || !newRule?.supplier_id) {
      alert('Selecciona producto y proveedor');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase?.from('auto_reorder_rules')?.insert({
        user_id: user?.id,
        catalog_item_id: newRule?.product_id,
        supplier_id: newRule?.supplier_id,
        reorder_quantity: parseInt(newRule?.reorder_quantity) || 10,
        trigger_stock_level: parseInt(newRule?.trigger_stock) || 5,
        is_active: newRule?.is_active
      });
      if (error) throw error;
      await fetchData();
      setShowAddRule(false);
      setNewRule({ product_id: '', supplier_id: '', reorder_quantity: 10, trigger_stock: 5, is_active: true });
    } catch (err) {
      console.error(err);
      alert('Error al guardar regla: ' + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRule = async (ruleId, isActive) => {
    try {
      await supabase?.from('auto_reorder_rules')?.update({ is_active: !isActive })?.eq('id', ruleId);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('¿Eliminar esta regla de reorden?')) return;
    try {
      await supabase?.from('auto_reorder_rules')?.delete()?.eq('id', ruleId);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl my-4">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground">Reglas de Reorden Automático</h2>
          <p className="text-sm text-muted-foreground">Genera POs automáticamente cuando el stock baja del umbral</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><Icon name="X" size={20} /></button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[65vh]">
        {/* Add Rule Form */}
        {showAddRule ? (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Nueva Regla de Reorden</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Producto *</label>
                <select value={newRule?.product_id}
                  onChange={e => setNewRule(prev => ({ ...prev, product_id: e?.target?.value }))}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm">
                  <option value="">Seleccionar...</option>
                  {products?.map(p => (
                    <option key={p?.id} value={p?.id}>
                      {p?.name} (Stock: {p?.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Proveedor *</label>
                <select value={newRule?.supplier_id}
                  onChange={e => setNewRule(prev => ({ ...prev, supplier_id: e?.target?.value }))}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm">
                  <option value="">Seleccionar...</option>
                  {suppliers?.map(s => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Umbral de Stock (trigger)</label>
                <input type="number" min="0" value={newRule?.trigger_stock}
                  onChange={e => setNewRule(prev => ({ ...prev, trigger_stock: e?.target?.value }))}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
                <p className="text-xs text-muted-foreground mt-0.5">Generar PO cuando stock ≤ este valor</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Cantidad a Reordenar</label>
                <input type="number" min="1" value={newRule?.reorder_quantity}
                  onChange={e => setNewRule(prev => ({ ...prev, reorder_quantity: e?.target?.value }))}
                  className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowAddRule(false)}>Cancelar</Button>
              <Button variant="default" size="sm" onClick={handleSaveRule} disabled={isSaving}
                iconName={isSaving ? 'Loader2' : 'Save'} iconPosition="left">
                {isSaving ? 'Guardando...' : 'Guardar Regla'}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowAddRule(true)} iconName="Plus" iconPosition="left" className="mb-4 w-full">
            Agregar Nueva Regla
          </Button>
        )}

        {/* Rules List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin text-primary" />
          </div>
        ) : rules?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Zap" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No hay reglas configuradas</p>
            <p className="text-xs text-muted-foreground mt-1">Agrega reglas para automatizar tus pedidos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules?.map(rule => (
              <div key={rule?.id} className={`border rounded-xl p-4 transition-all ${
                rule?.is_active ? 'border-border bg-card' : 'border-border bg-muted/30 opacity-60'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Package" size={14} className="text-primary" />
                      <p className="font-medium text-foreground text-sm">{rule?.catalog_items?.name}</p>
                      <span className="text-xs text-muted-foreground">({rule?.catalog_items?.sku})</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Truck" size={11} /> {rule?.suppliers?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="AlertTriangle" size={11} className="text-orange-500" />
                        Trigger: ≤{rule?.trigger_stock_level} uds
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="ShoppingCart" size={11} className="text-green-500" />
                        Reordenar: {rule?.reorder_quantity} uds
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        (rule?.catalog_items?.stock_quantity || 0) <= rule?.trigger_stock_level
                          ? 'bg-red-100 text-red-700' :'bg-green-100 text-green-700'
                      }`}>
                        Stock actual: {rule?.catalog_items?.stock_quantity || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule?.id, rule?.is_active)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        rule?.is_active ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        rule?.is_active ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <button onClick={() => handleDeleteRule(rule?.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end p-6 border-t border-border">
        <Button variant="outline" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};

export default AutoReorderRulesModal;
