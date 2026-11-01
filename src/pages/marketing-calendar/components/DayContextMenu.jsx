import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const MENU_OPTIONS = [
  { key: 'promotion', label: 'Crear promoción', icon: 'Tag', path: '/promotions-management/new', color: 'text-red-600' },
  { key: 'campaign', label: 'Crear campaña', icon: 'Zap', path: '/campaigns-management/new', color: 'text-blue-600' },
  { key: 'coupon', label: 'Crear cupón', icon: 'Ticket', path: '/coupons-management', color: 'text-green-600' },
  { key: 'event', label: 'Crear evento', icon: 'CalendarPlus', path: '/promotions-management/new', color: 'text-pink-600' },
];

const DayContextMenu = ({ date, position, onClose }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef?.current && !menuRef?.current?.contains(e?.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelect = (option) => {
    navigate(`${option?.path}?date=${date}`);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-52"
      style={{ top: position?.y || 100, left: position?.x || 100 }}
    >
      <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agregar al {date}</span>
      </div>
      {MENU_OPTIONS?.map(opt => (
        <button
          key={opt?.key}
          onClick={() => handleSelect(opt)}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
        >
          <Icon name={opt?.icon} size={16} className={opt?.color} />
          <span className="text-sm text-gray-700">{opt?.label}</span>
        </button>
      ))}
    </div>
  );
};

export default DayContextMenu;
