// components/Sidebar.js
import { useState, useEffect } from 'react';

export default function Sidebar({ isOpen, onClose, user }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Закрытие по клику на backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Заголовок с пользователем */}
        <div className="sidebar-header">
          <div className="sidebar-user">
            {user?.photo_url ? (
              <img 
                src={user.photo_url} 
                alt={user.first_name}
                className="sidebar-avatar"
              />
            ) : (
              <div className="sidebar-avatar-placeholder">
                {user?.first_name?.charAt(0) || '👤'}
              </div>
            )}
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.first_name} {user?.last_name || ''}
              </div>
              <div className="sidebar-user-handle">
                @{user?.username || 'пользователь'}
              </div>
            </div>
          </div>
          
          <button className="sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Основное меню */}
        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-section-title">🎮 Игровое</div>
            <a href="/profile" className="sidebar-item">
              <span className="sidebar-item-icon">👤</span>
              <span>Мой профиль</span>
            </a>
            <a href="/search" className="sidebar-item">
              <span className="sidebar-item-icon">🔍</span>
              <span>Найти игроков</span>
            </a>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">💰 Маркет</div>
            <a href="#" className="sidebar-item">
              <span className="sidebar-item-icon">🏪</span>
              <span>Скины и предметы</span>
            </a>
            <a href="#" className="sidebar-item">
              <span className="sidebar-item-icon">🎯</span>
              <span>Аукционы</span>
            </a>
            <a href="#" className="sidebar-item">
              <span className="sidebar-item-icon">📦</span>
              <span>Мои заказы</span>
            </a>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">⚙️ Настройки</div>
            <a href="#" className="sidebar-item">
              <span className="sidebar-item-icon">🌟</span>
              <span>Премиум</span>
            </a>
            <a href="#" className="sidebar-item">
              <span className="sidebar-item-icon">💬</span>
              <span>Поддержка</span>
            </a>
          </div>
        </div>

        {/* Футер */}
        <div className="sidebar-footer">
          <div className="sidebar-app-info">
            <div className="sidebar-app-name">Cloudes Market</div>
            <div className="sidebar-app-version">v1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}