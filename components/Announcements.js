// components/Announcements.js
import { useState, useEffect } from 'react';

export default function Announcements() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Останавливаем автопрокрутку при ручном переключении
    setTimeout(() => setIsAutoPlaying(true), 10000); // Возобновляем через 10 сек
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % announcements.length);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + announcements.length) % announcements.length);
  };

  // Обработка свайпов
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
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
      nextSlide(); // Свайп влево - следующий слайд
    } else if (isRightSwipe) {
      prevSlide(); // Свайп вправо - предыдущий слайд
    }
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
        <div 
          className="announcement-card"
          style={{'--type-color': getTypeColor(currentAnnouncement.type)}}
          onClick={() => handleAnnouncementClick(currentAnnouncement)}
        >
          <div className="announcement-content">
            <h3 className="announcement-title">
              {currentAnnouncement.title}
              {currentAnnouncement.telegram_link && (
                <span className="clickable-hint">👆</span>
              )}
            </h3>
            <p className="announcement-text">{currentAnnouncement.text}</p>
            <div className="announcement-date">
              {new Date(currentAnnouncement.created_at).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Индикаторы точек */}
      <div className="announcements-dots">
        {announcements.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Объявление ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}