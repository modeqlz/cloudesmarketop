import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import styles from '../styles/AnnouncementBoardNew.module.css';

const AnnouncementBoardNew = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000); // 5 секунд по умолчанию
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const autoPlayTimer = useRef(null);

  // Данные объявлений из Supabase
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка объявлений из Supabase с подпиской на изменения в реальном времени
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Загружаем объявления напрямую из Supabase
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Ошибка загрузки объявлений:', error);
          throw error;
        }

        if (data && data.length > 0) {
          // Преобразуем данные из Supabase в нужный формат
          const formattedAnnouncements = data.map(announcement => ({
            id: announcement.id,
            type: announcement.type.toUpperCase(),
            title: announcement.type.toUpperCase(),
            subtitle: announcement.title,
            description: announcement.text,
            action: announcement.telegram_link ? 'Читать в Telegram' : 'Подробнее',
            link: announcement.telegram_link,
            icon: getIconByType(announcement.type),
            background: getBackgroundByType(announcement.type)
          }));
          setAnnouncements(formattedAnnouncements);
        } else {
          // Fallback к статическим данным если нет объявлений в БД
          setAnnouncements([
            {
              id: 1,
              type: 'MARKET',
              title: 'MARKET',
              subtitle: 'Маркет работает 24/7',
              description: 'Покупай и продавай в любое время! Наш маркет не спит, как и настоящие трейдеры.',
              action: 'Подробнее',
              icon: '📦',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
            }
          ]);
        }
      } catch (error) {
        console.error('Ошибка загрузки объявлений:', error);
        // Fallback к статическим данным при ошибке
        setAnnouncements([
          {
            id: 1,
            type: 'MARKET',
            title: 'MARKET',
            subtitle: 'Маркет работает 24/7',
            description: 'Покупай и продавай в любое время! Наш маркет не спит, как и настоящие трейдеры.',
            action: 'Подробнее',
            icon: '📦',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Загружаем объявления при монтировании
    fetchAnnouncements();

    // Подписываемся на изменения в реальном времени
    const subscription = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Слушаем все события: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          console.log('🔄 Изменение в объявлениях:', payload);
          
          // Перезагружаем объявления при любом изменении
          fetchAnnouncements();
        }
      )
      .subscribe((status) => {
        console.log('📡 Статус подписки на объявления:', status);
      });

    // Очистка подписки при размонтировании
    return () => {
      console.log('🔌 Отключение подписки на объявления');
      subscription.unsubscribe();
    };
  }, []);

  // Функция для получения иконки по типу
  const getIconByType = (type) => {
    const icons = {
      'welcome': '🎉',
      'auction': '🔥',
      'market': '📦',
      'update': '⚡',
      'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  // Функция для получения фона по типу
  const getBackgroundByType = (type) => {
    const backgrounds = {
      'welcome': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'auction': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'market': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      'update': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'info': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    return backgrounds[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  // Автоматическое переключение
  useEffect(() => {
    if (isAutoPlaying && announcements.length > 1) {
      autoPlayTimer.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
        );
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [isAutoPlaying, autoPlayInterval, announcements.length]);

  // Пауза автоплея при взаимодействии
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
    // Возобновляем автоплей через 10 секунд после взаимодействия
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  // Обработка свайпа
  const handleTouchStart = (e) => {
    if (isTransitioning) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    pauseAutoPlay();
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || isTransitioning) return;
    currentXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || isTransitioning) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentIndex > 0) {
        // Свайп вправо - предыдущее объявление
        goToPrevious();
      } else if (deltaX < 0 && currentIndex < announcements.length - 1) {
        // Свайп влево - следующее объявление
        goToNext();
      }
    }

    isDraggingRef.current = false;
  };

  const goToNext = () => {
    if (isTransitioning || currentIndex >= announcements.length - 1) return;
    pauseAutoPlay();
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const goToPrevious = () => {
    if (isTransitioning || currentIndex <= 0) return;
    pauseAutoPlay();
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    pauseAutoPlay();
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  // Обработка клика по кнопке действия
  const handleActionClick = (announcement) => {
    if (announcement.link) {
      window.open(announcement.link, '_blank');
    }
  };

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className={styles.announcementBoard}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>📢</div>
          <h2 className={styles.headerTitle}>Объявления</h2>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Загрузка объявлений...</p>
        </div>
      </div>
    );
  }

  // Если нет объявлений
  if (announcements.length === 0) {
    return (
      <div className={styles.announcementBoard}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>📢</div>
          <h2 className={styles.headerTitle}>Объявления</h2>
        </div>
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>Пока нет объявлений</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.announcementBoard} ${isTransitioning ? styles.transitioning : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>📢</div>
        <h2 className={styles.headerTitle}>Объявления</h2>
        <div className={styles.counter}>
          {currentIndex + 1} / {announcements.length}
        </div>
      </div>

      <div 
        className={styles.container}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={styles.slider}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.3s ease-out' : 'none'
          }}
        >
          {announcements.map((announcement, index) => (
            <div 
              key={announcement.id}
              className={styles.slide}
              style={{ background: announcement.background }}
            >
              <div className={styles.slideContent}>
                <div className={styles.slideHeader}>
                  <span className={styles.slideType}>{announcement.type}</span>
                  <span className={styles.slideIcon}>{announcement.icon}</span>
                </div>
                
                <h3 className={styles.slideTitle}>{announcement.subtitle}</h3>
                <p className={styles.slideDescription}>{announcement.description}</p>
                
                <button 
                  className={styles.slideAction}
                  onClick={() => handleActionClick(announcement)}
                >
                  {announcement.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.indicators}>
        {announcements.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Перейти к объявлению ${index + 1}`}
          >
            {index === currentIndex && isAutoPlaying && (
              <div 
                className={styles.progressBar}
                style={{
                  animationDuration: `${autoPlayInterval}ms`
                }}
              />
            )}
          </button>
        ))}
      </div>


    </div>
  );
};

export default AnnouncementBoardNew;