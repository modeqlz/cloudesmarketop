import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/AnnouncementBoardNew.module.css';

const AnnouncementBoardNew = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Данные объявлений
  const announcements = [
    {
      id: 1,
      type: 'MARKET',
      title: 'MARKET',
      subtitle: 'Маркет работает 24/7',
      description: 'Покупай и продавай в любое время! Наш маркет не спит, как и настоящие трейдеры. Более 10,000 предметов в каталоге!',
      action: 'Читать в Telegram',
      icon: '📦',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    },
    {
      id: 2,
      type: 'PROMOTION',
      title: 'PROMOTION',
      subtitle: 'Скидка 20% на все операции!',
      description: 'Только сегодня! Получи скидку на все торговые операции. Не упусти возможность выгодно купить или продать скины.',
      action: 'Подробнее',
      icon: '🔥',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 3,
      type: 'UPDATE',
      title: 'UPDATE',
      subtitle: 'Новые функции в приложении',
      description: 'Добавлены новые фильтры поиска, улучшена система уведомлений и оптимизирована скорость загрузки.',
      action: 'Узнать больше',
      icon: '⚡',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 4,
      type: 'EVENT',
      title: 'EVENT',
      subtitle: 'Турнир трейдеров',
      description: 'Участвуй в еженедельном турнире! Лучшие трейдеры получат эксклюзивные награды и бонусы.',
      action: 'Участвовать',
      icon: '🏆',
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  // Обработка свайпа
  const handleTouchStart = (e) => {
    if (isTransitioning) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
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
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = () => {
    if (isTransitioning || currentIndex <= 0) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className={styles.announcementBoard}>
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
                
                <button className={styles.slideAction}>
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
          />
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBoardNew;