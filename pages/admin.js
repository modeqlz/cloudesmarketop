// pages/admin.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../lib/useAuth';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    type: 'info',
    telegram_link: '',
    display_order: 0
  });

  // Проверка админских прав (замени на свой Telegram ID)
  const ADMIN_IDS = ['YOUR_TELEGRAM_ID']; // Сюда впиши свой telegram_id
  const isAdmin = user && ADMIN_IDS.includes(user.telegram_id?.toString());

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace('/');
    }
  }, [user, loading]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnnouncements();
    }
  }, [isAdmin]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.ok) {
        setAnnouncements(data.announcements);
      }
    } catch (e) {
      console.error('Error fetching announcements:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.text.trim()) return;

    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { ...formData, id: editingId }
        : formData;

      const res = await fetch('/api/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.ok) {
        await fetchAnnouncements();
        resetForm();
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (e) {
      console.error('Error saving announcement:', e);
      alert('Ошибка сохранения');
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      text: announcement.text,
      type: announcement.type,
      telegram_link: announcement.telegram_link || '',
      display_order: announcement.display_order
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить объявление?')) return;

    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.ok) {
        await fetchAnnouncements();
      } else {
        alert('Ошибка удаления');
      }
    } catch (e) {
      console.error('Error deleting announcement:', e);
      alert('Ошибка удаления');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      text: '',
      type: 'info',
      telegram_link: '',
      display_order: 0
    });
  };

  if (loading || isLoading) {
    return (
      <div className="container">
        <div className="hero" style={{maxWidth: 480}}>
          <div className="loading-text">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="hero" style={{maxWidth: 480}}>
          <h1 className="h1">🚫 Доступ запрещен</h1>
          <p className="lead">У вас нет прав администратора.</p>
          <div className="row">
            <a href="/home" className="btn btn-primary">← Назад</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Админ-панель — Объявления</title>
      </Head>
      <div className="container">
        <div className="hero" style={{maxWidth: 800}}>
          <div className="brand">
            <a href="/home" style={{color: 'var(--muted)', textDecoration: 'none'}}>← Главная</a>
            <span className="badge">Админ</span>
          </div>
          
          <h1 className="h1">📢 Управление объявлениями</h1>
          <p className="lead">Создавай и редактируй объявления для главной страницы</p>

          {/* Форма добавления/редактирования */}
          <form onSubmit={handleSubmit} style={{marginTop: 24}}>
            <div className="admin-form">
              <div className="form-row">
                <label className="form-label">📝 Заголовок:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="🎉 Заголовок объявления..."
                  required
                />
              </div>

              <div className="form-row">
                <label className="form-label">📄 Текст:</label>
                <textarea
                  className="form-textarea"
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  placeholder="Описание объявления..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <label className="form-label">🎨 Тип:</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="welcome">🎉 Приветствие</option>
                  <option value="auction">🔥 Аукцион</option>
                  <option value="update">💎 Обновление</option>
                  <option value="market">🛒 Маркет</option>
                  <option value="info">ℹ️ Информация</option>
                </select>
              </div>

              <div className="form-row">
                <label className="form-label">🔗 Ссылка на пост в Telegram:</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.telegram_link}
                  onChange={(e) => setFormData({...formData, telegram_link: e.target.value})}
                  placeholder="https://t.me/твой_канал/номер_поста"
                />
              </div>

              <div className="form-row">
                <label className="form-label">📊 Порядок отображения:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? '💾 Сохранить' : '➕ Добавить'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-ghost" onClick={resetForm}>
                    ❌ Отмена
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Список объявлений */}
          <div style={{marginTop: 32}}>
            <h2 style={{fontSize: 20, marginBottom: 16}}>📋 Текущие объявления:</h2>
            <div className="announcements-list">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-item">
                  <div className="announcement-header">
                    <span className="announcement-type">{announcement.type}</span>
                    <span className="announcement-order">#{announcement.display_order}</span>
                  </div>
                  
                  <h3 className="announcement-item-title">{announcement.title}</h3>
                  <p className="announcement-item-text">{announcement.text}</p>
                  
                  {announcement.telegram_link && (
                    <a 
                      href={announcement.telegram_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="telegram-link"
                    >
                      🔗 Открыть в Telegram
                    </a>
                  )}
                  
                  <div className="announcement-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(announcement)}
                    >
                      ✏️ Изменить
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(announcement.id)}
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              ))}
              
              {announcements.length === 0 && (
                <div className="empty-state">
                  📭 Объявлений пока нет
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}