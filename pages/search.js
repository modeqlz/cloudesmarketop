// pages/search.js
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  async function runSearch(query) {
    const trimmed = (query || '').replace(/^@/, '').trim();
    if (!trimmed) { setResults([]); return; }
    try {
      setBusy(true); setError(null);
      const res = await fetch(`/api/search-users?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Search error');
      setResults(data.users || []);
    } catch (e) {
      setError(e.message || 'Ошибка поиска');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => runSearch(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <Head><title>Найти человека — Cloudес Market</title></Head>
      <div className="container">
        <div className="hero">
          <div className="brand">
            <a href="/home" style={{color: 'var(--muted)', textDecoration: 'none'}}>← Назад</a>
            <span className="badge">Поиск</span>
          </div>
          <h1 className="h1">Найти человека</h1>
          <p className="lead">Введи @никнейм пользователя, чтобы найти его в базе.</p>

          <div className="search-row">
            <span className="at">@</span>
            <input
              className="input"
              placeholder="Введи никнейм..."
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              autoFocus
            />
            {busy && <div className="search-spinner">🔍</div>}
          </div>

          {error && <div className="foot" style={{color:'#ffb4b4'}}>Ошибка: {error}</div>}

          <div className="user-list">
            {results.map(u => (
              <a key={u.telegram_id} className="user-row" href={`/user/${u.username || u.telegram_id}`}>
                <img src={u.photo_url || '/placeholder.png'} alt="" className="user-avatar" />
                <div className="user-meta">
                  <div className="user-name">{[u.first_name, u.last_name].filter(Boolean).join(' ') || 'Без имени'}</div>
                  <div className="user-handle">{u.username ? `@${u.username}` : `ID: ${u.telegram_id}`}</div>
                </div>
                <span className="user-open">Открыть</span>
              </a>
            ))}
            {!busy && !error && results.length === 0 && q.trim() !== '' && (
              <div className="foot">Пользователь не найден в базе.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}