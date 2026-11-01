import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserLevels = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const user = {
    id: 1,
    name: "Carlos Mendoza",
    email: "carlos@mirestaurante.com",
    role: "owner"
  };

  const levels = [
    {
      id: 1,
      name: 'Explorer',
      minPoints: 0,
      maxPoints: 500,
      icon: 'Compass',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      benefits: ['Acceso a promociones básicas', 'Acumulación de puntos estándar'],
      users: 342
    },
    {
      id: 2,
      name: 'Adventurer',
      minPoints: 500,
      maxPoints: 1500,
      icon: 'Map',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      benefits: ['10% de bonificación en puntos', 'Acceso a promociones exclusivas', 'Notificaciones prioritarias'],
      users: 218
    },
    {
      id: 3,
      name: 'Discoverer',
      minPoints: 1500,
      maxPoints: 3500,
      icon: 'Telescope',
      color: 'text-success',
      bgColor: 'bg-success/10',
      benefits: ['20% de bonificación en puntos', 'Acceso anticipado a nuevas promociones', 'Cupones exclusivos mensuales', 'Soporte prioritario'],
      users: 156
    },
    {
      id: 4,
      name: 'Pioneer',
      minPoints: 3500,
      maxPoints: 7500,
      icon: 'Flag',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      benefits: ['30% de bonificación en puntos', 'Eventos exclusivos VIP', 'Descuentos especiales en zonas premium', 'Acceso a beta de nuevas funciones'],
      users: 89
    },
    {
      id: 5,
      name: 'Local Legend',
      minPoints: 7500,
      maxPoints: null,
      icon: 'Crown',
      color: 'text-warning',
      bgColor: 'bg-gradient-to-r from-warning/20 to-warning/10',
      benefits: ['50% de bonificación en puntos', 'Acceso ilimitado a todas las promociones', 'Concierge personal', 'Invitaciones a eventos exclusivos', 'Reconocimiento público'],
      users: 42
    }
  ];

  const levelStats = [
    { label: 'Usuarios Activos', value: '847', icon: 'Users', color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Nivel Promedio', value: 'Adventurer', icon: 'TrendingUp', color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Promociones Totales', value: '1,247', icon: 'Star', color: 'text-warning', bgColor: 'bg-warning/10' },
    { label: 'Engagement', value: '78%', icon: 'Activity', color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Subidas de Nivel (mes)', value: '124', icon: 'ArrowUp', color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Beneficios Canjeados', value: '2,340', icon: 'Gift', color: 'text-warning', bgColor: 'bg-warning/10' }
  ];

  const progressionData = [
    { month: 'Ene', explorer: 450, adventurer: 180, discoverer: 120, pioneer: 65, legend: 28 },
    { month: 'Feb', explorer: 420, adventurer: 195, discoverer: 135, pioneer: 72, legend: 32 },
    { month: 'Mar', explorer: 390, adventurer: 210, discoverer: 148, pioneer: 78, legend: 36 },
    { month: 'Abr', explorer: 365, adventurer: 215, discoverer: 152, pioneer: 84, legend: 39 },
    { month: 'May', explorer: 342, adventurer: 218, discoverer: 156, pioneer: 89, legend: 42 }
  ];

  const topUsers = [
    { id: 1, name: 'María González', level: 'Local Legend', points: 12450, visits: 245, zonesExplored: 18, avatar: 'MG' },
    { id: 2, name: 'Juan Pérez', level: 'Local Legend', points: 10230, visits: 198, zonesExplored: 15, avatar: 'JP' },
    { id: 3, name: 'Ana Rodríguez', level: 'Pioneer', points: 6890, visits: 156, zonesExplored: 12, avatar: 'AR' },
    { id: 4, name: 'Carlos Martínez', level: 'Pioneer', points: 5420, visits: 142, zonesExplored: 11, avatar: 'CM' },
    { id: 5, name: 'Laura Sánchez', level: 'Discoverer', points: 3280, visits: 98, zonesExplored: 8, avatar: 'LS' },
    { id: 6, name: 'Pedro López', level: 'Discoverer', points: 2890, visits: 85, zonesExplored: 7, avatar: 'PL' },
    { id: 7, name: 'Isabel Torres', level: 'Adventurer', points: 1420, visits: 62, zonesExplored: 5, avatar: 'IT' },
    { id: 8, name: 'Miguel Ruiz', level: 'Adventurer', points: 980, visits: 48, zonesExplored: 4, avatar: 'MR' }
  ];

  const getLevelByName = (levelName) => {
    return levels?.find(l => l?.name === levelName);
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
                  Niveles de Usuario
                </h1>
                <p className="text-muted-foreground">
                  Sistema de progresión basado en actividad: visitas, canjes, zonas exploradas. Cada nivel desbloquea beneficios exclusivos.
                </p>
              </div>
              <Button onClick={() => setShowEditModal(true)} iconName="Settings" iconSize={16}>
                Configurar Niveles
              </Button>
            </div>
          </div>

          {/* Level Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {levelStats?.map((stat, index) => (
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

          {/* Progression Chart */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribución de Niveles en el Tiempo</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="explorer" stroke="#94A3B8" strokeWidth={2} name="Explorer" />
                  <Line type="monotone" dataKey="adventurer" stroke="#2563EB" strokeWidth={2} name="Adventurer" />
                  <Line type="monotone" dataKey="discoverer" stroke="#059669" strokeWidth={2} name="Discoverer" />
                  <Line type="monotone" dataKey="pioneer" stroke="#D97706" strokeWidth={2} name="Pioneer" />
                  <Line type="monotone" dataKey="legend" stroke="#DC2626" strokeWidth={2} name="Local Legend" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progression Path Visualization */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-6">Ruta de Progresión de Niveles</h3>
            <div className="relative">
              <div className="absolute top-8 left-8 right-8 h-1 bg-muted" />
              <div className="flex items-start justify-between relative">
                {levels?.map((level, index) => (
                  <div key={level?.id} className="flex flex-col items-center" style={{ width: `${100 / levels?.length}%` }}>
                    <div className={`w-16 h-16 rounded-full ${level?.bgColor} border-4 border-card flex items-center justify-center mb-3 relative z-10`}>
                      <Icon name={level?.icon} size={24} className={level?.color} />
                    </div>
                    <p className="text-sm font-semibold text-foreground text-center mb-1">{level?.name}</p>
                    <p className="text-xs text-muted-foreground text-center">{level?.minPoints?.toLocaleString()}+ pts</p>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-primary">{level?.users} usuarios</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {levels?.map(level => (
              <div key={level?.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`${level?.bgColor} p-6 border-b border-border`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 rounded-full bg-card flex items-center justify-center`}>
                      <Icon name={level?.icon} size={32} className={level?.color} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Usuarios</p>
                      <p className="text-2xl font-bold text-foreground">{level?.users}</p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{level?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {level?.minPoints?.toLocaleString()} {level?.maxPoints ? `- ${level?.maxPoints?.toLocaleString()}` : '+'} puntos
                  </p>
                </div>
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Beneficios Desbloqueables:</h4>
                  <ul className="space-y-2 mb-4">
                    {level?.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    iconName="Edit" 
                    iconSize={14}
                    onClick={() => {
                      setSelectedLevel(level);
                      setShowEditModal(true);
                    }}
                    className="w-full"
                  >
                    Editar Nivel
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Top Users Leaderboard */}
          <div className="bg-card border border-border rounded-lg">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Top Usuarios por Nivel</h3>
              <Button variant="outline" iconName="Download" iconSize={16}>
                Exportar
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Posición</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Nivel</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Puntos</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Visitas</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Zonas Exploradas</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers?.map((user, index) => {
                    const userLevel = getLevelByName(user?.level);
                    return (
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
                            <span className="text-sm font-medium text-foreground">{user?.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Icon name={userLevel?.icon} size={16} className={userLevel?.color} />
                            <span className="text-sm font-semibold text-foreground">{user?.level}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-semibold text-foreground">{user?.points?.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-muted-foreground">{user?.visits}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-muted-foreground">{user?.zonesExplored}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Level Modal */}
      {showEditModal && selectedLevel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Editar Nivel: {selectedLevel?.name}</h3>
              <button onClick={() => {
                setShowEditModal(false);
                setSelectedLevel(null);
              }} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nombre del Nivel</label>
                <Input
                  type="text"
                  value={selectedLevel?.name}
                  onChange={(e) => setSelectedLevel({ ...selectedLevel, name: e?.target?.value })}
                  placeholder="Ej: Explorer, Adventurer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Puntos Mínimos</label>
                  <Input
                    type="number"
                    value={selectedLevel?.minPoints}
                    onChange={(e) => setSelectedLevel({ ...selectedLevel, minPoints: parseInt(e?.target?.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Puntos Máximos</label>
                  <Input
                    type="number"
                    value={selectedLevel?.maxPoints || ''}
                    onChange={(e) => setSelectedLevel({ ...selectedLevel, maxPoints: e?.target?.value ? parseInt(e?.target?.value) : null })}
                    placeholder="Dejar vacío para ilimitado"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Icono</label>
                <Select
                  options={[
                    { value: 'Compass', label: 'Compass' },
                    { value: 'Map', label: 'Map' },
                    { value: 'Telescope', label: 'Telescope' },
                    { value: 'Flag', label: 'Flag' },
                    { value: 'Crown', label: 'Crown' },
                    { value: 'Star', label: 'Star' },
                    { value: 'Trophy', label: 'Trophy' },
                    { value: 'Award', label: 'Award' }
                  ]}
                  value={selectedLevel?.icon}
                  onChange={(value) => setSelectedLevel({ ...selectedLevel, icon: value })}
                  placeholder="Selecciona un icono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                <Select
                  options={[
                    { value: 'text-muted-foreground', label: 'Gris' },
                    { value: 'text-primary', label: 'Azul' },
                    { value: 'text-success', label: 'Verde' },
                    { value: 'text-warning', label: 'Amarillo/Dorado' },
                    { value: 'text-destructive', label: 'Rojo' }
                  ]}
                  value={selectedLevel?.color}
                  onChange={(value) => setSelectedLevel({ ...selectedLevel, color: value })}
                  placeholder="Selecciona un color"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Beneficios (uno por línea)</label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={6}
                  value={selectedLevel?.benefits?.join('\n')}
                  onChange={(e) => setSelectedLevel({ ...selectedLevel, benefits: e?.target?.value?.split('\n')?.filter(b => b?.trim()) })}
                  placeholder="Acceso a promociones básicas\n10% de bonificación en puntos\nNotificaciones prioritarias"
                />
              </div>
            </div>
            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowEditModal(false);
                setSelectedLevel(null);
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  console.log('Guardando nivel:', selectedLevel);
                  setShowEditModal(false);
                  setSelectedLevel(null);
                }}
                disabled={!selectedLevel?.name || selectedLevel?.minPoints === undefined}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLevels;