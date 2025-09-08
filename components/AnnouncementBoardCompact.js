import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/AnnouncementBoardCompact.module.css';

const AnnouncementBoardCompact = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [autoPlayPaused, setAutoPlayPaused] = useState(false);

  // Минимальное расстояние для свайпа
  const minSwipeDistance = 50;

  // Получение данных из API
  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/announcements');
      const data = await response.json();
      
      if (data.ok && data.announcements) {
        setAnnouncements(data.announcements);
        setError(null);
      } else {
        setError('Не удалось загрузить объявления');
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Навигация
  const nextAnnouncement = useCallback(() => {
    if (isTransitioning || announcements.length === 0) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, announcements.length]);

  const prevAnnouncement = useCallback(() => {
    if (isTransitioning || announcements.length === 0) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, announcements.length]);

  const goToAnnouncement = useCallback((index) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, currentIndex]);

  // Автопроигрывание
  useEffect(() => {
    if (announcements.length <= 1 || autoPlayPaused) return;

    const interval = setInterval(() => {
      nextAnnouncement();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextAnnouncement, announcements.length, autoPlayPaused]);

  // Обработка касаний
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setAutoPlayPaused(true);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextAnnouncement();
    } else if (isRightSwipe) {
      prevAnnouncement();
    }

    setTimeout(() => setAutoPlayPaused(false), 3000);
  };

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevAnnouncement();
          setAutoPlayPaused(true);
          setTimeout(() => setAutoPlayPaused(false), 3000);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextAnnouncement();
          setAutoPlayPaused(true);
          setTimeout(() => setAutoPlayPaused(false), 3000);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextAnnouncement, prevAnnouncement]);

  // Получение эмодзи по типу
  const getTypeEmoji = (type) => {
    const emojiMap = {
      welcome: '🎉',
      auction: '🔥',
      update: '💎',
      info: '📢',
      market: '🛒'
    };
    return emojiMap[type] || '📢';
  };

  // Получение цвета по типу
  const getTypeColor = (type) => {
    const colorMap = {
      welcome: 'var(--accent-gradient)',
      auction: 'var(--warning-gradient)',
      update: 'var(--success-gradient)',
      info: 'var(--info-gradient)',
      market: 'var(--primary-gradient)'
    };
    return colorMap[type] || 'var(--primary-gradient)';
  };

  if (isLoading) {
    return (
      <div className={styles.announcementBoardCompact}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Загрузка объявлений...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.announcementBoardCompact}>
        <div className={styles.error}>
          <span>⚠️ {error}</span>
          <button onClick={fetchAnnouncements} className={styles.retryButton}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className={styles.announcementBoardCompact}>
        <div className={styles.empty}>
          <span>📭 Нет активных объявлений</span>
        </div>
      </div>
    );
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className={styles.announcementBoardCompact}>
      <div className={styles.header}>
        <h3 className={styles.title}>📢 Объявления</h3>
      </div>

      <div 
        className={styles.container}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={`${styles.card} ${isTransitioning ? styles.transitioning : ''}`}>
          <div 
            className={styles.cardHeader}
            style={{ background: getTypeColor(currentAnnouncement.type) }}
          >
            <span className={styles.emoji}>
              {getTypeEmoji(currentAnnouncement.type)}
            </span>
            <span className={styles.type}>
              {currentAnnouncement.type.toUpperCase()}
            </span>
          </div>

          <div className={styles.cardContent}>
            <h4 className={styles.announcementTitle}>
              {currentAnnouncement.title}
            </h4>
            <p className={styles.description}>
              {currentAnnouncement.text}
            </p>
            
            {currentAnnouncement.telegram_link && (
              <a 
                href={currentAnnouncement.telegram_link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.telegramLink}
              >
                📱 Читать в Telegram
              </a>
            )}
          </div>
        </div>


      </div>


    </div>
  );
};

export default AnnouncementBoardCompact;