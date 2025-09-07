// pages/api/wallet/googlepay.js
import { supabaseAdmin } from '../../../lib/supabase';
import { verifyTelegramAuth } from '../../../lib/verifyTelegramAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем авторизацию Telegram
    const user = verifyTelegramAuth(req.body.initData || {});
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, currency = 'RUB', paymentToken, paymentMethodData } = req.body;

    // Валидация суммы
    if (!amount || amount <= 0 || amount > 100000) {
      return res.status(400).json({ 
        error: 'Invalid amount. Must be between 1 and 100,000 RUB' 
      });
    }

    if (!paymentToken) {
      return res.status(400).json({ error: 'Payment token is required' });
    }

    // Генерируем уникальный ID платежа
    const paymentId = `gpy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const externalId = paymentMethodData?.paymentMethodToken || null;

    try {
      // В реальной системе здесь был бы вызов Google Pay API
      // Для демонстрации симулируем успешный платеж
      const paymentResult = await simulateGooglePayment({
        amount,
        currency,
        paymentToken,
        paymentId
      });

      if (!paymentResult.success) {
        return res.status(400).json({ 
          error: 'Payment failed', 
          details: paymentResult.error 
        });
      }

      // Обновляем баланс пользователя через функцию Supabase
      const { data: result, error: dbError } = await supabaseAdmin
        .rpc('update_wallet_balance', {
          p_user_id: user.id,
          p_amount: parseFloat(amount),
          p_transaction_type: 'deposit',
          p_description: `Пополнение баланса через Google Pay`,
          p_payment_method: 'google_pay',
          p_payment_id: paymentId,
          p_external_id: externalId
        });

      if (dbError) {
        console.error('Database error:', dbError);
        
        // Если ошибка БД, нужно откатить платеж (в реальной системе)
        await cancelGooglePayment(paymentId);
        
        return res.status(500).json({ 
          error: 'Failed to update balance', 
          details: dbError.message 
        });
      }

      // Получаем обновленный баланс
      const { data: wallet } = await supabaseAdmin
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .eq('currency', 'RUB')
        .eq('is_active', true)
        .single();

      res.status(200).json({
        success: true,
        transaction_id: result,
        payment_id: paymentId,
        amount: parseFloat(amount),
        currency,
        new_balance: wallet?.balance || 0,
        message: 'Баланс успешно пополнен!'
      });

    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      res.status(500).json({ 
        error: 'Payment processing failed', 
        details: paymentError.message 
      });
    }

  } catch (error) {
    console.error('Google Pay API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Симуляция Google Pay платежа (в реальности здесь был бы вызов настоящего API)
async function simulateGooglePayment({ amount, currency, paymentToken, paymentId }) {
  // Симулируем задержку сети
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Симулируем различные сценарии
  const random = Math.random();
  
  if (random < 0.05) { // 5% вероятность ошибки
    return {
      success: false,
      error: 'Payment declined by bank'
    };
  }

  if (random < 0.1) { // еще 5% вероятность ошибки
    return {
      success: false,
      error: 'Insufficient funds'
    };
  }

  // 90% успешных платежей
  return {
    success: true,
    transaction_id: `gpy_trans_${paymentId}`,
    status: 'completed'
  };
}

// Функция отмены платежа (заглушка)
async function cancelGooglePayment(paymentId) {
  console.log(`Cancelling Google Pay payment: ${paymentId}`);
  // В реальной системе здесь был бы вызов API для отмены платежа
  return true;
}