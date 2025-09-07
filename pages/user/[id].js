// pages/user/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import LoadingCard from '../../components/LoadingCard';

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/get-user?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Пользователь не найден');
        }
        
        setUser(data.user);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <>
        <Head><title>Загрузка профиля — Cloudес Market</title></Head>
        <div className="overlay" aria-hidden>
          <div className="overlay-backdrop" />
          <div className="overlay-panel">
            <LoadingCard
              messages={[
                'Загружаем профиль…',
                'Получаем данные пользователя…',
                'Почти готово…'
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
        <Head><title>Ошибка — Cloudес Market</title></Head>
        <div className="container">
          <div className="hero" style={{maxWidth:560, textAlign:'center'}}>
            <div className="brand">
              <a href="/search" style={{color: 'var(--muted)', textDecoration: 'none'}}>← Назад к поиску</a>
            </div>
            <h1 className="h1">Пользователь не найден</h1>
            <p className="lead" style={{color: '#ffb4b4'}}>{error}</p>
            <div className="row" style={{justifyContent:'center'}}>
              <a className="btn btn-primary" href="/search">Попробовать снова</a>
              <a className="btn btn-ghost" href="/home">На главную</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Без имени';
  const username = user.username ? `@${user.username}` : `ID: ${user.telegram_id}`;
  const avatar = user.photo_url || '/placeholder.png';
  const joinDate = new Date(user.created_at).toLocaleDateString('ru-RU');
  const lastSeen = user.last_login ? new Date(user.last_login).toLocaleDateString('ru-RU') : 'Неизвестно';

  return (
    <>
      <Head><title>{fullName} — Cloudес Market</title></Head>
      <div className="container">
        <div className="hero" style={{maxWidth:560}}>
          <div className="brand" style={{justifyContent:'space-between', width:'100%'}}>
            <a href="/search" style={{color: 'var(--muted)', textDecoration: 'none'}}>← Назад</a>
            <span className="badge">Профиль</span>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:16, marginTop:16}}>
            <img
              src={avatar}
              alt="avatar"
              style={{
                width:64, height:64, borderRadius:20,
                objectFit:'cover', border:'2px solid var(--border)'
              }}
            />
            <div>
              <div className="h1" style={{fontSize:24, margin:'0 0 6px'}}>{fullName}</div>
              <div className="lead" style={{fontSize:16, margin:0, color:'var(--brand)'}}>{username}</div>
            </div>
          </div>

          <div style={{
            marginTop:24, 
            padding:20, 
            borderRadius:16, 
            background:'var(--card)', 
            border:'1px solid var(--border)'
          }}>
            <div style={{marginBottom:12}}>
              <strong style={{color:'var(--text)'}}>Telegram ID:</strong>
              <span style={{marginLeft:8, color:'var(--muted)'}}>{user.telegram_id}</span>
            </div>
            <div style={{marginBottom:12}}>
              <strong style={{color:'var(--text)'}}>Зарегистрирован:</strong>
              <span style={{marginLeft:8, color:'var(--muted)'}}>{joinDate}</span>
            </div>
            <div>
              <strong style={{color:'var(--text)'}}>Последняя активность:</strong>
              <span style={{marginLeft:8, color:'var(--muted)'}}>{lastSeen}</span>
            </div>
          </div>

          <div className="row" style={{marginTop:24}}>
            <a className="btn btn-primary" href={`https://t.me/${user.username || user.telegram_id}`} target="_blank" rel="noopener">
              Написать в Telegram
            </a>
            <a className="btn btn-ghost" href="/search">
              Найти другого
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

