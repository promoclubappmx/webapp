import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import NotificationDetailModal from '../NotificationDetailModal';
import { supabase } from '../../lib/supabase';
import {
  fetchCampaignNotifications,
  subscribeToCampaignNotifications,
  markCampaignNotificationRead,
  MILESTONE_CONFIG,
} from '../../services/campaignNotificationService';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ user, onMenuToggle, isMenuOpen = false, isCollapsed = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Campaign milestone notifications
  const [campaignNotifications, setCampaignNotifications] = useState([]);
  const [campaignNotifCount, setCampaignNotifCount] = useState(0);
  const [activeNotifTab, setActiveNotifTab] = useState('system');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const navigate = useNavigate();
  const { signOut, userProfile, isEmployee, isOwner } = useAuth();

  // Track screen size for responsive sidebar margin
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch system notifications from Supabase
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  // Fetch campaign milestone notifications
  useEffect(() => {
    const loadCampaignNotifs = async () => {
      try {
        const businessId = user?.business_id || user?.id;
        if (!businessId) return;
        const data = await fetchCampaignNotifications(null, businessId);
        const unread = data?.filter(n => !n?.is_read) || [];
        setCampaignNotifications(unread?.slice(0, 5));
        setCampaignNotifCount(unread?.length || 0);
      } catch (err) {
        // Silently handle - campaign notifications are non-critical
        setCampaignNotifications([]);
        setCampaignNotifCount(0);
      }
    };
    loadCampaignNotifs();
  }, [user?.business_id, user?.id]);

  // Supabase Realtime: subscribe to new campaign notifications
  useEffect(() => {
    const businessId = user?.business_id || user?.id;
    if (!businessId) return;
    let channel;
    try {
      channel = subscribeToCampaignNotifications(null, businessId, (newNotif) => {
        setCampaignNotifications(prev => [newNotif, ...prev]?.slice(0, 5));
        setCampaignNotifCount(prev => prev + 1);
      });
    } catch (err) {
      // Silently handle subscription errors
    }
    return () => {
      channel?.unsubscribe?.();
    };
  }, [user?.business_id, user?.id]);

  const fetchNotifications = async () => {
    try {
      const businessId = user?.business_id || user?.id;
      if (!businessId) return;
      const { data, error } = await supabase?.from('centralized_alerts')?.select('*')?.eq('business_id', businessId)?.eq('status', 'unread')?.order('created_at', { ascending: false })?.limit(5);

      if (error) {
        // Silently handle - table may not exist yet or network issues
        if (!error?.message?.includes('Failed to fetch') && !error?.message?.includes('relation') && !error?.message?.includes('does not exist')) {
          console.warn('Notifications unavailable:', error?.message);
        }
        return;
      }

      setNotifications(data || []);
      setNotificationCount(data?.length || 0);
    } catch (error) {
      // Silently handle network/fetch errors
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const { error } = await supabase?.from('centralized_alerts')?.update({ status: 'read', updated_at: new Date()?.toISOString() })?.eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev?.filter(n => n?.id !== notificationId));
      setNotificationCount(prev => Math.max(0, prev - 1));
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkCampaignNotifRead = async (notifId) => {
    await markCampaignNotificationRead(notifId);
    setCampaignNotifications(prev => prev?.filter(n => n?.id !== notifId));
    setCampaignNotifCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    setIsNotificationOpen(false);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7) return `hace ${days}d`;
    return date?.toLocaleDateString();
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      high_value_sale: 'bg-emerald-500',
      low_stock: 'bg-orange-500',
      staff_shift_start: 'bg-blue-500',
      staff_shift_end: 'bg-blue-500',
      staff_no_show: 'bg-red-500',
      customer_milestone: 'bg-purple-500',
      customer_birthday: 'bg-pink-500',
      system: 'bg-gray-500'
    };
    return colors?.[type] || 'bg-blue-500';
  };

  const totalNotifCount = notificationCount + campaignNotifCount;

  // Mock suggestions data
  const suggestions = [
    { id: 1, type: 'promotion', title: 'Descuento de Verano 2024', icon: 'Megaphone' },
    { id: 2, type: 'coupon', title: 'Cupón 20% OFF', icon: 'Ticket' },
    { id: 3, type: 'customer', title: 'Juan Pérez - Cliente Premium', icon: 'User' },
    { id: 4, type: 'business', title: 'Restaurante El Buen Sabor', icon: 'Building' },
  ];

  const filteredSuggestions = searchQuery?.trim()
    ? suggestions?.filter(s => s?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
    : [];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navigateToProfile = () => { navigate('/profile'); };
  const navigateToNotifications = () => { navigate('/notifications'); };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) setShowSuggestions(false);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setIsSearchExpanded(true);
    if (searchQuery?.trim()) setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    setTimeout(() => {
      setShowSuggestions(false);
      if (!searchQuery?.trim()) setIsSearchExpanded(false);
    }, 200);
  };

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    setShowSuggestions(value?.trim()?.length > 0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setIsSearchExpanded(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion?.title);
    setShowSuggestions(false);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement?.classList?.toggle('dark', !isDarkMode);
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleNotificationToggle = () => setIsNotificationOpen(!isNotificationOpen);

  // Sidebar offset: only on desktop (lg+)
  const sidebarMargin = isDesktop ? (isCollapsed ? '96px' : '304px') : '0px';

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-40 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side */}
        <div
          className="flex items-center flex-1 gap-3 transition-all duration-500 ease-in-out"
          style={{ marginLeft: sidebarMargin }}
        >
          {/* Hamburger button — visible only on mobile/tablet (<lg) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Abrir menú"
          >
            <Icon name={isMenuOpen ? 'X' : 'Menu'} size={22} />
          </Button>

          <div className={`relative flex-1 max-w-md transition-all duration-300 ease-in-out transform ${
            isSearchExpanded ? 'max-w-2xl scale-105' : 'scale-100'
          }`}>
            <form onSubmit={handleSearch} className="relative">
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'shadow-lg' : 'shadow-sm'}`}>
                <Input
                  type="text"
                  placeholder="Buscar promociones, cupones, clientes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className={`w-full pl-10 pr-10 py-2.5 bg-muted/50 border-muted-foreground/20 transition-all duration-300 ${
                    isSearchFocused 
                        ? 'bg-background ring-2 ring-blue-500 border-blue-500' :'hover:bg-muted/70'
                    }`}
                />
                <Icon 
                    name="Search" 
                    size={18} 
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      isSearchFocused ? 'text-blue-500 scale-110' : 'text-muted-foreground'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  )}
                </div>
              </form>

              {showSuggestions && filteredSuggestions?.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-dropdown z-50 overflow-hidden animate-fadeIn">
                  <div className="py-2">
                    {filteredSuggestions?.map((suggestion) => (
                      <button
                        key={suggestion?.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-all duration-200 text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                          <Icon 
                            name={suggestion?.icon} 
                            size={16} 
                            className="text-primary"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                            {suggestion?.title}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {suggestion?.type}
                          </p>
                        </div>
                        <Icon 
                          name="ArrowRight" 
                          size={16} 
                          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Notifications Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationToggle}
              className="relative hover:bg-muted transition-colors group"
            >
              <Icon name="Bell" size={20} className="text-muted-foreground group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
              {totalNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalNotifCount > 99 ? '99+' : totalNotifCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {isNotificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsNotificationOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-96 bg-popover border border-border rounded-xl shadow-dropdown z-20">
                  {/* Header with tabs */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
                      {totalNotifCount > 0 && (
                        <span className="text-xs text-muted-foreground">{totalNotifCount} no leídas</span>
                      )}
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveNotifTab('system')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeNotifTab === 'system' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon name="Bell" size={12} />
                        Sistema
                        {notificationCount > 0 && (
                          <span className="bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {notificationCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveNotifTab('campaigns')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeNotifTab === 'campaigns' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon name="Target" size={12} />
                        Campañas
                        {campaignNotifCount > 0 && (
                          <span className="bg-primary/20 text-primary text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {campaignNotifCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {/* System notifications tab */}
                    {activeNotifTab === 'system' && (
                      notifications?.length === 0 ? (
                        <div className="p-8 text-center">
                          <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No hay notificaciones del sistema</p>
                        </div>
                      ) : (
                        notifications?.map((notification) => (
                          <button
                            key={notification?.id}
                            onClick={() => handleNotificationClick(notification)}
                            className="w-full p-4 border-b border-border hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationTypeColor(notification?.alert_type)}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground line-clamp-1">{notification?.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification?.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(notification?.created_at)}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )
                    )}

                    {/* Campaign milestone notifications tab */}
                    {activeNotifTab === 'campaigns' && (
                      campaignNotifications?.length === 0 ? (
                        <div className="p-8 text-center">
                          <Icon name="Target" size={32} className="text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Sin hitos de campaña recientes</p>
                          <p className="text-xs text-muted-foreground mt-1">Las alertas aparecerán aquí en tiempo real</p>
                        </div>
                      ) : (
                        campaignNotifications?.map((notif) => {
                          const config = MILESTONE_CONFIG?.[notif?.milestone_type] || { icon: 'Bell', color: 'text-primary', bg: 'bg-primary/10' };
                          return (
                            <div
                              key={notif?.id}
                              className="flex items-start gap-3 p-4 border-b border-border hover:bg-muted/30 transition-colors"
                            >
                              <div className={`w-7 h-7 rounded-lg ${config?.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <Icon name={config?.icon} size={13} className={config?.color} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground line-clamp-1">{notif?.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif?.message}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">{formatTimestamp(notif?.created_at)}</p>
                              </div>
                              <button
                                onClick={(e) => { e?.stopPropagation(); handleMarkCampaignNotifRead(notif?.id); }}
                                className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                                title="Marcar como leída"
                              >
                                <Icon name="Check" size={12} className="text-muted-foreground" />
                              </button>
                            </div>
                          );
                        })
                      )
                    )}
                  </div>

                  <div className="p-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-center"
                      onClick={() => {
                        setIsNotificationOpen(false);
                        navigate(activeNotifTab === 'campaigns' ? '/campaigns-management' : '/notifications');
                      }}
                    >
                      {activeNotifTab === 'campaigns' ? 'Ver todas las campañas' : 'Ver todas las notificaciones'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={handleThemeToggle} title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} className="hover:bg-muted transition-colors group">
            <Icon name={isDarkMode ? 'Sun' : 'Moon'} size={20} className="text-muted-foreground group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button variant="ghost" size="icon" onClick={handleFullscreenToggle} title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} className="hover:bg-muted transition-colors group">
            <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={20} className="text-muted-foreground group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
          </Button>

          {/* User Profile — click navigates directly to /profile */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-1 hover:bg-muted transition-colors group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-1 ${
                isEmployee
                  ? 'bg-indigo-100 ring-indigo-300 dark:bg-indigo-900/30 dark:ring-indigo-700' :'bg-primary/10 ring-primary/20'
              }`}>
                <span className={`text-xs font-semibold leading-none ${
                  isEmployee ? 'text-indigo-700 dark:text-indigo-400' : 'text-primary'
                }`}>
                  {user?.name
                    ? user?.name?.split(' ')?.map(n => n?.[0])?.slice(0, 2)?.join('')?.toUpperCase()
                    : user?.email
                      ? user?.email?.[0]?.toUpperCase()
                      : 'U'}
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>
      {/* Notification Detail Modal */}
      {showDetailModal && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedNotification(null);
          }}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </header>
  );
};

export default Header;