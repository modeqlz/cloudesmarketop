// pages/api/stripe-webhook.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import Stripe from 'stripe'
import { supabaseServer } from '../../lib/supabaseServer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Отключаем парсинг body для получения raw данных
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature'] as string

  if (!sig) {
    console.error('Missing stripe-signature header')
    return res.status(400).json({ error: 'Missing signature' })
  }

  let event: Stripe.Event

  try {
    // Верифицируем webhook signature
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  console.log('Received Stripe event:', event.type, event.id)

  try {
    // Обрабатываем успешную оплату
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log('Processing checkout session:', session.id)
      
      const userId = Number(session.metadata?.userId)
      const amountCents = session.amount_total || 0
      
      if (!userId || !amountCents) {
        console.error('Missing userId or amountCents:', { userId, amountCents })
        return res.status(400).json({ error: 'Invalid session metadata' })
      }

      // Записываем транзакцию в базу данных
      const { error: txError } = await supabaseServer
        .from('wallet_tx')
        .insert({
          telegram_id: userId,
          amount_cents: amountCents,
          kind: 'topup',
          provider: 'stripe_gpay',
          status: 'succeeded',
          stripe_session_id: session.id,
          description: `Wallet top-up via Stripe: $${(amountCents / 100).toFixed(2)}`,
        })

      if (txError) {
        console.error('Failed to insert transaction:', txError)
        return res.status(500).json({ error: 'Database error' })
      }

      // Увеличиваем баланс пользователя через RPC функцию
      const { data: newBalance, error: balanceError } = await supabaseServer
        .rpc('wallet_increment', {
          p_user: userId,
          p_amount_cents: amountCents
        })

      if (balanceError) {
        console.error('Failed to increment balance:', balanceError)
        return res.status(500).json({ error: 'Failed to update balance' })
      }

      console.log(`Successfully processed payment for user ${userId}: +$${(amountCents / 100).toFixed(2)}, new balance: $${((newBalance || 0) / 100).toFixed(2)}`)
    }

    // Возвращаем успешный ответ
    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}