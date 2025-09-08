import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/announcementBoard.css';

const AnnouncementBoard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Пример данных объявлений
  const announcements = [
    {
      id: 1,
      type: 'WELCOME',
      title: 'Добро пожаловать в Cloudes Market!',
      description: 'Торгуй скинами, участвуй в аукционах и находи редкие предметы. Начни свой путь трейдера прямо сейчас!',
      emoji: '🎉',
      date: '8 сент.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      type: 'PROMOTION',
      title: 'Скидка 20% на все операции!',
      description: 'Только сегодня! Получи скидку на все торговые операции. Не упусти возможность выгодно купить или продать скины.',
      emoji: '🔥',
      date: '7 сент.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 3,
      type: 'UPDATE',
      title: 'Новые функции в приложении',
      description: 'Добавлены новые фильтры поиска, улучшена система уведомлений и оптимизирована скорость загрузки.',
      emoji: '⚡',
      date: '6 сент.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 4,
      type: 'EVENT',
      title: 'Турнир трейдеров',
      description: 'Участвуй в еженедельном турнире! Лучшие трейдеры получат эксклюзивные награды и бонусы.',
      emoji: '🏆',
      date: '5 сент.',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  // Функции навигации с зацикливанием
  const nextAnnouncement = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      // Автоматическое зацикливание: если достигли конца, переходим к началу
      return nextIndex >= announcements.length ? 0 : nextIndex;
    });
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevAnnouncement = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const prevIndex = prev - 1;
      // Автоматическое зацикливание: если в начале, переходим к концу
      return prevIndex < 0 ? announcements.length - 1 : prevIndex;
    });
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Функция для прямого перехода к определенному объявлению
  const goToAnnouncement = (index) => {
    if (isTransitioning || index === currentIndex) return;
    if (index >= 0 && index < announcements.length) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Обработка клавиш стрелок
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Проверяем, что фокус не на элементах ввода
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      );
      
      if (isInputFocused || isTransitioning) return;
      
      if (e.key === 'ArrowLeft') {
         e.preventDefault();
         handleUserNavigation(prevAnnouncement);
       } else if (e.key === 'ArrowRight') {
         e.preventDefault();
         handleUserNavigation(nextAnnouncement);
       } else if (e.key === 'Home') {
         e.preventDefault();
         pauseAutoPlay();
         setCurrentIndex(0);
       } else if (e.key === 'End') {
         e.preventDefault();
         pauseAutoPlay();
         setCurrentIndex(announcements.length - 1);
       } else if (e.key === ' ') {
         e.preventDefault();
         setIsAutoPlaying(prev => !prev); // Пробел для паузы/воспроизведения
       }
    };

    // Добавляем обработчик только когда компонент видим
    const container = containerRef.current;
    if (container) {
      container.setAttribute('tabindex', '0'); // Делаем контейнер фокусируемым
      container.addEventListener('keydown', handleKeyDown);
      
      return () => {
        container.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isTransitioning, announcements.length]);

  // Автоматическое воспроизведение
  useEffect(() => {
    if (!isAutoPlaying || isPaused || isTransitioning || announcements.length <= 1) {
      return;
    }

    const autoPlayInterval = setInterval(() => {
      nextAnnouncement();
    }, 5000); // Переключение каждые 5 секунд

    return () => clearInterval(autoPlayInterval);
  }, [isAutoPlaying, isPaused, isTransitioning, currentIndex, announcements.length]);

  // Пауза при взаимодействии пользователя
  const pauseAutoPlay = () => {
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000); // Возобновление через 10 секунд
  };

  // Обработчики с паузой автовоспроизведения
  const handleUserNavigation = (navigationFn) => {
    pauseAutoPlay();
    navigationFn();
  };

  // Touch события для свайпов
  const handleTouchStart = (e) => {
    if (isTransitioning) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    
    // Предотвращаем скролл страницы во время свайпа
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || isTransitioning) return;
    
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;
    
    // Визуальная обратная связь при свайпе
    if (containerRef.current) {
      const maxOffset = 30; // Максимальное смещение для визуального эффекта
      const offset = Math.max(-maxOffset, Math.min(maxOffset, deltaX * 0.3));
      containerRef.current.style.transform = `translateX(${offset}px)`;
    }
    
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingRef.current || isTransitioning) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    const minSwipeDistance = 60; // Увеличенное минимальное расстояние
    const swipeVelocity = Math.abs(deltaX) / 100; // Учитываем скорость свайпа
    
    // Сброс визуального смещения
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateX(0)';
    }
    
    // Проверяем расстояние и скорость свайпа
    if (Math.abs(deltaX) > minSwipeDistance || swipeVelocity > 0.5) {
      if (deltaX > 0) {
        handleUserNavigation(prevAnnouncement); // Свайп вправо - предыдущее
      } else {
        handleUserNavigation(nextAnnouncement); // Свайп влево - следующее
      }
    }
    
    isDraggingRef.current = false;
    e.preventDefault();
  };

  // Mouse события для десктопа
  const handleMouseDown = (e) => {
    if (isTransitioning) return;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    isDraggingRef.current = true;
    
    // Добавляем глобальные обработчики для отслеживания движения мыши
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || isTransitioning) return;
    
    currentXRef.current = e.clientX;
    const deltaX = currentXRef.current - startXRef.current;
    
    // Визуальная обратная связь при перетаскивании
    if (containerRef.current) {
      const maxOffset = 30;
      const offset = Math.max(-maxOffset, Math.min(maxOffset, deltaX * 0.3));
      containerRef.current.style.transform = `translateX(${offset}px)`;
    }
    
    e.preventDefault();
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current || isTransitioning) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    const minSwipeDistance = 60;
    const swipeVelocity = Math.abs(deltaX) / 100;
    
    // Сброс визуального смещения
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateX(0)';
    }
    
    // Удаляем глобальные обработчики
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (Math.abs(deltaX) > minSwipeDistance || swipeVelocity > 0.5) {
       if (deltaX > 0) {
         handleUserNavigation(prevAnnouncement);
       } else {
         handleUserNavigation(nextAnnouncement);
       }
     }
    
    isDraggingRef.current = false;
    e.preventDefault();
  };

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="announcement-board">
      <div className="announcement-header">
        <div className="announcement-icon">📢</div>
        <h2>Объявления</h2>
        <div className="announcement-counter">
          {currentIndex + 1} / {announcements.length}
        </div>
      </div>

      <div 
        className="announcement-container"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className={`announcement-card ${isTransitioning ? 'transitioning' : ''}`}
          style={{ background: currentAnnouncement.gradient }}
        >
          <div className="announcement-type">{currentAnnouncement.type}</div>
          
          <div className="announcement-content">
            <div className="announcement-emoji">{currentAnnouncement.emoji}</div>
            <h3 className="announcement-title">{currentAnnouncement.title}</h3>
            <p className="announcement-description">{currentAnnouncement.description}</p>
          </div>
          
          <div className="announcement-footer">
            <span className="announcement-date">{currentAnnouncement.date}</span>
            <button className="announcement-cta">Подробнее</button>
          </div>
          
          <div className="announcement-decorative">
            <div className="gradient-orb"></div>
            <div className="floating-emoji">{currentAnnouncement.emoji}</div>
          </div>
        </div>
      </div>

      {/* Индикаторы */}
      <div className="announcement-indicators">
        {announcements.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
               if (!isTransitioning && index !== currentIndex) {
                 pauseAutoPlay();
                 setCurrentIndex(index);
               }
             }}
            aria-label={`Перейти к объявлению ${index + 1}`}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* Кнопки навигации */}
        <div className="announcement-navigation">
          <button 
            className="nav-button prev" 
            onClick={() => handleUserNavigation(prevAnnouncement)}
            disabled={isTransitioning}
            aria-label="Предыдущее объявление"
          >
            ←
          </button>
          <button 
            className="nav-button next" 
            onClick={() => handleUserNavigation(nextAnnouncement)}
            disabled={isTransitioning}
            aria-label="Следующее объявление"
          >
            →
          </button>
          <button 
            className="nav-button play-pause" 
            onClick={() => setIsAutoPlaying(prev => !prev)}
            aria-label={isAutoPlaying ? 'Приостановить автовоспроизведение' : 'Запустить автовоспроизведение'}
          >
            {isAutoPlaying ? '⏸️' : '▶️'}
          </button>
        </div>
    </div>
  );
};

export default AnnouncementBoard;