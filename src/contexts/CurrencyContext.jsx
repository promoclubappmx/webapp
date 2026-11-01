import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { formatCurrency as formatCurrencyUtil, DEFAULT_CURRENCY_SETTINGS, parseCurrencySettings } from '../utils/currencyFormatter';
import { supabase } from '../lib/supabase';

const CurrencyContext = createContext({});

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [currencySettings, setCurrencySettings] = useState(DEFAULT_CURRENCY_SETTINGS);
  const [loading, setLoading] = useState(false);

  // Load currency settings from userProfile when it changes
  useEffect(() => {
    if (userProfile?.currency_settings) {
      setCurrencySettings(parseCurrencySettings(userProfile?.currency_settings));
    } else {
      setCurrencySettings(DEFAULT_CURRENCY_SETTINGS);
    }
  }, [userProfile]);

  // Format a monetary value using current settings
  const formatPrice = useCallback((amount) => {
    return formatCurrencyUtil(amount, currencySettings);
  }, [currencySettings]);

  // Update currency settings and save to Supabase
  const updateCurrencySettings = useCallback(async (newSettings) => {
    const merged = { ...currencySettings, ...newSettings };
    setCurrencySettings(merged);

    if (user?.id) {
      try {
        const { error } = await supabase?.from('user_profiles')?.update({ currency_settings: merged })?.eq('id', user?.id);
        if (error) {
          console.error('Error saving currency settings:', error);
          return { error };
        }
        return { error: null };
      } catch (err) {
        console.error('Error saving currency settings:', err);
        return { error: err };
      }
    }
    return { error: null };
  }, [user, currencySettings]);

  const value = {
    currencySettings,
    formatPrice,
    updateCurrencySettings,
    loading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
