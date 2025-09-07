// components/WalletMenu.js
import { useState, useEffect } from 'react';

export default function WalletMenu({ isOpen, onClose, user }) {
  const [isVisible, setIsVisible] = useState(false);
  const [balance, setBalance] = useState(1250);

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
              <div className="balance-amount">{balance.toLocaleString('ru-RU')} ₽</div>
              <div className="balance-subtitle">Доступно для покупок</div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="wallet-actions">
          <div className="action-button">
            <div className="action-icon">📥</div>
            <span>Пополнить</span>
          </div>
          <div className="action-button">
            <div className="action-icon">📤</div>
            <span>Вывести</span>
          </div>
          <div className="action-button">
            <div className="action-icon">💸</div>
            <span>Перевод</span>
          </div>
        </div>

        {/* История транзакций */}
        <div className="wallet-content">
          <div className="transactions-section">
            <div className="section-title">📈 История операций</div>
            
            <div className="transaction-list">
              <div className="transaction-item">
                <div className="transaction-icon income">+</div>
                <div className="transaction-info">
                  <div className="transaction-title">Пополнение баланса</div>
                  <div className="transaction-date">Сегодня, 14:30</div>
                </div>
                <div className="transaction-amount income">+500 ₽</div>
              </div>

              <div className="transaction-item">
                <div className="transaction-icon expense">-</div>
                <div className="transaction-info">
                  <div className="transaction-title">Покупка скина AK-47</div>
                  <div className="transaction-date">Вчера, 18:45</div>
                </div>
                <div className="transaction-amount expense">-1,200 ₽</div>
              </div>

              <div className="transaction-item">
                <div className="transaction-icon income">+</div>
                <div className="transaction-info">
                  <div className="transaction-title">Продажа предмета</div>
                  <div className="transaction-date">25 дек, 12:15</div>
                </div>
                <div className="transaction-amount income">+850 ₽</div>
              </div>

              <div className="transaction-item">
                <div className="transaction-icon transfer">⇄</div>
                <div className="transaction-info">
                  <div className="transaction-title">Перевод пользователю</div>
                  <div className="transaction-date">23 дек, 09:20</div>
                </div>
                <div className="transaction-amount transfer">-300 ₽</div>
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