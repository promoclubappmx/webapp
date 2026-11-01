import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StreaksManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [streakConfig, setStreakConfig] = useState({
    basePoints: 10,
    multiplier: 1.5,
    maxMultiplier: 5,
    resetGracePeriod: 24
  });

  const user = {
    id: 1,
    name: "Carlos Mendoza",
    email: "carlos@mirestaurante.com",
    role: "owner"
  };

  const streakLeaderboard = [
    { id: 1, userName: 'María González', currentStreak: 45, longestStreak: 52, totalVisits: 180, multiplier: 3.5, avatar: 'MG' },
    { id: 2, userName: 'Juan Pérez', currentStreak: 38, longestStreak: 45, totalVisits: 156, multiplier: 3.0, avatar: 'JP' },
    { id: 3, userName: 'Ana Rodríguez', currentStreak: 32, longestStreak: 38, totalVisits: 142, multiplier: 2.8, avatar: 'AR' },
    { id: 4, userName: 'Carlos Martínez', currentStreak: 28, longestStreak: 35, totalVisits: 128, multiplier: 2.5, avatar: 'CM' },
    { id: 5, userName: 'Laura Sánchez', currentStreak: 25, longestStreak: 30, totalVisits: 115, multiplier: 2.3, avatar: 'LS' },
    { id: 6, userName: 'Pedro López', currentStreak: 22, longestStreak: 28, totalVisits: 98, multiplier: 2.0, avatar: 'PL' },
    { id: 7, userName: 'Isabel Torres', currentStreak: 18, longestStreak: 24, totalVisits: 85, multiplier: 1.8, avatar: 'IT' },
    { id: 8, userName: 'Miguel Ruiz', currentStreak: 15, longestStreak: 20, totalVisits: 72, multiplier: 1.5, avatar: 'MR' }
  ];

  const streakStats = [
    { label: 'Racha Promedio', value: '12 días', icon: 'Flame', color: 'text-warning', bgColor: 'bg-warning/10' },
    { label: 'Racha Más Larga', value: '52 días', icon: 'TrendingUp', color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Usuarios con Racha', value: '342', icon: 'Users', color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Puntos Generados', value: '45,230', icon: 'Star', color: 'text-warning', bgColor: 'bg-warning/10' },
    { label: 'Usuarios Activos Hoy', value: '128', icon: 'Activity', color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Tasa de Retención', value: '78%', icon: 'Target', color: 'text-primary', bgColor: 'bg-primary/10' }
  ];

  const streakProgressionData = [
    { month: 'Ene', activeStreaks: 298, avgStreak: 10, pointsGenerated: 38420 },
    { month: 'Feb', activeStreaks: 312, avgStreak: 11, pointsGenerated: 40150 },
    { month: 'Mar', activeStreaks: 328, avgStreak: 11.5, pointsGenerated: 42380 },
    { month: 'Abr', activeStreaks: 335, avgStreak: 11.8, pointsGenerated: 43890 },
    { month: 'May', activeStreaks: 342, avgStreak: 12, pointsGenerated: 45230 }
  ];

  const handleSaveConfig = () => {
    console.log('Guardando configuración:', streakConfig);
    setShowConfigModal(false);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  const handleResetStreak = (userId) => {
    console.log('Reiniciando racha para usuario:', userId);
    alert('Racha reiniciada exitosamente');
  };

  const handleBoostStreak = (userId) => {
    console.log('Aplicando boost a racha para usuario:', userId);
    alert('Boost aplicado: +1 día de racha');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="p-6">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Racha de Visitas (Streaks)
                </h1>
                <p className="text-muted-foreground">
                  Los usuarios acumulan días consecutivos visitando negocios. Romper la racha genera retención diaria con multiplicadores de puntos.
                </p>
              </div>
              <Button onClick={() => setShowConfigModal(true)} iconName="Settings" iconSize={16}>
                Configurar Sistema
              </Button>
            </div>
          </div>

          {/* Streak Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {streakStats?.map((stat, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
                    <Icon name={stat?.icon} size={24} className={stat?.color} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat?.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
              </div>
            ))}
          </div>

          {/* Progression Analytics Chart */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Análisis de Progresión de Rachas</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={streakProgressionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#64748B" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="activeStreaks" stroke="#F59E0B" strokeWidth={2} name="Rachas Activas" />
                  <Line yAxisId="right" type="monotone" dataKey="avgStreak" stroke="#2563EB" strokeWidth={2} name="Racha Promedio" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Multiplier System Info */}
          <div className="bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Zap" size={24} className="text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Sistema de Multiplicadores</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Los usuarios ganan multiplicadores de puntos por mantener su racha activa. Cada 7 días consecutivos aumenta el multiplicador.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[1, 1.5, 2, 3, 5]?.map((mult, index) => (
                    <div key={index} className="bg-card rounded-lg p-3 text-center border border-border">
                      <p className="text-xs text-muted-foreground mb-1">{index * 7}+ días</p>
                      <p className="text-lg font-bold text-warning">{mult}x</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-card border border-border rounded-lg">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Tabla de Líderes - Rachas Activas</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" iconName="Download" iconSize={16}>
                  Exportar
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Posición</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Racha Actual</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Racha Más Larga</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Visitas Totales</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Multiplicador</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {streakLeaderboard?.map((user, index) => (
                    <tr key={user?.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Icon name="Trophy" size={16} className="text-warning" />}
                          {index === 1 && <Icon name="Medal" size={16} className="text-muted-foreground" />}
                          {index === 2 && <Icon name="Award" size={16} className="text-warning/60" />}
                          <span className="text-sm font-medium text-foreground">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">{user?.avatar}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{user?.userName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Icon name="Flame" size={16} className="text-warning" />
                          <span className="text-sm font-semibold text-foreground">{user?.currentStreak} días</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-muted-foreground">{user?.longestStreak} días</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-muted-foreground">{user?.totalVisits}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning">
                          {user?.multiplier}x
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Icon name="Eye" size={16} className="text-muted-foreground" />
                          </button>
                          <button 
                            onClick={() => handleBoostStreak(user?.id)}
                            className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                            title="Aplicar boost"
                          >
                            <Icon name="Zap" size={16} className="text-success" />
                          </button>
                          <button 
                            onClick={() => handleResetStreak(user?.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Reiniciar racha"
                          >
                            <Icon name="RotateCcw" size={16} className="text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Detail Modal */}
          {showUserDetailModal && selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl">
                <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Detalles de Racha - {selectedUser?.userName}</h3>
                  <button onClick={() => {
                    setShowUserDetailModal(false);
                    setSelectedUser(null);
                  }} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{selectedUser?.avatar}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{selectedUser?.userName}</h4>
                      <p className="text-sm text-muted-foreground">Usuario activo desde hace 6 meses</p>
                    </div>
                  </div>

                  {/* Streak Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Flame" size={20} className="text-warning" />
                        <p className="text-sm text-muted-foreground">Racha Actual</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{selectedUser?.currentStreak} días</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="TrendingUp" size={20} className="text-success" />
                        <p className="text-sm text-muted-foreground">Racha Más Larga</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{selectedUser?.longestStreak} días</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="MapPin" size={20} className="text-primary" />
                        <p className="text-sm text-muted-foreground">Visitas Totales</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{selectedUser?.totalVisits}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Zap" size={20} className="text-warning" />
                        <p className="text-sm text-muted-foreground">Multiplicador</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{selectedUser?.multiplier}x</p>
                    </div>
                  </div>

                  {/* Streak History */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Historial de Rachas</h4>
                    <div className="space-y-2">
                      {[
                        { date: '2024-05-15', days: selectedUser?.currentStreak, status: 'active' },
                        { date: '2024-04-20', days: 28, status: 'broken' },
                        { date: '2024-03-10', days: 35, status: 'broken' },
                        { date: '2024-02-05', days: 21, status: 'broken' }
                      ]?.map((streak, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Icon 
                              name={streak?.status === 'active' ? 'Flame' : 'X'} 
                              size={16} 
                              className={streak?.status === 'active' ? 'text-warning' : 'text-muted-foreground'} 
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">{streak?.days} días consecutivos</p>
                              <p className="text-xs text-muted-foreground">{streak?.date}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            streak?.status === 'active' ?'bg-success/10 text-success' :'bg-muted text-muted-foreground'
                          }`}>
                            {streak?.status === 'active' ? 'Activa' : 'Rota'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="success" 
                      iconName="Zap" 
                      iconSize={16}
                      onClick={() => handleBoostStreak(selectedUser?.id)}
                      className="flex-1"
                    >
                      Aplicar Boost
                    </Button>
                    <Button 
                      variant="destructive" 
                      iconName="RotateCcw" 
                      iconSize={16}
                      onClick={() => handleResetStreak(selectedUser?.id)}
                      className="flex-1"
                    >
                      Reiniciar Racha
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Modal */}
          {showConfigModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl">
                <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Configuración de Rachas</h3>
                  <button onClick={() => setShowConfigModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Puntos Base por Visita</label>
                    <Input
                      type="number"
                      value={streakConfig?.basePoints}
                      onChange={(e) => setStreakConfig({ ...streakConfig, basePoints: parseInt(e?.target?.value) })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Puntos que el usuario recibe por cada visita sin multiplicador
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Multiplicador Inicial</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={streakConfig?.multiplier}
                      onChange={(e) => setStreakConfig({ ...streakConfig, multiplier: parseFloat(e?.target?.value) })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Multiplicador que se aplica después de 7 días consecutivos
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Multiplicador Máximo</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={streakConfig?.maxMultiplier}
                      onChange={(e) => setStreakConfig({ ...streakConfig, maxMultiplier: parseFloat(e?.target?.value) })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Multiplicador máximo que un usuario puede alcanzar
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Período de Gracia (horas)</label>
                    <Select
                      options={[
                        { value: 12, label: '12 horas' },
                        { value: 24, label: '24 horas (recomendado)' },
                        { value: 36, label: '36 horas' },
                        { value: 48, label: '48 horas' }
                      ]}
                      value={streakConfig?.resetGracePeriod}
                      onChange={(value) => setStreakConfig({ ...streakConfig, resetGracePeriod: value })}
                      placeholder="Selecciona período"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tiempo que el usuario tiene para mantener su racha antes de que se reinicie
                    </p>
                  </div>
                </div>
                <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowConfigModal(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveConfig}
                    disabled={!streakConfig?.basePoints || !streakConfig?.multiplier || !streakConfig?.maxMultiplier}
                  >
                    Guardar Configuración
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StreaksManagement;