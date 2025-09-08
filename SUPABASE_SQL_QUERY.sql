-- SQL-запрос для редактора Supabase
-- Этот запрос можно скопировать и вставить в SQL Editor в панели Supabase

-- 1. Создание таблицы announcements (если еще не создана)
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('welcome', 'auction', 'update', 'info', 'market')),
  telegram_link TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Создание индекса для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_announcements_active_order 
ON announcements(is_active, display_order, created_at DESC);

-- 3. Включение Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 4. Создание политики безопасности для чтения
DROP POLICY IF EXISTS "Все могут читать активные объявления" ON announcements;
CREATE POLICY "Все могут читать активные объявления" ON announcements
  FOR SELECT USING (is_active = true);

-- 5. Функция для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Триггер для автообновления updated_at
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at 
  BEFORE UPDATE ON announcements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Вставка тестовых данных (только если таблица пустая)
INSERT INTO announcements (title, text, type, telegram_link, display_order, is_active)
SELECT * FROM (
  VALUES 
    ('🎉 Добро пожаловать в Cloudес Market!', 'Торгуй скинами, участвуй в аукционах и находи редкие предметы. Начни свой путь трейдера прямо сейчас!', 'welcome', 'https://t.me/cloudes_market/1', 1, true),
    ('🔥 Новые аукционы каждый день', 'Следи за горячими лотами! Редкие скины появляются в аукционах ежедневно. Не упусти свой шанс!', 'auction', 'https://t.me/cloudes_market/2', 2, true),
    ('💎 Обновление тарифов', 'Теперь доступен новый тариф Pro с расширенными возможностями для профессиональных трейдеров.', 'update', 'https://t.me/cloudes_market/3', 3, true),
    ('🛒 Маркет работает 24/7', 'Покупай и продавай в любое время! Наш маркет не спит, как и настоящие трейдеры.', 'info', 'https://t.me/cloudes_market/4', 4, true)
) AS new_data(title, text, type, telegram_link, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM announcements LIMIT 1);

-- 8. Проверочные запросы
-- Просмотр всех активных объявлений:
-- SELECT * FROM announcements WHERE is_active = true ORDER BY display_order, created_at DESC;

-- Добавление нового объявления:
-- INSERT INTO announcements (title, text, type, telegram_link, display_order) 
-- VALUES ('Заголовок', 'Текст объявления', 'info', 'https://t.me/link', 5);

-- Обновление объявления:
-- UPDATE announcements SET title = 'Новый заголовок', text = 'Новый текст' WHERE id = 1;

-- Деактивация объявления:
-- UPDATE announcements SET is_active = false WHERE id = 1;

-- Удаление объявления:
-- DELETE FROM announcements WHERE id = 1;

-- Включение Realtime для таблицы (выполнить отдельно в Supabase Dashboard):
-- ALTER PUBLICATION supabase_realtime ADD TABLE announcements;