// pages/api/validate-user.js
import { supabaseAdmin } from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { telegram_id } = req.body;
    
    if (!telegram_id) {
      return res.status(400).json({ 
        ok: false, 
        error: 'telegram_id обязателен' 
      });
    }

    // Проверяем существование пользователя в базе
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('telegram_id, username, first_name, last_name')
      .eq('telegram_id', telegram_id)
      .limit(1);

    if (error) {
      console.error('Supabase validation error:', error);
      return res.status(500).json({ 
        ok: false, 
        error: 'Ошибка проверки пользователя' 
      });
    }

    // Если пользователь не найден в базе - он был удален
    if (!users || users.length === 0) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Пользователь не найден в базе данных',
        code: 'USER_DELETED'
      });
    }

    const user = users[0];

    return res.status(200).json({ 
      ok: true, 
      user: {
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

  } catch (e) {
    console.error('[api/validate-user] error:', e);
    return res.status(500).json({ 
      ok: false, 
      error: 'Внутренняя ошибка сервера' 
    });
  }
}

