// pages/test-payment.tsx
// Простая страница для тестирования платежей без Stripe UI
import { useState } from 'react'

export default function TestPayment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTestPayment = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Создаем тестовую сессию
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountCents: 500, // $5.00
          userId: 123456789, // Тестовый ID
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Открываем во внешнем браузере
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openLink(data.url, { try_instant_view: false })
      } else {
        window.open(data.url, '_blank')
      }

    } catch (err) {
      console.error('Test payment error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Test Payment Page</h1>
      <p>This page tests payment without any Stripe UI components.</p>
      
      <button 
        onClick={handleTestPayment}
        disabled={isLoading}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? 'Creating Session...' : 'Test $5.00 Payment'}
      </button>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h3>How it works:</h3>
        <ol>
          <li>Click the button above</li>
          <li>Session is created on server</li>
          <li>Payment page opens in external browser</li>
          <li>Google Pay will be available there</li>
        </ol>
      </div>
    </div>
  )
}