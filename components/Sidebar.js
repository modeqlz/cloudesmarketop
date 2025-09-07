// components/Sidebar.js
import { useState, useEffect } from 'react';
import WalletMenu from './WalletMenu';

export default function Sidebar({ isOpen, onClose, user }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsWalletOpen(false); // Закрываем кошелек при закрытии сайдбара
      const timeout = setTimeout(() => setIsVisible(false), 200);
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

  const avatar = user?.photo_url || null;
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Гость';
  const username = user?.username ? `@${user.username}` : '';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div 
      className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
      onClick={handleBackdropClick}
    >
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Заголовок с пользователем */}
        <div className="sidebar-header">
          <div className="sidebar-user">
            {avatar ? (
              <img src={avatar} alt="User Avatar" className="sidebar-avatar" />
            ) : (
              <div className="sidebar-avatar-placeholder">{initial}</div>
            )}
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{name}</div>
              {username && <div className="sidebar-user-handle">{username}</div>}
            </div>
          </div>
          
          <button className="sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Закрепленный кошелек */}
        <div className="sidebar-wallet">
          <div className="wallet-card" onClick={() => setIsWalletOpen(true)}>
            <div className="wallet-icon">💳</div>
            <div className="wallet-info">
              <div className="wallet-title">Мой кошелек</div>
              <div className="wallet-balance">1,250 ₽</div>
            </div>
            <div className="wallet-arrow">→</div>
          </div>
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
              <span>Найти игрока</span>
            </a>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">💰 Маркет</div>
            <a href="/market" className="sidebar-item">
              <span className="sidebar-item-icon">🛒</span>
              <span>Скины</span>
            </a>
            <a href="/auctions" className="sidebar-item">
              <span className="sidebar-item-icon">🔥</span>
              <span>Аукционы</span>
            </a>
            <a href="/inventory" className="sidebar-item">
              <span className="sidebar-item-icon">🎒</span>
              <span>Мои заказы</span>
            </a>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">⚙️ Настройки</div>
            <a href="/plans" className="sidebar-item">
              <span className="sidebar-item-icon">💎</span>
              <span>Премиум</span>
            </a>
            <a href="/support" className="sidebar-item">
              <span className="sidebar-item-icon">💬</span>
              <span>Поддержка</span>
            </a>
          </div>
        </div>

        {/* Подвал */}
        <div className="sidebar-footer">
          <div className="sidebar-app-info">
            <div className="sidebar-app-name">Cloudes Market</div>
            <div className="sidebar-app-version">v1.0.0</div>
          </div>
        </div>
      </div>

      {/* Wallet Menu */}
      <WalletMenu 
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        user={user}
      />
    </div>
  );
}