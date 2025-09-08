import { useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../lib/useAuth';
import AnnouncementBoard from '../components/AnnouncementBoard';
import AnnouncementBoardCompact from '../components/AnnouncementBoardCompact';
import Sidebar from '../components/Sidebar';
import useSidebar from '../lib/useSidebar';

export default function HomePage() {
  const { user, loading, error } = useAuth();
  const { isOpen, openSidebar, closeSidebar, touchHandlers } = useSidebar();

  useEffect(() => {
    if (!loading && !user) {
      // Нет пользователя - редирект на логин
      window.location.replace('/');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="container">
        <div className="hero" style={{maxWidth:560, textAlign:'center'}}>Загружаем меню…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="hero" style={{maxWidth:560, textAlign:'center'}}>
          <div style={{color:'#ffb4b4', marginBottom:16}}>⚠️ {error}</div>
          <div>Перенаправляем на главную...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className="hero" style={{maxWidth:560, textAlign:'center'}}>Загружаем…</div>
      </div>
    );
  }

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Гость';
  const avatar = user.photo_url || '/placeholder.png';
  const at = user.username ? '@' + user.username : '';

  return (
    <>
      <Head><title>Главное меню — Spectra Market</title></Head>
      <div className="container" {...touchHandlers}>
        <div className="hero" style={{maxWidth:980}}>
          {/* top bar */}
          <div className="topbar">
            <div className="topbar-left">
              <button 
                className="menu-button"
                onClick={openSidebar}
                aria-label="Открыть меню"
              >
                ☰
              </button>
              <img className="avatar" src={avatar} alt="avatar" />
              <div className="hello">
                <div className="hello-hi">Привет, {name}</div>
                <div className="hello-sub">{at || 'Добро пожаловать!'}</div>
              </div>
            </div>
            <a className="btn btn-ghost" href="/profile" aria-label="Профиль">
              Профиль
            </a>
          </div>

          {/* Announcements */}
          <AnnouncementBoard />
          
          {/* Compact Announcements for testing */}
          <div style={{marginTop: '24px'}}>
            <AnnouncementBoardCompact />
          </div>

          {/* grid tiles */}
          <div className="grid">
            {/* Auctions */}
            <a className="tile tile-auction" href="/auctions">
              <div className="tile-icon">🔥</div>
              <div className="tile-head">
                <div className="tile-title">Аукционы</div>
                <div className="tile-badge">Live</div>
              </div>
              <div className="tile-desc">
                Делай ставки на редкие скины в реальном времени.
              </div>
            </a>

            {/* Market */}
            <a className="tile tile-gifts" href="/market">
              <div className="tile-icon">🛒</div>
              <div className="tile-head">
                <div className="tile-title">Маркет</div>
              </div>
              <div className="tile-desc">
                Каталог скинов и предметов — покупай и продавай в один клик.
              </div>
            </a>

            {/* Plans */}
            <a className="tile tile-plans" href="/plans">
              <div className="tile-icon">💎</div>
              <div className="tile-head">
                <div className="tile-title">Тарифы</div>
              </div>
              <ul className="tile-list">
                <li>🆓 Бесплатный — стартуй без рисков</li>
                <li>⭐ Plus — расширенная витрина</li>
                <li>👑 Pro — максимум для трейдеров</li>
              </ul>
            </a>

            {/* Inventory */}
            <a className="tile tile-orders" href="/inventory">
              <div className="tile-icon">🎒</div>
              <div className="tile-head">
                <div className="tile-title">Инвентарь</div>
              </div>
              <div className="tile-desc">Мои скины и история покупок.</div>
            </a>

            {/* Find user */}
            <a className="tile tile-create" href="/search">
              <div className="tile-icon">🔍</div>
              <div className="tile-head">
                <div className="tile-title">Найти человека</div>
              </div>
              <div className="tile-desc">Найди пользователя по @никнейму и посмотри его профиль.</div>
            </a>
          </div>
        </div>
      </div>
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isOpen} 
        onClose={closeSidebar} 
        user={user} 
      />
    </>
  );
}