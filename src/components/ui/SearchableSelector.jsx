import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import Icon from '../AppIcon';

/**
 * SearchableProductSelector
 * Dropdown with search that loads catalog_items from Supabase for the authenticated user.
 */
export const SearchableProductSelector = ({
  value = '',
  onChange,
  placeholder = 'Buscar producto o servicio...',
  accentClass = 'focus:ring-primary/30',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setSearch(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref?.current && !ref?.current?.contains(e?.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const fetchItems = async () => {
      setLoading(true);
      try {
        let query = supabase?.from('catalog_items')?.select('id, name, price, business_type, category_id')?.in('status', ['active', 'draft'])?.order('name');
        if (search?.trim()) query = query?.ilike('name', `%${search?.trim()}%`);
        query = query?.limit(50);
        const { data, error } = await query;
        if (!error) setItems(data || []);
      } catch (err) {
        console.error('SearchableProductSelector error:', err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchItems, 200);
    return () => clearTimeout(timer);
  }, [open, search]);

  const handleSelect = (item) => { setSearch(item?.name || ''); onChange?.(item?.name || '', item); setOpen(false); };
  const handleInputChange = (e) => { setSearch(e?.target?.value); onChange?.(e?.target?.value, null); if (!open) setOpen(true); };
  const handleClear = () => { setSearch(''); onChange?.('', null); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center">
        <Icon name="Search" size={14} className="absolute left-3 text-muted-foreground pointer-events-none" />
        <input type="text" value={search} onChange={handleInputChange} onFocus={() => setOpen(true)} placeholder={placeholder} disabled={disabled}
          className={`w-full pl-8 pr-8 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 ${accentClass} disabled:opacity-50`} />
        {search && <button type="button" onClick={handleClear} className="absolute right-2 text-muted-foreground hover:text-foreground"><Icon name="X" size={14} /></button>}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" /></div>
          ) : items?.length === 0 ? (
            <div className="py-4 px-3 text-sm text-muted-foreground text-center">{search ? 'Sin resultados para tu búsqueda' : 'No hay productos en el catálogo'}</div>
          ) : (
            items?.map((item) => (
              <button key={item?.id} type="button" onClick={() => handleSelect(item)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors text-left">
                <span className="truncate">{item?.name}</span>
                {item?.price != null && <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">${Number(item?.price)?.toFixed(2)}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/**
 * SearchableVariableProductSelector
 * Only shows products that have variants (product_type = 'variable' or have catalog_item_variants).
 * Returns the selected item with its variants list via onSelect(item, variants).
 */
export const SearchableVariableProductSelector = ({
  value = '',
  onSelect,
  placeholder = 'Buscar producto con variantes...',
  accentClass = 'focus:ring-primary/30',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setSearch(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref?.current && !ref?.current?.contains(e?.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Fetch products that are variable type
        let query = supabase?.from('catalog_items')
          ?.select('id, name, price, product_type')
          ?.in('status', ['active', 'draft'])
          ?.eq('product_type', 'variable')
          ?.order('name');
        if (search?.trim()) query = query?.ilike('name', `%${search?.trim()}%`);
        query = query?.limit(50);
        const { data, error } = await query;
        if (!error) setItems(data || []);
      } catch (err) {
        console.error('SearchableVariableProductSelector error:', err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchItems, 200);
    return () => clearTimeout(timer);
  }, [open, search]);

  const handleSelect = async (item) => {
    setSearch(item?.name || '');
    setOpen(false);
    // Fetch variants for this product
    try {
      const { data: variants } = await supabase
        ?.from('catalog_item_variants')
        ?.select('id, name, price, sku')
        ?.eq('catalog_item_id', item?.id)
        ?.order('name');
      onSelect?.(item?.name || '', item, variants || []);
    } catch {
      onSelect?.(item?.name || '', item, []);
    }
  };

  const handleInputChange = (e) => {
    setSearch(e?.target?.value);
    onSelect?.(e?.target?.value, null, []);
    if (!open) setOpen(true);
  };

  const handleClear = () => { setSearch(''); onSelect?.('', null, []); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center">
        <Icon name="Search" size={14} className="absolute left-3 text-muted-foreground pointer-events-none" />
        <input type="text" value={search} onChange={handleInputChange} onFocus={() => setOpen(true)} placeholder={placeholder} disabled={disabled}
          className={`w-full pl-8 pr-8 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 ${accentClass} disabled:opacity-50`} />
        {search && <button type="button" onClick={handleClear} className="absolute right-2 text-muted-foreground hover:text-foreground"><Icon name="X" size={14} /></button>}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" /></div>
          ) : items?.length === 0 ? (
            <div className="py-4 px-3 text-sm text-muted-foreground text-center">
              {search ? 'Sin resultados' : 'No hay productos con variantes en el catálogo'}
            </div>
          ) : (
            items?.map((item) => (
              <button key={item?.id} type="button" onClick={() => handleSelect(item)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <Icon name="Layers" size={12} className="text-cyan-500 flex-shrink-0" />
                  <span className="truncate">{item?.name}</span>
                </div>
                <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0">variable</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/**
 * SearchableCategorySelector
 */
export const SearchableCategorySelector = ({
  value = '',
  onChange,
  placeholder = 'Buscar categoría...',
  accentClass = 'focus:ring-primary/30',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setSearch(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref?.current && !ref?.current?.contains(e?.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        let query = supabase?.from('categories')?.select('id, name, description')?.order('name');
        if (search?.trim()) query = query?.ilike('name', `%${search?.trim()}%`);
        query = query?.limit(50);
        const { data, error } = await query;
        if (!error) setCategories(data || []);
      } catch (err) {
        console.error('SearchableCategorySelector error:', err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchCategories, 200);
    return () => clearTimeout(timer);
  }, [open, search]);

  const handleSelect = (cat) => { setSearch(cat?.name || ''); onChange?.(cat?.name || '', cat); setOpen(false); };
  const handleInputChange = (e) => { setSearch(e?.target?.value); onChange?.(e?.target?.value, null); if (!open) setOpen(true); };
  const handleClear = () => { setSearch(''); onChange?.('', null); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center">
        <Icon name="Tag" size={14} className="absolute left-3 text-muted-foreground pointer-events-none" />
        <input type="text" value={search} onChange={handleInputChange} onFocus={() => setOpen(true)} placeholder={placeholder} disabled={disabled}
          className={`w-full pl-8 pr-8 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 ${accentClass} disabled:opacity-50`} />
        {search && <button type="button" onClick={handleClear} className="absolute right-2 text-muted-foreground hover:text-foreground"><Icon name="X" size={14} /></button>}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" /></div>
          ) : categories?.length === 0 ? (
            <div className="py-4 px-3 text-sm text-muted-foreground text-center">{search ? 'Sin resultados para tu búsqueda' : 'No hay categorías en el catálogo'}</div>
          ) : (
            categories?.map((cat) => (
              <button key={cat?.id} type="button" onClick={() => handleSelect(cat)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors text-left">
                <span className="truncate">{cat?.name}</span>
                {cat?.description && <span className="text-xs text-muted-foreground ml-2 truncate max-w-[120px]">{cat?.description}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/**
 * CurrencyInput
 * Input field formatted as currency (MXN) with $ prefix and MXN suffix.
 */
export const CurrencyInput = ({
  label,
  value = '',
  onChange,
  placeholder = '0.00',
  disabled = false,
  accentClass = 'focus:ring-primary/30',
  className = '',
}) => {
  const handleChange = (e) => {
    // Allow only numbers and one decimal point
    const raw = e?.target?.value?.replace(/[^0-9.]/g, '');
    const parts = raw?.split('.');
    const cleaned = parts?.length > 2 ? parts?.[0] + '.' + parts?.slice(1)?.join('') : raw;
    onChange?.(cleaned);
  };

  return (
    <div className={className}>
      {label && <label className="text-xs font-medium text-foreground block mb-1">{label}</label>}
      <div className="flex items-center">
        <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-lg text-sm font-medium text-muted-foreground select-none">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 ${accentClass} disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed`}
        />
        <span className="px-3 py-2 bg-muted border border-l-0 border-border rounded-r-lg text-sm font-medium text-muted-foreground select-none">MXN</span>
      </div>
    </div>
  );
};
