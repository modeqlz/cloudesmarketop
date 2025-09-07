// pages/topup/success.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function TopUpSuccess() {
  const router = useRouter()
  const { session_id } = router.query
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Автоматически закрываем WebApp через 5 секунд
    const timer = setTimeout(() => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.close()
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (session_id) {
      // Можно добавить запрос к Stripe API для получения деталей сессии
      // Пока просто показываем успешное сообщение
      setLoading(false)
    }
  }, [session_id])

  if (loading) {
    return (
      <div className="success-page">
        <div className="success-content">
          <div className="loading-spinner">⏳</div>
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="success-page">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Your wallet has been topped up successfully.</p>
        
        {session_id && (
          <div className="session-info">
            <p className="session-id">Session ID: {session_id}</p>
          </div>
        )}

        <div className="success-actions">
          <Link href="/home" className="btn-primary">
            🏠 Back to Home
          </Link>
          
          <button 
            className="btn-secondary"
            onClick={() => {
              if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.close()
              } else {
                window.close()
              }
            }}
          >
            ✕ Close
          </button>
        </div>

        <div className="auto-close-notice">
          <p>💡 This window will close automatically in 5 seconds</p>
        </div>
      </div>

      <style jsx>{`
        .success-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .success-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 40px 30px;
          text-align: center;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .loading-spinner {
          font-size: 48px;
          margin-bottom: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        h1 {
          color: #2d3748;
          margin-bottom: 16px;
          font-size: 28px;
          font-weight: 700;
        }

        h2 {
          color: #4a5568;
          margin-bottom: 16px;
          font-size: 24px;
          font-weight: 600;
        }

        p {
          color: #718096;
          margin-bottom: 24px;
          font-size: 16px;
          line-height: 1.5;
        }

        .session-info {
          background: #f7fafc;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .session-id {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 12px;
          color: #4a5568;
          word-break: break-all;
          margin: 0;
        }

        .success-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5a67d8;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
          transform: translateY(-2px);
        }

        .auto-close-notice {
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
        }

        .auto-close-notice p {
          font-size: 12px;
          color: #a0aec0;
          margin: 0;
        }

        @media (max-width: 480px) {
          .success-content {
            padding: 30px 20px;
          }

          .success-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}