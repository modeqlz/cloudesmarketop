# Примеры SQL запросов для управления объявлениями

## Базовые операции CRUD

### CREATE - Создание объявлений

#### 1. Простое информационное объявление
```sql
INSERT INTO announcements (title, description, type)
VALUES (
  'Добро пожаловать!',
  'Спасибо за регистрацию в нашем сервисе',
  'success'
);
```

#### 2. Объявление с кнопкой и ссылкой
```sql
INSERT INTO announcements (title, description, type, action, link, priority)
VALUES (
  'Пополните баланс',
  'Получите бонус 10% при пополнении от 1000 рублей',
  'info',
  'Пополнить',
  'https://t.me/your_bot?start=deposit',
  15
);
```

#### 3. Срочное предупреждение
```sql
INSERT INTO announcements (title, description, type, action, link, priority)
VALUES (
  'Техническое обслуживание',
  'Сервис будет недоступен с 02:00 до 04:00 МСК',
  'warning',
  'Подробнее',
  'https://t.me/your_bot?start=maintenance',
  100
);
```

#### 4. Объявление об ошибке
```sql
INSERT INTO announcements (title, description, type, priority)
VALUES (
  'Временные проблемы',
  'Мы работаем над устранением технических неполадок',
  'error',
  50
);
```

### READ - Чтение объявлений

#### 1. Все активные объявления (как в API)
```sql
SELECT 
  id,
  title,
  description,
  type,
  action,
  link,
  priority,
  created_at
FROM announcements
WHERE is_active = true
ORDER BY priority DESC, created_at DESC;
```

#### 2. Объявления по типу
```sql
-- Только предупреждения
SELECT * FROM announcements
WHERE type = 'warning' AND is_active = true
ORDER BY priority DESC;

-- Только успешные уведомления
SELECT * FROM announcements
WHERE type = 'success' AND is_active = true
ORDER BY created_at DESC;
```

#### 3. Топ-3 объявления по приоритету
```sql
SELECT title, description, type, priority
FROM announcements
WHERE is_active = true
ORDER BY priority DESC, created_at DESC
LIMIT 3;
```

#### 4. Поиск по тексту
```sql
SELECT *
FROM announcements
WHERE (
  title ILIKE '%бонус%' 
  OR description ILIKE '%бонус%'
)
AND is_active = true
ORDER BY priority DESC;
```

### UPDATE - Обновление объявлений

#### 1. Изменение текста объявления
```sql
UPDATE announcements
SET 
  title = 'Обновленное предложение',
  description = 'Новые условия акции действуют до конца месяца',
  updated_at = NOW()
WHERE id = 1;
```

#### 2. Изменение приоритета
```sql
UPDATE announcements
SET 
  priority = 25,
  updated_at = NOW()
WHERE id = 2;
```

#### 3. Деактивация объявления
```sql
UPDATE announcements
SET 
  is_active = false,
  updated_at = NOW()
WHERE id = 3;
```

#### 4. Изменение типа объявления
```sql
UPDATE announcements
SET 
  type = 'success',
  updated_at = NOW()
WHERE id = 4;
```

#### 5. Обновление ссылки и кнопки
```sql
UPDATE announcements
SET 
  action = 'Новая кнопка',
  link = 'https://t.me/your_bot?start=new_action',
  updated_at = NOW()
WHERE id = 5;
```

### DELETE - Удаление объявлений

#### 1. Удаление конкретного объявления
```sql
DELETE FROM announcements
WHERE id = 1;
```

#### 2. Удаление старых неактивных объявлений
```sql
DELETE FROM announcements
WHERE is_active = false
AND created_at < NOW() - INTERVAL '30 days';
```

#### 3. Удаление всех объявлений определенного типа
```sql
DELETE FROM announcements
WHERE type = 'error'
AND is_active = false;
```

## Массовые операции

