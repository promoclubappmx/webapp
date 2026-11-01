import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MissionsChallenges = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [missionType, setMissionType] = useState('standard');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    type: 'visit',
    target: 3,
    reward: 100,
    duration: 7,
    sponsored: false,
    sponsorBusiness: ''
  });

  const user = {
    id: 1,
    name: "Carlos Mendoza",
    email: "carlos@mirestaurante.com",
    role: "owner"
  };

  const missions = [
    {
      id: 1,
      title: 'Visita 3 cafeterías esta semana',
      description: 'Explora diferentes cafeterías en tu zona',
      type: 'visit',
      target: 3,
      progress: 2,
      reward: 150,
      duration: '5 días restantes',
      status: 'active',
      sponsored: false,
      participants: 342
    },
    {
      id: 2,
      title: 'Canjea un cupón en una zona nueva',
      description: 'Descubre negocios en áreas que no has visitado',
      type: 'redeem',
      target: 1,
      progress: 0,
      reward: 200,
      duration: '3 días restantes',
      status: 'active',
      sponsored: false,
      participants: 218
    },
    {
      id: 3,
      title: 'Prueba el nuevo menú de Restaurante El Jardín',
      description: 'Misión patrocinada - Visita y prueba nuestro nuevo menú',
      type: 'sponsored',
      target: 1,
      progress: 0,
      reward: 300,
      duration: '10 días restantes',
      status: 'active',
      sponsored: true,
      sponsorBusiness: 'Restaurante El Jardín',
      participants: 156
    },
    {
      id: 4,
      title: 'Comparte 5 promociones con amigos',
      description: 'Ayuda a difundir las mejores ofertas',
      type: 'social',
      target: 5,
      progress: 3,
      reward: 100,
      duration: '7 días restantes',
      status: 'active',
      sponsored: false,
      participants: 428
    },
    {
      id: 5,
      title: 'Realiza 2 compras en negocios locales',
      description: 'Apoya a los comercios de tu comunidad',
      type: 'purchase',
      target: 2,
      progress: 1,
      reward: 250,
      duration: '4 días restantes',
      status: 'active',
      sponsored: false,
      participants: 289
    },
    {
      id: 6,
      title: 'Deja 3 reseñas de negocios visitados',
      description: 'Comparte tu experiencia con la comunidad',
      type: 'review',
      target: 3,
      progress: 0,
      reward: 180,
      duration: '6 días restantes',
      status: 'active',
      sponsored: false,
      participants: 195
    }
  ];

  const missionStats = [
    { label: 'Misiones Activas', value: '12', icon: 'Target', color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Completadas Hoy', value: '89', icon: 'CheckCircle', color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Participantes', value: '1,144', icon: 'Users', color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Misiones Patrocinadas', value: '4', icon: 'DollarSign', color: 'text-warning', bgColor: 'bg-warning/10' },
    { label: 'Tasa de Completado', value: '68%', icon: 'TrendingUp', color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Ingresos Patrocinios', value: '€850', icon: 'Euro', color: 'text-warning', bgColor: 'bg-warning/10' }
  ];

  const missionCompletionData = [
    { type: 'Visitas', completed: 245, active: 98 },
    { type: 'Canjes', completed: 189, active: 67 },
    { type: 'Sociales', completed: 156, active: 89 },
    { type: 'Compras', completed: 134, active: 54 },
    { type: 'Reseñas', completed: 98, active: 42 }
  ];

  const missionTypeDistribution = [
    { name: 'Visitas', value: 35, color: '#2563EB' },
    { name: 'Canjes', value: 25, color: '#059669' },
    { name: 'Sociales', value: 20, color: '#F59E0B' },
    { name: 'Compras', value: 15, color: '#DC2626' },
    { name: 'Reseñas', value: 5, color: '#8B5CF6' }
  ];

  const missionTypeOptions = [
    { value: 'visit', label: 'Visitar negocios' },
    { value: 'redeem', label: 'Canjear cupones' },
    { value: 'social', label: 'Acción social' },
    { value: 'purchase', label: 'Realizar compra' },
    { value: 'review', label: 'Dejar reseña' }
  ];

  const getMissionIcon = (type) => {
    switch (type) {
      case 'visit': return 'MapPin';
      case 'redeem': return 'Ticket';
      case 'social': return 'Share2';
      case 'purchase': return 'ShoppingCart';
      case 'sponsored': return 'DollarSign';
      case 'review': return 'Star';
      default: return 'Target';
    }
  };

  const handleCreateMission = () => {
    console.log('Creando misión:', newMission);
    setShowCreateModal(false);
    setNewMission({
      title: '',
      description: '',
      type: 'visit',
      target: 3,
      reward: 100,
      duration: 7,
      sponsored: false,
      sponsorBusiness: ''
    });
  };

  const filteredMissions = selectedFilter === 'all' 
    ? missions 
    : selectedFilter === 'sponsored'
    ? missions?.filter(m => m?.sponsored)
    : missions?.filter(m => !m?.sponsored);

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
                  Misiones y Retos
                </h1>
                <p className="text-muted-foreground">
                  Tareas como "Visita 3 cafeterías esta semana" o "Canjea un cupón en una zona nueva". Los negocios pueden crear misiones patrocinadas.
                </p>
              </div>
              <Button onClick={() => setShowCreateModal(true)} iconName="Plus" iconSize={16}>
                Crear Misión
              </Button>
            </div>
          </div>

          {/* Mission Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {missionStats?.map((stat, index) => (
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

          {/* Mission Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Completion Chart */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Misiones Completadas vs Activas</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={missionCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="type" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="completed" fill="#059669" name="Completadas" />
                    <Bar dataKey="active" fill="#2563EB" name="Activas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Type Distribution */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Distribución por Tipo de Misión</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={missionTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {missionTypeDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry?.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sponsored Missions Info */}
          <div className="bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="DollarSign" size={24} className="text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Misiones Patrocinadas - Vía de Monetización</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Los negocios pueden crear misiones patrocinadas para atraer clientes específicos. Esto abre una vía de monetización adicional para la plataforma.
                </p>
                <div className="flex items-center gap-4">
                  <div className="bg-card rounded-lg px-4 py-2 border border-border">
                    <p className="text-xs text-muted-foreground">Costo por misión</p>
                    <p className="text-lg font-bold text-foreground">€50 - €200</p>
                  </div>
                  <div className="bg-card rounded-lg px-4 py-2 border border-border">
                    <p className="text-xs text-muted-foreground">Alcance promedio</p>
                    <p className="text-lg font-bold text-foreground">200+ usuarios</p>
                  </div>
                  <div className="bg-card rounded-lg px-4 py-2 border border-border">
                    <p className="text-xs text-muted-foreground">Tasa de conversión</p>
                    <p className="text-lg font-bold text-foreground">35%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedFilter('standard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'standard' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Estándar
            </button>
            <button
              onClick={() => setSelectedFilter('sponsored')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'sponsored' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Patrocinadas
            </button>
          </div>

          {/* Active Missions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMissions?.map(mission => (
              <div key={mission?.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {mission?.sponsored && (
                  <div className="bg-gradient-to-r from-warning to-warning/80 px-4 py-2 flex items-center gap-2">
                    <Icon name="Star" size={14} className="text-white" />
                    <span className="text-xs font-semibold text-white">Misión Patrocinada - {mission?.sponsorBusiness}</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        mission?.sponsored ? 'bg-warning/10' : 'bg-primary/10'
                      }`}>
                        <Icon 
                          name={getMissionIcon(mission?.type)} 
                          size={20} 
                          className={mission?.sponsored ? 'text-warning' : 'text-primary'} 
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{mission?.title}</h3>
                        <p className="text-sm text-muted-foreground">{mission?.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium text-foreground">{mission?.progress} / {mission?.target}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(mission?.progress / mission?.target) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={14} className="text-warning" />
                        <span className="text-sm font-semibold text-foreground">{mission?.reward} pts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Users" size={14} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{mission?.participants}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{mission?.duration}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm" iconName="Edit" iconSize={14} className="flex-1">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" iconName="Eye" iconSize={14} className="flex-1">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create Mission Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Crear Nueva Misión</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Mission Type Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMissionType('standard')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        missionType === 'standard' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon name="Target" size={24} className="mx-auto mb-2 text-primary" />
                      <p className="text-sm font-semibold text-foreground">Misión Estándar</p>
                      <p className="text-xs text-muted-foreground mt-1">Gratuita para todos los usuarios</p>
                    </button>
                    <button
                      onClick={() => setMissionType('sponsored')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        missionType === 'sponsored' ?'border-warning bg-warning/5' :'border-border hover:border-warning/50'
                      }`}
                    >
                      <Icon name="DollarSign" size={24} className="mx-auto mb-2 text-warning" />
                      <p className="text-sm font-semibold text-foreground">Misión Patrocinada</p>
                      <p className="text-xs text-muted-foreground mt-1">Promoción de pago para negocios</p>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Título de la Misión</label>
                    <Input
                      type="text"
                      placeholder="Ej: Visita 3 cafeterías esta semana"
                      value={newMission?.title}
                      onChange={(e) => setNewMission({ ...newMission, title: e?.target?.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
                    <textarea
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Describe la misión y lo que los usuarios deben hacer"
                      value={newMission?.description}
                      onChange={(e) => setNewMission({ ...newMission, description: e?.target?.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Tipo de Acción</label>
                      <Select
                        options={missionTypeOptions}
                        value={newMission?.type}
                        onChange={(value) => setNewMission({ ...newMission, type: value })}
                        placeholder="Selecciona el tipo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Objetivo (cantidad)</label>
                      <Input
                        type="number"
                        value={newMission?.target}
                        onChange={(e) => setNewMission({ ...newMission, target: parseInt(e?.target?.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Recompensa (puntos)</label>
                      <Input
                        type="number"
                        value={newMission?.reward}
                        onChange={(e) => setNewMission({ ...newMission, reward: parseInt(e?.target?.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Duración (días)</label>
                      <Input
                        type="number"
                        value={newMission?.duration}
                        onChange={(e) => setNewMission({ ...newMission, duration: parseInt(e?.target?.value) })}
                      />
                    </div>
                  </div>

                  {missionType === 'sponsored' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Negocio Patrocinador</label>
                      <Select
                        options={[
                          { value: 'restaurante-el-jardin', label: 'Restaurante El Jardín' },
                          { value: 'cafe-premium', label: 'Café Premium' },
                          { value: 'boutique-fashion', label: 'Boutique Fashion' },
                          { value: 'gym-fitness', label: 'Gym Fitness Center' },
                          { value: 'libreria-cultural', label: 'Librería Cultural' }
                        ]}
                        value={newMission?.sponsorBusiness}
                        onChange={(value) => setNewMission({ ...newMission, sponsorBusiness: value })}
                        placeholder="Selecciona el negocio"
                        searchable
                      />
                    </div>
                  )}
                </div>
                <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateMission}
                    disabled={!newMission?.title || !newMission?.description || (missionType === 'sponsored' && !newMission?.sponsorBusiness)}
                  >
                    Crear Misión
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

export default MissionsChallenges;