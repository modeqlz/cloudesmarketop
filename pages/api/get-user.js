// pages/api/get-user.js
import { supabaseAdmin } from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        ok: false, 
        error: 'ID пользователя обязателен' 
      });
    }

    let query = supabaseAdmin
      .from('users')
      .select('telegram_id, first_name, last_name, username, photo_url, created_at, last_login');

    // Проверяем, является ли ID числом (telegram_id) или строкой (username)
    if (/^\d+$/.test(id)) {
      // Это telegram_id
      query = query.eq('telegram_id', parseInt(id));
    } else {
      // Это username
      query = query.eq('username', id);
    }

    const { data: users, error } = await query.limit(1);

    if (error) {
      console.error('Supabase get user error:', error);
      return res.status(500).json({ 
        ok: false, 
        error: 'Ошибка получения данных пользователя' 
      });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Пользователь не найден' 
      });
    }

    const user = users[0];

    return res.status(200).json({ 
      ok: true, 
      user: {
        telegram_id: user.telegram_id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });

  } catch (e) {
    console.error('[api/get-user] error:', e);
    return res.status(500).json({ 
      ok: false, 
      error: 'Внутренняя ошибка сервера' 
    });
  }
}

