// components/WalletMenu.js
import { useState, useEffect } from 'react';
import TopUpModal from './TopUpModal';

export default function WalletMenu({ isOpen, onClose, user }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      loadWalletData(); // Загружаем данные при открытии
    } else {
      setIsTopUpOpen(false); // Закрываем TopUpModal при закрытии кошелька
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const loadWalletData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Загружаем баланс и транзакции параллельно
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch(`/api/wallet/balance?telegram_id=${user.id}`),
        fetch(`/api/wallet/transactions?telegram_id=${user.id}&limit=10`)
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance_usd || 0);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);
      }

    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
    setLoading(false);
  };

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
              <div className="balance-amount">
                {loading ? '⏳' : `$${balance.toFixed(2)}`}
              </div>
              <div className="balance-subtitle">Доступно для покупок</div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="wallet-actions">
          <div className="action-button" onClick={() => setIsTopUpOpen(true)}>
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
              {loading ? (
                <div className="transactions-loading">
                  <div className="loading-spinner">⏳</div>
                  <div>Загружаем операции...</div>
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className={`transaction-icon ${transaction.className}`}>
                      {transaction.icon}
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-title">{transaction.title}</div>
                      <div className="transaction-date">{transaction.date}</div>
                    </div>
                    <div className={`transaction-amount ${transaction.className}`}>
                      {transaction.amount_display}
                    </div>
                  </div>
                ))
              ) : (
                <div className="transactions-empty">
                  <div className="empty-icon">📭</div>
                  <div className="empty-text">Пока операций нет</div>
                  <div className="empty-hint">Пополните баланс, чтобы начать пользоваться кошельком</div>
                </div>
              )}
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

      {/* TopUp Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        userId={user?.id || 0}
        onSuccess={() => {
          // Обновляем данные после успешного пополнения
          loadWalletData();
        }}
      />
    </div>
  );
}