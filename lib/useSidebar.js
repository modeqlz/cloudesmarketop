// lib/useSidebar.js
import { useState, useCallback, useEffect } from 'react';

export default function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Обработка свайпа вправо для открытия меню
  const minSwipeDistance = 50;
  const maxStartDistance = 50; // Максимальное расстояние от левого края для начала свайпа

  const onTouchStart = useCallback((e) => {
    const touch = e.targetTouches[0];
    const startX = touch.clientX;
    
    // Свайп должен начинаться у левого края экрана
    if (startX <= maxStartDistance) {
      setTouchEnd(null);
      setTouchStart(startX);
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [touchStart]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart;
    const isRightSwipe = distance > minSwipeDistance;

    if (isRightSwipe && !isOpen) {
      openSidebar();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, isOpen, openSidebar]);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Предотвращаем скролл фона когда меню открыто
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeSidebar]);

  return {
    isOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    // Touch handlers для свайпа
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd
    }
  };
}