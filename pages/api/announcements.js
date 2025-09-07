// pages/api/announcements.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Получить все активные объявления
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        return res.status(500).json({ ok: false, error: 'Failed to fetch announcements' });
      }

      return res.status(200).json({ ok: true, announcements: data || [] });
    }

    if (req.method === 'POST') {
      // Создать новое объявление
      const { title, text, type, telegram_link, display_order } = req.body;

      if (!title || !text) {
        return res.status(400).json({ ok: false, error: 'Title and text are required' });
      }

      const { data, error } = await supabaseAdmin
        .from('announcements')
        .insert([{
          title,
          text,
          type: type || 'info',
          telegram_link,
          display_order: display_order || 0,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating announcement:', error);
        return res.status(500).json({ ok: false, error: 'Failed to create announcement' });
      }

      return res.status(201).json({ ok: true, announcement: data });
    }

    if (req.method === 'PUT') {
      // Обновить объявление
      const { id, title, text, type, telegram_link, display_order, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ ok: false, error: 'ID is required' });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (text !== undefined) updateData.text = text;
      if (type !== undefined) updateData.type = type;
      if (telegram_link !== undefined) updateData.telegram_link = telegram_link;
      if (display_order !== undefined) updateData.display_order = display_order;
      if (is_active !== undefined) updateData.is_active = is_active;

      const { data, error } = await supabaseAdmin
        .from('announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating announcement:', error);
        return res.status(500).json({ ok: false, error: 'Failed to update announcement' });
      }

      return res.status(200).json({ ok: true, announcement: data });
    }

    if (req.method === 'DELETE') {
      // Удалить объявление (мягкое удаление - деактивация)
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ ok: false, error: 'ID is required' });
      }

      const { error } = await supabaseAdmin
        .from('announcements')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting announcement:', error);
        return res.status(500).json({ ok: false, error: 'Failed to delete announcement' });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    console.error('API error:', e);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}