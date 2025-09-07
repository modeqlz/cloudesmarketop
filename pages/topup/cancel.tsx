// pages/topup/cancel.tsx
import { useEffect } from 'react'
import Link from 'next/link'

export default function TopUpCancel() {
  useEffect(() => {
    // Автоматически закрываем WebApp через 3 секунды
    const timer = setTimeout(() => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.close()
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="cancel-page">
      <div className="cancel-content">
        <div className="cancel-icon">❌</div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges were made to your account.</p>

        <div className="cancel-actions">
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
          <p>💡 This window will close automatically in 3 seconds</p>
        </div>
      </div>

      <style jsx>{`
        .cancel-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .cancel-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 40px 30px;
          text-align: center;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .cancel-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        h1 {
          color: #2d3748;
          margin-bottom: 16px;
          font-size: 28px;
          font-weight: 700;
        }

        p {
          color: #718096;
          margin-bottom: 24px;
          font-size: 16px;
          line-height: 1.5;
        }

        .cancel-actions {
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
          .cancel-content {
            padding: 30px 20px;
          }

          .cancel-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}