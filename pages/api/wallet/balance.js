// pages/api/wallet/balance.js
import { supabaseServer } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telegram_id } = req.query;

  if (!telegram_id) {
    return res.status(400).json({ error: 'Telegram ID is required' });
  }

  try {
    // Проверяем, существует ли кошелек
    let { data: balanceData, error: fetchError } = await supabaseServer
      .from('balances')
      .select('balance_cents')
      .eq('telegram_id', telegram_id)
      .eq('currency', 'USD')
      .single();

    if (fetchError && fetchError.code === 'PGRST116') { // No rows found
      // Если кошелька нет, создаем его с 0 балансом
      const { data: newBalanceData, error: insertError } = await supabaseServer
        .from('balances')
        .insert({ telegram_id: telegram_id, balance_cents: 0, currency: 'USD' })
        .select('balance_cents')
        .single();

      if (insertError) {
        console.error('Error creating new wallet:', insertError);
        return res.status(500).json({ error: 'Failed to create wallet' });
      }
      balanceData = newBalanceData;
    } else if (fetchError) {
      console.error('Error fetching balance:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch balance' });
    }

    res.status(200).json({ balance_usd: (balanceData?.balance_cents || 0) / 100.0 });
  } catch (error) {
    console.error('Unexpected error in balance API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

