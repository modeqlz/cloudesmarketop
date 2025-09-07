// pages/api/wallet/transactions.js
import { supabaseServer } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telegram_id, limit = 10 } = req.query;

  if (!telegram_id) {
    return res.status(400).json({ error: 'Telegram ID is required' });
  }

  try {
    const { data: transactions, error } = await supabaseServer
      .from('wallet_tx')
      .select('*')
      .eq('telegram_id', telegram_id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    // Форматируем данные для отображения
    const formattedTransactions = transactions.map(tx => {
      const amount = tx.amount_cents / 100.0;
      let title = '';
      let icon = '';
      let className = '';

      switch (tx.kind) {
        case 'topup':
          title = 'Пополнение баланса';
          icon = '📥';
          className = 'income';
          break;
        case 'purchase':
          title = tx.description || 'Покупка';
          icon = '🛒';
          className = 'expense';
          break;
        case 'withdrawal':
          title = 'Вывод средств';
          icon = '📤';
          className = 'expense';
          break;
        case 'refund':
          title = 'Возврат средств';
          icon = '↩️';
          className = 'income';
          break;
        default:
          title = tx.description || 'Операция';
          icon = '🔄';
          className = '';
      }

      return {
        id: tx.id,
        title: title,
        date: new Date(tx.created_at).toLocaleString('ru-RU', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        amount_display: `${amount > 0 ? '+' : ''}${amount.toFixed(2)} $`,
        icon: icon,
        className: className,
      };
    });

    res.status(200).json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Unexpected error in transactions API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

