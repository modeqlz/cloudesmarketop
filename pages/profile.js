import { useEffect, useState } from 'react';
import Head from 'next/head';
import LoadingCard from '../components/LoadingCard';
import { useAuth } from '../lib/useAuth';

export default function ProfilePage() {
  const { user, loading, error, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    status: '',
    interests: '',
    experience: '',
    location: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace('/');
    }
    // Загружаем данные профиля из localStorage
    if (user) {
      const savedProfile = localStorage.getItem(`profile_${user.telegram_id}`);
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      }
    }
  }, [user, loading]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Сохраняем в localStorage (можно заменить на API вызов)
      localStorage.setItem(`profile_${user.telegram_id}`, JSON.stringify(profileData));
      setIsEditing(false);
      // Показываем уведомление об успешном сохранении
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Профиль успешно сохранен!');
      }
    } catch (err) {
      console.error('Ошибка сохранения профиля:', err);
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Ошибка при сохранении профиля');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Восстанавливаем данные из localStorage
    const savedProfile = localStorage.getItem(`profile_${user.telegram_id}`);
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    } else {
      setProfileData({
        bio: '',
        status: '',
        interests: '',
        experience: '',
        location: ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <>
        <Head><title>Профиль — Spectra Market</title></Head>
        <div className="overlay" aria-hidden>
          <div className="overlay-backdrop" />
          <div className="overlay-panel">
            <LoadingCard
              messages={[
                'Проверяем профиль…',
                'Валидируем данные…',
                'Загружаем информацию…',
                'Готовим профиль…'
              ]}
              intervalMs={700}
            />
            <div className="overlay-hint">Секунду…</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head><title>Профиль — Spectra Market</title></Head>
        <div className="container">
          <div className="hero" style={{maxWidth:560, textAlign:'center', padding:'32px'}}>
            <div style={{color:'#ffb4b4', marginBottom:16}}>⚠️ {error}</div>
            <div>Перенаправляем на главную...</div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Head><title>Профиль — Spectra Market</title></Head>
        <div className="container">
          <div className="hero" style={{maxWidth:560, textAlign:'center', padding:'32px'}}>
            <p className="lead" style={{marginBottom:16}}>Нет данных профиля.</p>
            <div className="row" style={{justifyContent:'center'}}>
              <a className="btn btn-primary" href="/">На главную</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Без имени';
  const at = user.username ? '@' + user.username : 'без username';
  const avatar = user.photo_url || '/placeholder.png';
  
  // Проверка админских прав (замени на свой Telegram ID)
  const ADMIN_IDS = ['YOUR_TELEGRAM_ID']; // Сюда впиши свой telegram_id
  const isAdmin = ADMIN_IDS.includes(user.telegram_id?.toString());

  return (
    <>
      <Head><title>Профиль — Spectra Market</title></Head>
      <div className="container">
        <div className="hero" style={{maxWidth:560}}>
          <div className="brand" style={{justifyContent:'space-between', width:'100%'}}>
            <span>Профиль</span>
            <button className="btn btn-ghost" onClick={logout}>Выйти</button>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:14, marginTop:6}}>
            <img
              src={avatar}
              alt="avatar"
              style={{
                width:56, height:56, borderRadius:16,
                objectFit:'cover', border:'1px solid var(--border)'
              }}
            />
            <div>
              <div className="h1" style={{fontSize:22, margin:'0 0 4px'}}>{name}</div>
              <div className="lead" style={{fontSize:14, margin:0}}>{at}</div>
            </div>
          </div>

          {/* Редактируемые поля профиля */}
          <div className="profile-sections" style={{marginTop: 24}}>
            {/* О себе */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h3 className="profile-section-title">💬 О себе</h3>
                {!isEditing && (
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setIsEditing(true)}
                    style={{fontSize: '12px', padding: '6px 12px'}}
                  >
                    ✏️ Редактировать
                  </button>
                )}
              </div>
              {isEditing ? (
                <textarea
                  className="profile-textarea"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Расскажите о себе..."
                  rows={3}
                />
              ) : (
                <div className="profile-field-content">
                  {profileData.bio || 'Информация не указана'}
                </div>
              )}
            </div>

            {/* Статус */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h3 className="profile-section-title">🎯 Статус</h3>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={profileData.status}
                  onChange={(e) => setProfileData({...profileData, status: e.target.value})}
                  placeholder="Ваш текущий статус..."
                />
              ) : (
                <div className="profile-field-content">
                  {profileData.status || 'Статус не указан'}
                </div>
              )}
            </div>

            {/* Интересы */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h3 className="profile-section-title">🎮 Интересы</h3>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={profileData.interests}
                  onChange={(e) => setProfileData({...profileData, interests: e.target.value})}
                  placeholder="CS2, Dota 2, NFT, трейдинг..."
                />
              ) : (
                <div className="profile-field-content">
                  {profileData.interests || 'Интересы не указаны'}
                </div>
              )}
            </div>

            {/* Опыт */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h3 className="profile-section-title">⭐ Опыт трейдинга</h3>
              </div>
              {isEditing ? (
                <select
                  className="profile-select"
                  value={profileData.experience}
                  onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                >
                  <option value="">Выберите уровень</option>
                  <option value="beginner">🌱 Новичок</option>
                  <option value="intermediate">🚀 Средний уровень</option>
                  <option value="advanced">💎 Продвинутый</option>
                  <option value="expert">👑 Эксперт</option>
                </select>
              ) : (
                <div className="profile-field-content">
                  {profileData.experience === 'beginner' && '🌱 Новичок'}
                  {profileData.experience === 'intermediate' && '🚀 Средний уровень'}
                  {profileData.experience === 'advanced' && '💎 Продвинутый'}
                  {profileData.experience === 'expert' && '👑 Эксперт'}
                  {!profileData.experience && 'Опыт не указан'}
                </div>
              )}
            </div>

            {/* Локация */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h3 className="profile-section-title">📍 Локация</h3>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  placeholder="Ваш город или страна..."
                />
              ) : (
                <div className="profile-field-content">
                  {profileData.location || 'Локация не указана'}
                </div>
              )}
            </div>
          </div>

          {/* Кнопки сохранения/отмены */}
          {isEditing && (
            <div className="profile-actions" style={{marginTop: 24, display: 'flex', gap: '12px'}}>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving}
                style={{flex: 1}}
              >
                {isSaving ? '💾 Сохраняем...' : '💾 Сохранить'}
              </button>
              <button 
                className="btn btn-ghost"
                onClick={handleCancel}
                disabled={isSaving}
                style={{flex: 1}}
              >
                ❌ Отмена
              </button>
            </div>
          )}

          <div style={{marginTop:24, opacity:.85, fontSize:14, borderTop: '1px solid var(--border)', paddingTop: 16}}>
            <div><b>ID:</b> {user.telegram_id}</div>
            <div><b>Источник:</b> Telegram WebApp</div>
          </div>

          {/* Админская кнопка */}
          {isAdmin && (
            <div style={{marginTop:20}}>
              <a href="/admin" className="btn btn-primary" style={{width:'100%', textAlign:'center'}}>
                🛠️ Админ-панель
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}