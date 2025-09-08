# Руководство по работе с SQL Editor в Supabase

## Введение

SQL Editor в Supabase - это мощный инструмент для управления базой данных через веб-интерфейс. Это руководство покажет, как использовать SQL Editor для работы с таблицей объявлений.

## Доступ к SQL Editor

1. Войдите в свой проект Supabase
2. В левом меню выберите "SQL Editor"
3. Вы увидите интерфейс редактора с возможностью писать и выполнять SQL запросы

## Структура таблицы announcements

Таблица `announcements` имеет следующую структуру:

```sql
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  action TEXT DEFAULT 'Подробнее',
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Описание полей:

- `id` - Уникальный идентификатор (автоинкремент)
- `title` - Заголовок объявления (обязательное поле)
- `description` - Описание объявления
- `type` - Тип объявления (info, warning, success, error)
- `action` - Текст кнопки действия
- `link` - Ссылка для кнопки действия
- `is_active` - Активно ли объявление
- `priority` - Приоритет отображения (больше = выше)
- `created_at` - Дата создания
- `updated_at` - Дата последнего обновления

## Основные операции

### 1. Просмотр всех объявлений

```sql
SELECT * FROM announcements
ORDER BY priority DESC, created_at DESC;
```

### 2. Просмотр только активных объявлений

```sql
SELECT * FROM announcements
WHERE is_active = true
ORDER BY priority DESC, created_at DESC;
```

### 3. Добавление нового объявления

#### Простое объявление:
```sql
INSERT INTO announcements (title, description, type)
VALUES (
  'Новое обновление',
  'Мы выпустили новую версию приложения с улучшениями',
  'info'
);
```

#### Объявление с ссылкой:
```sql
INSERT INTO announcements (title, description, type, action, link, priority)
VALUES (
  'Важное уведомление',
  'Обновите настройки безопасности в вашем профиле',
  'warning',
  'Перейти к настройкам',
  'https://t.me/your_bot?start=settings',
  10
);
```

#### Объявление с высоким приоритетом:
```sql
INSERT INTO announcements (title, description, type, priority)
VALUES (
  'Срочное объявление',
  'Техническое обслуживание сегодня с 22:00 до 02:00',
  'error',
  100
);
```

### 4. Обновление объявления

#### Изменение текста:
```sql
UPDATE announcements
SET 
  title = 'Обновленный заголовок',
  description = 'Новое описание',
  updated_at = NOW()
WHERE id = 1;
```

#### Изменение приоритета:
```sql
UPDATE announcements
SET 
  priority = 50,
  updated_at = NOW()
WHERE id = 1;
```

#### Деактивация объявления:
```sql
UPDATE announcements
SET 
  is_active = false,
  updated_at = NOW()
WHERE id = 1;
```

### 5. Удаление объявлений

#### Удаление конкретного объявления:
```sql
DELETE FROM announcements
WHERE id = 1;
```

#### Удаление старых неактивных объявлений:
```sql
DELETE FROM announcements
WHERE is_active = false
AND created_at < NOW() - INTERVAL '30 days';
```

## Полезные запросы для администрирования

### Статистика объявлений

```sql
SELECT 
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN is_active THEN 1 END) as active,
  COUNT(CASE WHEN NOT is_active THEN 1 END) as inactive
FROM announcements
GROUP BY type
ORDER BY total DESC;
```

### Поиск объявлений по тексту

```sql
SELECT *
FROM announcements
WHERE 
  title ILIKE '%обновление%'
  OR description ILIKE '%обновление%'
ORDER BY created_at DESC;
```

### Объявления за последнюю неделю

```sql
SELECT *
FROM announcements
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Топ-5 объявлений по приоритету

```sql
SELECT title, priority, type, is_active
FROM announcements
WHERE is_active = true
ORDER BY priority DESC
LIMIT 5;
```

## Массовые операции

### Добавление нескольких объявлений

```sql
INSERT INTO announcements (title, description, type, action, link, priority) VALUES
('Новые функции', 'Добавлены новые возможности в приложение', 'success', 'Узнать больше', 'https://t.me/your_bot?start=features', 5),
('Техническое обслуживание', 'Плановые работы на сервере', 'warning', 'Подробности', 'https://t.me/your_bot?start=maintenance', 8),
('Конкурс', 'Участвуйте в нашем конкурсе и выигрывайте призы', 'info', 'Участвовать', 'https://t.me/your_bot?start=contest', 3);
```

### Обновление типа для нескольких объявлений

```sql
UPDATE announcements
SET 
  type = 'info',
  updated_at = NOW()
WHERE type = 'warning'
AND created_at < NOW() - INTERVAL '7 days';
```

## Безопасность и RLS (Row Level Security)

Таблица объявлений защищена политиками RLS. Для работы через SQL Editor убедитесь, что:

1. У вас есть права администратора проекта
2. Политики RLS настроены правильно
3. Используйте сервисную роль для административных операций

### Проверка политик RLS

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'announcements';
```

## Резервное копирование

### Экспорт всех объявлений

```sql
SELECT 
  'INSERT INTO announcements (title, description, type, action, link, is_active, priority) VALUES (' ||
  '''' || REPLACE(title, '''', '''''') || ''', ' ||
  COALESCE('''' || REPLACE(description, '''', '''''') || '''', 'NULL') || ', ' ||
  '''' || type || ''', ' ||
  COALESCE('''' || REPLACE(action, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(link, '''', '''''') || '''', 'NULL') || ', ' ||
  is_active || ', ' ||
  priority || ');' as backup_sql
FROM announcements
ORDER BY id;
```

## Мониторинг и логирование

### Просмотр последних изменений

```sql
SELECT 
  id,
  title,
  type,
  is_active,
  created_at,
  updated_at,
  CASE 
    WHEN updated_at > created_at THEN 'Обновлено'
    ELSE 'Создано'
  END as status
FROM announcements
ORDER BY GREATEST(created_at, updated_at) DESC
LIMIT 10;
```

## Советы по использованию SQL Editor

1. **Всегда делайте резервную копию** перед массовыми изменениями
2. **Используйте транзакции** для сложных операций:
   ```sql
   BEGIN;
   -- ваши запросы
   COMMIT; -- или ROLLBACK; для отмены
   ```
3. **Тестируйте запросы** сначала с `SELECT` перед `UPDATE` или `DELETE`
4. **Используйте `LIMIT`** при тестировании запросов на больших таблицах
5. **Проверяйте результаты** после выполнения изменений

## Заключение

SQL Editor в Supabase предоставляет полный контроль над данными объявлений. Используйте это руководство как справочник для эффективной работы с таблицей announcements. Помните о безопасности и всегда проверяйте результаты ваших запросов.