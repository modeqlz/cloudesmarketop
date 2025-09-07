// components/Announcements.js
import { useState, useEffect } from 'react';

// Пример данных объявлений (потом можно заменить на API)
const announcementsData = [
  {
    id: 1,
    title: "🎉 Добро пожаловать в Cloudес Market!",
    text: "Торгуй скинами, участвуй в аукционах и находи редкие предметы. Начни свой путь трейдера прямо сейчас!",
    type: "welcome",
    date: "2024-01-15"
  },
  {
    id: 2,
    title: "🔥 Новые аукционы каждый день",
    text: "Следи за горячими лотами! Редкие скины появляются в аукционах ежедневно. Не упусти свой шанс!",
    type: "auction",
    date: "2024-01-14"
  },
  {
    id: 3,
    title: "💎 Обновление тарифов",
    text: "Теперь доступен новый тариф Pro с расширенными возможностями для профессиональных трейдеров.",
    type: "update",
    date: "2024-01-13"
  },
  {
    id: 4,
    title: "🛒 Маркет работает 24/7",
    text: "Покупай и продавай в любое время! Наш маркет не спит, как и настоящие трейдеры.",
    type: "info",
    date: "2024-01-12"
  }
];

export default function Announcements() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Автопрокрутка каждые 5 секунд
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcementsData.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Останавливаем автопрокрутку при ручном переключении
    setTimeout(() => setIsAutoPlaying(true), 10000); // Возобновляем через 10 сек
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % announcementsData.length);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + announcementsData.length) % announcementsData.length);
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
      default: return 'rgba(123,199,255,0.6)';
    }
  };

  const currentAnnouncement = announcementsData[currentIndex];

  return (
    <div className="announcements-container">
      <div className="announcements-header">
        <div className="announcements-title">📢 Объявления</div>
        <div className="announcements-counter">
          {currentIndex + 1} / {announcementsData.length}
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
        >
          <div className="announcement-content">
            <h3 className="announcement-title">{currentAnnouncement.title}</h3>
            <p className="announcement-text">{currentAnnouncement.text}</p>
            <div className="announcement-date">{currentAnnouncement.date}</div>
          </div>
        </div>
      </div>
      
      {/* Индикаторы точек */}
      <div className="announcements-dots">
        {announcementsData.map((_, index) => (
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