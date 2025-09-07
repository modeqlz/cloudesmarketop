// components/TopUpModal.js
import { useState, useEffect } from 'react';

export default function TopUpModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);

  // Предустановленные суммы
  const presetAmounts = [100, 500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    if (isOpen) {
      // Проверяем доступность Google Pay
      checkGooglePayAvailability();
    }
  }, [isOpen]);

  const checkGooglePayAvailability = async () => {
    try {
      if (window.google && window.google.payments) {
        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: 'TEST' // В продакшене: 'PRODUCTION'
        });

        const isReadyToPay = await paymentsClient.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA']
            }
          }]
        });

        setGooglePayAvailable(isReadyToPay.result);
      }
    } catch (error) {
      console.error('Google Pay check failed:', error);
      setGooglePayAvailable(false);
    }
  };

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
    setError('');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
    setError('');
  };

  const validateAmount = () => {
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount < 50) {
      setError('Минимальная сумма пополнения: 50 ₽');
      return false;
    }
    if (numAmount > 100000) {
      setError('Максимальная сумма пополнения: 100,000 ₽');
      return false;
    }
    return true;
  };

  const handleGooglePay = async () => {
    if (!validateAmount()) return;

    setIsLoading(true);
    setError('');

    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST'
      });

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example', // Замените на вашего провайдера
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }],
        merchantInfo: {
          merchantId: 'your-merchant-id',
          merchantName: 'Cloudes Market'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: amount,
          currencyCode: 'RUB',
          countryCode: 'RU'
        }
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      
      // Отправляем данные платежа на сервер
      const response = await fetch('/api/wallet/googlepay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseInt(amount),
          currency: 'RUB',
          paymentToken: paymentData.paymentMethodData.tokenizationData.token,
          paymentMethodData: paymentData.paymentMethodData,
          initData: window.Telegram?.WebApp?.initData || {}
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess && onSuccess(result);
        onClose();
        setAmount('');
      } else {
        setError(result.error || 'Ошибка при обработке платежа');
      }

    } catch (error) {
      console.error('Payment error:', error);
      if (error.statusCode === 'CANCELED') {
        setError('Платеж отменен пользователем');
      } else {
        setError('Ошибка при обработке платежа. Попробуйте снова.');
      }
    }

    setIsLoading(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="topup-overlay" onClick={handleBackdropClick}>
      <div className="topup-modal">
        <div className="topup-header">
          <h3>Пополнение баланса</h3>
          <button 
            className="topup-close" 
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="topup-content">
          {/* Быстрый выбор суммы */}
          <div className="amount-presets">
            <div className="presets-title">Выберите сумму:</div>
            <div className="presets-grid">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  className={`preset-button ${amount === preset.toString() ? 'active' : ''}`}
                  onClick={() => handleAmountSelect(preset)}
                  disabled={isLoading}
                >
                  {preset.toLocaleString('ru-RU')} ₽
                </button>
              ))}
            </div>
          </div>

          {/* Ввод произвольной суммы */}
          <div className="custom-amount">
            <label className="amount-label">Или введите свою сумму:</label>
            <div className="amount-input-wrapper">
              <input
                type="text"
                className="amount-input"
                placeholder="Введите сумму"
                value={amount}
                onChange={handleAmountChange}
                disabled={isLoading}
              />
              <span className="currency-suffix">₽</span>
            </div>
            <div className="amount-hint">От 50 до 100,000 рублей</div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="topup-error">
              {error}
            </div>
          )}

          {/* Кнопки оплаты */}
          <div className="payment-methods">
            {googlePayAvailable ? (
              <button
                className="google-pay-button"
                onClick={handleGooglePay}
                disabled={isLoading || !amount}
              >
                {isLoading ? (
                  <div className="loading-spinner">⏳</div>
                ) : (
                  <>
                    <img 
                      src="https://developers.google.com/pay/api/web/guides/brand-guidelines/google-pay-mark.svg" 
                      alt="Google Pay"
                      className="google-pay-logo"
                    />
                    <span>Оплатить {amount ? `${parseInt(amount).toLocaleString('ru-RU')} ₽` : ''}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="payment-unavailable">
                <div className="unavailable-icon">❌</div>
                <div className="unavailable-text">
                  Google Pay недоступен в вашем браузере
                </div>
                <div className="unavailable-hint">
                  Попробуйте использовать Chrome или другой поддерживаемый браузер
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}