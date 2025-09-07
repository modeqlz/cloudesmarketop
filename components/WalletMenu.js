// components/WalletMenu.js
import { useState, useEffect } from 'react';

export default function WalletMenu({ isOpen, onClose, user }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Закрытие по ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Закрытие по клику на backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`wallet-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`wallet-menu ${isOpen ? 'open' : ''}`}>
        {/* Заголовок кошелька */}
        <div className="wallet-header">
          <button className="wallet-back" onClick={onClose}>
            ←
          </button>
          <div className="wallet-header-title">Мой кошелек</div>
          <div className="wallet-header-spacer"></div>
        </div>

        {/* Основной баланс */}
        <div className="wallet-balance-section">
          <div className="balance-card">
            <div className="balance-icon">💳</div>
            <div className="balance-info">
              <div className="balance-label">Общий баланс</div>
              <div className="balance-amount">$0.00</div>
              <div className="balance-subtitle">Доступно для покупок</div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="wallet-actions">
          <div className="action-button" onClick={() => alert('Функция в разработке')}>
            <div className="action-icon">💳</div>
            <span>Пополнить</span>
          </div>
          <div className="action-button" onClick={() => alert('Функция в разработке')}>
            <div className="action-icon">📤</div>
            <span>Вывести</span>
          </div>
          <div className="action-button" onClick={() => alert('Функция в разработке')}>
            <div className="action-icon">💸</div>
            <span>Перевод</span>
          </div>
        </div>

        {/* История транзакций */}
        <div className="wallet-content">
          <div className="transactions-section">
            <div className="section-title">📈 История операций</div>
            
            <div className="transaction-list">
              <div className="transactions-empty">
                <div className="empty-icon">📭</div>
                <div className="empty-text">Пока операций нет</div>
                <div className="empty-hint">Пополните баланс, чтобы начать пользоваться кошельком</div>
              </div>
            </div>

            <button className="show-all-button">
              Показать всю историю
            </button>
          </div>

          {/* Карты и способы оплаты */}
          <div className="payment-methods-section">
            <div className="section-title">💳 Способы пополнения</div>
            
            <div className="payment-method">
              <div className="payment-icon">🏦</div>
              <div className="payment-info">
                <div className="payment-name">Банковская карта</div>
                <div className="payment-desc">Visa, MasterCard, МИР</div>
              </div>
              <div className="payment-arrow">→</div>
            </div>

            <div className="payment-method">
              <div className="payment-icon">📱</div>
              <div className="payment-info">
                <div className="payment-name">СБП</div>
                <div className="payment-desc">Быстрые платежи</div>
              </div>
              <div className="payment-arrow">→</div>
            </div>

            <div className="payment-method">
              <div className="payment-icon">🎮</div>
              <div className="payment-info">
                <div className="payment-name">Steam кошелек</div>
                <div className="payment-desc">Обмен средств Steam</div>
              </div>
              <div className="payment-arrow">→</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}