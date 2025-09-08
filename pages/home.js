import { useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../lib/useAuth';
import CryptoMainMenu from '../components/CryptoMainMenu';
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
      <Head>
        <title>NFT Gifts — Crypto Market</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Crypto Main Menu */}
      <CryptoMainMenu />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isOpen} 
        onClose={closeSidebar} 
        user={user} 
      />
    </>
  );
}