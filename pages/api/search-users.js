// pages/api/search-users.js
import { supabaseAdmin } from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Поисковый запрос должен содержать минимум 2 символа' 
      });
    }

    const searchTerm = q.trim().toLowerCase();

    // Поиск по username (точное совпадение или начинается с)
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('telegram_id, first_name, last_name, username, photo_url, created_at')
      .or(`username.ilike.${searchTerm}%,username.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase search error:', error);
      return res.status(500).json({ 
        ok: false, 
        error: 'Ошибка поиска в базе данных' 
      });
    }

    // Фильтруем результаты и убираем дубликаты
    const filteredUsers = users.filter(user => 
      user.username && user.username.toLowerCase().includes(searchTerm)
    );

    return res.status(200).json({ 
      ok: true, 
      users: filteredUsers,
      count: filteredUsers.length 
    });

  } catch (e) {
    console.error('[api/search-users] error:', e);
    return res.status(500).json({ 
      ok: false, 
      error: 'Внутренняя ошибка сервера' 
    });
  }
}