### 1. Добавление нескольких объявлений
```sql
INSERT INTO announcements (title, description, type, action, link, priority) VALUES
('Новый функционал', 'Добавлена возможность автоплатежей', 'success', 'Попробовать', 'https://t.me/your_bot?start=autopay', 10),
('Акция месяца', 'Скидка 20% на все услуги до конца месяца', 'info', 'Воспользоваться', 'https://t.me/your_bot?start=promo', 20),
('Обновление безопасности', 'Усилены меры защиты аккаунтов', 'warning', 'Узнать больше', 'https://t.me/your_bot?start=security', 5);
```

### 2. Деактивация всех старых объявлений
```sql
UPDATE announcements
SET 
  is_active = false,
  updated_at = NOW()
WHERE created_at < NOW() - INTERVAL '7 days'
AND type IN ('info', 'success');
```

### 3. Повышение приоритета важных объявлений
```sql
UPDATE announcements
SET 
  priority = priority + 10,
  updated_at = NOW()
WHERE type IN ('warning', 'error')
AND is_active = true;
```

## Аналитические запросы

### 1. Статистика по типам объявлений
```sql
SELECT 
  type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count,
  COUNT(CASE WHEN NOT is_active THEN 1 END) as inactive_count,
  AVG(priority) as avg_priority
FROM announcements
GROUP BY type
ORDER BY total_count DESC;
```

### 2. Активность по дням
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as announcements_created,
  COUNT(CASE WHEN type = 'error' THEN 1 END) as errors,
  COUNT(CASE WHEN type = 'warning' THEN 1 END) as warnings
FROM announcements
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 3. Топ объявлений по приоритету
```sql
SELECT 
  title,
  type,
  priority,
  is_active,
  created_at
FROM announcements
ORDER BY priority DESC, created_at DESC
LIMIT 10;
```

### 4. Объявления с ссылками
```sql
SELECT 
  title,
  action,
  link,
  type,
  priority
FROM announcements
WHERE link IS NOT NULL
AND is_active = true
ORDER BY priority DESC;
```

## Запросы для обслуживания

### 1. Проверка целостности данных
```sql
-- Объявления без заголовка
SELECT * FROM announcements
WHERE title IS NULL OR title = '';

-- Объявления с некорректным типом
SELECT * FROM announcements
WHERE type NOT IN ('info', 'warning', 'success', 'error');

-- Объявления с отрицательным приоритетом
SELECT * FROM announcements
WHERE priority < 0;
```

### 2. Очистка данных
```sql
-- Удаление дубликатов по заголовку
DELETE FROM announcements a1
USING announcements a2
WHERE a1.id > a2.id
AND a1.title = a2.title
AND a1.type = a2.type;

-- Нормализация приоритетов
UPDATE announcements
SET priority = GREATEST(0, LEAST(100, priority))
WHERE priority < 0 OR priority > 100;
```

### 3. Архивирование старых объявлений
```sql
-- Создание архивной таблицы (выполнить один раз)
CREATE TABLE announcements_archive AS
SELECT * FROM announcements WHERE false;

-- Перенос старых объявлений в архив
INSERT INTO announcements_archive
SELECT * FROM announcements
WHERE created_at < NOW() - INTERVAL '90 days'
AND is_active = false;

-- Удаление архивированных объявлений
DELETE FROM announcements
WHERE created_at < NOW() - INTERVAL '90 days'
AND is_active = false;
```

## Специальные сценарии

### 1. Планирование объявлений (с дополнительным полем)
```sql
-- Добавление поля для планирования (выполнить один раз)
ALTER TABLE announcements
ADD COLUMN scheduled_at TIMESTAMPTZ;

-- Создание запланированного объявления
INSERT INTO announcements (title, description, type, is_active, scheduled_at)
VALUES (
  'Запланированное объявление',
  'Это объявление появится завтра',
  'info',
  false,
  NOW() + INTERVAL '1 day'
);

-- Активация запланированных объявлений
UPDATE announcements
SET 
  is_active = true,
  updated_at = NOW()
WHERE scheduled_at <= NOW()
AND is_active = false
AND scheduled_at IS NOT NULL;
```

