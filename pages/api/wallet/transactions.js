// pages/api/wallet/transactions.js
import { supabaseAdmin } from '../../../lib/supabase';
import { verifyTelegramAuth } from '../../../lib/verifyTelegramAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем авторизацию Telegram
    const user = verifyTelegramAuth(req.query);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit = 10, offset = 0 } = req.query;

    // Получаем транзакции пользователя
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        id, type, amount, currency, status, payment_method,
        description, created_at, updated_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    // Форматируем транзакции для фронтенда
    const formattedTransactions = transactions.map(transaction => {
      let icon = '+';
      let className = 'income';
      
      if (transaction.type === 'withdrawal' || transaction.type === 'transfer_out' || transaction.type === 'purchase') {
        icon = '-';
        className = 'expense';
      } else if (transaction.type === 'transfer_in' || transaction.type === 'transfer_out') {
        icon = '⇄';
        className = 'transfer';
      }

      return {
        id: transaction.id,
        icon,
        className,
        title: transaction.description || getTransactionTitle(transaction.type),
        date: formatDate(transaction.created_at),
        amount: `${icon === '-' ? '-' : '+'}${transaction.amount.toLocaleString('ru-RU')} ₽`,
        status: transaction.status
      };
    });

    res.status(200).json({
      transactions: formattedTransactions,
      hasMore: transactions.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Transactions API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function getTransactionTitle(type) {
  const titles = {
    'deposit': 'Пополнение баланса',
    'withdrawal': 'Вывод средств',
    'transfer_in': 'Входящий перевод',
    'transfer_out': 'Исходящий перевод',
    'purchase': 'Покупка',
    'refund': 'Возврат средств'
  };
  return titles[type] || 'Операция';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  }
}