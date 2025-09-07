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
      
      <div className="announcements-slider">
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
        
        {/* Навигационные кнопки */}
        <button 
          className="nav-btn nav-btn-prev" 
          onClick={prevSlide}
          aria-label="Предыдущее объявление"
        >
          ‹
        </button>
        <button 
          className="nav-btn nav-btn-next" 
          onClick={nextSlide}
          aria-label="Следующее объявление"
        >
          ›
        </button>
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