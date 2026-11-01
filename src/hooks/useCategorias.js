import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for cascading category selects:
 * categorias → subcategorias (filtered by categoriaId) → tipos (filtered by subcategoriaId)
 */
const useCategorias = (categoriaId = null, subcategoriaId = null) => {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [tipos, setTipos] = useState([]);

  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);
  const [loadingTipos, setLoadingTipos] = useState(false);

  const [errorCategorias, setErrorCategorias] = useState(null);
  const [errorSubcategorias, setErrorSubcategorias] = useState(null);
  const [errorTipos, setErrorTipos] = useState(null);

  // Load all categories on mount
  useEffect(() => {
    const fetchCategorias = async () => {
      setLoadingCategorias(true);
      setErrorCategorias(null);
      try {
        const { data, error } = await supabase?.from('business_categories')?.select('id, nombre')?.order('nombre', { ascending: true });

        if (error) throw error;
        setCategorias(data || []);
      } catch (err) {
        setErrorCategorias(err?.message || 'Error al cargar categorías');
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  // Load subcategories when categoriaId changes
  useEffect(() => {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }

    const fetchSubcategorias = async () => {
      setLoadingSubcategorias(true);
      setErrorSubcategorias(null);
      try {
        const { data, error } = await supabase?.from('business_subcategories')?.select('id, nombre, categoria_id')?.eq('categoria_id', categoriaId)?.order('nombre', { ascending: true });

        if (error) throw error;
        setSubcategorias(data || []);
      } catch (err) {
        setErrorSubcategorias(err?.message || 'Error al cargar subcategorías');
        setSubcategorias([]);
      } finally {
        setLoadingSubcategorias(false);
      }
    };

    fetchSubcategorias();
  }, [categoriaId]);

  // Load tipos when subcategoriaId changes
  useEffect(() => {
    if (!subcategoriaId) {
      setTipos([]);
      return;
    }

    const fetchTipos = async () => {
      setLoadingTipos(true);
      setErrorTipos(null);
      try {
        const { data, error } = await supabase?.from('business_establishment_types')?.select('id, nombre, subcategoria_id')?.eq('subcategoria_id', subcategoriaId)?.order('nombre', { ascending: true });

        if (error) throw error;
        setTipos(data || []);
      } catch (err) {
        setErrorTipos(err?.message || 'Error al cargar tipos de establecimiento');
        setTipos([]);
      } finally {
        setLoadingTipos(false);
      }
    };

    fetchTipos();
  }, [subcategoriaId]);

  return {
    categorias,
    subcategorias,
    tipos,
    loading: loadingCategorias || loadingSubcategorias || loadingTipos,
    loadingCategorias,
    loadingSubcategorias,
    loadingTipos,
    error: errorCategorias || errorSubcategorias || errorTipos,
    errorCategorias,
    errorSubcategorias,
    errorTipos,
  };
};

export default useCategorias;
