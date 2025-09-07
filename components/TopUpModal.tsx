// components/TopUpModal.tsx
import { useState } from 'react'

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
}

export default function TopUpModal({ isOpen, onClose, userId }: TopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Предустановленные суммы в центах (USD)
  const presetAmounts = [
    { label: '$1.00', cents: 100 },
    { label: '$2.50', cents: 250 },
    { label: '$5.00', cents: 500 },
    { label: '$10.00', cents: 1000 },
  ]

  const handlePresetSelect = (cents: number) => {
    setSelectedAmount(cents)
    setCustomAmount('')
    setError('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
    setError('')
  }

  const getAmountInCents = (): number | null => {
    if (selectedAmount) return selectedAmount
    
    const customValue = parseFloat(customAmount)
    if (isNaN(customValue) || customValue <= 0) return null
    
    return Math.round(customValue * 100)
  }

  const validateAmount = (cents: number): string | null => {
    if (cents < 50) return 'Minimum amount is $0.50'
    if (cents > 99999) return 'Maximum amount is $999.99'
    return null
  }

  const handlePayment = async () => {
    const amountCents = getAmountInCents()
    
    if (!amountCents) {
      setError('Please enter a valid amount')
      return
    }

    const validationError = validateAmount(amountCents)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Создаем Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountCents,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // ВАЖНО: Всегда открываем Stripe Checkout во внешнем браузере
      // Это необходимо для поддержки Google Pay, который не работает в WebView
      if (window.Telegram?.WebApp) {
        // Открываем во внешнем браузере (Chrome/Android) где доступен Google Pay
        window.Telegram.WebApp.openLink(data.url, { try_instant_view: false })
      } else {
        // Fallback для тестирования в обычном браузере
        window.open(data.url, '_blank')
      }

      // Закрываем модал
      onClose()
    } catch (err) {
      console.error('Payment error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      
      // Показываем ошибку пользователю
      setError(errorMessage)
      
      // Также показываем toast в Telegram WebApp если доступен
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(`Ошибка: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="topup-overlay" onClick={handleBackdropClick}>
      <div className="topup-modal">
        <div className="topup-header">
          <h3>💳 Top Up Wallet</h3>
          <button 
            className="topup-close" 
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="topup-content">
          {/* Предустановленные суммы */}
          <div className="preset-amounts">
            <h4>Quick amounts:</h4>
            <div className="preset-grid">
              {presetAmounts.map((preset) => (
                <button
                  key={preset.cents}
                  className={`preset-btn ${selectedAmount === preset.cents ? 'active' : ''}`}
                  onClick={() => handlePresetSelect(preset.cents)}
                  disabled={isLoading}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Произвольная сумма */}
          <div className="custom-amount">
            <h4>Or enter custom amount:</h4>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                className="amount-input"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                disabled={isLoading}
                min="0.50"
                max="999.99"
                step="0.01"
              />
            </div>
            <p className="amount-hint">Min: $0.50, Max: $999.99</p>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Кнопка оплаты */}
          <button
            className="pay-button"
            onClick={handlePayment}
            disabled={isLoading || !getAmountInCents()}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Processing...
              </>
            ) : (
              <>
                💳 Open Payment Page
                {getAmountInCents() && ` ($${(getAmountInCents()! / 100).toFixed(2)})`}
              </>
            )}
          </button>

          <p className="payment-note">
            💡 Payment will open in your browser where Google Pay and all cards are supported.
          </p>
        </div>
      </div>
    </div>
  )
}