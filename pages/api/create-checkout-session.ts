// pages/api/create-checkout-session.ts
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { amountCents, userId } = req.body

    // Валидация входных данных
    if (!amountCents || !userId || typeof amountCents !== 'number' || typeof userId !== 'number') {
      return res.status(400).json({ error: 'Invalid amountCents or userId' })
    }

    // Минимальная сумма $0.50 (50 центов)
    if (amountCents < 50) {
      return res.status(400).json({ error: 'Minimum amount is $0.50' })
    }

    // Максимальная сумма $999.99
    if (amountCents > 99999) {
      return res.status(400).json({ error: 'Maximum amount is $999.99' })
    }

    // Создаем Stripe Checkout Session
    // ВАЖНО: Этот session.url будет открыт во внешнем браузере через Telegram WebApp
    // где Google Pay будет доступен автоматически
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'], // Google Pay включается автоматически для card
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: 'Wallet Top-up',
              description: `Add $${(amountCents / 100).toFixed(2)} to your wallet`,
              images: ['https://via.placeholder.com/300x200?text=Wallet+Top-up'],
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/topup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/topup/cancel`,
      metadata: {
        userId: String(userId),
        kind: 'wallet_topup',
        source: 'telegram_webapp', // Помечаем что запрос из Telegram WebApp
      },
      // Настройки для лучшей поддержки Google Pay
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      // Отключаем автоматические налоги
      automatic_tax: { enabled: false },
      // Настройки для мобильных устройств
      phone_number_collection: {
        enabled: false,
      },
      // Дополнительные настройки для WebView
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: [],
      },
      // Отключаем сбор адреса доставки
      allow_promotion_codes: false,
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe session creation error:', error)
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}