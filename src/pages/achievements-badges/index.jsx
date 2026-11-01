import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AchievementsBadges = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    category: 'milestone',
    requirement: '',
    icon: 'Award',
    rarity: 'common'
  });

  const user = {
    id: 1,
    name: "Carlos Mendoza",
    email: "carlos@mirestaurante.com",
    role: "owner"
  };

  const badges = [
    {
      id: 1,
      name: 'Primera Visita Nocturna',
      description: 'Visita un negocio después de las 8 PM',
      category: 'milestone',
      icon: 'Moon',
      rarity: 'common',
      earned: 842,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 2,
      name: '10 Negocios Distintos',
      description: 'Visita 10 negocios diferentes',
      category: 'milestone',
      icon: 'Building',
      rarity: 'common',
      earned: 624,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 3,
      name: 'Explorador del Centro Histórico',
      description: 'Visita 5 negocios en el centro histórico',
      category: 'zone',
      icon: 'MapPin',
      rarity: 'rare',
      earned: 342,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 4,
      name: 'Maestro de Cupones',
      description: 'Canjea 50 cupones',
      category: 'milestone',
      icon: 'Ticket',
      rarity: 'rare',
      earned: 218,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 5,
      name: 'Leyenda de la Zona Norte',
      description: 'Visita todos los negocios de la zona norte',
      category: 'zone',
      icon: 'Compass',
      rarity: 'epic',
      earned: 89,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 6,
      name: 'Madrugador',
      description: 'Visita un negocio antes de las 7 AM',
      category: 'special',
      icon: 'Sunrise',
      rarity: 'rare',
      earned: 156,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 7,
      name: 'Gourmet Explorer',
      description: 'Visita 20 restaurantes diferentes',
      category: 'milestone',
      icon: 'Utensils',
      rarity: 'rare',
      earned: 445,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 8,
      name: 'Coleccionista de Zonas',
      description: 'Visita negocios en 10 zonas diferentes',
      category: 'zone',
      icon: 'Map',
      rarity: 'epic',
      earned: 124,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 9,
      name: 'Pionero de la Zona Sur',
      description: 'Sé el primero en visitar 5 negocios nuevos en la zona sur',
      category: 'zone',
      icon: 'Flag',
      rarity: 'legendary',
      earned: 23,
      color: 'text-warning',
      bgColor: 'bg-gradient-to-r from-warning/20 to-warning/10'
    }
  ];

  const badgeStats = [
    { label: 'Total de Badges', value: '48', icon: 'Award', color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Badges Otorgados', value: '5,420', icon: 'CheckCircle', color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Badges Raros', value: '12', icon: 'Star', color: 'text-warning', bgColor: 'bg-warning/10' },
    { label: 'Coleccionistas', value: '342', icon: 'Users', color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Badges por Zona', value: '24', icon: 'MapPin', color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Tasa de Completado', value: '34%', icon: 'Target', color: 'text-warning', bgColor: 'bg-warning/10' }
  ];

  const rarityDistribution = [
    { name: 'Común', value: 20, color: '#94A3B8' },
    { name: 'Raro', value: 15, color: '#2563EB' },
    { name: 'Épico', value: 10, color: '#F59E0B' },
    { name: 'Legendario', value: 3, color: '#DC2626' }
  ];

  const zoneBadgeData = [
    { zone: 'Centro Histórico', badges: 8, earned: 342 },
    { zone: 'Zona Norte', badges: 6, earned: 218 },
    { zone: 'Zona Sur', badges: 5, earned: 189 },
    { zone: 'Zona Este', badges: 5, earned: 156 }
  ];

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'milestone', label: 'Hitos' },
    { value: 'zone', label: 'Zonas' },
    { value: 'special', label: 'Especiales' },
    { value: 'seasonal', label: 'Temporales' }
  ];

  const rarityOptions = [
    { value: 'common', label: 'Común' },
    { value: 'rare', label: 'Raro' },
    { value: 'epic', label: 'Épico' },
    { value: 'legendary', label: 'Legendario' }
  ];

  const iconOptions = [
    { value: 'Award', label: 'Award' },
    { value: 'Star', label: 'Star' },
    { value: 'Trophy', label: 'Trophy' },
    { value: 'Medal', label: 'Medal' },
    { value: 'Crown', label: 'Crown' },
    { value: 'MapPin', label: 'MapPin' },
    { value: 'Compass', label: 'Compass' },
    { value: 'Flag', label: 'Flag' }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground';
      case 'rare': return 'text-primary';
      case 'epic': return 'text-warning';
      case 'legendary': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getRarityBadge = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-muted text-muted-foreground';
      case 'rare': return 'bg-primary/10 text-primary';
      case 'epic': return 'bg-warning/10 text-warning';
      case 'legendary': return 'bg-gradient-to-r from-warning to-warning/80 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges?.filter(b => b?.category === selectedCategory);

  const handleCreateBadge = () => {
    console.log('Creando badge:', newBadge);
    setShowCreateModal(false);
    setNewBadge({
      name: '',
      description: '',
      category: 'milestone',
      requirement: '',
      icon: 'Award',
      rarity: 'common'
    });
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
                  Logros y Badges
                </h1>
                <p className="text-muted-foreground">
                  Coleccionables por hitos: "Primera visita nocturna", "10 negocios distintos", "Explorador del centro histórico". Los badges por zona incentivan movilidad geográfica.
                </p>
              </div>
              <Button onClick={() => setShowCreateModal(true)} iconName="Plus" iconSize={16}>
                Crear Badge
              </Button>
            </div>
          </div>

          {/* Badge Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {badgeStats?.map((stat, index) => (
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

          {/* Badge Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Rarity Distribution */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Distribución por Rareza</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={rarityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {rarityDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry?.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Zone Badge Performance */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Badges por Zona - Rendimiento</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={zoneBadgeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="zone" stroke="#64748B" fontSize={10} angle={-15} textAnchor="end" height={80} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="badges" fill="#2563EB" name="Total Badges" />
                    <Bar dataKey="earned" fill="#059669" name="Badges Ganados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Zone Badges Info */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="MapPin" size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Badges por Zona - Movilidad Geográfica</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Los badges por zona incentivan la movilidad geográfica, que es exactamente lo que tus negocios quieren. Los usuarios exploran nuevas áreas para completar colecciones.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Centro Histórico', 'Zona Norte', 'Zona Sur', 'Zona Este']?.map((zone, index) => (
                    <div key={index} className="bg-card rounded-lg p-3 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="MapPin" size={14} className="text-primary" />
                        <p className="text-xs font-semibold text-foreground">{zone}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{zoneBadgeData?.[index]?.badges || 0} badges</p>
                      <p className="text-xs text-success">{zoneBadgeData?.[index]?.earned || 0} ganados</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
            {categories?.map(cat => (
              <button
                key={cat?.value}
                onClick={() => setSelectedCategory(cat?.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat?.label}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges?.map(badge => (
              <div key={badge?.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`${badge?.bgColor} p-6 border-b border-border`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 rounded-full bg-card flex items-center justify-center`}>
                      <Icon name={badge?.icon} size={32} className={badge?.color} />
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRarityBadge(badge?.rarity)}`}>
                      {badge?.rarity?.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{badge?.name}</h3>
                  <p className="text-sm text-muted-foreground">{badge?.description}</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Usuarios que lo obtuvieron</p>
                      <p className="text-2xl font-bold text-foreground">{badge?.earned}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Categoría</p>
                      <p className="text-sm font-semibold text-foreground capitalize">{badge?.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" iconName="Edit" iconSize={14} className="flex-1">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" iconName="Eye" iconSize={14} className="flex-1">
                      Ver Usuarios
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create Badge Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Crear Nuevo Badge</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nombre del Badge</label>
                    <Input
                      type="text"
                      placeholder="Ej: Primera Visita Nocturna"
                      value={newBadge?.name}
                      onChange={(e) => setNewBadge({ ...newBadge, name: e?.target?.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
                    <textarea
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Describe cómo se obtiene este badge"
                      value={newBadge?.description}
                      onChange={(e) => setNewBadge({ ...newBadge, description: e?.target?.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Categoría</label>
                      <Select
                        options={categories?.filter(c => c?.value !== 'all')}
                        value={newBadge?.category}
                        onChange={(value) => setNewBadge({ ...newBadge, category: value })}
                        placeholder="Selecciona categoría"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Rareza</label>
                      <Select
                        options={rarityOptions}
                        value={newBadge?.rarity}
                        onChange={(value) => setNewBadge({ ...newBadge, rarity: value })}
                        placeholder="Selecciona rareza"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Icono</label>
                      <Select
                        options={iconOptions}
                        value={newBadge?.icon}
                        onChange={(value) => setNewBadge({ ...newBadge, icon: value })}
                        placeholder="Selecciona icono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Vista Previa</label>
                      <div className="w-full h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name={newBadge?.icon} size={24} className="text-primary" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Requisito</label>
                    <Input
                      type="text"
                      placeholder="Ej: Visitar 10 negocios diferentes"
                      value={newBadge?.requirement}
                      onChange={(e) => setNewBadge({ ...newBadge, requirement: e?.target?.value })}
                    />
                  </div>
                </div>
                <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateBadge}
                    disabled={!newBadge?.name || !newBadge?.description || !newBadge?.requirement}
                  >
                    Crear Badge
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

export default AchievementsBadges;