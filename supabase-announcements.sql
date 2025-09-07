-- Создание таблицы для объявлений
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('welcome', 'auction', 'update', 'info', 'market')),
  telegram_link TEXT, -- Ссылка на пост в Telegram
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Создаем индекс для активных объявлений, отсортированных по порядку
CREATE INDEX idx_announcements_active_order ON announcements(is_active, display_order, created_at DESC);

-- RLS (Row Level Security) для announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать активные объявления
CREATE POLICY "Все могут читать активные объявления" ON announcements
  FOR SELECT USING (is_active = true);

-- Добавляем функцию обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автообновления updated_at
CREATE TRIGGER update_announcements_updated_at 
  BEFORE UPDATE ON announcements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Добавляем тестовые данные
INSERT INTO announcements (title, text, type, telegram_link, display_order, is_active) VALUES
('🎉 Добро пожаловать в Cloudес Market!', 'Торгуй скинами, участвуй в аукционах и находи редкие предметы. Начни свой путь трейдера прямо сейчас!', 'welcome', 'https://t.me/cloudes_market/1', 1, true),
('🔥 Новые аукционы каждый день', 'Следи за горячими лотами! Редкие скины появляются в аукционах ежедневно. Не упусти свой шанс!', 'auction', 'https://t.me/cloudes_market/2', 2, true),
('💎 Обновление тарифов', 'Теперь доступен новый тариф Pro с расширенными возможностями для профессиональных трейдеров.', 'update', 'https://t.me/cloudes_market/3', 3, true),
('🛒 Маркет работает 24/7', 'Покупай и продавай в любое время! Наш маркет не спит, как и настоящие трейдеры.', 'info', 'https://t.me/cloudes_market/4', 4, true);