### 2. Временные объявления
```sql
-- Добавление поля для автоматического отключения
ALTER TABLE announcements
ADD COLUMN expires_at TIMESTAMPTZ;

-- Создание временного объявления
INSERT INTO announcements (title, description, type, expires_at, priority)
VALUES (
  'Временная акция',
  'Скидка действует только сегодня!',
  'warning',
  NOW() + INTERVAL '1 day',
  50
);

-- Деактивация истекших объявлений
UPDATE announcements
SET 
  is_active = false,
  updated_at = NOW()
WHERE expires_at <= NOW()
AND is_active = true
AND expires_at IS NOT NULL;
```

### 3. Персонализированные объявления
```sql
-- Добавление поля для целевой аудитории
ALTER TABLE announcements
ADD COLUMN target_audience TEXT[];

-- Объявление для VIP пользователей
INSERT INTO announcements (title, description, type, target_audience, priority)
VALUES (
  'Эксклюзивное предложение',
  'Специальные условия для VIP клиентов',
  'success',
  ARRAY['vip', 'premium'],
  30
);

-- Выборка объявлений для конкретной аудитории
SELECT *
FROM announcements
WHERE (
  target_audience IS NULL
  OR 'vip' = ANY(target_audience)
)
AND is_active = true
ORDER BY priority DESC;
```

## Мониторинг и отчеты

### 1. Ежедневный отчет
```sql
SELECT 
  'Сегодня' as period,
  COUNT(*) as total_announcements,
  COUNT(CASE WHEN is_active THEN 1 END) as active,
  COUNT(CASE WHEN type = 'error' THEN 1 END) as errors,
  COUNT(CASE WHEN type = 'warning' THEN 1 END) as warnings
FROM announcements
WHERE DATE(created_at) = CURRENT_DATE

UNION ALL

SELECT 
  'Вчера' as period,
  COUNT(*) as total_announcements,
  COUNT(CASE WHEN is_active THEN 1 END) as active,
  COUNT(CASE WHEN type = 'error' THEN 1 END) as errors,
  COUNT(CASE WHEN type = 'warning' THEN 1 END) as warnings
FROM announcements
WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day';
```

### 2. Анализ эффективности
```sql
SELECT 
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN link IS NOT NULL THEN 1 END) as with_links,
  ROUND(
    COUNT(CASE WHEN link IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as link_percentage,
  AVG(priority) as avg_priority
FROM announcements
WHERE is_active = true
GROUP BY type
ORDER BY total DESC;
```

## Резервное копирование и восстановление

### 1. Полный экспорт
```sql
COPY announcements TO '/tmp/announcements_backup.csv' WITH CSV HEADER;
```

### 2. Экспорт только активных
```sql
COPY (
  SELECT * FROM announcements 
  WHERE is_active = true 
  ORDER BY priority DESC
) TO '/tmp/active_announcements.csv' WITH CSV HEADER;
```

### 3. Генерация SQL для восстановления
```sql
SELECT 
  'INSERT INTO announcements (title, description, type, action, link, is_active, priority, created_at) VALUES (' ||
  '''' || REPLACE(title, '''', '''''') || ''', ' ||
  COALESCE('''' || REPLACE(description, '''', '''''') || '''', 'NULL') || ', ' ||
  '''' || type || ''', ' ||
  COALESCE('''' || REPLACE(action, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(link, '''', '''''') || '''', 'NULL') || ', ' ||
  is_active || ', ' ||
  priority || ', ' ||
  '''' || created_at || '''' ||
  ');' as restore_sql
FROM announcements
WHERE is_active = true
ORDER BY id;
```

Эти примеры покрывают большинство сценариев работы с объявлениями. Используйте их как основу для создания собственных запросов, адаптированных под ваши конкретные потребности.