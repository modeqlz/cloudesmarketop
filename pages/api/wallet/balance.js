// pages/api/wallet/balance.js
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

    // Получаем баланс пользователя
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('id, balance, currency')
      .eq('user_id', user.id)
      .eq('currency', 'RUB')
      .eq('is_active', true)
      .single();

    if (walletError || !wallet) {
      // Если кошелек не найден, создаем его
      const { data: newWallet, error: createError } = await supabaseAdmin
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 0.00,
          currency: 'RUB'
        })
        .select('id, balance, currency')
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return res.status(500).json({ error: 'Failed to create wallet' });
      }

      return res.status(200).json({
        balance: newWallet.balance,
        currency: newWallet.currency,
        wallet_id: newWallet.id
      });
    }

    res.status(200).json({
      balance: wallet.balance,
      currency: wallet.currency,
      wallet_id: wallet.id
    });

  } catch (error) {
    console.error('Balance API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}