// components/Announcements.js
import { useState, useEffect } from 'react';

export default function Announcements() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Загружаем объявления при монтировании компонента
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Автопрокрутка каждые 5 секунд
  useEffect(() => {
    if (!isAutoPlaying || announcements.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, announcements.length]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.ok && data.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch (e) {
      console.error('Error fetching announcements:', e);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index, animated = true) => {
    if (isTransitioning) return;
    
    if (animated) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 150);
    } else {
      setCurrentIndex(index);
    }
    
    setIsAutoPlaying(false); // Останавливаем автопрокрутку при ручном переключении
    setTimeout(() => setIsAutoPlaying(true), 10000); // Возобновляем через 10 сек
  };

  const nextSlide = () => {
    if (!isTransitioning) {
      goToSlide((currentIndex + 1) % announcements.length);
    }
  };

  const prevSlide = () => {
    if (!isTransitioning) {
      goToSlide((currentIndex - 1 + announcements.length) % announcements.length);
    }
  };

  // Обработка свайпов с плавной анимацией
  const minSwipeDistance = 50;
  const maxSwipeOffset = 80;

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    setIsDragging(true);
    setIsAutoPlaying(false); // Останавливаем автопрокрутку при начале свайпа
  };

  const onTouchMove = (e) => {
    if (!touchStart || !isDragging) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Ограничиваем смещение для упругого эффекта
    const limitedOffset = Math.max(-maxSwipeOffset, Math.min(maxSwipeOffset, diff * 0.3));
    setSwipeOffset(limitedOffset);
    setTouchEnd(currentTouch);
  };

  const onTouchEnd = () => {
    if (!touchStart || !isDragging) return;
    
    setIsDragging(false);
    setSwipeOffset(0);
    
    if (touchEnd) {
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
        nextSlide(); // Свайп влево - следующий слайд
      } else if (isRightSwipe) {
        prevSlide(); // Свайп вправо - предыдущий слайд
      }
    }
    
    // Возобновляем автопрокрутку через 3 секунды
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'welcome': return 'rgba(123,199,255,0.6)';
      case 'auction': return 'rgba(255,140,0,0.6)';
      case 'update': return 'rgba(138,43,226,0.6)';
      case 'info': return 'rgba(34,193,195,0.6)';
      case 'market': return 'rgba(0,200,100,0.6)';
      default: return 'rgba(123,199,255,0.6)';
    }
  };

  const handleAnnouncementClick = (announcement) => {
    if (announcement.telegram_link) {
      window.open(announcement.telegram_link, '_blank');
    }
  };

  // Показываем загрузку
  if (loading) {
    return (
      <div className="announcements-container">
        <div className="announcements-header">
          <div className="announcements-title">📢 Объявления</div>
          <div className="announcements-counter">Загрузка...</div>
        </div>
        <div className="announcements-slider" style={{height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{color: 'var(--muted)', fontSize: 14}}>⏳ Загружаем объявления...</div>
        </div>
      </div>
    );
  }

  // Если объявлений нет
  if (announcements.length === 0) {
    return (
      <div className="announcements-container">
        <div className="announcements-header">
          <div className="announcements-title">📢 Объявления</div>
          <div className="announcements-counter">0 / 0</div>
        </div>
        <div className="announcements-slider" style={{height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{color: 'var(--muted)', fontSize: 14}}>📭 Объявлений пока нет</div>
        </div>
      </div>
    );
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="announcements-container">
      <div className="announcements-header">
        <div className="announcements-title">📢 Объявления</div>
        <div className="announcements-counter">
          {currentIndex + 1} / {announcements.length}
        </div>
      </div>
      
      <div 
        className="announcements-slider"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="announcements-wrapper">
          {announcements.map((announcement, index) => {
            const offset = index - currentIndex;
            const isActive = index === currentIndex;
            const isPrev = index === (currentIndex - 1 + announcements.length) % announcements.length;
            const isNext = index === (currentIndex + 1) % announcements.length;
            
            return (
              <div
                key={announcement.id}
                className={`announcement-card ${isActive ? 'active' : ''} ${isPrev ? 'prev' : ''} ${isNext ? 'next' : ''}`}
                style={{
                  '--type-color': getTypeColor(announcement.type),
                  '--offset': offset,
                  transform: `translateX(${(offset * 100) + swipeOffset}%) scale(${isActive ? 1 : 0.95})`,
                  opacity: Math.abs(offset) <= 1 ? (1 - Math.abs(offset) * 0.3) : 0,
                  zIndex: isActive ? 10 : (Math.abs(offset) <= 1 ? 5 : 1),
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
                onClick={() => isActive && handleAnnouncementClick(announcement)}
              >
                <div className="announcement-content">
                  <div className="announcement-type-badge">{announcement.type}</div>
                  <h3 className="announcement-title">
                    {announcement.title}
                    {announcement.telegram_link && (
                      <span className="clickable-hint">👆</span>
                    )}
                  </h3>
                  <p className="announcement-text">{announcement.text}</p>
                  <div className="announcement-meta">
                    <div className="announcement-date">
                      {new Date(announcement.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    {announcement.telegram_link && (
                      <div className="announcement-link-indicator">
                        <span>🔗</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Декоративный градиент */}
                <div className="announcement-gradient"></div>
                
                {/* Эмодзи-декорация по типу */}
                <div className="announcement-emoji">
                  {announcement.type === 'welcome' && '🎉'}
                  {announcement.type === 'auction' && '🔥'}
                  {announcement.type === 'update' && '💎'}
                  {announcement.type === 'market' && '🛒'}
                  {announcement.type === 'info' && 'ℹ️'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Индикаторы точек с анимацией */}
      <div className="announcements-dots">
        <div className="dots-track">
          {announcements.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Объявление ${index + 1}`}
              style={{
                '--delay': `${index * 0.1}s`
              }}
            />
          ))}
          <div 
            className="dot-indicator" 
            style={{
              transform: `translateX(${currentIndex * (16 + 8)}px)` // 16px width + 8px gap
            }}
          />
        </div>
        
        {/* Полоска прогресса */}
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{
              width: `${((currentIndex + 1) / announcements.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}