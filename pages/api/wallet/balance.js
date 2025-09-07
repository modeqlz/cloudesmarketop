// pages/api/wallet/balance.js
import { supabaseServer } from '../../../lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Получаем telegram_id из query параметров
    const { telegram_id } = req.query

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' })
    }

    // Получаем баланс пользователя
    const { data: balance, error: balanceError } = await supabaseServer
      .from('balances')
      .select('balance_cents, currency, updated_at')
      .eq('telegram_id', telegram_id)
      .eq('currency', 'USD')
      .single()

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('Error fetching balance:', balanceError)
      return res.status(500).json({ error: 'Failed to fetch balance' })
    }

    // Если баланса нет, создаем с нулевым значением
    if (!balance) {
      const { data: newBalance, error: createError } = await supabaseServer
        .from('balances')
        .insert({
          telegram_id: parseInt(telegram_id),
          balance_cents: 0,
          currency: 'USD'
        })
        .select('balance_cents, currency, updated_at')
        .single()

      if (createError) {
        console.error('Error creating balance:', createError)
        return res.status(500).json({ error: 'Failed to create balance' })
      }

      return res.status(200).json({
        balance_cents: newBalance.balance_cents,
        balance_usd: newBalance.balance_cents / 100,
        currency: newBalance.currency,
        last_updated: newBalance.updated_at
      })
    }

    res.status(200).json({
      balance_cents: balance.balance_cents,
      balance_usd: balance.balance_cents / 100,
      currency: balance.currency,
      last_updated: balance.updated_at
    })

  } catch (error) {
    console.error('Balance API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}