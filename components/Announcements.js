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

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    // Оптимизированный таймаут для плавности
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Сократил время
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

  // Упрощенная обработка свайпов
  const minSwipeDistance = 40;

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    setIsDragging(true);
  };

  const onTouchMove = (e) => {
    if (!touchStart || !isDragging) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isDragging) return;
    
    setIsDragging(false);
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
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
            const isVisible = Math.abs(offset) <= 1; // Показываем только текущую и соседние
            
            if (!isVisible) return null; // Не рендерим далекие карточки
            
            return (
              <div
                key={announcement.id}
                className={`announcement-card ${isActive ? 'active' : ''}`}
                style={{
                  '--type-color': getTypeColor(announcement.type),
                  transform: `translateX(${offset * 100}%) scale(${isActive ? 1 : 0.95})`,
                  opacity: isActive ? 1 : 0.4,
                  zIndex: isActive ? 10 : 5,
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
      
      {/* Полоска прогресса */}
      <div className="announcements-progress">
        <div className="progress-info">
          <span className="progress-text">{currentIndex + 1} из {announcements.length}</span>
          <span className="progress-percentage">{Math.round(((currentIndex + 1) / announcements.length) * 100)}%</span>
        </div>
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