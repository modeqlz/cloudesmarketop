import { useEffect } from 'react';
import Head from 'next/head';
import LoadingCard from '../components/LoadingCard';
import { useAuth } from '../lib/useAuth';

export default function ProfilePage() {
  const { user, loading, error, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace('/');
    }
  }, [user, loading]);

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

          <div style={{marginTop:16, opacity:.85, fontSize:14}}>
            <div><b>ID:</b> {user.id}</div>
            <div><b>Источник:</b> Telegram WebApp</div>
          </div>
        </div>
      </div>
    </>
  );
}