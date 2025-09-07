// pages/api/auth/telegram.js
import { validateInitData, parseInitData } from '../../../lib/verifyTelegramAuth.js';
import { supabaseAdmin } from '../../../lib/supabase.js';

// Явно укажем Node-runtime (на всякий случай, чтобы не уехало в Edge)
export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) {
      return res.status(500).json({ ok: false, error: 'Missing TELEGRAM_BOT_TOKEN on server' });
    }

    // Поддержим и raw string, и body { initData }
    const initData =
      typeof req.body === 'string' ? req.body : (req.body && req.body.initData) || '';

    if (!initData) {
      return res.status(400).json({ ok: false, error: 'No initData provided' });
    }

    const result = validateInitData(initData, BOT_TOKEN);
    if (!result.ok) {
      return res.status(401).json({ ok: false, error: result.reason || 'Invalid initData' });
    }

    const parsed = parseInitData(initData);
    let user = null;
    try {
      user = parsed.user ? JSON.parse(parsed.user) : null;
    } catch (_) {
      return res.status(400).json({ ok: false, error: 'Bad user payload in initData' });
    }

    const profile = user
      ? {
          id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          username: user.username || '',
          photo_url: user.photo_url || '',
        }
      : null;

    // Сохраняем пользователя в Supabase
    if (profile) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .upsert([
            {
              telegram_id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              username: profile.username,
              photo_url: profile.photo_url,
              last_login: new Date().toISOString(),
            }
          ], {
            onConflict: 'telegram_id'
          });

        if (error) {
          console.error('Supabase error:', error);
          // Не прерываем процесс авторизации, если Supabase недоступен
        } else {
          console.log('User saved to Supabase:', data);
        }
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
        // Продолжаем работу даже если Supabase недоступен
      }
    }

    return res.status(200).json({ ok: true, profile });
  } catch (e) {
    console.error('[api/auth/telegram] error:', e);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}