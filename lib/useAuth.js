// lib/useAuth.js
import { useEffect, useState } from 'react';

function readStoredProfile() {
  try {
    const a = localStorage.getItem('profile');
    if (a) return JSON.parse(a);
  } catch {}
  try {
    const b = sessionStorage.getItem('profile');
    if (b) return JSON.parse(b);
  } catch {}
  return null;
}

function clearStoredProfile() {
  try {
    localStorage.removeItem('profile');
    sessionStorage.removeItem('profile');
    sessionStorage.setItem('logged_out', '1');
  } catch {}
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateUser = async (profile) => {
    try {
      const res = await fetch('/api/validate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: profile.id })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.code === 'USER_DELETED') {
          // Пользователь был удален из базы - разлогиниваем
          console.log('User was deleted from database, logging out...');
          clearStoredProfile();
          setUser(null);
          setError('Ваш профиль был удален. Необходимо войти заново.');
          // Редирект на главную через небольшую задержку
          setTimeout(() => {
            window.location.replace('/');
          }, 2000);
          return false;
        }
        throw new Error(data.error || 'Ошибка валидации');
      }
      
      return true;
    } catch (e) {
      console.error('Validation error:', e);
      setError(e.message);
      return false;
    }
  };

  const logout = () => {
    clearStoredProfile();
    setUser(null);
    window.location.replace('/');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем logged_out флаг
        if (sessionStorage.getItem('logged_out') === '1') {
          setUser(null);
          setLoading(false);
          return;
        }

        const profile = readStoredProfile();
        if (!profile) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Проверяем существование пользователя в базе
        const isValid = await validateUser(profile);
        if (isValid) {
          setUser(profile);
        }
      } catch (e) {
        console.error('Auth check error:', e);
        setError(e.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Проверяем каждые 30 секунд (можно настроить)
    const interval = setInterval(checkAuth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { user, loading, error, logout, validateUser };
}

