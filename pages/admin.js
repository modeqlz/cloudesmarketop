// pages/admin.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../lib/useAuth';

export default function AdminPage() {
  const { user, loading } = useAuth();

  // Проверка админских прав (замени на свой Telegram ID)
  const ADMIN_IDS = ['YOUR_TELEGRAM_ID']; // Сюда впиши свой telegram_id
  const isAdmin = user && ADMIN_IDS.includes(user.telegram_id?.toString());

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace('/');
    }
  }, [user, loading]);

  if (loading) {
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
          
          <h1 className="h1">⚙️ Админ-панель</h1>
          <p className="lead">Управление системой</p>

          <div style={{marginTop: 32}}>
            <p>Админ-панель в разработке...</p>
          </div>
        </div>
      </div>
    </>
  );
}