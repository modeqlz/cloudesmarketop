// pages/api/wallet/transactions.js
import { supabaseServer } from '../../../lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { telegram_id, limit = 20, offset = 0 } = req.query

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' })
    }

    // Получаем транзакции пользователя
    const { data: transactions, error } = await supabaseServer
      .from('wallet_tx')
      .select(`
        id,
        amount_cents,
        kind,
        provider,
        status,
        description,
        stripe_session_id,
        created_at
      `)
      .eq('telegram_id', telegram_id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      console.error('Error fetching transactions:', error)
      return res.status(500).json({ error: 'Failed to fetch transactions' })
    }

    // Форматируем транзакции для фронтенда
    const formattedTransactions = transactions.map(transaction => {
      let icon = '+'
      let className = 'income'
      let title = transaction.description || getTransactionTitle(transaction.kind)
      
      if (transaction.kind === 'withdrawal' || transaction.kind === 'purchase') {
        icon = '-'
        className = 'expense'
      } else if (transaction.kind === 'transfer_in' || transaction.kind === 'transfer_out') {
        icon = '⇄'
        className = 'transfer'
      }

      return {
        id: transaction.id,
        icon,
        className,
        title,
        amount_cents: transaction.amount_cents,
        amount_usd: transaction.amount_cents / 100,
        amount_display: `${icon === '-' ? '-' : '+'}$${(transaction.amount_cents / 100).toFixed(2)}`,
        provider: transaction.provider,
        status: transaction.status,
        date: formatDate(transaction.created_at),
        created_at: transaction.created_at
      }
    })

    res.status(200).json({
      transactions: formattedTransactions,
      has_more: transactions.length === parseInt(limit)
    })

  } catch (error) {
    console.error('Transactions API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

function getTransactionTitle(kind) {
  const titles = {
    'topup': 'Wallet Top-up',
    'withdrawal': 'Withdrawal',
    'purchase': 'Purchase',
    'refund': 'Refund',
    'transfer_in': 'Transfer In',
    'transfer_out': 'Transfer Out'
  }
  return titles[kind] || 'Transaction'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}