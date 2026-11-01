import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';


const GamificationNotificationActions = ({ notification }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (notification?.actionUrl) {
      navigate(notification?.actionUrl);
    }
  };

  const handleReward = () => {
    console.log('Recompensando usuario:', notification?.actionData);
    // Simulate reward action
    alert(`Recompensa enviada a usuario ID: ${notification?.actionData?.userId}`);
  };

  const handleCelebrate = () => {
    console.log('Celebrando logro:', notification?.actionData);
    // Simulate celebration action
    alert(`¡Celebración enviada por ${notification?.actionData?.badgeName || notification?.actionData?.missionName || 'logro'}!`);
  };

  const handleBoost = () => {
    console.log('Aplicando boost:', notification?.actionData);
    // Simulate boost action
    alert(`Boost aplicado: +${notification?.actionData?.multiplier || 1}x puntos`);
  };

  const renderActions = () => {
    switch (notification?.type) {
      case 'streak_completed':
        return (
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetails}
              iconName="Eye"
              iconSize={14}
            >
              Ver Racha
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={handleBoost}
              iconName="Zap"
              iconSize={14}
            >
              Aplicar Boost
            </Button>
          </div>
        );

      case 'mission_unlocked':
        return (
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetails}
              iconName="Eye"
              iconSize={14}
            >
              Ver Misión
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={handleReward}
              iconName="Gift"
              iconSize={14}
            >
              Enviar Recompensa
            </Button>
          </div>
        );

      case 'level_up':
        return (
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetails}
              iconName="Eye"
              iconSize={14}
            >
              Ver Progreso
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={handleCelebrate}
              iconName="PartyPopper"
              iconSize={14}
            >
              Celebrar
            </Button>
          </div>
        );

      case 'badge_earned':
        return (
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetails}
              iconName="Eye"
              iconSize={14}
            >
              Ver Badge
            </Button>
            <Button
              size="sm"
              variant="warning"
              onClick={handleCelebrate}
              iconName="Trophy"
              iconSize={14}
            >
              Destacar Logro
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const isGamificationNotification = [
    'streak_completed',
    'mission_unlocked',
    'level_up',
    'badge_earned'
  ]?.includes(notification?.type);

  if (!isGamificationNotification) {
    return null;
  }

  return (
    <div className="border-t border-border pt-3 mt-2">
      {renderActions()}
    </div>
  );
};

export default GamificationNotificationActions;