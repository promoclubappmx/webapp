import React, { useState, useEffect } from 'react';
import { Save, Info, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BasePointsSection from './components/BasePointsSection';
import PointsByMethodSection from './components/PointsByMethodSection';
import MultipliersSection from './components/MultipliersSection';
import StreakSection from './components/StreakSection';

const CheckInRewardsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rewardsData, setRewardsData] = useState(null);
  const [basePoints, setBasePoints] = useState(10);
  const [differentiateByMethod, setDifferentiateByMethod] = useState(false);
  const [pointsByMethod, setPointsByMethod] = useState({
    qr_static: 10, qr_dynamic: 10, geofence: 5, manual: 5, nfc: 15, beacon: 10
  });
  const [multipliers, setMultipliers] = useState([
    { id: '1', type: 'day', condition: 'Martes', multiplier: 2.0, active: true },
    { id: '2', type: 'time', condition: '14:00-17:00', multiplier: 1.5, active: true },
  ]);
  const [streakEnabled, setStreakEnabled] = useState(true);
  const [streakBonuses, setStreakBonuses] = useState([
    { visit: 2, bonus: 5 },
    { visit: 3, bonus: 10 },
    { visit: 5, bonus: 25 },
    { visit: 7, bonus: 35 },
    { visit: 10, bonus: 50 },
  ]);
  const [streakWindowDays, setStreakWindowDays] = useState(7);
  const [showAddMultiplier, setShowAddMultiplier] = useState(false);
  const [newMultiplier, setNewMultiplier] = useState({ type: 'day', condition: '', multiplier: 2.0 });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Stats for context card
  const avgVisitsPerMonth = 4;
  const cheapestRewardPoints = 100;
  const visitsForFirstReward = Math.ceil(cheapestRewardPoints / basePoints);

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase?.from('checkin_rewards')?.select('*')?.limit(1)?.single();

      if (data && !error) {
        setRewardsData(data);
        setBasePoints(data?.base_points || 10);
        setDifferentiateByMethod(data?.differentiate_by_method || false);
        setStreakEnabled(data?.streak_enabled || false);
        if (data?.points_by_method && Object.keys(data?.points_by_method)?.length > 0) {
          setPointsByMethod(data?.points_by_method);
        }
        if (data?.multipliers && Array.isArray(data?.multipliers) && data?.multipliers?.length > 0) {
          setMultipliers(data?.multipliers?.map((m, i) => ({ ...m, id: m?.id || String(i + 1) })));
        }
        if (data?.streak_config) {
          const sc = data?.streak_config;
          if (sc?.milestones && sc?.bonuses) {
            setStreakBonuses(sc?.milestones?.map((v, i) => ({ visit: v, bonus: sc?.bonuses?.[i] || 0 })));
          }
          if (sc?.window_days) setStreakWindowDays(sc?.window_days);
        }
      }
    } catch (err) {
      console.error('Error fetching rewards data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        base_points: basePoints,
        differentiate_by_method: differentiateByMethod,
        points_by_method: pointsByMethod,
        multipliers: multipliers,
        streak_enabled: streakEnabled,
        streak_config: {
          milestones: streakBonuses?.map(s => s?.visit),
          bonuses: streakBonuses?.map(s => s?.bonus),
          window_days: streakWindowDays,
        },
        updated_at: new Date()?.toISOString(),
      };

      if (rewardsData?.id) {
        await supabase?.from('checkin_rewards')?.update(payload)?.eq('id', rewardsData?.id);
      } else {
        await supabase?.from('checkin_rewards')?.insert(payload);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving rewards:', err);
    } finally {
      setSaving(false);
    }
  };

  const addMultiplier = () => {
    if (!newMultiplier?.condition) return;
    setMultipliers(p => [...p, { ...newMultiplier, id: Date.now()?.toString(), active: true }]);
    setNewMultiplier({ type: 'day', condition: '', multiplier: 2.0 });
    setShowAddMultiplier(false);
  };

  const removeMultiplier = (id) => {
    setMultipliers(p => p?.filter(m => m?.id !== id));
  };

  const toggleMultiplier = (id) => {
    setMultipliers(p => p?.map(m => m?.id === id ? { ...m, active: !m?.active } : m));
  };

  const updateStreakBonus = (index, value) => {
    setStreakBonuses(p => p?.map((s, i) => i === index ? { ...s, bonus: parseInt(value) || 0 } : s));
  };

  const getPreviewPoints = () => {
    let pts = basePoints;
    const activeMultipliers = multipliers?.filter(m => m?.active);
    activeMultipliers?.forEach(m => { pts = pts * m?.multiplier; });
    return Math.round(pts);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Cargando configuración de recompensas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/check-in-methods-configuration" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft size={18} className="text-muted-foreground" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Recompensas por Check-in</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Configura los puntos y beneficios que se otorgan al registrar una visita</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-sm text-green-600 font-medium">✓ Guardado correctamente</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl">
        {/* Context Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Los puntos por check-in son adicionales a los puntos por compra</p>
            <p className="text-xs text-muted-foreground mt-0.5">Si un cliente hace check-in y gasta $200 (con regla de 1 pto/$10), recibe {basePoints} + 20 = {basePoints + 20} puntos en total.</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Base Points */}
          <BasePointsSection
            basePoints={basePoints}
            setBasePoints={setBasePoints}
            visitsForFirstReward={visitsForFirstReward}
            avgVisitsPerMonth={avgVisitsPerMonth}
            cheapestRewardPoints={cheapestRewardPoints}
          />

          {/* Points by Method */}
          <PointsByMethodSection
            differentiateByMethod={differentiateByMethod}
            setDifferentiateByMethod={setDifferentiateByMethod}
            pointsByMethod={pointsByMethod}
            setPointsByMethod={setPointsByMethod}
          />

          {/* Multipliers */}
          <MultipliersSection
            multipliers={multipliers}
            toggleMultiplier={toggleMultiplier}
            removeMultiplier={removeMultiplier}
            showAddMultiplier={showAddMultiplier}
            setShowAddMultiplier={setShowAddMultiplier}
            newMultiplier={newMultiplier}
            setNewMultiplier={setNewMultiplier}
            addMultiplier={addMultiplier}
            basePoints={basePoints}
            getPreviewPoints={getPreviewPoints}
          />

          {/* Streak */}
          <StreakSection
            streakEnabled={streakEnabled}
            setStreakEnabled={setStreakEnabled}
            streakBonuses={streakBonuses}
            updateStreakBonus={updateStreakBonus}
            streakWindowDays={streakWindowDays}
            setStreakWindowDays={setStreakWindowDays}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckInRewardsManagement;
